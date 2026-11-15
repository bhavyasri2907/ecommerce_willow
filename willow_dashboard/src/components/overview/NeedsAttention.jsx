import { Link } from 'react-router-dom';
import { AlertTriangle, ArrowRight, Boxes, ClipboardList, FileEdit, PackageCheck, Truck } from 'lucide-react';
import { Card, CardHeader } from '../common/Card.jsx';

function AttentionItem({ icon: Icon, label, value, to, tone }) {
  return (
    <Link to={to} className={`attention attention--${value ? tone : 'clear'}`}>
      <span className="attention__icon" aria-hidden><Icon size={16} /></span>
      <span className="attention__label">{label}</span>
      <span className="attention__value">{value ?? '—'}</span>
      <ArrowRight size={14} className="attention__arrow" aria-hidden />
    </Link>
  );
}

/** Live to-do counts. `orderCounts` is keyed by order status; `catalog` is the product summary. */
export default function NeedsAttention({ orderCounts, catalog }) {
  return (
    <Card>
      <CardHeader title="Needs attention" subtitle="Live counts across your store" />
      <div className="attention-list">
        <AttentionItem icon={ClipboardList} label="Orders to confirm" value={orderCounts?.PENDING} to="/orders?tab=PENDING" tone="accent" />
        <AttentionItem icon={PackageCheck} label="Confirmed, to pack" value={orderCounts?.CONFIRMED} to="/orders?tab=CONFIRMED" tone="info" />
        <AttentionItem icon={Truck} label="Packed, to ship" value={orderCounts?.PACKED} to="/orders?tab=PACKED" tone="info" />
        <AttentionItem icon={AlertTriangle} label="Low stock products" value={catalog?.lowStock} to="/inventory?filter=low" tone="warning" />
        <AttentionItem icon={Boxes} label="Out of stock" value={catalog?.outOfStock} to="/inventory?filter=out" tone="danger" />
        <AttentionItem icon={FileEdit} label="Drafts not yet live" value={catalog?.byStatus.DRAFT} to="/products?tab=DRAFT" tone="neutral" />
      </div>
    </Card>
  );
}
