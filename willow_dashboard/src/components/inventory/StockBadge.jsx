import { Badge } from '../common/Badge.jsx';
import { STOCK_STATUS } from '../../constants/stockStatus.js';

export default function StockBadge({ status }) {
  const meta = STOCK_STATUS[status] ?? { label: status, tone: 'neutral' };
  return <Badge tone={meta.tone}>{meta.label}</Badge>;
}
