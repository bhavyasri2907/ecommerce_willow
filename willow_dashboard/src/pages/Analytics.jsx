import { useSearchParams } from 'react-router-dom';
import { ClipboardList, IndianRupee, Package, ShoppingCart, Users } from 'lucide-react';
import { sellerApi } from '../api/seller.js';
import { useQuery } from '../hooks/useQuery.js';
import PageHeader from '../components/ui/PageHeader.jsx';
import { Card, CardHeader } from '../components/ui/Card.jsx';
import { Segmented } from '../components/ui/Tabs.jsx';
import KpiCard from '../components/ui/KpiCard.jsx';
import ProductThumb from '../components/ui/ProductThumb.jsx';
import { OrderStatusBadge } from '../components/ui/Badge.jsx';
import { ErrorState, Skeleton, SkeletonRows } from '../components/ui/States.jsx';
import { OrdersChart, RevenueChart } from '../components/charts/TimeSeriesChart.jsx';
import BarList from '../components/charts/BarList.jsx';
import { ORDER_STATUS, PAYMENT_LABELS } from '../utils/constants.js';
import { formatCurrency, formatDate, formatNumber } from '../utils/format.js';

const RANGES = [
  { value: '7', label: '7 days' },
  { value: '30', label: '30 days' },
  { value: '90', label: '90 days' },
];

export default function Analytics() {
  const [params, setParams] = useSearchParams();
  const range = params.get('range') || '30';
  const report = useQuery((signal) => sellerApi.analytics(range, signal), [range], { live: ['order.'] });
  const a = report.data;
  const k = a?.kpis;
  const vs = `vs previous ${range} days`;
  const spark = (key) => a?.series.map((p) => Number(p[key]));

  const totalStatus = a ? Object.values(a.byStatus).reduce((x, y) => x + y, 0) : 0;
  const totalPayments = a ? Object.values(a.byPayment).reduce((x, y) => x + y, 0) : 0;

  return (
    <>
      <PageHeader
        title="Analytics"
        description={a ? `${formatDate(a.from)} – ${formatDate(a.to)} · revenue excludes cancelled and returned orders` : 'Sales performance for your store'}
        actions={<Segmented ariaLabel="Date range" options={RANGES} value={range} onChange={(v) => setParams(v === '30' ? {} : { range: v }, { replace: true })} />}
      />

      {report.error ? (
        <Card><ErrorState error={report.error} onRetry={report.refetch} /></Card>
      ) : (
        <>
          <div className="kpi-grid kpi-grid--5">
            <KpiCard label="Revenue" icon={IndianRupee} loading={!k} value={k && formatCurrency(k.revenue.value)} current={k?.revenue.value} previous={k?.revenue.previous} spark={spark('revenue')} comparisonLabel={vs} />
            <KpiCard label="Orders" icon={ShoppingCart} loading={!k} value={k && formatNumber(k.orders.value)} current={k?.orders.value} previous={k?.orders.previous} spark={spark('orders')} comparisonLabel={vs} />
            <KpiCard label="Avg. order value" icon={ClipboardList} loading={!k} value={k && formatCurrency(k.averageOrderValue.value)} current={k?.averageOrderValue.value} previous={k?.averageOrderValue.previous} comparisonLabel={vs} />
            <KpiCard label="Units sold" icon={Package} loading={!k} value={k && formatNumber(k.unitsSold.value)} current={k?.unitsSold.value} previous={k?.unitsSold.previous} spark={spark('units')} comparisonLabel={vs} />
            <KpiCard label="Customers" icon={Users} loading={!k} value={k && formatNumber(k.customers.value)} current={k?.customers.value} previous={k?.customers.previous} comparisonLabel={vs} />
          </div>

          <Card>
            <CardHeader title="Revenue per day" subtitle="Hover a day for revenue, orders and units" />
            {a ? <RevenueChart data={a.series} height={300} /> : <Skeleton height={300} />}
          </Card>

          <div className="grid-2">
            <Card>
              <CardHeader title="Orders per day" subtitle="Excludes cancelled and returned orders" />
              {a ? <OrdersChart data={a.series} /> : <Skeleton height={220} />}
            </Card>
            <Card>
              <CardHeader title="Sales by category" subtitle="Revenue share of each category" />
              {a ? (
                <BarList
                  items={a.byCategory.map((c) => ({
                    key: c.type,
                    label: c.label,
                    value: Number(c.revenue),
                    display: formatCurrency(c.revenue),
                    sub: `${formatNumber(c.units)} units`,
                  }))}
                />
              ) : (
                <SkeletonRows rows={5} columns={2} />
              )}
            </Card>
          </div>

          <div className="grid-2-1">
            <Card padded={false}>
              <div className="card--padded card__header-pad">
                <CardHeader title="Top products" subtitle={`By revenue, last ${range} days`} />
              </div>
              {!a ? (
                <SkeletonRows rows={5} columns={4} />
              ) : a.topProducts.length === 0 ? (
                <p className="muted small card--padded">No sales in this period.</p>
              ) : (
                <div className="table-wrap">
                  <table className="table table--compact">
                    <thead>
                      <tr>
                        <th scope="col">#</th>
                        <th scope="col">Product</th>
                        <th scope="col" className="num">Units</th>
                        <th scope="col" className="num">Revenue</th>
                        <th scope="col" className="num">Share</th>
                      </tr>
                    </thead>
                    <tbody>
                      {a.topProducts.map((p, i) => (
                        <tr key={p.productId}>
                          <td className="muted">{i + 1}</td>
                          <td>
                            <div className="product-cell">
                              <ProductThumb product={p} size={34} />
                              <div>
                                <div className="product-cell__name">{p.name}</div>
                                <div className="product-cell__meta">{p.typeLabel}</div>
                              </div>
                            </div>
                          </td>
                          <td className="num">{formatNumber(p.units)}</td>
                          <td className="num strong">{formatCurrency(p.revenue)}</td>
                          <td className="num muted">
                            {Number(k.revenue.value) ? `${((Number(p.revenue) / Number(k.revenue.value)) * 100).toFixed(1)}%` : '—'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </Card>

            <Card>
              <CardHeader title="Top cities" subtitle="By revenue" />
              {a ? (
                <BarList
                  items={a.topCities.map((c) => ({
                    key: c.city,
                    label: c.city,
                    value: Number(c.revenue),
                    display: formatCurrency(c.revenue),
                    sub: `${formatNumber(c.orders)} orders`,
                  }))}
                />
              ) : (
                <SkeletonRows rows={5} columns={2} />
              )}
            </Card>
          </div>

          <div className="grid-2">
            <Card>
              <CardHeader title="Order status" subtitle={`All ${formatNumber(totalStatus)} orders placed in this period`} />
              {a ? (
                <ul className="status-breakdown">
                  {Object.entries(a.byStatus).map(([status, count]) => (
                    <li key={status}>
                      <OrderStatusBadge status={status} />
                      <span className="status-breakdown__bar">
                        <span className={`status-breakdown__fill tone-${ORDER_STATUS[status].tone}`} style={{ width: `${totalStatus ? (count / totalStatus) * 100 : 0}%` }} />
                      </span>
                      <span className="status-breakdown__value">{formatNumber(count)}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <SkeletonRows rows={6} columns={2} />
              )}
            </Card>
            <Card>
              <CardHeader title="Payment methods" subtitle="Share of orders" />
              {a ? (
                <BarList
                  items={Object.entries(a.byPayment).map(([method, count]) => ({
                    key: method,
                    label: PAYMENT_LABELS[method] ?? method,
                    value: count,
                    display: `${formatNumber(count)} orders`,
                    sub: totalPayments ? `${((count / totalPayments) * 100).toFixed(0)}%` : undefined,
                  }))}
                />
              ) : (
                <SkeletonRows rows={4} columns={2} />
              )}
            </Card>
          </div>
        </>
      )}
    </>
  );
}
