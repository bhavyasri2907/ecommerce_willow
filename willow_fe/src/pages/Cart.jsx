import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext.jsx';
import { ChevronRightIcon, HeartIcon } from '../assets/icons/NavIcons.jsx';
import CheckoutSteps from '../features/cart/components/CheckoutSteps.jsx';
import CartItem from '../features/cart/components/CartItem.jsx';
import PriceDetails from '../features/cart/components/PriceDetails.jsx';
import { useStorePolicies } from '../features/cart/hooks/useStorePolicies.js';
import { cartTotals, isOutOfStock } from '../features/cart/cartTotals.js';

export default function Cart() {
  const navigate = useNavigate();
  const { items, setQty, setSize, removeItems, addToWishlist } = useCart();
  // Everything is selected by default, so only the items the shopper unticks are tracked.
  const [unselected, setUnselected] = useState(new Set());

  const entries = Object.values(items);
  // Each seller sets their own shipping fee and return window.
  const policies = useStorePolicies(entries.map((e) => e.product.storeId).filter(Boolean));
  const selectable = entries.filter((e) => !isOutOfStock(e.product));
  const selected = selectable.filter((e) => !unselected.has(e.product.id));
  const selectedIds = selected.map((e) => e.product.id);
  const totals = cartTotals(selected, policies);

  function select(id, on) {
    setUnselected((prev) => {
      const next = new Set(prev);
      on ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function selectAll(on) {
    setUnselected(on ? new Set() : new Set(selectable.map((e) => e.product.id)));
  }

  function moveToWishlist() {
    addToWishlist(selected.map((e) => e.product));
    removeItems(selectedIds);
  }

  function placeOrder() {
    removeItems(selectedIds);
    navigate('/checkout');
  }

  if (entries.length === 0) {
    return (
      <div className="cart">
        <CheckoutSteps current="Bag" />
        <div className="cart-empty">
          <h1 className="cart-empty__title">Your bag is empty</h1>
          <p className="cart-empty__text">Add pieces you love and they will be waiting for you here.</p>
          <div className="cart-empty__actions">
            <Link to="/all" className="cart-empty__action">Explore the collection</Link>
            <Link to="/wishlist" className="cart-empty__action cart-empty__action--ghost">Add from wishlist</Link>
          </div>
        </div>
      </div>
    );
  }

  const allSelected = selectable.length > 0 && selected.length === selectable.length;

  return (
    <div className="cart">
      <CheckoutSteps current="Bag" />

      <div className="cart__layout">
        <section className="cart__items" aria-label="Items in your bag">
          <div className="cart-toolbar">
            <label className="cart-toolbar__select">
              <input
                type="checkbox"
                className="cart-check"
                checked={allSelected}
                disabled={selectable.length === 0}
                onChange={(e) => selectAll(e.target.checked)}
              />
              <span>{selected.length}/{entries.length} items selected</span>
            </label>
            <div className="cart-toolbar__actions">
              <button type="button" disabled={selected.length === 0} onClick={() => removeItems(selectedIds)}>Remove</button>
              <button type="button" disabled={selected.length === 0} onClick={moveToWishlist}>Move to Wishlist</button>
            </div>
          </div>

          {entries.map((entry) => (
            <CartItem
              key={entry.product.id}
              entry={entry}
              selected={selectedIds.includes(entry.product.id)}
              onSelect={select}
              onSizeChange={setSize}
              onQtyChange={setQty}
              onRemove={removeItems}
              returnWindowDays={policies[entry.product.storeId]?.returnWindowDays}
            />
          ))}

          <Link to="/wishlist" className="cart-more">
            <HeartIcon size={20} />
            <span>Add More From Wishlist</span>
            <ChevronRightIcon size={18} />
          </Link>
        </section>

        <PriceDetails totals={totals} onPlaceOrder={placeOrder} />
      </div>
    </div>
  );
}
