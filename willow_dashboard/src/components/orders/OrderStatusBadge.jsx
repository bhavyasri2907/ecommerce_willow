import { Badge } from '../common/Badge.jsx';
import { ORDER_STATUS } from '../../constants/orderStatus.js';

export default function OrderStatusBadge({ status }) {
  const meta = ORDER_STATUS[status] ?? { label: status, tone: 'neutral' };
  return <Badge tone={meta.tone}>{meta.label}</Badge>;
}
