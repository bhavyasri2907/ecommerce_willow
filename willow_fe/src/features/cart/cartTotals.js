const MAX_QTY_PER_ITEM = 10;

/** Highest quantity a shopper can pick for a product: limited by stock when the API reports it. */
export function maxQuantity(product) {
  const stock = Number(product.stock);
  return Number.isFinite(stock) && stock > 0 ? Math.min(stock, MAX_QTY_PER_ITEM) : MAX_QTY_PER_ITEM;
}

export function isOutOfStock(product) {
  return product.stock !== undefined && Number(product.stock) <= 0;
}

/**
 * Price breakdown for the given bag entries ({ product, qty }).
 *
 * Each store ships its own items, so shipping is worked out per store with that store's
 * rules (`policies` is keyed by store id) and added up - the same way the backend splits
 * a bag into one order per store. `shipping` is null while any store's rules are unknown.
 * `sellers` lists each store's share: { storeId, storeName, subtotal, shipping, freeShippingThreshold }.
 */
export function cartTotals(entries, policies = {}) {
  let mrp = 0;
  let subtotal = 0;
  let units = 0;
  const subtotalByStore = new Map();

  entries.forEach(({ product, qty }) => {
    const price = Number(product.price);
    const original = Number(product.originalPrice);
    mrp += (original > price ? original : price) * qty;
    subtotal += price * qty;
    units += qty;
    subtotalByStore.set(product.storeId, (subtotalByStore.get(product.storeId) ?? 0) + price * qty);
  });

  const sellers = [...subtotalByStore].map(([storeId, storeSubtotal]) => {
    const policy = policies[storeId];
    const freeShippingThreshold = policy ? Number(policy.freeShippingThreshold) : null;
    const shipping = !policy ? null : storeSubtotal >= freeShippingThreshold ? 0 : Number(policy.shippingFee);
    return { storeId, storeName: policy?.storeName, subtotal: storeSubtotal, shipping, freeShippingThreshold };
  });

  const shipping = sellers.some((s) => s.shipping === null) ? null : sellers.reduce((sum, s) => sum + s.shipping, 0);

  return { units, mrp, discount: mrp - subtotal, subtotal, shipping, sellers, total: subtotal + (shipping ?? 0) };
}
