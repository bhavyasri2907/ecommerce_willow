import { ExternalLink, X } from 'lucide-react';
import ProductThumb from '../common/ProductThumb.jsx';
import { STOREFRONT_URL } from '../../constants/config.js';
import { formatPrice } from '../../utils/formatPrice.js';

/** The pieces in a Curated Fit. `ownStoreId` marks which ones are the seller's own. */
export default function PickList({ picks, ownStoreId, onRemove }) {
  return (
    <ul className="picks">
      {picks.map((p) => (
        <li key={p.id} className="pick">
          <ProductThumb product={p} size={44} />
          <div className="pick__text">
            <strong>{p.name}</strong>
            <span>
              {p.typeLabel} · {formatPrice(p.price)} · {p.storeId === ownStoreId ? 'Your store' : `From ${p.storeName}`}
              {p.status !== 'LIVE' && <em className="pick__off"> · not on sale, hidden from shoppers</em>}
            </span>
          </div>
          <a
            className="icon-btn"
            href={`${STOREFRONT_URL}/product/${p.id}`}
            target="_blank"
            rel="noreferrer"
            aria-label={`Open ${p.name} on the website`}
          >
            <ExternalLink size={15} />
          </a>
          <button type="button" className="icon-btn" aria-label={`Remove ${p.name}`} onClick={() => onRemove(p)}>
            <X size={16} />
          </button>
        </li>
      ))}
    </ul>
  );
}
