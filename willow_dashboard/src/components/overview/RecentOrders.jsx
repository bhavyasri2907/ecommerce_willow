import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, ShoppingCart } from 'lucide-react';
import { Card, CardHeader } from '../common/Card.jsx';
import EmptyState from '../common/EmptyState.jsx';
import ErrorState from '../common/ErrorState.jsx';
import { SkeletonRows } from '../common/Loader.jsx';
import OrderStatusBadge from '../orders/OrderStatusBadge.jsx';
import { formatPrice } from '../../utils/formatPrice.js';
import { timeAgo } from '../../utils/formatDate.js';

/** Latest orders. `orders` is undefined while loading. */
export default function RecentOrders({ orders, error, onRetry }) {
  const navigate = useNavigate();
  return (
    <Card padded={false}>
      <div className="card--padded card__header-pad">
        <CardHeader title="Recent orders" subtitle="New orders appear here instantly" actions={<Link to="/orders" className="link">All orders <ArrowRight size={14} aria-hidden /></Link>} />
      </div>
      {error ? (
        <ErrorState error={error} onRetry={onRetry} />
      ) : !orders ? (
        <SkeletonRows rows={6} columns={4} />
      ) : orders.length === 0 ? (
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
              {orders.map((o) => (
                <tr key={o.id} className="is-clickable" onClick={() => navigate(`/orders?order=${o.id}`)}>
                  <td>
                    <div className="strong">{o.orderNumber}</div>
                    <div className="muted small">{timeAgo(o.createdAt)}</div>
                  </td>
                  <td>
                    <div>{o.customerName}</div>
                    <div className="muted small">{o.shippingCity ?? '—'} · {o.itemCount} item{o.itemCount === 1 ? '' : 's'}</div>
                  </td>
                  <td className="num strong">{formatPrice(o.total)}</td>
                  <td><OrderStatusBadge status={o.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
}
