import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { productService } from '../services/productService.js';
import { useCart } from '../context/CartContext.jsx';
import { useStore } from '../hooks/useStore.js';
import { formatPrice } from '../utils/formatPrice.js';
import ProductImage from '../features/products/components/ProductImage.jsx';

/** Shown under the price so shoppers know how urgent it is. */
function StockNote({ product }) {
  if (product.stockStatus === 'OUT_OF_STOCK') return <p className="pd-stock pd-stock--out">Sold out</p>;
  if (product.stockStatus === 'LOW_STOCK') return <p className="pd-stock pd-stock--low">Only {product.stock} left</p>;
  return <p className="pd-stock">In stock</p>;
}

export default function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const store = useStore();
  const { addToCart, toggleWishlist, isInWishlist } = useCart();

  const [product, setProduct] = useState(null);
  const [photo, setPhoto] = useState(0); // index into product.images
  const [size, setSize] = useState(null);
  const [sizeMissing, setSizeMissing] = useState(false);
  const [matches, setMatches] = useState(null);
  const [matchesVisible, setMatchesVisible] = useState(false);
  const [matchStatus, setMatchStatus] = useState('idle'); // idle | loading | ready | error

  const isSaved = product ? isInWishlist(product.id) : false;

  useEffect(() => {
    setProduct(null);
    setPhoto(0);
    setSize(null);
    setSizeMissing(false);
    setMatches(null);
    setMatchesVisible(false);
    setMatchStatus('idle');
    window.scrollTo(0, 0);
    productService.getProduct(id).then(setProduct).catch(() => setProduct(false));
  }, [id]);

  async function handleFindMatches() {
    if (matches) {
      setMatchesVisible((v) => !v);
      return;
    }
    setMatchStatus('loading');
    try {
      const data = await productService.getAiMatches(id);
      setMatches(data);
      setMatchesVisible(true);
      setMatchStatus('ready');
    } catch {
      setMatchStatus('error');
    }
  }

  if (product === null) return <p className="state-msg">Loading…</p>;
  if (product === false) {
    return (
      <div className="empty-category-box" style={{ marginTop: 40 }}>
        <h3>This product isn't available.</h3>
        <p>It may have been removed or is no longer on sale.</p>
        <button className="reset-filter-btn" onClick={() => navigate('/all')}>Browse all products</button>
      </div>
    );
  }

  const images = product.images ?? [];
  const sizes = product.sizes ?? [];
  const soldOut = product.stockStatus === 'OUT_OF_STOCK';
  const seller = store?.storeName;

  function handleAddToBag() {
    if (sizes.length > 0 && !size) {
      setSizeMissing(true);
      return;
    }
    addToCart(product, size);
  }

  return (
    <div className="product-detail-page">
      <button className="back-link" onClick={() => navigate(-1)}>← Back</button>

      <div className="pd">
        <div className="pd-gallery">
          <ProductImage product={product} src={images[photo] ?? null} className="pd-photo" iconSize="44%" />
          {images.length > 1 && (
            <div className="pd-thumbs">
              {images.map((url, i) => (
                <button
                  key={url}
                  type="button"
                  className={`pd-thumb ${i === photo ? 'is-on' : ''}`}
                  onClick={() => setPhoto(i)}
                  aria-label={`Photo ${i + 1} of ${images.length}`}
                  aria-pressed={i === photo}
                >
                  <img src={url} alt="" loading="lazy" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="pd-info">
          <div className="kicker">
            {[product.genderLabel !== 'Unisex' && product.genderLabel, product.typeLabel].filter(Boolean).join(' · ')}
          </div>
          {(product.brand || seller) && <div className="pd-brand">{product.brand || seller}</div>}
          <h1>{product.name}</h1>

          <div className="pd-price">
            <span className="price">{formatPrice(product.price)}</span>
            {product.discountPercent && (
              <>
                <span className="original-price">{formatPrice(product.originalPrice)}</span>
                <span className="pd-off">{product.discountPercent}% off</span>
              </>
            )}
          </div>
          <StockNote product={product} />

          {sizes.length > 0 && (
            <div className="pd-sizes">
              <div className="pd-label">Size{size ? `: ${size}` : ''}</div>
              <div className="pd-size-list" role="group" aria-label="Size">
                {sizes.map((s) => (
                  <button
                    key={s}
                    type="button"
                    className={`pd-size ${s === size ? 'is-on' : ''}`}
                    aria-pressed={s === size}
                    onClick={() => {
                      setSize(s);
                      setSizeMissing(false);
                    }}
                  >
                    {s}
                  </button>
                ))}
              </div>
              {sizeMissing && <p className="pd-size-error" role="alert">Please choose a size.</p>}
            </div>
          )}

          <div className="pd-action-row">
            <button className="add-btn" onClick={handleAddToBag} disabled={soldOut}>
              {soldOut ? 'Sold out' : 'Add to bag'}
            </button>
            <button
              className={`pd-wishlist-btn ${isSaved ? 'saved' : ''}`}
              onClick={() => toggleWishlist(product)}
              title={isSaved ? 'Remove from Wishlist' : 'Save to Wishlist'}
            >
              {isSaved ? '♥ Saved to Wishlist' : '♡ Save to Wishlist'}
            </button>
          </div>

          {product.description && <p className="desc">{product.description}</p>}

          <dl className="pd-facts">
            {product.color && (
              <div>
                <dt>Colour</dt>
                <dd>
                  <span className="pd-dot" style={{ background: product.hex }} aria-hidden="true" />
                  {product.color}
                </dd>
              </div>
            )}
            {product.material && <div><dt>Material</dt><dd>{product.material}</dd></div>}
            {product.style && <div><dt>Style</dt><dd>{product.style}</dd></div>}
            {seller && <div><dt>Sold by</dt><dd>{seller}</dd></div>}
          </dl>

          {product.type === 'TOP' && (
            <div className="ai-box">
              <div className="ai-head"><span className="dot" /><span>AI Style Assistant</span></div>
              <p className="ai-sub">Not sure what to wear with this? See the pants this seller has paired it with.</p>
              <button className="ai-cta" onClick={handleFindMatches}>
                {matchStatus === 'loading' ? 'Finding matches…' : 'Find matching pants'}
              </button>

              {matchStatus === 'error' && (
                <p className="state-msg" style={{ padding: '12px 0 0' }}>
                  Couldn't reach the style assistant right now.
                </p>
              )}

              {matches && matchesVisible && (
                <div className="match-list">
                  {matches.length === 0 && (
                    <p className="state-msg" style={{ padding: 0 }}>
                      No pants have been paired with this top yet.
                    </p>
                  )}
                  {matches.map((m) => (
                    <div className="match" key={m.product.id}>
                      <ProductImage product={m.product} className="msw" />
                      <div>
                        <div className="mname">{m.product.name}</div>
                        <div className="mreason">{m.reason}</div>
                        <div className="mprice">{formatPrice(m.product.price)}</div>
                      </div>
                      <div>
                        <div className="mscore">{m.matchScore}% match</div>
                        <button className="match-view-btn" onClick={() => navigate(`/product/${m.product.id}`)}>
                          View
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
