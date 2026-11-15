import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { productService } from '../services/productService.js';
import { useCart } from '../context/CartContext.jsx';
import Garment from '../assets/icons/Garment.jsx';

export default function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart, toggleWishlist, isInWishlist, getPairingsForTop } = useCart();

  const [product, setProduct] = useState(null);
  const [matches, setMatches] = useState(null);
  const [matchesVisible, setMatchesVisible] = useState(false);
  const [matchStatus, setMatchStatus] = useState('idle'); // idle | loading | ready | error

  const sellerPairings = getPairingsForTop(id);
  const isSaved = product ? isInWishlist(product.id) : false;

  useEffect(() => {
    setProduct(null);
    setMatches(null);
    setMatchesVisible(false);
    setMatchStatus('idle');
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
  if (product === false) return <p className="state-msg">Couldn't load that product.</p>;

  return (
    <div className="product-detail-page">
      <button className="back-link" onClick={() => navigate(-1)}>← Back to collection</button>

      <div className="pd">
        <div className="pd-swatch" style={{ background: `${product.hex}22` }}>
          <Garment type={product.type} hex={product.hex} size="44%" />
        </div>

        <div className="pd-info">
          <div className="kicker">{product.type === 'TOP' ? 'Top' : 'Pants'}</div>
          <h1>{product.name}</h1>
          <div className="price">₹{Number(product.price).toLocaleString('en-IN')}</div>
          <p className="desc">{product.description}</p>

          <div className="pd-action-row">
            <button className="add-btn" onClick={() => addToCart(product)}>Add to bag</button>
            <button
              className={`pd-wishlist-btn ${isSaved ? 'saved' : ''}`}
              onClick={() => toggleWishlist(product)}
              title={isSaved ? 'Remove from Wishlist' : 'Save to Wishlist'}
            >
              {isSaved ? '♥ Saved to Wishlist' : '♡ Save to Wishlist'}
            </button>
          </div>

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
                      No pants have been approved for this top yet — add some in Seller Studio.
                    </p>
                  )}
                  {matches.map((m) => (
                    <div className="match" key={m.product.id}>
                      <div className="msw" style={{ background: `${m.product.hex}22` }}>
                        <Garment type={m.product.type} hex={m.product.hex} />
                      </div>
                      <div>
                        <div className="mname">{m.product.name}</div>
                        <div className="mreason">{m.reason}</div>
                        <div className="mprice">₹{Number(m.product.price).toLocaleString('en-IN')}</div>
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
