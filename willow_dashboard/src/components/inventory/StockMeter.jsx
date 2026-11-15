/** Stock level bar with a tick at the low-stock threshold. */
export default function StockMeter({ stock, threshold }) {
  // Full bar = 3× the low-stock threshold, so "healthy" sits comfortably past the warning mark.
  const max = Math.max(threshold * 3, 1);
  const pct = Math.min(100, (stock / max) * 100);
  const tone = stock <= 0 ? 'danger' : stock <= threshold ? 'warning' : 'success';
  return (
    <div className="meter" title={`${stock} in stock · threshold ${threshold}`}>
      <div className={`meter__fill meter__fill--${tone}`} style={{ width: `${Math.max(pct, stock > 0 ? 3 : 0)}%` }} />
      <div className="meter__mark" style={{ left: `${(threshold / max) * 100}%` }} aria-hidden />
    </div>
  );
}
