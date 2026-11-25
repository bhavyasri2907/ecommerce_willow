import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { productService } from '../services/productService.js';
import ProductCard from '../features/products/components/ProductCard.jsx';
import heroBg from '../assets/images/heropage2.png';

export default function Home() {
  const [products, setProducts] = useState([]);
  const [status, setStatus] = useState('loading');
  const navigate = useNavigate();

  useEffect(() => {
    setStatus('loading');
    productService
      .listProducts()
      .then((data) => {
        // Newest arrivals first.
        setProducts([...data].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
        setStatus('ready');
      })
      .catch(() => setStatus('error'));
  }, []);

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
                  onClick={() => navigate('/all')}
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

      <div id="catalog" className="home-catalog">
        {status === 'error' && (
          <p className="state-msg">Couldn't load the collection. Please check your connection and try again.</p>
        )}
        {status === 'loading' && <p className="state-msg">Loading Willow collection…</p>}

        {status === 'ready' && products.length === 0 && (
          <div className="empty-category-box">
            <h3>The collection is on its way.</h3>
            <p>New pieces will appear here as soon as they are listed.</p>
          </div>
        )}

        {status === 'ready' && products.length > 0 && (
          <div className="grid">
            {products.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
