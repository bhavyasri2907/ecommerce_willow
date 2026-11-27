import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { reviewService } from '../../../services/reviewService.js';
import { StarIcon } from '../../../assets/icons/AccountIcons.jsx';
import ProductImage from '../../products/components/ProductImage.jsx';
import Stars from '../../reviews/components/Stars.jsx';
import ReviewForm from '../../reviews/components/ReviewForm.jsx';
import { formatOrderDate } from '../../orders/orderStatus.js';

/** My Account > My Reviews: delivered pieces waiting for a review, and every review the shopper has written. */
export default function MyReviews() {
  const [pending, setPending] = useState(null);
  const [reviews, setReviews] = useState(null);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState(null); // product id whose form is open

  const reload = () =>
    Promise.all([reviewService.pending(), reviewService.mine()]).then(([p, r]) => {
      setPending(p);
      setReviews(r);
    });

  useEffect(() => {
    reload().catch((err) => setError(err.message));
  }, []);

  async function save(productId, values) {
    await reviewService.save(productId, values);
    await reload();
    setEditing(null);
  }

  async function remove(productId) {
    await reviewService.remove(productId);
    await reload();
    setEditing(null);
  }

  const loading = (pending === null || reviews === null) && !error;
  const nothing = !loading && !error && pending?.length === 0 && reviews?.length === 0;

  return (
    <section className="account-section">
      <header className="account-section__header">
        <p className="account-hero__eyebrow">My Account</p>
        <h1 className="account-section__title">My Reviews</h1>
        <p className="account-section__intro">
          Rate the pieces you&apos;ve received. Your reviews appear on the product page with your first name.
        </p>
      </header>

      {error && (
        <p className="form-alert" role="alert">
          {error} <button type="button" className="link-btn" onClick={() => { setError(''); reload().catch((e) => setError(e.message)); }}>Try again</button>
        </p>
      )}
      {loading && <p className="state-msg">Loading your reviews…</p>}

      {nothing && (
        <div className="account-empty">
          <span className="quick-link__icon quick-link__icon--sage"><StarIcon size={26} /></span>
          <h2 className="account-empty__title">No reviews yet</h2>
          <p className="account-empty__text">Once an order is delivered, the pieces in it will show up here for you to review.</p>
          <Link to="/account/orders" className="account-empty__action">View my orders</Link>
        </div>
      )}

      {pending?.length > 0 && (
        <div className="my-rv-group">
          <h2 className="my-rv-group__title">Waiting for your review <span>{pending.length}</span></h2>
          <ul className="my-rv-list">
            {pending.map((p) => (
              <li key={p.id} className="order-panel my-rv">
                <ProductRow product={p}>
                  {editing !== p.id && (
                    <button type="button" className="btn btn--primary" onClick={() => setEditing(p.id)}>Write a review</button>
                  )}
                </ProductRow>
                {editing === p.id && (
                  <ReviewForm onSubmit={(values) => save(p.id, values)} onCancel={() => setEditing(null)} />
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      {reviews?.length > 0 && (
        <div className="my-rv-group">
          <h2 className="my-rv-group__title">Your reviews <span>{reviews.length}</span></h2>
          <ul className="my-rv-list">
            {reviews.map((r) => (
              <li key={r.id} className="order-panel my-rv">
                <ProductRow product={r.product}>
                  {editing !== r.product.id && (
                    <button type="button" className="link-btn" onClick={() => setEditing(r.product.id)}>Edit</button>
                  )}
                </ProductRow>
                {editing === r.product.id ? (
                  <ReviewForm
                    initial={r}
                    onSubmit={(values) => save(r.product.id, values)}
                    onCancel={() => setEditing(null)}
                    onDelete={() => remove(r.product.id)}
                  />
                ) : (
                  <div className="my-rv__body">
                    <div className="rv-item__top">
                      <Stars value={r.rating} size={16} />
                      {r.title && <strong className="rv-item__title">{r.title}</strong>}
                    </div>
                    {r.comment && <p className="rv-item__text">{r.comment}</p>}
                    <p className="rv-item__meta">
                      <span>Reviewed {formatOrderDate(r.createdAt)}{r.edited ? ` · edited ${formatOrderDate(r.updatedAt)}` : ''}</span>
                    </p>
                  </div>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}

function ProductRow({ product, children }) {
  const name = product.live ? <Link to={`/product/${product.id}`}>{product.name}</Link> : product.name;
  return (
    <div className="my-rv__product">
      <ProductImage
        product={{ name: product.name, type: product.type, hex: product.hex, imageUrl: product.imageUrl }}
        className="my-rv__thumb"
        iconSize="60%"
      />
      <div className="my-rv__text">
        <span className="my-rv__store">{product.brand || product.storeName}</span>
        <strong>{name}</strong>
        {!product.live && <span className="my-rv__off">No longer on sale</span>}
      </div>
      <div className="my-rv__action">{children}</div>
    </div>
  );
}
