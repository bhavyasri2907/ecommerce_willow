import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { AlertTriangle, Boxes, History, IndianRupee, Layers, PackageX, SlidersHorizontal } from 'lucide-react';
import { inventoryService } from '../services/inventoryService.js';
import { useFetch } from '../hooks/useFetch.js';
import { useDebounce } from '../hooks/useDebounce.js';
import PageHeader from '../components/common/PageHeader.jsx';
import Button from '../components/common/Button.jsx';
import { Card, CardHeader } from '../components/common/Card.jsx';
import { Tabs } from '../components/common/Tabs.jsx';
import { SearchInput, Select } from '../components/common/Input.jsx';
import StockBadge from '../components/inventory/StockBadge.jsx';
import StockMeter from '../components/inventory/StockMeter.jsx';
import StockAdjustModal from '../components/inventory/StockAdjustModal.jsx';
import ProductThumb from '../components/common/ProductThumb.jsx';
import StatCard from '../components/overview/StatCard.jsx';
import EmptyState from '../components/common/EmptyState.jsx';
import ErrorState from '../components/common/ErrorState.jsx';
import { SkeletonRows } from '../components/common/Loader.jsx';
import { MOVEMENT_LABELS } from '../constants/stockStatus.js';
import { useCategories } from '../hooks/useCategories.js';
import { formatPriceCompact } from '../utils/formatPrice.js';
import { formatNumber } from '../utils/formatNumber.js';
import { timeAgo } from '../utils/formatDate.js';

export default function Inventory() {
  const [params, setParams] = useSearchParams();
  const { categories } = useCategories();
  const filter = params.get('filter') || 'all';
  const type = params.get('type') || '';
  const adjustId = params.get('adjust');
  const [search, setSearch] = useState('');
  const q = useDebounce(search, 250);

  const setParam = (key, value) => {
    const next = new URLSearchParams(params);
    value ? next.set(key, value) : next.delete(key);
    setParams(next, { replace: true });
  };

  const live = ['inventory.', 'product.', 'order.', 'settings.'];
  const summary = useFetch((signal) => inventoryService.getInventorySummary(signal), [], { live });
  const all = useFetch((signal) => inventoryService.listInventory({ q: q || undefined, type: type || undefined }, signal), [q, type], { live });
  const movements = useFetch((signal) => inventoryService.listStockMovements({ limit: 15 }, signal), [], { live: ['inventory.', 'order.', 'product.'] });

  const s = summary.data;
  const items = useMemo(() => all.data ?? [], [all.data]);
  const counts = useMemo(() => ({
    all: items.length,
    low: items.filter((i) => i.product.stockStatus === 'LOW_STOCK').length,
    out: items.filter((i) => i.product.stockStatus === 'OUT_OF_STOCK').length,
    healthy: items.filter((i) => i.product.stockStatus === 'IN_STOCK').length,
  }), [items]);
  const rows = items.filter((i) =>
    filter === 'all' ? true : filter === 'low' ? i.product.stockStatus === 'LOW_STOCK' : filter === 'out' ? i.product.stockStatus === 'OUT_OF_STOCK' : i.product.stockStatus === 'IN_STOCK'
  );
  const adjustItem = adjustId && items.find((i) => String(i.product.id) === adjustId);

  return (
    <>
      <PageHeader
        title="Inventory"
        description="Stock levels, sell-through and every stock movement. Sales and cancellations update this page automatically."
        actions={<SearchInput value={search} onChange={setSearch} placeholder="Search product or SKU" />}
      />

      <div className="kpi-grid kpi-grid--5">
        <StatCard label="Active SKUs" icon={Layers} loading={!s} value={s && formatNumber(s.skuCount)} />
        <StatCard label="Units on hand" icon={Boxes} loading={!s} value={s && formatNumber(s.totalUnits)} />
        <StatCard label="Stock value" icon={IndianRupee} loading={!s} value={s && formatPriceCompact(s.stockValue)} comparisonLabel="at selling price" />
        <StatCard label="Low stock" icon={AlertTriangle} loading={!s} value={s && formatNumber(s.lowStock)} comparisonLabel={s && `≤ ${s.lowStockThreshold} units`} />
        <StatCard label="Out of stock" icon={PackageX} loading={!s} value={s && formatNumber(s.outOfStock)} />
      </div>

      <div className="grid-3-1">
        <Card padded={false} className="table-card">
          <Tabs
            value={filter}
            onChange={(v) => setParam('filter', v === 'all' ? '' : v)}
            ariaLabel="Stock filter"
            tabs={[
              { value: 'all', label: 'All', count: counts.all },
              { value: 'low', label: 'Low Stock', count: counts.low },
              { value: 'out', label: 'Out of Stock', count: counts.out },
              { value: 'healthy', label: 'Healthy', count: counts.healthy },
            ]}
          />
          <div className="table-toolbar">
            <div>
              <h2 className="table-toolbar__title">{formatNumber(rows.length)} Products</h2>
              <p className="table-toolbar__sub">Most urgent first · velocity and cover based on the last 30 days</p>
            </div>
            <Select aria-label="Category" value={type} onChange={(e) => setParam('type', e.target.value)} placeholder="All categories" options={categories} />
          </div>

          {all.error ? (
            <ErrorState error={all.error} onRetry={all.refetch} />
          ) : !all.data ? (
            <SkeletonRows rows={8} columns={6} />
          ) : rows.length === 0 ? (
            <EmptyState icon={Boxes} title="Nothing to show" description="No products match this filter." />
          ) : (
            <div className="table-wrap">
              <table className="table">
                <thead>
                  <tr>
                    <th scope="col">Product</th>
                    <th scope="col">On hand</th>
                    <th scope="col" className="num">Sold (30d)</th>
                    <th scope="col" className="num">Days of cover</th>
                    <th scope="col">Status</th>
                    <th scope="col" className="col-actions"><span className="sr-only">Actions</span></th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map(({ product: p, unitsSold30d, dailyVelocity, daysOfCover }) => (
                    <tr key={p.id}>
                      <td>
                        <div className="product-cell">
                          <ProductThumb product={p} size={38} />
                          <div>
                            <div className="product-cell__name">{p.name}</div>
                            <div className="product-cell__meta">{p.sku} · {p.typeLabel}</div>
                          </div>
                        </div>
                      </td>
                      <td className="col-meter">
                        <div className="meter-cell">
                          <span className={`stock-text stock-text--${p.stockStatus}`}>{formatNumber(p.stock)}</span>
                          <StockMeter stock={p.stock} threshold={s?.lowStockThreshold ?? 10} />
                        </div>
                      </td>
                      <td className="num">
                        {formatNumber(unitsSold30d)}
                        <div className="muted small">{dailyVelocity}/day</div>
                      </td>
                      <td className="num">
                        {p.stock === 0 ? <span className="text-danger">Sold out</span> : daysOfCover === null ? <span className="muted">No recent sales</span> : `${formatNumber(daysOfCover)} days`}
                      </td>
                      <td><StockBadge status={p.stockStatus} /></td>
                      <td className="col-actions">
                        <Button size="sm" icon={SlidersHorizontal} onClick={() => setParam('adjust', p.id)} aria-label={`Adjust stock for ${p.name}`} title="Adjust stock" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        <Card>
          <CardHeader title="Stock movements" subtitle="Live ledger of every change" icon={History} />
          {movements.error ? (
            <ErrorState error={movements.error} onRetry={movements.refetch} />
          ) : !movements.data ? (
            <SkeletonRows rows={6} columns={2} />
          ) : movements.data.length === 0 ? (
            <p className="muted small">No stock movements yet.</p>
          ) : (
            <ul className="ledger">
              {movements.data.map((m) => (
                <li key={m.id} className="ledger__item">
                  <span className={`ledger__qty ${m.quantityChange > 0 ? 'is-in' : 'is-out'}`}>
                    {m.quantityChange > 0 ? '+' : '−'}{Math.abs(m.quantityChange)}
                  </span>
                  <span className="ledger__text">
                    <strong>{m.productName}</strong>
                    <span>{MOVEMENT_LABELS[m.reason] ?? m.reason}{m.note ? ` · ${m.note}` : ''}</span>
                  </span>
                  <span className="ledger__meta">
                    <span>{formatNumber(m.balanceAfter)} left</span>
                    <span>{timeAgo(m.createdAt)}</span>
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      {adjustItem && <StockAdjustModal key={adjustItem.product.id} item={adjustItem} onClose={() => setParam('adjust', '')} />}
    </>
  );
}
