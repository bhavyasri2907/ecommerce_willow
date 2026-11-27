import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { orderService } from '../../../services/orderService.js';
import { PackageIcon } from '../../../assets/icons/AccountIcons.jsx';
import { ChevronRightIcon } from '../../../assets/icons/NavIcons.jsx';
import ProductImage from '../../products/components/ProductImage.jsx';
import OrderStatusPill from '../../orders/components/OrderStatusPill.jsx';
import { ORDER_STATUS, formatOrderDate } from '../../orders/orderStatus.js';
import { formatPrice } from '../../../utils/formatPrice.js';

const PAGE_SIZE = 10;

/** My Account > My Orders: every order the shopper has placed, newest first. */
export default function MyOrders() {
  const [orders, setOrders] = useState([]);
  const [page, setPage] = useState(null); // last page loaded: { page, totalPages, totalElements }
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback((pageNumber) => {
    setLoading(true);
    setError('');
    return orderService
      .listOrders({ page: pageNumber, size: PAGE_SIZE })
      .then((res) => {
        setOrders((prev) => (pageNumber === 0 ? res.content : [...prev, ...res.content]));
        setPage(res);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load(0);
  }, [load]);

  const hasMore = page && page.page + 1 < page.totalPages;

  return (
    <section className="account-section">
      <header className="account-section__header">
        <p className="account-hero__eyebrow">My Account</p>
        <h1 className="account-section__title">My Orders</h1>
        <p className="account-section__intro">
          {page?.totalElements ? `${page.totalElements} order${page.totalElements === 1 ? '' : 's'} · ` : ''}
          Track deliveries and cancel orders that haven&apos;t been packed yet.
        </p>
      </header>

      {error && (
        <p className="form-alert" role="alert">
          {error} <button type="button" className="link-btn" onClick={() => load(0)}>Try again</button>
        </p>
      )}

      {!error && !loading && orders.length === 0 ? (
        <div className="account-empty">
          <span className="quick-link__icon quick-link__icon--plum"><PackageIcon size={26} /></span>
          <h2 className="account-empty__title">No orders yet</h2>
          <p className="account-empty__text">When you place an order it will show up here with live tracking.</p>
          <Link to="/all" className="account-empty__action">Start shopping</Link>
        </div>
      ) : (
        <ul className="order-list">
          {orders.map((o) => (
            <li key={o.orderNumber}>
              <Link to={`/account/orders/${o.orderNumber}`} className="order-card">
                <div className="order-card__head">
                  <div>
                    <span className="order-card__number">{o.orderNumber}</span>
                    <span className="order-card__meta">Placed {formatOrderDate(o.createdAt)} · Sold by {o.storeName}</span>
                  </div>
                  <OrderStatusPill status={o.status} />
                </div>
                <div className="order-card__body">
                  <div className="order-card__thumbs">
                    {o.items.slice(0, 3).map((item, i) => (
                      <ProductImage
                        key={`${item.productId}-${i}`}
                        product={{ name: item.productName, type: item.type, hex: item.hex, imageUrl: item.imageUrl }}
                        className="order-card__thumb"
                        iconSize="60%"
                      />
                    ))}
                    {o.items.length > 3 && <span className="order-card__more">+{o.items.length - 3}</span>}
                  </div>
                  <div className="order-card__text">
                    <strong>{o.items.map((i) => i.productName).join(', ')}</strong>
                    <span>{ORDER_STATUS[o.status]?.text}</span>
                  </div>
                  <div className="order-card__total">
                    <strong>{formatPrice(o.total)}</strong>
                    <span>{o.itemCount} item{o.itemCount === 1 ? '' : 's'}</span>
                  </div>
                  <ChevronRightIcon size={18} className="order-card__chevron" />
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}

      {loading && <p className="state-msg">Loading your orders…</p>}
      {hasMore && !loading && (
        <button type="button" className="btn btn--ghost order-list__more" onClick={() => load(page.page + 1)}>
          Show older orders
        </button>
      )}
    </section>
  );
}
