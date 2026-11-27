import { useState } from 'react';
import { Mail, MapPin, Phone } from 'lucide-react';
import { orderService } from '../../services/orderService.js';
import { useFetch } from '../../hooks/useFetch.js';
import { useToast } from '../../context/ToastProvider.jsx';
import Button from '../common/Button.jsx';
import { ConfirmDialog, Drawer } from '../common/Modal.jsx';
import ErrorState from '../common/ErrorState.jsx';
import { SkeletonRows } from '../common/Loader.jsx';
import ProductThumb from '../common/ProductThumb.jsx';
import OrderStatusBadge from './OrderStatusBadge.jsx';
import OrderTimeline from './OrderTimeline.jsx';
import { ACTOR_LABELS, ORDER_STATUS, PAYMENT_LABELS, PAYMENT_STATUS } from '../../constants/orderStatus.js';
import { Badge } from '../common/Badge.jsx';
import { formatPrice } from '../../utils/formatPrice.js';
import { formatDateTime, timeAgo } from '../../utils/formatDate.js';

const isDestructive = (status) => status === 'CANCELLED' || status === 'RETURNED';

/** Side panel with one order's details and the actions that move it through fulfilment. */
export default function OrderDetailsDrawer({ orderId, onClose }) {
  const toast = useToast();
  const [busy, setBusy] = useState(null);
  const [confirm, setConfirm] = useState(null);
  const order = useFetch((signal) => orderService.getOrder(orderId, signal), [orderId], { live: ['order.updated'] });
  const o = order.data;

  async function move(status) {
    setBusy(status);
    try {
      const updated = await orderService.updateOrderStatus(o.id, status);
      order.setData(updated);
      toast.success(`${updated.orderNumber} marked ${ORDER_STATUS[status].label.toLowerCase()}`,
        isDestructive(status) ? 'Stock has been returned to inventory.' : undefined);
    } catch (err) {
      toast.error('Could not update order', err.message);
      throw err;
    } finally {
      setBusy(null);
    }
  }

  const forward = o?.nextStatuses.filter((s) => !isDestructive(s)) ?? [];
  const destructive = o?.nextStatuses.filter(isDestructive) ?? [];

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
          <OrderTimeline status={o.status} />

          {o.status === 'CANCELLED' && (
            <p className="order-cancel-note">
              Cancelled by {o.history.at(-1)?.actor === 'CUSTOMER' ? 'the customer' : 'you'}
              {o.cancellationNote ? `: “${o.cancellationNote}”` : '.'}
            </p>
          )}

          <section>
            <h3 className="section-title">Items ({o.itemCount})</h3>
            <ul className="line-items">
              {o.items.map((item, i) => (
                <li key={`${item.productId}-${i}`}>
                  <ProductThumb product={{ type: item.type, hex: item.hex, imageUrl: item.imageUrl }} size={44} />
                  <div className="line-items__text">
                    <strong>{item.productName}</strong>
                    <span>{item.size ? `Size ${item.size} · ` : ''}{item.quantity} × {formatPrice(item.unitPrice)}</span>
                  </div>
                  <span className="strong">{formatPrice(item.lineTotal)}</span>
                </li>
              ))}
            </ul>
            <dl className="totals">
              <div><dt>Subtotal</dt><dd>{formatPrice(o.subtotal)}</dd></div>
              <div><dt>Shipping</dt><dd>{Number(o.shippingFee) === 0 ? 'Free' : formatPrice(o.shippingFee)}</dd></div>
              <div className="totals__grand"><dt>Total</dt><dd>{formatPrice(o.total)}</dd></div>
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
              <p className="icon-line icon-line--top">
                <MapPin size={14} aria-hidden />
                <span>
                  {o.shippingAddress || '—'}
                  {(o.shippingCity || o.shippingState) && <><br />{[o.shippingCity, o.shippingState].filter(Boolean).join(', ')}</>}
                  {o.shippingPincode && <> – {o.shippingPincode}</>}
                </span>
              </p>
              <h3 className="section-title section-title--spaced">Payment</h3>
              <p className="icon-line">
                {PAYMENT_LABELS[o.paymentMethod] ?? o.paymentMethod}
                {PAYMENT_STATUS[o.paymentStatus] && (
                  <Badge tone={PAYMENT_STATUS[o.paymentStatus].tone}>
                    {o.paymentStatus === 'PENDING' && o.paymentMethod === 'COD'
                      ? `Collect ${formatPrice(o.total)}`
                      : PAYMENT_STATUS[o.paymentStatus].label}
                  </Badge>
                )}
              </p>
            </div>
          </section>

          {o.history?.length > 0 && (
            <section>
              <h3 className="section-title">History</h3>
              <ol className="order-history">
                {[...o.history].reverse().map((h, i) => (
                  <li key={i}>
                    <span className="strong">{ORDER_STATUS[h.status]?.label ?? h.status}</span>
                    <span className="muted small"> · {ACTOR_LABELS[h.actor] ?? h.actor} · {formatDateTime(h.at)}</span>
                    {h.note && <div className="muted small">{h.note}</div>}
                  </li>
                ))}
              </ol>
            </section>
          )}
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
