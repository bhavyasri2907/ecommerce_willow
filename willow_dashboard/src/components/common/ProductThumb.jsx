import { useState } from 'react';
import { Footprints, Gem, Shirt, ShoppingBag } from 'lucide-react';

const TYPE_ICON = { TOP: Shirt, PANTS: Shirt, SHOES: Footprints, BAG: ShoppingBag, ACCESSORY: Gem };

/** Very light swatches (white, ivory) would vanish on a white tile, so they get a neutral icon. */
function isLight(hex) {
  const n = parseInt(hex.replace('#', ''), 16);
  if (Number.isNaN(n)) return false;
  const [r, g, b] = [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255 > 0.8;
}

/** Product image, falling back to a colour-swatch tile with a category icon. */
export default function ProductThumb({ product, size = 40 }) {
  const [failed, setFailed] = useState(false);
  const hex = product?.hex || '#B4636F';
  const Icon = TYPE_ICON[product?.type] ?? Shirt;

  if (product?.imageUrl && !failed) {
    return (
      <img
        className="thumb"
        src={product.imageUrl}
        alt=""
        width={size}
        height={size}
        loading="lazy"
        onError={() => setFailed(true)}
        style={{ width: size, height: size }}
      />
    );
  }
  return (
    <span className="thumb thumb--swatch" style={{ width: size, height: size, background: isLight(hex) ? hex : `${hex}26` }} aria-hidden>
      <Icon size={Math.round(size * 0.48)} color={isLight(hex) ? '#9a9196' : hex} strokeWidth={1.8} />
    </span>
  );
}
