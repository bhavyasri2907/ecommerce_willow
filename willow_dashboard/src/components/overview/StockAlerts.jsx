import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Card, CardHeader } from '../common/Card.jsx';
import { SkeletonRows } from '../common/Loader.jsx';
import ProductThumb from '../common/ProductThumb.jsx';
import StockBadge from '../inventory/StockBadge.jsx';

/** Out-of-stock products first, then low stock. Both lists are undefined while loading. */
export default function StockAlerts({ lowStock, outOfStock, threshold, limit = 5 }) {
  const alerts = [...(outOfStock ?? []), ...(lowStock ?? [])].slice(0, limit);
  return (
    <Card>
      <CardHeader
        title="Stock alerts"
        subtitle={threshold !== undefined ? `At or below ${threshold} units` : undefined}
        actions={<Link to="/inventory" className="link">Inventory <ArrowRight size={14} aria-hidden /></Link>}
      />
      {!lowStock || !outOfStock ? (
        <SkeletonRows rows={3} columns={2} />
      ) : alerts.length === 0 ? (
        <p className="muted small">All products are comfortably stocked.</p>
      ) : (
        <ul className="mini-list">
          {alerts.map(({ product: p, daysOfCover }) => (
            <li key={p.id}>
              <Link to={`/inventory?adjust=${p.id}`} className="mini-list__row">
                <ProductThumb product={p} size={34} />
                <span className="mini-list__text">
                  <strong>{p.name}</strong>
                  <span>{p.stock} left{daysOfCover !== null && p.stock > 0 ? ` · ~${daysOfCover} days of cover` : ''}</span>
                </span>
                <StockBadge status={p.stockStatus} />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
