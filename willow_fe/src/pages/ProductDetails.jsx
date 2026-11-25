import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { productService } from '../services/productService.js';
import { storeService } from '../services/storeService.js';
import { useCart } from '../context/CartContext.jsx';
import { formatPrice } from '../utils/formatPrice.js';
import { CATEGORY_PAGES } from '../utils/constants.js';
import { ChevronLeftIcon, ChevronRightIcon, HeartIcon, ShoppingCartIcon } from '../assets/icons/NavIcons.jsx';
import ProductImage from '../features/products/components/ProductImage.jsx';
import ProductCard from '../features/products/components/ProductCard.jsx';

const MORE_FROM_STORE = 4;
/** Pieces of a Curated Fit shown before "Show all". */
const FIT_PREVIEW = 3;

function SparkleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 3l1.900 5.100L19 10l-5.100 1.900L12 17l-1.900-5.100L5 10l5.100-1.900L12 3z" />
      <path d="M19 15l.800 2.200L22 18l-2.200.800L19 21l-.800-2.200L16 18l2.200-.800L19 15z" />
    </svg>
  );
}

/** Collection page each category and audience links back to, for the breadcrumb. */
const TYPE_PATH = { BAG: '/bags', SHOES: '/shoes', ACCESSORY: '/accessories' };
const GENDER_PATH = { MEN: '/men', WOMEN: '/women' };
const pageTitle = (path) => CATEGORY_PAGES.find((p) => p.path === path)?.title;

function TruckIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M3 6h11v10H3z" />
      <path d="M14 9h4l3 3v4h-7" />
      <circle cx="7" cy="17.500" r="1.800" />
      <circle cx="17" cy="17.500" r="1.800" />
    </svg>
  );
}

function ReturnIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M4 9h11a5 5 0 0 1 0 10H8" />
      <path d="M8 5 4 9l4 4" />
    </svg>
  );
}

/** How much is left, shown under the price. */
function StockNote({ product }) {
  if (product.stockStatus === 'OUT_OF_STOCK') return <span className="pdp-stock pdp-stock--out">Sold out</span>;
  if (product.stockStatus === 'LOW_STOCK') return <span className="pdp-stock pdp-stock--low">Only {product.stock} left</span>;
  return <span className="pdp-stock">In stock</span>;
}

export default function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart, toggleWishlist, isInWishlist } = useCart();

  const [product, setProduct] = useState(null); // null = loading, false = unavailable
  const [photo, setPhoto] = useState(0); // index into product.images
  const [size, setSize] = useState(null);
  const [sizeMissing, setSizeMissing] = useState(false);
  const [policy, setPolicy] = useState(null); // the seller's shipping and returns
  const [more, setMore] = useState([]); // other products from the same store
  const [fit, setFit] = useState(null); // the seller's Curated Fit for this product; null while loading
  const [fitExpanded, setFitExpanded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setProduct(null);
    setPhoto(0);
    setSize(null);
    setSizeMissing(false);
    setPolicy(null);
    setMore([]);
    setFit(null);
    setFitExpanded(false);
    window.scrollTo(0, 0);

    productService
      .getProduct(id)
      .then((p) => {
        if (cancelled) return;
        setProduct(p);
        // Extras from the seller; the page works without them if either call fails.
        storeService.getPolicies([p.storeId]).then(([found]) => !cancelled && setPolicy(found ?? null)).catch(() => {});
        productService.getCuratedFit(p.id).then((picks) => !cancelled && setFit(picks)).catch(() => !cancelled && setFit([]));
        productService
          .listProducts({ storeId: p.storeId })
          .then((items) => {
            if (cancelled) return;
            const others = items.filter((item) => item.id !== p.id);
            others.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            setMore(others.slice(0, MORE_FROM_STORE));
          })
          .catch(() => {});
      })
      .catch(() => !cancelled && setProduct(false));

    return () => {
      cancelled = true;
    };
  }, [id]);

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
  const isSaved = isInWishlist(product.id);
  const storeUrl = `/store/${product.storeId}`;
  const step = (by) => setPhoto((i) => (i + by + images.length) % images.length);

  // Breadcrumb: Home / Women / Bottoms. Bags, shoes and accessories have their own page; clothing lives under Men/Women.
  const genderPath = GENDER_PATH[product.gender];
  const typePath = TYPE_PATH[product.type] ?? genderPath ?? '/all';
  const crumbs = [
    { label: 'Home', to: '/' },
    genderPath && { label: pageTitle(genderPath), to: genderPath },
    { label: product.typeLabel, to: typePath },
  ].filter(Boolean);

  const specs = [
    product.color && {
      label: 'Colour',
      value: (
        <>
          <span className="pdp-dot" style={{ background: product.hex }} aria-hidden="true" />
          {product.color}
        </>
      ),
    },
    product.material && { label: 'Material', value: product.material },
    product.style && { label: 'Style', value: product.style },
    { label: 'Category', value: product.typeLabel },
    product.genderLabel && { label: 'For', value: product.genderLabel },
    sizes.length > 0 && { label: 'Sizes', value: sizes.join(', ') },
  ].filter(Boolean);

  function handleAddToBag() {
    if (sizes.length > 0 && !size) {
      setSizeMissing(true);
      return;
    }
    addToCart(product, size);
  }

  return (
    <div className="pdp">
      <nav className="pdp-crumbs" aria-label="Breadcrumb">
        {crumbs.map((c) => (
          <span key={c.label}>
            <Link to={c.to}>{c.label}</Link>
            <span className="pdp-crumbs__sep" aria-hidden="true">/</span>
          </span>
        ))}
        <span className="pdp-crumbs__current">{product.name}</span>
      </nav>

      <div className="pdp-main">
        {/* Gallery: thumbnail rail beside the photo; stays in view while the details scroll. */}
        <div className="pdp-gallery">
          {images.length > 1 && (
            <div className="pdp-rail">
              {images.map((url, i) => (
                <button
                  key={url}
                  type="button"
                  className={`pdp-thumb ${i === photo ? 'is-on' : ''}`}
                  onClick={() => setPhoto(i)}
                  aria-label={`Photo ${i + 1} of ${images.length}`}
                  aria-pressed={i === photo}
                >
                  <img src={url} alt="" loading="lazy" />
                </button>
              ))}
            </div>
          )}

          <div className="pdp-stage">
            <ProductImage product={product} src={images[photo] ?? null} iconSize="42%" />
            {product.discountPercent && !soldOut && <span className="pdp-flag">{product.discountPercent}% off</span>}
            {soldOut && <span className="pdp-flag pdp-flag--muted">Sold out</span>}
            {images.length > 1 && (
              <>
                <button type="button" className="pdp-arrow pdp-arrow--prev" onClick={() => step(-1)} aria-label="Previous photo">
                  <ChevronLeftIcon size={18} />
                </button>
                <button type="button" className="pdp-arrow pdp-arrow--next" onClick={() => step(1)} aria-label="Next photo">
                  <ChevronRightIcon size={18} />
                </button>
                <span className="pdp-count">{photo + 1} / {images.length}</span>
              </>
            )}
          </div>
        </div>

        <div className="pdp-info">
          <Link to={storeUrl} className="pdp-brand">{product.brand || product.storeName}</Link>
          <h1 className="pdp-title">{product.name}</h1>

          <div className="pdp-price">
            <span className="pdp-price__now">{formatPrice(product.price)}</span>
            {product.discountPercent && (
              <>
                <span className="pdp-price__was">{formatPrice(product.originalPrice)}</span>
                <span className="pdp-price__off">{product.discountPercent}% off</span>
              </>
            )}
          </div>
          <StockNote product={product} />

          {sizes.length > 0 && (
            <div className="pdp-block">
              <div className="pdp-label">
                <span>Select size</span>
                {size && <span className="pdp-label__value">{size}</span>}
              </div>
              <div className="pdp-sizes" role="group" aria-label="Size">
                {sizes.map((s) => (
                  <button
                    key={s}
                    type="button"
                    className={`pdp-size ${s === size ? 'is-on' : ''}`}
                    aria-pressed={s === size}
                    disabled={soldOut}
                    onClick={() => {
                      setSize(s);
                      setSizeMissing(false);
                    }}
                  >
                    {s}
                  </button>
                ))}
              </div>
              {sizeMissing && <p className="pdp-error" role="alert">Please choose a size first.</p>}
            </div>
          )}

          <div className="pdp-actions">
            <button type="button" className="pdp-add" onClick={handleAddToBag} disabled={soldOut}>
              <ShoppingCartIcon size={18} />
              {soldOut ? 'Sold out' : 'Add to bag'}
            </button>
            <button
              type="button"
              className={`pdp-save ${isSaved ? 'is-saved' : ''}`}
              onClick={() => toggleWishlist(product)}
              aria-pressed={isSaved}
            >
              <HeartIcon size={18} />
              {isSaved ? 'Saved' : 'Wishlist'}
            </button>
          </div>

          {policy && (
            <ul className="pdp-perks">
              <li>
                <TruckIcon />
                <span>
                  <strong>
                    {Number(policy.shippingFee) === 0 || Number(policy.freeShippingThreshold) <= Number(product.price)
                      ? 'Free delivery'
                      : `Delivery ${formatPrice(policy.shippingFee)}`}
                  </strong>
                  {Number(policy.shippingFee) > 0 && Number(policy.freeShippingThreshold) > Number(product.price) && (
                    <> · free on orders over {formatPrice(policy.freeShippingThreshold)} from this seller</>
                  )}
                </span>
              </li>
              <li>
                <ReturnIcon />
                <span>
                  {policy.returnWindowDays > 0 ? (
                    <><strong>{policy.returnWindowDays}-day returns</strong> · send it back if it isn't right</>
                  ) : (
                    <strong>This seller does not accept returns</strong>
                  )}
                </span>
              </li>
            </ul>
          )}

          <section className="pdp-section">
            <h2>Product details</h2>
            {product.description && <p className="pdp-desc">{product.description}</p>}
            <dl className="pdp-specs">
              {specs.map((s) => (
                <div key={s.label}>
                  <dt>{s.label}</dt>
                  <dd>{s.value}</dd>
                </div>
              ))}
            </dl>
          </section>

          <Link to={storeUrl} className="pdp-seller">
            <span className="pdp-seller__avatar" aria-hidden="true">{product.storeName.slice(0, 1).toUpperCase()}</span>
            <span className="pdp-seller__text">
              <span>Sold by</span>
              <strong>{product.storeName}</strong>
            </span>
            <span className="pdp-seller__go">Visit store <ChevronRightIcon size={14} /></span>
          </Link>

          {/* Seller's Curated Fit: what this seller suggests wearing with the piece. */}
          <section className="pdp-fit" aria-labelledby="pdp-fit-title">
            <div className="pdp-fit__head">
              <span className="pdp-fit__icon" aria-hidden="true"><SparkleIcon /></span>
              <div>
                <h2 id="pdp-fit-title">Seller's Curated Fit</h2>
                <p>
                  {fit?.length
                    ? `Picked by ${product.storeName} to wear with this piece.`
                    : `Pieces ${product.storeName} suggests wearing with this.`}
                </p>
              </div>
              {fit?.length > 0 && <span className="pdp-fit__count">{fit.length}</span>}
            </div>

            {fit === null ? (
              <p className="pdp-fit__empty">Loading…</p>
            ) : fit.length === 0 ? (
              <p className="pdp-fit__empty">
                {product.storeName} hasn't put a fit together for this piece yet.{' '}
                <Link to={storeUrl}>Browse their store</Link> for ideas.
              </p>
            ) : (
              <>
                <ul className="pdp-fit__list">
                  {(fitExpanded ? fit : fit.slice(0, FIT_PREVIEW)).map((p) => (
                    <li key={p.id}>
                      <Link to={`/product/${p.id}`} className="pdp-fit__item">
                        <ProductImage product={p} className="pdp-fit__thumb" />
                        <span className="pdp-fit__text">
                          <span className="pdp-fit__store">{p.brand || p.storeName}</span>
                          <strong>{p.name}</strong>
                          <span className="pdp-fit__meta">
                            {p.typeLabel} · {formatPrice(p.price)}
                            {p.discountPercent && <em> · {p.discountPercent}% off</em>}
                            {p.stockStatus === 'OUT_OF_STOCK' && <em className="is-out"> · Sold out</em>}
                          </span>
                        </span>
                        <span className="pdp-fit__go">View <ChevronRightIcon size={14} /></span>
                      </Link>
                    </li>
                  ))}
                </ul>
                {fit.length > FIT_PREVIEW && (
                  <button type="button" className="pdp-fit__more" onClick={() => setFitExpanded((v) => !v)}>
                    {fitExpanded ? 'Show fewer' : `Show all ${fit.length} pieces`}
                  </button>
                )}
              </>
            )}
          </section>
        </div>
      </div>

      {more.length > 0 && (
        <section className="pdp-more">
          <div className="pdp-more__head">
            <h2>More from {product.storeName}</h2>
            <Link to={storeUrl}>View all</Link>
          </div>
          <div className="grid">
            {more.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
