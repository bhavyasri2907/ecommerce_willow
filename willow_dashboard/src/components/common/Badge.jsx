/** tone: success | warning | danger | info | violet | neutral | muted | accent */
export function Badge({ tone = 'neutral', dot = true, children, className = '' }) {
  return (
    <span className={`badge badge--${tone} ${className}`}>
      {dot && <span className="badge__dot" aria-hidden />}
      {children}
    </span>
  );
}

/** Small numeric pill used in the sidebar and tabs. */
export function CountPill({ value, tone = 'neutral' }) {
  if (value === undefined || value === null) return null;
  return <span className={`count-pill count-pill--${tone}`}>{value}</span>;
}
