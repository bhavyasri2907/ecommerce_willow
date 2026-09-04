import { createContext, useContext, useMemo, useState } from 'react';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  // { [productId]: { product, qty } }
  const [items, setItems] = useState({});
  const [isOpen, setIsOpen] = useState(false);

  function addToCart(product) {
    setItems((prev) => {
      const existing = prev[product.id];
      return {
        ...prev,
        [product.id]: { product, qty: (existing?.qty || 0) + 1 },
      };
    });
    setIsOpen(true);
  }

  function changeQty(productId, delta) {
    setItems((prev) => {
      const existing = prev[productId];
      if (!existing) return prev;
      const nextQty = existing.qty + delta;
      const next = { ...prev };
      if (nextQty <= 0) {
        delete next[productId];
      } else {
        next[productId] = { ...existing, qty: nextQty };
      }
      return next;
    });
  }

  function removeItem(productId) {
    setItems((prev) => {
      const next = { ...prev };
      delete next[productId];
      return next;
    });
  }

  function clearCart() {
    setItems({});
  }

  const count = useMemo(
    () => Object.values(items).reduce((sum, i) => sum + i.qty, 0),
    [items]
  );
  const total = useMemo(
    () => Object.values(items).reduce((sum, i) => sum + i.qty * Number(i.product.price), 0),
    [items]
  );

  const value = {
    items,
    count,
    total,
    isOpen,
    setIsOpen,
    addToCart,
    changeQty,
    removeItem,
    clearCart,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used inside a CartProvider');
  return ctx;
}
