import { Link } from 'react-router-dom';
import Garment from '../../../assets/icons/Garment.jsx';
import { CloseIcon } from '../../../assets/icons/NavIcons.jsx';
import { formatPrice } from '../../../utils/formatPrice.js';
import { isOutOfStock, maxQuantity } from '../cartTotals.js';

const LOW_STOCK_NOTICE = 5;

/** One line in the bag: selection, image, size / quantity pickers and price. */
export default function CartItem({ entry, selected, onSelect, onSizeChange, onQtyChange, onRemove, returnWindowDays }) {
  const { product, qty, size } = entry;
  const { id, name, type, typeLabel, hex, imageUrl, price, originalPrice, discountPercent, stock } = product;
  const sizes = product.sizes ?? [];
  const productUrl = `/product/${id}`;
  const soldOut = isOutOfStock(product);
  const onSale = Number(originalPrice) > Number(price);
  const percentOff = discountPercent ?? (onSale ? Math.round((1 - Number(price) / Number(originalPrice)) * 100) : null);
  const quantities = Array.from({ length: Math.max(maxQuantity(product), qty) }, (_, i) => i + 1);

  return (
    <article className={`cart-line ${selected ? 'is-selected' : ''} ${soldOut ? 'is-sold-out' : ''}`}>
      <div className="cart-line__media" style={{ background: `${hex || '#B4636F'}1f` }}>
        <input
          type="checkbox"
          className="cart-check cart-line__check"
          checked={selected}
          disabled={soldOut}
          onChange={(e) => onSelect(id, e.target.checked)}
          aria-label={`Select ${name}`}
        />
        <Link to={productUrl} aria-label={name}>
          {imageUrl ? <img src={imageUrl} alt="" loading="lazy" /> : <Garment type={type} hex={hex} size="56%" />}
        </Link>
      </div>

      <div className="cart-line__body">
        {typeLabel && <p className="cart-line__category">{typeLabel}</p>}
        <Link to={productUrl} className="cart-line__name">{name}</Link>
        {product.storeName && (
          <p className="cart-line__seller">
            Sold by <Link to={`/store/${product.storeId}`}>{product.storeName}</Link>
          </p>
        )}

        <div className="cart-line__options">
          {sizes.length > 0 && (
            <label className="cart-select">
              <span>Size:</span>
              <select value={size ?? sizes[0]} onChange={(e) => onSizeChange(id, e.target.value)}>
                {sizes.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </label>
          )}
          <label className="cart-select">
            <span>Qty:</span>
            <select value={qty} onChange={(e) => onQtyChange(id, Number(e.target.value))} disabled={soldOut}>
              {quantities.map((n) => <option key={n} value={n}>{n}</option>)}
            </select>
          </label>
          {!soldOut && Number(stock) <= LOW_STOCK_NOTICE && <span className="cart-line__left">{stock} left</span>}
        </div>

        <p className="cart-line__price">
          <span className="cart-line__price-now">{formatPrice(price)}</span>
          {onSale && (
            <>
              <span className="cart-line__price-was">{formatPrice(originalPrice)}</span>
              <span className="cart-line__price-off">{percentOff}% OFF</span>
            </>
          )}
        </p>

        {soldOut ? (
          <p className="cart-line__warning">Currently out of stock.</p>
        ) : (
          returnWindowDays > 0 && (
            <p className="cart-line__note"><strong>{returnWindowDays} days</strong> return available</p>
          )
        )}
      </div>

      <button type="button" className="cart-line__remove" onClick={() => onRemove([id])} aria-label={`Remove ${name} from bag`}>
        <CloseIcon size={20} />
      </button>
    </article>
  );
}
