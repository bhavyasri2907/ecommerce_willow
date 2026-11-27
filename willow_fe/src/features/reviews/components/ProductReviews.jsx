import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { reviewService } from '../../../services/reviewService.js';
import { useAuth } from '../../../context/AuthContext.jsx';
import { formatOrderDate } from '../../orders/orderStatus.js';
import Stars from './Stars.jsx';
import ReviewForm from './ReviewForm.jsx';

const PAGE_SIZE = 5;
const SORTS = [
  { value: 'NEWEST', label: 'Newest first' },
  { value: 'HIGHEST', label: 'Highest rated' },
  { value: 'LOWEST', label: 'Lowest rated' },
];

/**
 * Ratings and reviews on a product page: the summary with a star breakdown, the reviews themselves,
 * and, for a shopper whose order for this piece has been delivered, a form to write or edit theirs.
 * `onChange(summary)` fires after the shopper's own review changes, so the page header can update.
 */
export default function ProductReviews({ productId, onChange }) {
  const { user } = useAuth();
  const location = useLocation();
  const [data, setData] = useState(null); // summary + current page
  const [items, setItems] = useState([]);
  const [sort, setSort] = useState('NEWEST');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [mine, setMine] = useState(null); // { canReview, review } for a signed-in shopper
  const [writing, setWriting] = useState(false);

  const load = useCallback(
    (page, sortBy) => {
      setLoading(true);
      setError('');
      return reviewService
        .forProduct(productId, { sort: sortBy, page, size: PAGE_SIZE })
        .then((res) => {
          setData(res);
          setItems((prev) => (page === 0 ? res.reviews.content : [...prev, ...res.reviews.content]));
          return res;
        })
        .catch((err) => setError(err.message))
        .finally(() => setLoading(false));
    },
    [productId]
  );

  useEffect(() => {
    load(0, sort);
  }, [load, sort]);

  useEffect(() => {
    setWriting(false);
    setMine(null);
    if (!user) return undefined;
    let active = true;
    reviewService.status(productId).then((s) => active && setMine(s)).catch(() => active && setMine({ canReview: false, review: null }));
    return () => {
      active = false;
    };
  }, [productId, user]);

  // Arriving from a "#reviews" link scrolls here once the reviews have loaded; "#write-review"
  // (from My Orders) also opens the form when the shopper is allowed to review.
  // Runs once per visit, after both the reviews and (for a signed-in shopper) their status have loaded.
  const hash = location.hash;
  const ready = data !== null && (!user || mine !== null);
  const handledRef = useRef('');
  useEffect(() => {
    const key = `${location.key}:${productId}`;
    if (!ready || handledRef.current === key || (hash !== '#reviews' && hash !== '#write-review')) return;
    handledRef.current = key;
    if (hash === '#write-review' && mine?.canReview) setWriting(true);
    document.getElementById('reviews')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [hash, ready, mine, location.key, productId]);

  async function afterOwnChange(review) {
    setMine((prev) => ({ ...prev, canReview: true, review }));
    setWriting(false);
    const res = await load(0, sort);
    if (res) onChange?.({ rating: res.average, reviewCount: res.count });
  }

  const count = data?.count ?? 0;
  const page = data?.reviews;
  const hasMore = page && page.page + 1 < page.totalPages;
  const ownId = mine?.review?.id;

  return (
    <section className="rv" id="reviews" aria-labelledby="rv-title">
      <div className="rv__head">
        <h2 id="rv-title">Ratings &amp; reviews</h2>
        {count > 0 && <span className="rv__count">{count} review{count === 1 ? '' : 's'}</span>}
      </div>

      <div className="rv__layout">
        <aside className="rv-summary">
          {data && count > 0 ? (
            <>
              <div className="rv-summary__score">
                <strong>{Number(data.average).toFixed(1)}</strong>
                <div>
                  <Stars value={data.average} size={18} />
                  <span>Based on {count} verified review{count === 1 ? '' : 's'}</span>
                </div>
              </div>
              <ul className="rv-bars">
                {data.breakdown.map(({ stars, count: n }) => (
                  <li key={stars}>
                    <span className="rv-bars__label">{stars} ★</span>
                    <span className="rv-bars__track">
                      <span className="rv-bars__fill" style={{ width: `${(n / count) * 100}%` }} />
                    </span>
                    <span className="rv-bars__n">{n}</span>
                  </li>
                ))}
              </ul>
            </>
          ) : (
            data && <p className="rv-summary__none">No reviews yet. Shoppers who receive this piece can be the first to review it.</p>
          )}

          <WriteBox
            user={user}
            mine={mine}
            writing={writing}
            onWrite={() => setWriting(true)}
            from={location.pathname}
          />
        </aside>

        <div className="rv__main">
          {writing && (
            <div className="order-panel rv__form-panel">
              <h3 className="order-panel__title">{mine?.review ? 'Edit your review' : 'Write a review'}</h3>
              <ReviewForm
                initial={mine?.review}
                onCancel={() => setWriting(false)}
                onSubmit={async (values) => afterOwnChange(await reviewService.save(productId, values))}
                onDelete={mine?.review ? async () => {
                  await reviewService.remove(productId);
                  await afterOwnChange(null);
                } : undefined}
              />
            </div>
          )}

          {count > 1 && (
            <div className="rv__toolbar">
              <label>
                <span>Sort by</span>
                <select value={sort} onChange={(e) => setSort(e.target.value)}>
                  {SORTS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                </select>
              </label>
            </div>
          )}

          {error && (
            <p className="form-alert" role="alert">
              {error} <button type="button" className="link-btn" onClick={() => load(0, sort)}>Try again</button>
            </p>
          )}

          <ul className="rv-list">
            {items.map((r) => (
              <li key={r.id} className={`rv-item ${r.id === ownId ? 'is-mine' : ''}`}>
                <div className="rv-item__top">
                  <Stars value={r.rating} size={15} />
                  {r.title && <strong className="rv-item__title">{r.title}</strong>}
                </div>
                {r.comment && <p className="rv-item__text">{r.comment}</p>}
                <p className="rv-item__meta">
                  <span className="rv-item__author">{r.id === ownId ? 'You' : r.authorName}</span>
                  <span className="rv-item__verified">✓ Verified purchase</span>
                  <span>{formatOrderDate(r.createdAt)}{r.edited ? ' · edited' : ''}</span>
                </p>
              </li>
            ))}
          </ul>

          {loading && <p className="state-msg rv__loading">Loading reviews…</p>}
          {hasMore && !loading && (
            <button type="button" className="btn btn--ghost rv__more" onClick={() => load(page.page + 1, sort)}>
              Show more reviews
            </button>
          )}
        </div>
      </div>
    </section>
  );
}

/** The call to action under the summary: sign in, write, edit, or why you can't review yet. */
function WriteBox({ user, mine, writing, onWrite, from }) {
  if (!user) {
    return (
      <div className="rv-write">
        <p>Bought this piece? Sign in to share what you think.</p>
        <Link to="/login" state={{ from: `${from}#reviews` }} className="btn btn--ghost">Sign in to review</Link>
      </div>
    );
  }
  if (!mine || writing) return null;
  if (mine.review) {
    return (
      <div className="rv-write">
        <p>You rated this <strong>{mine.review.rating} out of 5</strong>.</p>
        <button type="button" className="btn btn--ghost" onClick={onWrite}>Edit your review</button>
      </div>
    );
  }
  if (mine.canReview) {
    return (
      <div className="rv-write">
        <p>You've received this piece. How did it turn out?</p>
        <button type="button" className="btn btn--primary" onClick={onWrite}>Write a review</button>
      </div>
    );
  }
  return (
    <div className="rv-write">
      <p className="rv-write__note">You can review this piece once an order with it has been delivered to you.</p>
    </div>
  );
}
