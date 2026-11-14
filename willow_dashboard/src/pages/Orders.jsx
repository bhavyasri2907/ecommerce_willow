import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ArrowDown, ArrowUp, ArrowUpDown, Check, Mail, MapPin, Phone, ShoppingCart } from 'lucide-react';
import { sellerApi } from '../api/seller.js';
import { useQuery } from '../hooks/useQuery.js';
import { useDebounce } from '../hooks/useDebounce.js';
import { useLiveEvent } from '../live/LiveProvider.jsx';
import { useToast } from '../components/toast/ToastProvider.jsx';
import PageHeader from '../components/ui/PageHeader.jsx';
import Button from '../components/ui/Button.jsx';
import { Card } from '../components/ui/Card.jsx';
import { Tabs } from '../components/ui/Tabs.jsx';
import { SearchInput } from '../components/ui/Form.jsx';
import { OrderStatusBadge } from '../components/ui/Badge.jsx';
import ProductThumb from '../components/ui/ProductThumb.jsx';
import Pagination from '../components/ui/Pagination.jsx';
import { ConfirmDialog, Drawer } from '../components/ui/Overlay.jsx';
import { EmptyState, ErrorState, SkeletonRows } from '../components/ui/States.jsx';
import { FULFILMENT_STEPS, ORDER_STATUS, PAYMENT_LABELS } from '../utils/constants.js';
import { formatCurrency, formatDateTime, formatNumber, timeAgo } from '../utils/format.js';

const TAB_ORDER = ['ALL', 'PENDING', 'CONFIRMED', 'PACKED', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'RETURNED'];

function Timeline({ status }) {
  const voided = status === 'CANCELLED' || status === 'RETURNED';
  const current = FULFILMENT_STEPS.indexOf(status);
  return (
    <ol className={`timeline ${voided ? 'is-void' : ''}`} aria-label="Fulfilment progress">
      {FULFILMENT_STEPS.map((step, i) => {
        const done = !voided && i <= current;
        return (
          <li key={step} className={`timeline__step ${done ? 'is-done' : ''} ${i === current ? 'is-current' : ''}`}>
            <span className="timeline__dot" aria-hidden>{done && <Check size={11} strokeWidth={3} />}</span>
            <span className="timeline__label">{ORDER_STATUS[step].label}</span>
          </li>
        );
      })}
    </ol>
  );
}

function OrderDrawer({ orderId, onClose }) {
  const toast = useToast();
  const [busy, setBusy] = useState(null);
  const [confirm, setConfirm] = useState(null);
  const order = useQuery((signal) => sellerApi.getOrder(orderId, signal), [orderId], { live: ['order.updated'] });
  const o = order.data;

  async function move(status) {
    setBusy(status);
    try {
      const updated = await sellerApi.setOrderStatus(o.id, status);
      order.setData(updated);
      toast.success(`${updated.orderNumber} marked ${ORDER_STATUS[status].label.toLowerCase()}`,
        status === 'CANCELLED' || status === 'RETURNED' ? 'Stock has been returned to inventory.' : undefined);
    } catch (err) {
      toast.error('Could not update order', err.message);
      throw err;
    } finally {
      setBusy(null);
    }
  }

  const forward = o?.nextStatuses.filter((s) => s !== 'CANCELLED' && s !== 'RETURNED') ?? [];
  const destructive = o?.nextStatuses.filter((s) => s === 'CANCELLED' || s === 'RETURNED') ?? [];

  return (
    <Drawer
      open
      onClose={onClose}
      title={o ? o.orderNumber : 'Order'}
      subtitle={o ? `Placed ${formatDateTime(o.createdAt)}` : undefined}
      actions={o && <OrderStatusBadge status={o.status} />}
      footer={
        o && o.nextStatuses.length > 0 && (
          <>
            {destructive.map((s) => (
              <Button key={s} variant="ghost" className="text-danger" disabled={!!busy} onClick={() => setConfirm(s)}>
                {ORDER_STATUS[s].action}
              </Button>
            ))}
            <span className="spacer" />
            {forward.map((s) => (
              <Button key={s} variant="primary" loading={busy === s} disabled={!!busy} onClick={() => move(s).catch(() => {})}>
                {ORDER_STATUS[s].action}
              </Button>
            ))}
          </>
        )
      }
    >
      {order.error ? (
        <ErrorState error={order.error} onRetry={order.refetch} />
      ) : !o ? (
        <SkeletonRows rows={5} columns={2} />
      ) : (
        <div className="order-detail">
          <Timeline status={o.status} />

          <section>
            <h3 className="section-title">Items ({o.itemCount})</h3>
            <ul className="line-items">
              {o.items.map((item, i) => (
                <li key={`${item.productId}-${i}`}>
                  <ProductThumb product={{ type: item.type, hex: item.hex, imageUrl: item.imageUrl }} size={44} />
                  <div className="line-items__text">
                    <strong>{item.productName}</strong>
                    <span>{item.size ? `Size ${item.size} · ` : ''}{item.quantity} × {formatCurrency(item.unitPrice)}</span>
                  </div>
                  <span className="strong">{formatCurrency(item.lineTotal)}</span>
                </li>
              ))}
            </ul>
            <dl className="totals">
              <div><dt>Subtotal</dt><dd>{formatCurrency(o.subtotal)}</dd></div>
              <div><dt>Shipping</dt><dd>{Number(o.shippingFee) === 0 ? 'Free' : formatCurrency(o.shippingFee)}</dd></div>
              <div className="totals__grand"><dt>Total</dt><dd>{formatCurrency(o.total)}</dd></div>
            </dl>
          </section>

          <section className="info-grid">
            <div>
              <h3 className="section-title">Customer</h3>
              <p className="strong">{o.customerName}</p>
              <p className="icon-line"><Mail size={14} aria-hidden /> {o.customerEmail}</p>
              {o.customerPhone && <p className="icon-line"><Phone size={14} aria-hidden /> {o.customerPhone}</p>}
            </div>
            <div>
              <h3 className="section-title">Shipping</h3>
              <p className="icon-line"><MapPin size={14} aria-hidden /> {[o.shippingAddress, o.shippingCity].filter(Boolean).join(', ') || '—'}</p>
              <h3 className="section-title section-title--spaced">Payment</h3>
              <p>{PAYMENT_LABELS[o.paymentMethod] ?? o.paymentMethod}</p>
            </div>
          </section>
          <p className="muted small">Last updated {timeAgo(o.updatedAt)}</p>
        </div>
      )}

      <ConfirmDialog
        open={!!confirm}
        onClose={() => setConfirm(null)}
        onConfirm={() => move(confirm)}
        title={confirm === 'CANCELLED' ? `Cancel ${o?.orderNumber}?` : `Mark ${o?.orderNumber} as returned?`}
        message={`The ${o?.itemCount} item${o?.itemCount === 1 ? '' : 's'} on this order will be added back to inventory. This can't be undone.`}
        confirmLabel={confirm === 'CANCELLED' ? 'Cancel order' : 'Mark returned'}
      />
    </Drawer>
  );
}

export default function Orders() {
  const [params, setParams] = useSearchParams();
  const tab = params.get('tab') || 'ALL';
  const page = Number(params.get('page') || 0);
  const size = Number(params.get('size') || 10);
  const sort = params.get('sort') || 'createdAt';
  const dir = params.get('dir') || 'desc';
  const openOrder = params.get('order');
  const [search, setSearch] = useState(params.get('q') || '');
  const q = useDebounce(search, 300);
  const [newIds, setNewIds] = useState(new Set());

  function update(changes, { resetPage = true } = {}) {
    const next = new URLSearchParams(params);
    Object.entries(changes).forEach(([k, v]) => (v === '' || v === null || v === undefined ? next.delete(k) : next.set(k, v)));
    if (resetPage && !('page' in changes) && !('order' in changes)) next.delete('page');
    setParams(next, { replace: !('order' in changes) });
  }

  useEffect(() => {
    if ((params.get('q') || '') !== q) update({ q });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);
  useEffect(() => {
    const fromUrl = params.get('q') || '';
    if (fromUrl !== search && fromUrl !== q) setSearch(fromUrl);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params]);

  useLiveEvent('order.created', (event) => {
    const id = event.payload.id;
    setNewIds((prev) => new Set(prev).add(id));
    setTimeout(() => setNewIds((prev) => { const n = new Set(prev); n.delete(id); return n; }), 6000);
  });

  const listParams = { status: tab === 'ALL' ? undefined : tab, q: q || undefined, page, size, sort, dir };
  const orders = useQuery((signal) => sellerApi.listOrders(listParams, signal), [JSON.stringify(listParams)], { live: ['order.'] });
  const counts = useQuery((signal) => sellerApi.orderCounts(signal), [], { live: ['order.'] });

  const tabs = TAB_ORDER.map((s) => ({ value: s, label: s === 'ALL' ? 'All' : ORDER_STATUS[s].label, count: counts.data?.[s] }));
  const rows = orders.data?.content ?? [];

  const sortIcon = (key) => (sort !== key ? ArrowUpDown : dir === 'asc' ? ArrowUp : ArrowDown);
  const toggleSort = (key) => update({ sort: key, dir: sort === key && dir === 'desc' ? 'asc' : 'desc' });
  const sortButton = (k, label) => {
    const Icon = sortIcon(k);
    return (
      <button className={`th-sort ${sort === k ? 'is-active' : ''}`} onClick={() => toggleSort(k)}>
        {label} <Icon size={13} aria-hidden />
      </button>
    );
  };

  return (
    <>
      <PageHeader
        title="Orders"
        description="Confirm, pack and ship orders. New storefront orders appear here in real time."
        actions={<SearchInput value={search} onChange={setSearch} placeholder="Order #, customer, email or city" />}
      />

      <Card padded={false} className="table-card">
        <Tabs tabs={tabs} value={tab} onChange={(v) => update({ tab: v === 'ALL' ? '' : v })} ariaLabel="Order status" />

        <div className="table-toolbar">
          <div>
            <h2 className="table-toolbar__title">
              {formatNumber(orders.data?.totalElements ?? 0)} {tab === 'ALL' ? '' : ORDER_STATUS[tab].label} Orders
            </h2>
            <p className="table-toolbar__sub">{orders.refreshing ? 'Updating…' : 'Click an order to see details and move it forward.'}</p>
          </div>
        </div>

        {orders.error ? (
          <ErrorState error={orders.error} onRetry={orders.refetch} />
        ) : orders.loading && !orders.data ? (
          <SkeletonRows rows={size > 10 ? 10 : size} columns={6} />
        ) : rows.length === 0 ? (
          <EmptyState icon={ShoppingCart} title="No orders here" description={q ? `Nothing matches "${q}".` : 'Orders in this state will show up here.'} />
        ) : (
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th scope="col">{sortButton('orderNumber', 'Order')}</th>
                  <th scope="col">Customer</th>
                  <th scope="col">Items</th>
                  <th scope="col">Payment</th>
                  <th scope="col" className="num">{sortButton('total', 'Total')}</th>
                  <th scope="col">Status</th>
                  <th scope="col">{sortButton('createdAt', 'Placed')}</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((o) => (
                  <tr
                    key={o.id}
                    className={`is-clickable ${newIds.has(o.id) ? 'is-new' : ''} ${String(o.id) === openOrder ? 'is-selected' : ''}`}
                    onClick={() => update({ order: o.id })}
                  >
                    <td>
                      <div className="strong">{o.orderNumber}</div>
                      {newIds.has(o.id) && <span className="new-tag">New</span>}
                    </td>
                    <td>
                      <div>{o.customerName}</div>
                      <div className="muted small">{o.shippingCity ?? o.customerEmail}</div>
                    </td>
                    <td>
                      <div className="thumb-stack">
                        {o.items.slice(0, 3).map((item, i) => (
                          <ProductThumb key={i} product={{ type: item.type, hex: item.hex, imageUrl: item.imageUrl }} size={30} />
                        ))}
                        <span className="muted small">{o.itemCount} item{o.itemCount === 1 ? '' : 's'}</span>
                      </div>
                    </td>
                    <td className="muted">{PAYMENT_LABELS[o.paymentMethod] ?? o.paymentMethod}</td>
                    <td className="num strong">{formatCurrency(o.total)}</td>
                    <td><OrderStatusBadge status={o.status} /></td>
                    <td>
                      <div>{timeAgo(o.createdAt)}</div>
                      <div className="muted small">{formatDateTime(o.createdAt)}</div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {orders.data && (
          <Pagination
            page={orders.data.page}
            size={orders.data.size}
            totalElements={orders.data.totalElements}
            totalPages={orders.data.totalPages}
            onPageChange={(p) => update({ page: p || '' }, { resetPage: false })}
            onSizeChange={(n) => update({ size: n === 10 ? '' : n })}
          />
        )}
      </Card>

      {openOrder && <OrderDrawer key={openOrder} orderId={openOrder} onClose={() => update({ order: '' })} />}
    </>
  );
}
