import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext.jsx';
import Garment from '../assets/icons/Garment.jsx';

export default function Wishlist() {
  const { wishlist, toggleWishlist, addToCart } = useCart();
  const navigate = useNavigate();
  const wishlistArray = Object.values(wishlist);

  return (
    <div className="wishlist-page-container">
      {/* Breadcrumb Bar */}
      <div className="category-breadcrumb">
        <Link to="/">Home</Link>
        <span className="sep">/</span>
        <span className="current">My Saved Wishlist</span>
      </div>

      {/* Wishlist Hero Header */}
      <div className="wishlist-hero-header">
        <div className="category-hero-badge">SAVED FAVORITES</div>
        <h1>My Wishlist</h1>
        <p className="category-hero-sub">
          Keep track of your favorite tops, bottoms & outfit sets. Save items here and move them to your bag anytime.
        </p>

        <div className="category-stats-row">
          <span className="stat-pill">{wishlistArray.length} Saved Items</span>
          <span className="stat-pill">Price Drop Alerts Active</span>
        </div>
      </div>

      {wishlistArray.length === 0 ? (
        <div className="empty-wishlist-box">
          <div className="empty-heart-icon">♡</div>
          <h3>Your wishlist is currently empty.</h3>
          <p>Explore our collections and tap the heart icon on any outfit item to save it for later.</p>
          <button className="reset-filter-btn" onClick={() => navigate('/all')}>
            Explore Collections
          </button>
        </div>
      ) : (
        <div className="grid">
          {wishlistArray.map((p) => (
            <div className="card wishlist-card" key={p.id}>
              <button
                className="remove-wishlist-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleWishlist(p);
                }}
                title="Remove from Wishlist"
              >
                ✕
              </button>

              <div className="swatch" style={{ background: `${p.hex}22` }} onClick={() => navigate(`/product/${p.id}`)}>
                <Garment type={p.type} hex={p.hex} />
              </div>

              <div className="name" onClick={() => navigate(`/product/${p.id}`)}>{p.name}</div>
              <div className="meta">{p.style} · {p.color}</div>
              <div className="price">₹{Number(p.price).toLocaleString('en-IN')}</div>

              <div className="wishlist-card-actions">
                <button className="wishlist-add-bag-btn" onClick={() => addToCart(p)}>
                  Add to Bag
                </button>
                <button className="wishlist-view-btn" onClick={() => navigate(`/product/${p.id}`)}>
                  View
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
