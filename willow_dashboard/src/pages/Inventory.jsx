import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { AlertTriangle, Boxes, History, IndianRupee, Layers, Minus, PackageX, Plus, SlidersHorizontal } from 'lucide-react';
import { sellerApi } from '../api/seller.js';
import { useQuery } from '../hooks/useQuery.js';
import { useDebounce } from '../hooks/useDebounce.js';
import { useToast } from '../components/toast/ToastProvider.jsx';
import PageHeader from '../components/ui/PageHeader.jsx';
import Button from '../components/ui/Button.jsx';
import { Card, CardHeader } from '../components/ui/Card.jsx';
import { Tabs, Segmented } from '../components/ui/Tabs.jsx';
import { Field, Input, SearchInput, Select, Textarea } from '../components/ui/Form.jsx';
import { StockBadge } from '../components/ui/Badge.jsx';
import ProductThumb from '../components/ui/ProductThumb.jsx';
import KpiCard from '../components/ui/KpiCard.jsx';
import { Modal } from '../components/ui/Overlay.jsx';
import { EmptyState, ErrorState, SkeletonRows } from '../components/ui/States.jsx';
import { MOVEMENT_LABELS, STOCK_REASONS } from '../utils/constants.js';
import { useCategories } from '../hooks/useCategories.js';
import { formatCurrencyCompact, formatNumber, timeAgo } from '../utils/format.js';

function StockMeter({ stock, threshold }) {
  // Full bar = 3× the low-stock threshold, so "healthy" sits comfortably past the warning mark.
  const max = Math.max(threshold * 3, 1);
  const pct = Math.min(100, (stock / max) * 100);
  const tone = stock <= 0 ? 'danger' : stock <= threshold ? 'warning' : 'success';
  return (
    <div className="meter" title={`${stock} in stock · threshold ${threshold}`}>
      <div className={`meter__fill meter__fill--${tone}`} style={{ width: `${Math.max(pct, stock > 0 ? 3 : 0)}%` }} />
      <div className="meter__mark" style={{ left: `${(threshold / max) * 100}%` }} aria-hidden />
    </div>
  );
}

function AdjustModal({ item, onClose }) {
  const toast = useToast();
  const [direction, setDirection] = useState('in');
  const [quantity, setQuantity] = useState('');
  const [reason, setReason] = useState('RESTOCK');
  const [note, setNote] = useState('');
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const p = item.product;

  const reasons = STOCK_REASONS.filter((r) => r.direction === 'both' || r.direction === direction);
  useEffect(() => {
    if (!reasons.some((r) => r.value === reason)) setReason(reasons[0].value);
  }, [direction]); // eslint-disable-line react-hooks/exhaustive-deps

  const qty = Number(quantity) || 0;
  const change = direction === 'in' ? qty : -qty;
  const after = p.stock + change;

  async function submit(e) {
    e.preventDefault();
    if (!Number.isInteger(qty) || qty <= 0) return setErrors({ quantityChange: 'Enter a whole number greater than 0' });
    if (after < 0) return setErrors({ quantityChange: `Only ${p.stock} in stock` });
    setSaving(true);
    try {
      await sellerApi.adjustStock(p.id, { quantityChange: change, reason, note: note.trim() || null });
      toast.success('Stock updated', `${p.name}: ${p.stock} → ${after}`);
      onClose();
    } catch (err) {
      setErrors(err.fields ?? { quantityChange: err.message });
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal
      open
      onClose={onClose}
      title="Adjust stock"
      subtitle={`${p.name} · ${p.sku}`}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button variant="primary" onClick={submit} loading={saving} disabled={!qty}>Save adjustment</Button>
        </>
      }
    >
      <form className="stack" onSubmit={submit}>
        <Segmented
          ariaLabel="Direction"
          value={direction}
          onChange={setDirection}
          options={[{ value: 'in', label: 'Add stock' }, { value: 'out', label: 'Remove stock' }]}
        />
        <Field label="Quantity" required error={errors.quantityChange}>
          {(id) => (
            <Input id={id} type="number" min="1" step="1" autoFocus value={quantity} onChange={(e) => { setQuantity(e.target.value); setErrors({}); }} prefix={direction === 'in' ? <Plus size={14} /> : <Minus size={14} />} suffix="units" />
          )}
        </Field>
        <Field label="Reason" required>
          {(id) => <Select id={id} value={reason} onChange={(e) => setReason(e.target.value)} options={reasons} />}
        </Field>
        <Field label="Note" hint="Optional, e.g. supplier invoice number">
          {(id) => <Textarea id={id} rows={2} maxLength={300} value={note} onChange={(e) => setNote(e.target.value)} />}
        </Field>
        <div className="adjust-preview">
          <div><span>Current</span><strong>{formatNumber(p.stock)}</strong></div>
          <div className="adjust-preview__arrow" aria-hidden>→</div>
          <div><span>After</span><strong className={after < 0 ? 'text-danger' : ''}>{formatNumber(after)}</strong></div>
        </div>
      </form>
    </Modal>
  );
}

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
  const summary = useQuery((signal) => sellerApi.inventorySummary(signal), [], { live });
  const all = useQuery((signal) => sellerApi.inventory({ q: q || undefined, type: type || undefined }, signal), [q, type], { live });
  const movements = useQuery((signal) => sellerApi.stockMovements({ limit: 15 }, signal), [], { live: ['inventory.', 'order.', 'product.'] });

  const s = summary.data;
  const items = all.data ?? [];
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
        <KpiCard label="Active SKUs" icon={Layers} loading={!s} value={s && formatNumber(s.skuCount)} />
        <KpiCard label="Units on hand" icon={Boxes} loading={!s} value={s && formatNumber(s.totalUnits)} />
        <KpiCard label="Stock value" icon={IndianRupee} loading={!s} value={s && formatCurrencyCompact(s.stockValue)} comparisonLabel="at selling price" />
        <KpiCard label="Low stock" icon={AlertTriangle} loading={!s} value={s && formatNumber(s.lowStock)} comparisonLabel={s && `≤ ${s.lowStockThreshold} units`} />
        <KpiCard label="Out of stock" icon={PackageX} loading={!s} value={s && formatNumber(s.outOfStock)} />
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

      {adjustItem && <AdjustModal key={adjustItem.product.id} item={adjustItem} onClose={() => setParam('adjust', '')} />}
    </>
  );
}
