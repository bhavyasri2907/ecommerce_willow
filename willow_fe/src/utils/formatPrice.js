/** ₹1,499 style price in Indian number format. */
export function formatPrice(value) {
  return `₹${Number(value ?? 0).toLocaleString('en-IN')}`;
}
