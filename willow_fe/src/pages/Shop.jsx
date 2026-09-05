import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/client.js';
import Garment from '../icons/Garment.jsx';
import ShopByCategory from '../components/ShopByCategory.jsx';
import heroBg from '../assets/heropage2.png';

export default function Shop() {
  const [products, setProducts] = useState([]);
  const [activeCategory, setActiveCategory] = useState('all');
  const [filterType, setFilterType] = useState(null);
  const [status, setStatus] = useState('loading');
  const navigate = useNavigate();

  useEffect(() => {
    setStatus('loading');
    api
      .listProducts(filterType)
      .then((data) => {
        setProducts(data);
        setStatus('ready');
      })
      .catch(() => setStatus('error'));
  }, [filterType]);

  const handleCategorySelect = (catId, type) => {
    if (activeCategory === catId) {
      setActiveCategory('all');
      setFilterType(null);
    } else {
      setActiveCategory(catId);
      setFilterType(type);
    }
  };

  return (
    <div>
      {/* 100% Full-width Picture Hero with Direct Overlay Content */}
      <div className="hero-full-screen">
        <img src={heroBg} alt="Willow Style Assistant" className="hero-bg-img" />

        <div className="hero-overlay-container">
          <div className="hero-overlay-content">
            <h1>
              Dress in<br />
              <span className="hero-accent-word">pairs</span>, not<br />
              pieces.
            </h1>

            <p className="hero-sub-description">
              Discover complete outfits from tops and bottoms to shoes and accessories.<br />
              Every look is thoughtfully styled so everything works perfectly together.
            </p>

            {/* Rating & Social Proof Bar */}
            <div className="hero-rating-section">
              <div className="hero-rating-row">
                <div className="stars-row" aria-label="5 out of 5 stars">
                  ★★★★★
                </div>
                <span className="rating-score">4.9/5</span>
              </div>
              <div className="hero-rating-divider" />
            </div>

            {/* Dual Action CTA Buttons */}
            <div className="hero-cta-group">
              <button
                className="hero-primary-cta"
                onClick={() => document.getElementById('catalog')?.scrollIntoView({ behavior: 'smooth' })}
              >
                <span>Explore Collections</span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14" />
                  <path d="m12 5 7 7-7 7" />
                </svg>
              </button>

              <div className="hero-secondary-cta-wrapper">
                <button
                  className="hero-secondary-cta"
                  onClick={() => navigate('/studio')}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="4" x2="20" y1="21" y2="21" />
                    <line x1="4" x2="20" y1="14" y2="14" />
                    <line x1="4" x2="20" y1="7" y2="7" />
                    <circle cx="8" cy="21" r="2" />
                    <circle cx="16" cy="14" r="2" />
                    <circle cx="12" cy="7" r="2" />
                  </svg>
                  <span>Find Your Style Fit</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div id="catalog">
        {/* Shop By Category Section replacing 'The edit' header */}
        <ShopByCategory
          activeCategory={activeCategory}
          onSelectCategory={handleCategorySelect}
        />

        {status === 'error' && (
          <p className="state-msg">
            Couldn't reach the Willow API. Make sure the Spring Boot backend is running on
            http://localhost:8080.
          </p>
        )}
        {status === 'loading' && <p className="state-msg">Loading Willow collection…</p>}

        {status === 'ready' && (
          <div className="grid">
            {products.map((p) => (
              <div className="card" key={p.id} onClick={() => navigate(`/product/${p.id}`)}>
                <div className="swatch" style={{ background: `${p.hex}22` }}>
                  <Garment type={p.type} hex={p.hex} />
                </div>
                <div className="name">{p.name}</div>
                <div className="meta">{p.style} · {p.color}</div>
                <div className="price">₹{Number(p.price).toLocaleString('en-IN')}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
