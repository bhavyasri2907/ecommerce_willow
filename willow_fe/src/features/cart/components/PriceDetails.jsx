import { formatPrice } from '../../../utils/formatPrice.js';

/** Order summary for the selected items, with the Place Order button. */
export default function PriceDetails({ totals, policies, onPlaceOrder }) {
  const { units, mrp, discount, shipping, total } = totals;
  const nothingSelected = units === 0;

  return (
    <aside className="price-details" aria-label="Price details">
      <h2 className="price-details__title">Price Details ({units} Item{units === 1 ? '' : 's'})</h2>

      <dl className="price-details__rows">
        <div>
          <dt>Total MRP</dt>
          <dd>{formatPrice(mrp)}</dd>
        </div>
        {discount > 0 && (
          <div>
            <dt>Discount on MRP</dt>
            <dd className="is-saving">- {formatPrice(discount)}</dd>
          </div>
        )}
        <div>
          <dt>Shipping Fee</dt>
          <dd className={shipping === 0 && !nothingSelected ? 'is-saving' : ''}>
            {shipping === null ? 'Calculated at checkout' : shipping === 0 ? (nothingSelected ? formatPrice(0) : 'Free') : formatPrice(shipping)}
          </dd>
        </div>
      </dl>

      {policies && shipping > 0 && (
        <p className="price-details__hint">
          Add {formatPrice(Number(policies.freeShippingThreshold) - totals.subtotal)} more for free shipping.
        </p>
      )}

      <div className="price-details__total">
        <span>Total Amount</span>
        <span>{formatPrice(total)}</span>
      </div>

      <button type="button" className="price-details__place" disabled={nothingSelected} onClick={onPlaceOrder}>
        Place Order
      </button>
    </aside>
  );
}
