import { createContext, useContext, useMemo, useState } from 'react';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  // { [productId]: { product, qty } }
  const [items, setItems] = useState({});
  const [isOpen, setIsOpen] = useState(false);

  // Wishlist: { [productId]: product }. Starts empty; filled by the heart buttons.
  const [wishlist, setWishlist] = useState({});

  // Seller Uploaded Products & Outfit Pairings State
  const [sellerProducts, setSellerProducts] = useState([]);
  const [sellerPairings, setSellerPairings] = useState([
    {
      topId: '101',
      matchProduct: { id: 201, name: 'Black Wide-Leg Pants', type: 'PANTS', color: 'Black', hex: '#2B2730', style: 'Casual', price: 1499, description: 'High-rise wide-leg trousers.' },
      reason: 'Seller Curated: High-contrast casual pairing with relaxed crop top silhouette.',
      matchScore: 98
    },
    {
      topId: '101',
      matchProduct: { id: 911, name: 'Classic Canvas Lows', type: 'SHOES', color: 'Burgundy', hex: '#7D2D40', style: 'Casual', price: 2499, description: 'Heritage canvas low-top sneakers.' },
      reason: 'Stylist Picked Shoes: Adds a bold vintage pop of color to blue crop top.',
      matchScore: 96
    }
  ]);

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

  // Wishlist Handlers
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

  // Seller Handlers
  function addSellerProduct(newProduct) {
    setSellerProducts((prev) => [newProduct, ...prev]);
  }

  function addOutfitPairing(pairing) {
    setSellerPairings((prev) => [pairing, ...prev]);
  }

  function getPairingsForTop(topId) {
    return sellerPairings.filter((p) => String(p.topId) === String(topId));
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
    removeItem,
    clearCart,
    // Wishlist
    wishlist,
    wishlistCount,
    toggleWishlist,
    isInWishlist,
    // Seller Studio & Outfit Curations
    sellerProducts,
    sellerPairings,
    addSellerProduct,
    addOutfitPairing,
    getPairingsForTop,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used inside a CartProvider');
  return ctx;
}
