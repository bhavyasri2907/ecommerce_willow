import { Badge } from '../common/Badge.jsx';
import { PRODUCT_STATUS } from '../../constants/productStatus.js';

export default function ProductStatusBadge({ status }) {
  const meta = PRODUCT_STATUS[status] ?? { label: status, tone: 'neutral' };
  return <Badge tone={meta.tone}>{meta.label}</Badge>;
}
