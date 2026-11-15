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
 * Shipping follows the same rule the backend applies when the order is created;
 * it is null while the store's policies are not known.
 */
export function cartTotals(entries, policies) {
  let mrp = 0;
  let subtotal = 0;
  let units = 0;

  entries.forEach(({ product, qty }) => {
    const price = Number(product.price);
    const original = Number(product.originalPrice);
    mrp += (original > price ? original : price) * qty;
    subtotal += price * qty;
    units += qty;
  });

  let shipping = null;
  if (entries.length === 0) shipping = 0;
  else if (policies) shipping = subtotal >= Number(policies.freeShippingThreshold) ? 0 : Number(policies.shippingFee);

  return { units, mrp, discount: mrp - subtotal, subtotal, shipping, total: subtotal + (shipping ?? 0) };
}
