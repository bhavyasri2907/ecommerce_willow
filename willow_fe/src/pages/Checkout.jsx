import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { addressService } from '../services/addressService.js';
import { orderService } from '../services/orderService.js';
import CheckoutSteps from '../features/cart/components/CheckoutSteps.jsx';
import { useStorePolicies } from '../features/cart/hooks/useStorePolicies.js';
import { cartTotals } from '../features/cart/cartTotals.js';
import AddressForm from '../features/address/components/AddressForm.jsx';
import AddressText from '../features/address/components/AddressText.jsx';
import ProductImage from '../features/products/components/ProductImage.jsx';
import { formatPrice } from '../utils/formatPrice.js';

/** Payment options shown at checkout. Only Cash on Delivery is live until a payment gateway is added. */
const PAYMENT_OPTIONS = [
  { value: 'COD', label: 'Cash on Delivery', note: 'Pay in cash when your order arrives.' },
  { value: 'UPI', label: 'UPI', note: 'Coming soon', disabled: true },
  { value: 'CARD', label: 'Credit / Debit card', note: 'Coming soon', disabled: true },
  { value: 'NET_BANKING', label: 'Net banking', note: 'Coming soon', disabled: true },
];

function newCheckoutRef() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID();
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 12)}`;
}

/**
 * Checkout for the items picked on the bag page: choose or add a delivery address, pay by
 * Cash on Delivery, review and place. Signed-in shoppers only (wrapped in RequireAuth).
 */
export default function Checkout() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { items, checkoutIds, setCheckoutIds, removeItems } = useCart();

  // One id per visit to this page: a double click or a retry after a network error can't order twice.
  const checkoutRef = useRef(newCheckoutRef());

  const [addresses, setAddresses] = useState(null);
  const [addressError, setAddressError] = useState('');
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [addingAddress, setAddingAddress] = useState(false);
  const [payment, setPayment] = useState('COD');
  const [placing, setPlacing] = useState(false);
  const [placeError, setPlaceError] = useState('');

  const entries = useMemo(() => checkoutIds.map((id) => items[id]).filter(Boolean), [checkoutIds, items]);
  const policies = useStorePolicies(entries.map((e) => e.product.storeId).filter(Boolean));
  const totals = cartTotals(entries, policies);

  useEffect(() => {
    let active = true;
    addressService
      .list()
      .then((list) => {
        if (!active) return;
        setAddresses(list);
        setSelectedAddressId(list[0]?.id ?? null); // the default address comes first
        setAddingAddress(list.length === 0);
      })
      .catch((err) => active && setAddressError(err.message));
    return () => {
      active = false;
    };
  }, []);

  if (entries.length === 0 && !placing) return <Navigate to="/cart" replace />;

  async function saveAddress(values) {
    const saved = await addressService.create(values);
    const list = await addressService.list();
    setAddresses(list);
    setSelectedAddressId(saved.id);
    setAddingAddress(false);
  }

  async function placeOrder() {
    setPlaceError('');
    if (!selectedAddressId) {
      setPlaceError('Choose a delivery address first.');
      return;
    }
    setPlacing(true);
    try {
      const orders = await orderService.placeOrder({
        checkoutRef: checkoutRef.current,
        addressId: selectedAddressId,
        paymentMethod: payment,
        items: entries.map(({ product, qty, size }) => ({ productId: product.id, size: size ?? null, quantity: qty })),
      });
      const placedIds = entries.map((e) => e.product.id);
      navigate('/order-placed', { replace: true, state: { orders } });
      removeItems(placedIds);
      setCheckoutIds([]);
    } catch (err) {
      setPlacing(false);
      if (err.status === 401) {
        navigate('/login', { state: { from: '/checkout' } });
        return;
      }
      // Validation errors list the bad fields; stock/size problems come back as a plain message.
      const fieldMessages = Object.values(err.fields ?? {});
      setPlaceError(fieldMessages.length ? fieldMessages.join(' ') : err.message);
    }
  }

  const selectedAddress = addresses?.find((a) => a.id === selectedAddressId);
  const sellerCount = totals.sellers.length;

  return (
    <div className="cart checkout">
      <CheckoutSteps current={selectedAddress && !addingAddress ? 'Payment' : 'Address'} />

      <div className="cart__layout">
        <div className="checkout__main">
          {/* ---------- Delivery address ---------- */}
          <section className="checkout-card" aria-labelledby="checkout-address">
            <header className="checkout-card__head">
              <h2 id="checkout-address" className="checkout-card__title"><span>1</span> Delivery address</h2>
              {addresses?.length > 0 && !addingAddress && (
                <button type="button" className="link-btn" onClick={() => setAddingAddress(true)}>+ Add new address</button>
              )}
            </header>

            {addressError ? (
              <p className="form-alert" role="alert">{addressError}</p>
            ) : addresses === null ? (
              <p className="checkout-card__muted">Loading your addresses…</p>
            ) : addingAddress ? (
              <AddressForm
                initial={{ fullName: user.fullName, phone: user.phone ?? '' }}
                onSubmit={saveAddress}
                onCancel={addresses.length ? () => setAddingAddress(false) : undefined}
                submitLabel="Save and deliver here"
              />
            ) : (
              <div className="addr-options" role="radiogroup" aria-label="Delivery address">
                {addresses.map((a) => (
                  <label key={a.id} className={`addr-option ${a.id === selectedAddressId ? 'is-selected' : ''}`}>
                    <input
                      type="radio"
                      name="address"
                      className="cart-check"
                      checked={a.id === selectedAddressId}
                      onChange={() => setSelectedAddressId(a.id)}
                    />
                    <AddressText name={a.fullName} phone={a.phone} line={a.addressLine} city={a.city} state={a.state} pincode={a.pincode} />
                    {a.isDefault && <span className="addr-badge">Default</span>}
                  </label>
                ))}
              </div>
            )}
          </section>

          {/* ---------- Payment ---------- */}
          <section className="checkout-card" aria-labelledby="checkout-payment">
            <header className="checkout-card__head">
              <h2 id="checkout-payment" className="checkout-card__title"><span>2</span> Payment method</h2>
            </header>
            <div className="pay-options" role="radiogroup" aria-label="Payment method">
              {PAYMENT_OPTIONS.map((opt) => (
                <label
                  key={opt.value}
                  className={`pay-option ${payment === opt.value ? 'is-selected' : ''} ${opt.disabled ? 'is-disabled' : ''}`}
                >
                  <input
                    type="radio"
                    name="payment"
                    className="cart-check"
                    value={opt.value}
                    checked={payment === opt.value}
                    disabled={opt.disabled}
                    onChange={() => setPayment(opt.value)}
                  />
                  <span className="pay-option__text">
                    <strong>{opt.label}</strong>
                    <span>{opt.note}</span>
                  </span>
                </label>
              ))}
            </div>
          </section>

          {/* ---------- Review ---------- */}
          <section className="checkout-card" aria-labelledby="checkout-review">
            <header className="checkout-card__head">
              <h2 id="checkout-review" className="checkout-card__title"><span>3</span> Review items</h2>
              <Link to="/cart" className="link-btn">Edit bag</Link>
            </header>
            {sellerCount > 1 && (
              <p className="checkout-card__muted">
                These items come from {sellerCount} sellers, so they will arrive as {sellerCount} separate orders.
              </p>
            )}
            <ul className="review-list">
              {entries.map(({ product, qty, size }) => (
                <li key={product.id} className="review-item">
                  <ProductImage product={product} className="review-item__img" iconSize="60%" />
                  <div className="review-item__text">
                    <strong>{product.name}</strong>
                    <span>
                      {size ? `Size ${size} · ` : ''}Qty {qty}
                      {product.storeName ? ` · Sold by ${product.storeName}` : ''}
                    </span>
                  </div>
                  <span className="review-item__price">{formatPrice(Number(product.price) * qty)}</span>
                </li>
              ))}
            </ul>
          </section>
        </div>

        {/* ---------- Summary ---------- */}
        <aside className="price-details" aria-label="Order summary">
          <h2 className="price-details__title">Price Details ({totals.units} Item{totals.units === 1 ? '' : 's'})</h2>
          <dl className="price-details__rows">
            <div><dt>Total MRP</dt><dd>{formatPrice(totals.mrp)}</dd></div>
            {totals.discount > 0 && (
              <div><dt>Discount on MRP</dt><dd className="is-saving">- {formatPrice(totals.discount)}</dd></div>
            )}
            <div>
              <dt>Shipping Fee</dt>
              <dd className={totals.shipping === 0 ? 'is-saving' : ''}>
                {totals.shipping === null ? '…' : totals.shipping === 0 ? 'Free' : formatPrice(totals.shipping)}
              </dd>
            </div>
          </dl>
          <div className="price-details__total">
            <span>Amount to pay</span>
            <span>{formatPrice(totals.total)}</span>
          </div>

          {selectedAddress && !addingAddress && (
            <p className="price-details__hint">
              Delivering to <strong>{selectedAddress.fullName}</strong>, {selectedAddress.city} {selectedAddress.pincode}
            </p>
          )}
          {placeError && <p className="form-alert" role="alert">{placeError}</p>}

          <button
            type="button"
            className="price-details__place"
            disabled={placing || !selectedAddressId || addingAddress || totals.shipping === null}
            onClick={placeOrder}
          >
            {placing ? 'Placing order…' : 'Place Order'}
          </button>
          <p className="price-details__hint checkout__cod-note">
            Pay {formatPrice(totals.total)} in cash to the delivery partner. Prices and stock are confirmed when you place the order.
          </p>
        </aside>
      </div>
    </div>
  );
}
