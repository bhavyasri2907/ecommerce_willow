import { Link } from 'react-router-dom';
import { formatPrice } from '../../../utils/formatPrice.js';
import ProductImage from './ProductImage.jsx';
import Stars from '../../reviews/components/Stars.jsx';

/** One product in a listing grid: photo, brand (or the name of the store selling it), name and price. */
export default function ProductCard({ product }) {
  const { id, name, price, originalPrice, discountPercent, stockStatus, color } = product;
  const soldOut = stockStatus === 'OUT_OF_STOCK';

  return (
    <Link to={`/product/${id}`} className={`card ${soldOut ? 'is-sold-out' : ''}`}>
      <div className="card-media">
        <ProductImage product={product} />
        {soldOut ? (
          <span className="card-tag card-tag--muted">Sold out</span>
        ) : (
          discountPercent && <span className="card-tag">{discountPercent}% off</span>
        )}
      </div>
      <div className="card-brand">{product.brand || product.storeName}</div>
      <div className="name">{name}</div>
      {color && <div className="meta">{color}</div>}
      {product.reviewCount > 0 && (
        <div className="card-rating">
          <Stars value={product.rating} size={12} />
          <span>{Number(product.rating).toFixed(1)} ({product.reviewCount})</span>
        </div>
      )}
      <div className="price-row">
        <span className="price">{formatPrice(price)}</span>
        {discountPercent && <span className="original-price">{formatPrice(originalPrice)}</span>}
      </div>
    </Link>
  );
}
