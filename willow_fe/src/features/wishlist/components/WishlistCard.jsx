import { Link } from 'react-router-dom';
import Garment from '../../../assets/icons/Garment.jsx';
import { CloseIcon } from '../../../assets/icons/NavIcons.jsx';

const formatPrice = (value) => `₹${Number(value).toLocaleString('en-IN')}`;

/** One saved product: image, name, price and the "move to bag" action. */
export default function WishlistCard({ product, onRemove, onMoveToBag }) {
  const { id, name, type, hex, imageUrl, style, color, price, originalPrice } = product;
  const productUrl = `/product/${id}`;
  const hasDiscount = Number(originalPrice) > Number(price);
  const discount = hasDiscount ? Math.round((1 - Number(price) / Number(originalPrice)) * 100) : 0;
  const meta = [style, color].filter(Boolean).join(' · ');

  return (
    <article className="wishlist-card">
      <button
        type="button"
        className="wishlist-card__remove"
        onClick={() => onRemove(product)}
        aria-label={`Remove ${name} from wishlist`}
      >
        <CloseIcon size={14} />
      </button>

      <Link to={productUrl} className="wishlist-card__media" style={{ background: `${hex || '#B4636F'}1f` }} aria-label={name}>
        {imageUrl ? <img src={imageUrl} alt="" loading="lazy" /> : <Garment type={type} hex={hex} size="52%" />}
      </Link>

      <div className="wishlist-card__body">
        <Link to={productUrl} className="wishlist-card__name" title={name}>{name}</Link>
        {meta && <p className="wishlist-card__meta">{meta}</p>}
        <p className="wishlist-card__price">
          <span className="wishlist-card__price-now">{formatPrice(price)}</span>
          {hasDiscount && (
            <>
              <span className="wishlist-card__price-was">{formatPrice(originalPrice)}</span>
              <span className="wishlist-card__price-off">({discount}% OFF)</span>
            </>
          )}
        </p>
      </div>

      <button type="button" className="wishlist-card__move" onClick={() => onMoveToBag(product)}>
        Move to Bag
      </button>
    </article>
  );
}
