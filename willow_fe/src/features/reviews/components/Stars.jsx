const STAR = 'M12 2.5l2.9 6.1 6.6.8-4.9 4.6 1.2 6.6L12 17.4l-5.8 3.2 1.2-6.6-4.9-4.6 6.6-.8z';

/** Read-only star rating; fractions are shown as partly filled stars (4.5 = four and a half). */
export default function Stars({ value = 0, size = 16, className = '' }) {
  const pct = Math.max(0, Math.min(5, Number(value) || 0)) * 20;
  const row = (filled) => (
    <span className={`stars__row ${filled ? 'stars__row--on' : ''}`} style={filled ? { width: `${pct}%` } : undefined}>
      {[0, 1, 2, 3, 4].map((i) => (
        <svg key={i} width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
          <path d={STAR} />
        </svg>
      ))}
    </span>
  );
  return (
    <span className={`stars ${className}`} role="img" aria-label={`${Number(value || 0).toFixed(1)} out of 5 stars`}>
      {row(false)}
      {row(true)}
    </span>
  );
}

export { STAR };
