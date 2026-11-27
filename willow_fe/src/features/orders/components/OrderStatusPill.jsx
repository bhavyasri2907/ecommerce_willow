import { ORDER_STATUS } from '../orderStatus.js';

export default function OrderStatusPill({ status }) {
  const meta = ORDER_STATUS[status] ?? { short: status, tone: 'grey' };
  return <span className={`order-pill order-pill--${meta.tone}`}>{meta.short}</span>;
}
