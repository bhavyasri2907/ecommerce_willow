const num = new Intl.NumberFormat('en-IN');

export function formatNumber(value) {
  return num.format(Number(value ?? 0));
}

/** Percentage change from previous to current; null when there is no baseline. */
export function percentChange(current, previous) {
  const c = Number(current ?? 0);
  const p = Number(previous ?? 0);
  if (p === 0) return c === 0 ? 0 : null;
  return ((c - p) / p) * 100;
}
