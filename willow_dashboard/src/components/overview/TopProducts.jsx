import { Link } from 'react-router-dom';
import { Card, CardHeader } from '../common/Card.jsx';
import { SkeletonRows } from '../common/Loader.jsx';
import ProductThumb from '../common/ProductThumb.jsx';
import { formatPrice } from '../../utils/formatPrice.js';
import { formatNumber } from '../../utils/formatNumber.js';

/** Best sellers by revenue. `products` is undefined while loading. */
export default function TopProducts({ products, limit = 4 }) {
  return (
    <Card>
      <CardHeader title="Top sellers" subtitle="By revenue, last 30 days" />
      {!products ? (
        <SkeletonRows rows={3} columns={2} />
      ) : products.length === 0 ? (
        <p className="muted small">No sales in this period yet.</p>
      ) : (
        <ol className="mini-list mini-list--ranked">
          {products.slice(0, limit).map((p, i) => (
            <li key={p.productId}>
              <Link to={`/products/${p.productId}/edit`} className="mini-list__row">
                <span className="rank">{i + 1}</span>
                <ProductThumb product={{ ...p, type: undefined }} size={34} />
                <span className="mini-list__text">
                  <strong>{p.name}</strong>
                  <span>{formatNumber(p.units)} sold</span>
                </span>
                <span className="strong">{formatPrice(p.revenue)}</span>
              </Link>
            </li>
          ))}
        </ol>
      )}
    </Card>
  );
}
