import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { productService } from '../services/productService.js';
import Garment from '../assets/icons/Garment.jsx';

// Custom curated items for specific categories (Bags, Shoes, Accessories, Sale, New In)
const EXTENDED_COLLECTIONS = {
  bags: [
    { id: 901, name: 'Leather Tote Bag', type: 'BAG', color: 'Tan', hex: '#8C5230', style: 'Smart', price: 2999, description: 'Structured pebbled leather tote with spacious double compartments.' },
    { id: 902, name: 'Canvas Crossbody', type: 'BAG', color: 'Cream', hex: '#EAE3D2', style: 'Casual', price: 1799, description: 'Durable canvas crossbody bag with adjustable webbed strap.' },
    { id: 903, name: 'Saddle Shoulder Bag', type: 'BAG', color: 'Burgundy', hex: '#5C1D24', style: 'Smart Casual', price: 2499, description: 'Classic saddle-shaped shoulder bag in rich burgundy smooth leather.' },
  ],
  shoes: [
    { id: 911, name: 'Classic Canvas Lows', type: 'SHOES', color: 'Burgundy', hex: '#7D2D40', style: 'Casual', price: 2499, description: 'Heritage canvas low-top sneakers in deep burgundy.' },
    { id: 912, name: 'Minimalist Leather Loafers', type: 'SHOES', color: 'Black', hex: '#231519', style: 'Smart', price: 3499, description: 'Handcrafted leather penny loafers with cushioned insoles.' },
    { id: 913, name: 'Suede Chelsea Boots', type: 'SHOES', color: 'Taupe', hex: '#9C8A79', style: 'Smart Casual', price: 3999, description: 'Refined suede chelsea boots with elastic side gussets.' },
  ],
  accessories: [
    { id: 921, name: 'Gold Hoop Earrings', type: 'ACCESSORY', color: 'Gold', hex: '#C9A24B', style: 'Smart', price: 699, description: '18k gold plated lightweight daily hoop earrings.' },
    { id: 922, name: 'Mesh Gold Watch', type: 'ACCESSORY', color: 'Gold', hex: '#D4AF37', style: 'Smart', price: 1599, description: 'Sleek mesh strap analog watch with minimal champagne dial.' },
    { id: 923, name: 'Italian Leather Belt', type: 'ACCESSORY', color: 'Brown', hex: '#5C3A21', style: 'Casual', price: 1299, description: 'Full grain leather belt finished with a brushed brass buckle.' },
  ],
};

export default function Products({ categoryKey, title, subtitle, badge, isSalePage = false }) {
  const [products, setProducts] = useState([]);
  const [status, setStatus] = useState('loading');
  const [activeFilter, setActiveFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState('featured');
  const navigate = useNavigate();

  useEffect(() => {
    setStatus('loading');
    window.scrollTo(0, 0);

    productService
      .listProducts()
      .then((data) => {
        let items = [...data];

        // Filter items based on category key
        if (categoryKey === 'men') {
          // Curate men's collection (shirts, smart casual tops, tailored pants)
          items = items.filter((p) => p.style === 'Smart' || p.style === 'Smart Casual' || p.type === 'PANTS');
        } else if (categoryKey === 'women') {
          // Curate women's collection
          items = items.filter((p) => p.style === 'Casual' || p.type === 'TOP');
        } else if (categoryKey === 'new-in') {
          // Latest arrivals
          items = items.slice(0, 8);
        } else if (categoryKey === 'sale') {
          // Sale products with discounted price presentation
          items = items.map((p) => ({ ...p, price: Math.round(p.price * 0.85), originalPrice: p.price }));
        } else if (EXTENDED_COLLECTIONS[categoryKey]) {
          // Bags, Shoes, Accessories
          items = EXTENDED_COLLECTIONS[categoryKey];
        }

        setProducts(items);
        setStatus('ready');
      })
      .catch(() => setStatus('error'));
  }, [categoryKey]);

  // Apply Sub-filter (All, Top, Pants, Smart, Casual)
  const filteredProducts = products.filter((p) => {
    if (activeFilter === 'TOP') return p.type === 'TOP';
    if (activeFilter === 'PANTS') return p.type === 'PANTS';
    if (activeFilter === 'SMART') return p.style === 'Smart' || p.style === 'Smart Casual';
    if (activeFilter === 'CASUAL') return p.style === 'Casual';
    return true;
  });

  // Apply Sorting
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortBy === 'price-low') return a.price - b.price;
    if (sortBy === 'price-high') return b.price - a.price;
    return a.id - b.id;
  });

  return (
    <div className="category-page-container">
      {/* Breadcrumb Bar */}
      <div className="category-breadcrumb">
        <Link to="/">Home</Link>
        <span className="sep">/</span>
        <span className="current">{title}</span>
      </div>

      {/* Category Hero Banner */}
      <div className={`category-hero-header ${isSalePage ? 'sale-banner' : ''}`}>
        <div className="category-hero-badge">{badge || 'Curated Collection'}</div>
        <h1>{title}</h1>
        <p className="category-hero-sub">{subtitle}</p>

        <div className="category-stats-row">
          <span className="stat-pill">{sortedProducts.length} Items Available</span>
          <span className="stat-pill">Stylist Verified Pairs</span>
        </div>
      </div>

      {/* Filter & Sorting Controls */}
      <div className="category-controls-bar">
        <div className="filter-chips">
          <button
            className={`filter-chip ${activeFilter === 'ALL' ? 'active' : ''}`}
            onClick={() => setActiveFilter('ALL')}
          >
            All Items
          </button>
          <button
            className={`filter-chip ${activeFilter === 'TOP' ? 'active' : ''}`}
            onClick={() => setActiveFilter('TOP')}
          >
            Tops
          </button>
          <button
            className={`filter-chip ${activeFilter === 'PANTS' ? 'active' : ''}`}
            onClick={() => setActiveFilter('PANTS')}
          >
            Pants & Bottoms
          </button>
          <button
            className={`filter-chip ${activeFilter === 'CASUAL' ? 'active' : ''}`}
            onClick={() => setActiveFilter('CASUAL')}
          >
            Casual
          </button>
          <button
            className={`filter-chip ${activeFilter === 'SMART' ? 'active' : ''}`}
            onClick={() => setActiveFilter('SMART')}
          >
            Smart
          </button>
        </div>

        <div className="sort-dropdown-wrapper">
          <label htmlFor="sort-select">Sort by:</label>
          <select
            id="sort-select"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="sort-select"
          >
            <option value="featured">Featured Pairs</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
          </select>
        </div>
      </div>

      {/* Product Grid State Handling */}
      {status === 'error' && (
        <p className="state-msg">
          Couldn't load collection. Please ensure the Willow API is running.
        </p>
      )}

      {status === 'loading' && <p className="state-msg">Loading {title} collection…</p>}

      {status === 'ready' && sortedProducts.length === 0 && (
        <div className="empty-category-box">
          <h3>No items match your selected filter.</h3>
          <p>Try switching filter tabs or exploring our main collection.</p>
          <button className="reset-filter-btn" onClick={() => setActiveFilter('ALL')}>
            Reset Filters
          </button>
        </div>
      )}

      {status === 'ready' && sortedProducts.length > 0 && (
        <div className="grid">
          {sortedProducts.map((p) => (
            <div className="card" key={p.id} onClick={() => navigate(`/product/${p.id}`)}>
              <div className="swatch" style={{ background: `${p.hex}22` }}>
                <Garment type={p.type} hex={p.hex} />
              </div>
              <div className="name">{p.name}</div>
              <div className="meta">
                {p.style} · {p.color}
              </div>
              <div className="price-row">
                <span className="price">₹{Number(p.price).toLocaleString('en-IN')}</span>
                {p.originalPrice && (
                  <span className="original-price">₹{Number(p.originalPrice).toLocaleString('en-IN')}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
