const inr = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 });
const inrPrecise = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 });

export function formatPrice(value, { precise = false } = {}) {
  const n = Number(value ?? 0);
  return (precise ? inrPrecise : inr).format(n);
}

/** ₹4.2L / ₹1.3Cr style for chart axes and tight spaces. */
export function formatPriceCompact(value) {
  const n = Number(value ?? 0);
  if (Math.abs(n) >= 1e7) return `₹${(n / 1e7).toFixed(1)}Cr`;
  if (Math.abs(n) >= 1e5) return `₹${(n / 1e5).toFixed(1)}L`;
  if (Math.abs(n) >= 1e3) return `₹${(n / 1e3).toFixed(1)}k`;
  return `₹${Math.round(n)}`;
}
