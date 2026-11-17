import { useState } from 'react';
import Garment from '../../../assets/icons/Garment.jsx';
import {
  AccessoriesCategoryIcon,
  BagsCategoryIcon,
  ShoesCategoryIcon,
} from '../../../assets/icons/CategoryIcons.jsx';

/** Line icons for the categories the Garment drawing doesn't cover. */
const TYPE_ICONS = {
  BAG: BagsCategoryIcon,
  SHOES: ShoesCategoryIcon,
  ACCESSORY: AccessoriesCategoryIcon,
};

/**
 * A product photo. When there isn't one (or it fails to load) it falls back to a
 * tile in the product's colour with a drawing of its category.
 */
export default function ProductImage({ product, src = product.imageUrl, className = '', iconSize = '55%' }) {
  const [failedSrc, setFailedSrc] = useState(null);

  if (src && failedSrc !== src) {
    return (
      <div className={`product-image ${className}`}>
        <img src={src} alt={product.name} loading="lazy" onError={() => setFailedSrc(src)} />
      </div>
    );
  }

  const hex = product.hex || '#B4636F';
  const TypeIcon = TYPE_ICONS[product.type];
  return (
    <div className={`product-image product-image--drawn ${className}`} style={{ background: `${hex}22` }}>
      {TypeIcon ? (
        <span style={{ width: iconSize, display: 'flex' }}>
          <TypeIcon size="100%" color={hex} />
        </span>
      ) : (
        <Garment type={product.type} hex={hex} size={iconSize} />
      )}
    </div>
  );
}
