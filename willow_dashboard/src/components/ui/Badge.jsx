import { ORDER_STATUS, PRODUCT_STATUS, STOCK_STATUS } from '../../utils/constants.js';

/** tone: success | warning | danger | info | violet | neutral | muted | accent */
export function Badge({ tone = 'neutral', dot = true, children, className = '' }) {
  return (
    <span className={`badge badge--${tone} ${className}`}>
      {dot && <span className="badge__dot" aria-hidden />}
      {children}
    </span>
  );
}

export function OrderStatusBadge({ status }) {
  const meta = ORDER_STATUS[status] ?? { label: status, tone: 'neutral' };
  return <Badge tone={meta.tone}>{meta.label}</Badge>;
}

export function ProductStatusBadge({ status }) {
  const meta = PRODUCT_STATUS[status] ?? { label: status, tone: 'neutral' };
  return <Badge tone={meta.tone}>{meta.label}</Badge>;
}

export function StockBadge({ status }) {
  const meta = STOCK_STATUS[status] ?? { label: status, tone: 'neutral' };
  return <Badge tone={meta.tone}>{meta.label}</Badge>;
}

/** Small numeric pill used in the sidebar and tabs. */
export function CountPill({ value, tone = 'neutral' }) {
  if (value === undefined || value === null) return null;
  return <span className={`count-pill count-pill--${tone}`}>{value}</span>;
}
