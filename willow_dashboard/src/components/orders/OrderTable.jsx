import { ArrowDown, ArrowUp, ArrowUpDown } from 'lucide-react';
import ProductThumb from '../common/ProductThumb.jsx';
import OrderStatusBadge from './OrderStatusBadge.jsx';
import { PAYMENT_LABELS } from '../../constants/orderStatus.js';
import { formatPrice } from '../../utils/formatPrice.js';
import { formatDateTime, timeAgo } from '../../utils/formatDate.js';

/**
 * Order list. `newIds` (a Set) highlights orders that just arrived; `selectedId` marks
 * the order whose details are open.
 */
export default function OrderTable({ orders, sort, dir, onSort, onSelect, selectedId, newIds }) {
  const sortButton = (key, label) => {
    const Icon = sort !== key ? ArrowUpDown : dir === 'asc' ? ArrowUp : ArrowDown;
    return (
      <button className={`th-sort ${sort === key ? 'is-active' : ''}`} onClick={() => onSort(key)}>
        {label} <Icon size={13} aria-hidden />
      </button>
    );
  };

  return (
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
          {orders.map((o) => (
            <tr
              key={o.id}
              className={`is-clickable ${newIds?.has(o.id) ? 'is-new' : ''} ${String(o.id) === String(selectedId) ? 'is-selected' : ''}`}
              onClick={() => onSelect(o)}
            >
              <td>
                <div className="strong">{o.orderNumber}</div>
                {newIds?.has(o.id) && <span className="new-tag">New</span>}
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
              <td className="num strong">{formatPrice(o.total)}</td>
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
  );
}
