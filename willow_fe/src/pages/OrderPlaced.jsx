import { Link, Navigate, useLocation } from 'react-router-dom';
import AddressText from '../features/address/components/AddressText.jsx';
import OrderStatusPill from '../features/orders/components/OrderStatusPill.jsx';
import { formatPrice } from '../utils/formatPrice.js';

/** Thank-you page after checkout. Gets the placed orders from navigation state. */
export default function OrderPlaced() {
  const { state } = useLocation();
  const orders = state?.orders;
  if (!orders?.length) return <Navigate to="/account/orders" replace />;

  const amountDue = orders.reduce((sum, o) => sum + Number(o.total), 0);
  const first = orders[0];

  return (
    <div className="placed">
      <div className="placed__hero">
        <span className="placed__tick" aria-hidden="true">✓</span>
        <h1 className="placed__title">Order placed, thank you!</h1>
        <p className="placed__sub">
          {orders.length === 1
            ? `Your order ${first.orderNumber} has been sent to ${first.storeName}.`
            : `Your items come from ${orders.length} sellers, so we've placed ${orders.length} orders.`}{' '}
          We&apos;ll keep its status updated in My Orders.
        </p>
      </div>

      <div className="placed__grid">
        <section className="placed__card">
          <h2 className="placed__card-title">Order{orders.length > 1 ? 's' : ''}</h2>
          <ul className="placed__orders">
            {orders.map((o) => (
              <li key={o.orderNumber}>
                <div>
                  <Link to={`/account/orders/${o.orderNumber}`} className="placed__number">{o.orderNumber}</Link>
                  <span className="placed__meta">
                    {o.itemCount} item{o.itemCount === 1 ? '' : 's'} · Sold by {o.storeName}
                  </span>
                </div>
                <div className="placed__right">
                  <OrderStatusPill status={o.status} />
                  <strong>{formatPrice(o.total)}</strong>
                </div>
              </li>
            ))}
          </ul>
        </section>

        <section className="placed__card">
          <h2 className="placed__card-title">Delivering to</h2>
          <AddressText
            name={first.customerName}
            phone={first.customerPhone}
            line={first.shippingAddress}
            city={first.shippingCity}
            state={first.shippingState}
            pincode={first.shippingPincode}
          />
          <h2 className="placed__card-title placed__card-title--spaced">Payment</h2>
          <p className="placed__cod">
            Cash on Delivery · <strong>{formatPrice(amountDue)}</strong> to pay when your order{orders.length > 1 ? 's arrive' : ' arrives'}.
          </p>
        </section>
      </div>

      <div className="placed__actions">
        <Link to="/account/orders" className="cart-empty__action">View my orders</Link>
        <Link to="/all" className="cart-empty__action cart-empty__action--ghost">Continue shopping</Link>
      </div>
    </div>
  );
}
