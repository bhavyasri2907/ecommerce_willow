import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { orderService } from '../../../services/orderService.js';
import { ChevronLeftIcon } from '../../../assets/icons/NavIcons.jsx';
import ProductImage from '../../products/components/ProductImage.jsx';
import AddressText from '../../address/components/AddressText.jsx';
import OrderStatusPill from '../../orders/components/OrderStatusPill.jsx';
import OrderTracker from '../../orders/components/OrderTracker.jsx';
import { CANCEL_REASONS, ORDER_STATUS, PAYMENT_LABELS, formatOrderDate, paymentNote } from '../../orders/orderStatus.js';
import { formatPrice } from '../../../utils/formatPrice.js';

/** How often an open order is re-checked while the page is visible, so seller updates show up. */
const REFRESH_MS = 30000;

/** My Account > My Orders > one order: tracking, items, delivery and payment, and cancellation. */
export default function OrderDetail() {
  const { orderNumber } = useParams();
  const [order, setOrder] = useState(null);
  const [error, setError] = useState(null);
  const [cancelOpen, setCancelOpen] = useState(false);

  useEffect(() => {
    let active = true;
    const fetchOrder = () =>
      orderService
        .getOrder(orderNumber)
        .then((o) => active && setOrder(o))
        .catch((err) => active && setError(err));
    fetchOrder();

    const timer = setInterval(() => {
      if (document.visibilityState === 'visible') fetchOrder();
    }, REFRESH_MS);
    return () => {
      active = false;
      clearInterval(timer);
    };
  }, [orderNumber]);

  const back = (
    <Link to="/account/orders" className="order-back">
      <ChevronLeftIcon size={16} /> All orders
    </Link>
  );

  if (error) {
    return (
      <section className="account-section">
        {back}
        <div className="account-empty">
          <h2 className="account-empty__title">{error.status === 404 ? 'Order not found' : "Couldn't load this order"}</h2>
          <p className="account-empty__text">{error.status === 404 ? `We couldn't find ${orderNumber} in your orders.` : error.message}</p>
        </div>
      </section>
    );
  }
  if (!order) return <p className="state-msg">Loading order…</p>;

  const o = order;
  return (
    <section className="account-section order-detail">
      {back}
      <header className="order-detail__head">
        <div>
          <h1 className="account-section__title">{o.orderNumber}</h1>
          <p className="account-section__intro">
            Placed {formatOrderDate(o.createdAt, { withTime: true })} · Sold by{' '}
            <Link to={`/store/${o.storeId}`}>{o.storeName}</Link>
          </p>
        </div>
        <OrderStatusPill status={o.status} />
      </header>

      <div className="order-panel">
        <p className="order-panel__status">{ORDER_STATUS[o.status]?.text}</p>
        {o.status === 'CANCELLED' && o.cancellationNote && (
          <p className="order-panel__note">Reason: {o.cancellationNote}</p>
        )}
        <OrderTracker order={o} />
        {o.cancellable && (
          <div className="order-panel__actions">
            <button type="button" className="btn btn--danger-ghost" onClick={() => setCancelOpen(true)}>Cancel order</button>
            <span className="order-panel__hint">You can cancel until the seller packs your order.</span>
          </div>
        )}
      </div>

      {cancelOpen && (
        <CancelOrder
          order={o}
          onClose={() => setCancelOpen(false)}
          onCancelled={(updated) => {
            setOrder(updated);
            setCancelOpen(false);
          }}
        />
      )}

      <div className="order-detail__grid">
        <section className="order-panel">
          <h2 className="order-panel__title">Items ({o.itemCount})</h2>
          <ul className="review-list">
            {o.items.map((item, i) => (
              <li key={`${item.productId}-${i}`} className="review-item">
                <Link to={`/product/${item.productId}`} aria-label={item.productName}>
                  <ProductImage
                    product={{ name: item.productName, type: item.type, hex: item.hex, imageUrl: item.imageUrl }}
                    className="review-item__img"
                    iconSize="60%"
                  />
                </Link>
                <div className="review-item__text">
                  <Link to={`/product/${item.productId}`}><strong>{item.productName}</strong></Link>
                  <span>{item.size ? `Size ${item.size} · ` : ''}{item.quantity} × {formatPrice(item.unitPrice)}</span>
                  {o.status === 'DELIVERED' && (
                    <Link to={`/product/${item.productId}#write-review`} className="link-btn order-item__review">★ Rate &amp; review</Link>
                  )}
                </div>
                <span className="review-item__price">{formatPrice(item.lineTotal)}</span>
              </li>
            ))}
          </ul>
        </section>

        <div className="order-detail__side">
          <section className="order-panel">
            <h2 className="order-panel__title">Delivery address</h2>
            <AddressText
              name={o.customerName}
              phone={o.customerPhone}
              line={o.shippingAddress}
              city={o.shippingCity}
              state={o.shippingState}
              pincode={o.shippingPincode}
            />
          </section>

          <section className="order-panel">
            <h2 className="order-panel__title">Payment</h2>
            <p className="order-panel__pay">
              <strong>{PAYMENT_LABELS[o.paymentMethod] ?? o.paymentMethod}</strong>
              <span>{paymentNote(o)}</span>
            </p>
            <dl className="price-details__rows order-panel__rows">
              <div><dt>Subtotal</dt><dd>{formatPrice(o.subtotal)}</dd></div>
              <div><dt>Shipping</dt><dd>{Number(o.shippingFee) === 0 ? 'Free' : formatPrice(o.shippingFee)}</dd></div>
            </dl>
            <div className="price-details__total">
              <span>Order total</span>
              <span>{formatPrice(o.total)}</span>
            </div>
          </section>
        </div>
      </div>
    </section>
  );
}

/** Asks why, then cancels. The seller sees the reason on their dashboard. */
function CancelOrder({ order, onClose, onCancelled }) {
  const [reason, setReason] = useState('');
  const [other, setOther] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function submit(e) {
    e.preventDefault();
    if (!reason) {
      setError('Tell us why you are cancelling.');
      return;
    }
    setBusy(true);
    setError('');
    try {
      const text = reason === 'Other' ? other.trim() || 'Other' : reason;
      onCancelled(await orderService.cancelOrder(order.orderNumber, text));
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  }

  return (
    <form className="order-panel cancel-box" onSubmit={submit}>
      <h2 className="order-panel__title">Cancel {order.orderNumber}?</h2>
      <p className="order-panel__hint">
        {order.paymentMethod === 'COD' ? 'Nothing has been charged, so there is nothing to refund.' : 'Any payment will be refunded.'}
      </p>
      <div className="cancel-box__reasons" role="radiogroup" aria-label="Reason for cancelling">
        {CANCEL_REASONS.map((r) => (
          <label key={r} className="cancel-box__reason">
            <input type="radio" name="reason" className="cart-check" checked={reason === r} onChange={() => setReason(r)} />
            <span>{r}</span>
          </label>
        ))}
      </div>
      {reason === 'Other' && (
        <textarea
          className="cancel-box__other"
          maxLength={300}
          rows={3}
          placeholder="Tell us a little more (optional)"
          value={other}
          onChange={(e) => setOther(e.target.value)}
        />
      )}
      {error && <p className="form-alert" role="alert">{error}</p>}
      <div className="addr-form__actions">
        <button type="button" className="btn btn--ghost" onClick={onClose} disabled={busy}>Keep order</button>
        <button type="submit" className="btn btn--danger" disabled={busy}>{busy ? 'Cancelling…' : 'Cancel order'}</button>
      </div>
    </form>
  );
}
