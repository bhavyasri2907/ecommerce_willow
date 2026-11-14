import { Link, useNavigate } from 'react-router-dom';
import {
  AlertTriangle, ArrowRight, Boxes, ClipboardList, FileEdit, IndianRupee, PackageCheck, Plus, ShoppingCart, Truck, Users,
} from 'lucide-react';
import { sellerApi } from '../api/seller.js';
import { useQuery } from '../hooks/useQuery.js';
import PageHeader from '../components/ui/PageHeader.jsx';
import Button from '../components/ui/Button.jsx';
import { Card, CardHeader } from '../components/ui/Card.jsx';
import KpiCard from '../components/ui/KpiCard.jsx';
import { OrderStatusBadge, StockBadge } from '../components/ui/Badge.jsx';
import ProductThumb from '../components/ui/ProductThumb.jsx';
import { EmptyState, ErrorState, Skeleton, SkeletonRows } from '../components/ui/States.jsx';
import { RevenueChart } from '../components/charts/TimeSeriesChart.jsx';
import { formatCurrency, formatDate, formatNumber, greeting, timeAgo } from '../utils/format.js';

function AttentionItem({ icon: Icon, label, value, to, tone }) {
  return (
    <Link to={to} className={`attention attention--${value ? tone : 'clear'}`}>
      <span className="attention__icon" aria-hidden><Icon size={16} /></span>
      <span className="attention__label">{label}</span>
      <span className="attention__value">{value ?? '—'}</span>
      <ArrowRight size={14} className="attention__arrow" aria-hidden />
    </Link>
  );
}

export default function Overview() {
  const navigate = useNavigate();
  const store = useQuery((signal) => sellerApi.storeProfile(signal), [], { live: ['store.'] });
  const analytics = useQuery((signal) => sellerApi.analytics(30, signal), [], { live: ['order.'] });
  const recent = useQuery((signal) => sellerApi.listOrders({ size: 6 }, signal), [], { live: ['order.'] });
  const counts = useQuery((signal) => sellerApi.orderCounts(signal), [], { live: ['order.'] });
  const catalog = useQuery((signal) => sellerApi.productSummary(undefined, signal), [], { live: ['product.', 'inventory.', 'settings.'] });
  const lowStock = useQuery((signal) => sellerApi.inventory({ filter: 'low' }, signal), [], { live: ['inventory.', 'product.', 'settings.'] });
  const outStock = useQuery((signal) => sellerApi.inventory({ filter: 'out' }, signal), [], { live: ['inventory.', 'product.', 'settings.'] });

  const a = analytics.data;
  const k = a?.kpis;
  const spark = (key) => a?.series.map((p) => Number(p[key]));
  const stockAlerts = [...(outStock.data ?? []), ...(lowStock.data ?? [])].slice(0, 5);

  return (
    <>
      <PageHeader
        eyebrow={formatDate(new Date(), { weekday: 'long', day: 'numeric', month: 'long' })}
        title={`${greeting()}, ${store.data?.storeName ?? 'Willow'}`}
        description="Here's how your store is doing over the last 30 days. Everything on this page updates live."
        actions={
          <>
            <Button icon={ClipboardList} onClick={() => navigate('/orders?tab=PENDING')}>Review orders</Button>
            <Button variant="primary" icon={Plus} onClick={() => navigate('/products/new')}>Add Product</Button>
          </>
        }
      />

      {analytics.error ? (
        <Card><ErrorState error={analytics.error} onRetry={analytics.refetch} /></Card>
      ) : (
        <div className="kpi-grid">
          <KpiCard label="Revenue" icon={IndianRupee} loading={!k} value={k && formatCurrency(k.revenue.value)} current={k?.revenue.value} previous={k?.revenue.previous} spark={spark('revenue')} comparisonLabel="vs previous 30 days" />
          <KpiCard label="Orders" icon={ShoppingCart} loading={!k} value={k && formatNumber(k.orders.value)} current={k?.orders.value} previous={k?.orders.previous} spark={spark('orders')} comparisonLabel="vs previous 30 days" />
          <KpiCard label="Avg. order value" icon={ClipboardList} loading={!k} value={k && formatCurrency(k.averageOrderValue.value)} current={k?.averageOrderValue.value} previous={k?.averageOrderValue.previous} comparisonLabel="vs previous 30 days" />
          <KpiCard label="Customers" icon={Users} loading={!k} value={k && formatNumber(k.customers.value)} current={k?.customers.value} previous={k?.customers.previous} comparisonLabel="unique buyers" />
        </div>
      )}

      <div className="grid-2-1">
        <Card>
          <CardHeader
            title="Revenue"
            subtitle={a ? `${formatDate(a.from, { day: 'numeric', month: 'short' })} – ${formatDate(a.to, { day: 'numeric', month: 'short' })} · excludes cancelled and returned orders` : 'Last 30 days'}
            actions={<Link to="/analytics" className="link">Full analytics <ArrowRight size={14} aria-hidden /></Link>}
          />
          {a ? <RevenueChart data={a.series} /> : <Skeleton height={280} />}
        </Card>

        <Card>
          <CardHeader title="Needs attention" subtitle="Live counts across your store" />
          <div className="attention-list">
            <AttentionItem icon={ClipboardList} label="Orders to confirm" value={counts.data?.PENDING} to="/orders?tab=PENDING" tone="accent" />
            <AttentionItem icon={PackageCheck} label="Confirmed, to pack" value={counts.data?.CONFIRMED} to="/orders?tab=CONFIRMED" tone="info" />
            <AttentionItem icon={Truck} label="Packed, to ship" value={counts.data?.PACKED} to="/orders?tab=PACKED" tone="info" />
            <AttentionItem icon={AlertTriangle} label="Low stock products" value={catalog.data?.lowStock} to="/inventory?filter=low" tone="warning" />
            <AttentionItem icon={Boxes} label="Out of stock" value={catalog.data?.outOfStock} to="/inventory?filter=out" tone="danger" />
            <AttentionItem icon={FileEdit} label="Drafts not yet live" value={catalog.data?.byStatus.DRAFT} to="/products?tab=DRAFT" tone="neutral" />
          </div>
        </Card>
      </div>

      <div className="grid-2-1">
        <Card padded={false}>
          <div className="card--padded card__header-pad">
            <CardHeader title="Recent orders" subtitle="New orders appear here instantly" actions={<Link to="/orders" className="link">All orders <ArrowRight size={14} aria-hidden /></Link>} />
          </div>
          {recent.error ? (
            <ErrorState error={recent.error} onRetry={recent.refetch} />
          ) : !recent.data ? (
            <SkeletonRows rows={6} columns={4} />
          ) : recent.data.content.length === 0 ? (
            <EmptyState icon={ShoppingCart} title="No orders yet" description="Orders from the storefront will show up here." />
          ) : (
            <div className="table-wrap">
              <table className="table table--compact">
                <thead>
                  <tr>
                    <th scope="col">Order</th>
                    <th scope="col">Customer</th>
                    <th scope="col" className="num">Total</th>
                    <th scope="col">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recent.data.content.map((o) => (
                    <tr key={o.id} className="is-clickable" onClick={() => navigate(`/orders?order=${o.id}`)}>
                      <td>
                        <div className="strong">{o.orderNumber}</div>
                        <div className="muted small">{timeAgo(o.createdAt)}</div>
                      </td>
                      <td>
                        <div>{o.customerName}</div>
                        <div className="muted small">{o.shippingCity ?? '—'} · {o.itemCount} item{o.itemCount === 1 ? '' : 's'}</div>
                      </td>
                      <td className="num strong">{formatCurrency(o.total)}</td>
                      <td><OrderStatusBadge status={o.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        <div className="stack">
          <Card>
            <CardHeader title="Stock alerts" subtitle={catalog.data ? `At or below ${catalog.data.lowStockThreshold} units` : undefined} actions={<Link to="/inventory" className="link">Inventory <ArrowRight size={14} aria-hidden /></Link>} />
            {!lowStock.data || !outStock.data ? (
              <SkeletonRows rows={3} columns={2} />
            ) : stockAlerts.length === 0 ? (
              <p className="muted small">All products are comfortably stocked.</p>
            ) : (
              <ul className="mini-list">
                {stockAlerts.map(({ product: p, daysOfCover }) => (
                  <li key={p.id}>
                    <Link to={`/inventory?adjust=${p.id}`} className="mini-list__row">
                      <ProductThumb product={p} size={34} />
                      <span className="mini-list__text">
                        <strong>{p.name}</strong>
                        <span>{p.stock} left{daysOfCover !== null && p.stock > 0 ? ` · ~${daysOfCover} days of cover` : ''}</span>
                      </span>
                      <StockBadge status={p.stockStatus} />
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </Card>

          <Card>
            <CardHeader title="Top sellers" subtitle="By revenue, last 30 days" />
            {!a ? (
              <SkeletonRows rows={3} columns={2} />
            ) : a.topProducts.length === 0 ? (
              <p className="muted small">No sales in this period yet.</p>
            ) : (
              <ol className="mini-list mini-list--ranked">
                {a.topProducts.slice(0, 4).map((p, i) => (
                  <li key={p.productId}>
                    <Link to={`/products/${p.productId}/edit`} className="mini-list__row">
                      <span className="rank">{i + 1}</span>
                      <ProductThumb product={{ ...p, type: undefined }} size={34} />
                      <span className="mini-list__text">
                        <strong>{p.name}</strong>
                        <span>{formatNumber(p.units)} sold</span>
                      </span>
                      <span className="strong">{formatCurrency(p.revenue)}</span>
                    </Link>
                  </li>
                ))}
              </ol>
            )}
          </Card>
        </div>
      </div>
    </>
  );
}
