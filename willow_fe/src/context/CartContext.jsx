import { createContext, useContext, useEffect, useMemo, useState } from 'react';

const CartContext = createContext(null);

const STORAGE_KEY = 'willow_bag_v1';

/** The bag, wishlist and checkout selection saved in this browser, so a refresh or sign-in keeps them. */
function loadSaved() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return saved && typeof saved === 'object' ? saved : {};
  } catch {
    return {};
  }
}

export function CartProvider({ children }) {
  const [saved] = useState(loadSaved);
  // { [productId]: { product, qty, size } }
  const [items, setItems] = useState(saved.items ?? {});
  const [isOpen, setIsOpen] = useState(false);

  // Wishlist: { [productId]: product }. Filled by the heart buttons.
  const [wishlist, setWishlist] = useState(saved.wishlist ?? {});

  // Product ids the shopper chose to check out on the bag page.
  const [checkoutIds, setCheckoutIds] = useState(saved.checkoutIds ?? []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ items, wishlist, checkoutIds }));
    } catch {
      /* storage unavailable (private mode): the bag lasts until the tab closes */
    }
  }, [items, wishlist, checkoutIds]);

  /** `size` is the one picked on the product page; without it the bag keeps or defaults the size. */
  function addToCart(product, size) {
    setItems((prev) => {
      const existing = prev[product.id];
      return {
        ...prev,
        [product.id]: {
          product,
          qty: (existing?.qty || 0) + 1,
          size: size ?? existing?.size ?? product.sizes?.[0] ?? null,
        },
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

  /** Sets an exact quantity (bag page dropdown). */
  function setQty(productId, qty) {
    setItems((prev) => (prev[productId] ? { ...prev, [productId]: { ...prev[productId], qty } } : prev));
  }

  function setSize(productId, size) {
    setItems((prev) => (prev[productId] ? { ...prev, [productId]: { ...prev[productId], size } } : prev));
  }

  function removeItems(productIds) {
    setItems((prev) => {
      const next = { ...prev };
      productIds.forEach((id) => delete next[id]);
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

  // Wishlist Handlers
  function addToWishlist(products) {
    setWishlist((prev) => {
      const next = { ...prev };
      products.forEach((p) => { next[p.id] = p; });
      return next;
    });
  }

  function toggleWishlist(product) {
    setWishlist((prev) => {
      const next = { ...prev };
      if (next[product.id]) {
        delete next[product.id];
      } else {
        next[product.id] = product;
      }
      return next;
    });
  }

  function isInWishlist(productId) {
    return !!wishlist[productId];
  }

  const count = useMemo(
    () => Object.values(items).reduce((sum, i) => sum + i.qty, 0),
    [items]
  );
  const total = useMemo(
    () => Object.values(items).reduce((sum, i) => sum + i.qty * Number(i.product.price), 0),
    [items]
  );

  const wishlistCount = useMemo(
    () => Object.keys(wishlist).length,
    [wishlist]
  );

  const value = {
    items,
    count,
    total,
    isOpen,
    setIsOpen,
    addToCart,
    changeQty,
    setQty,
    setSize,
    removeItems,
    removeItem,
    clearCart,
    // Checkout
    checkoutIds,
    setCheckoutIds,
    // Wishlist
    wishlist,
    wishlistCount,
    toggleWishlist,
    addToWishlist,
    isInWishlist,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used inside a CartProvider');
  return ctx;
}
