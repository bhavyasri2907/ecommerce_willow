import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { productService } from '../services/productService.js';
import Garment from '../assets/icons/Garment.jsx';
import {
  CATEGORY_FILTERS,
  TYPE_ICONS,
  itemsForCategory,
  needsApi,
} from '../features/products/categoryFilters.js';

export default function Products({ categoryKey, title }) {
  const [products, setProducts] = useState([]);
  const [status, setStatus] = useState('loading');
  const [activeFilter, setActiveFilter] = useState('all');
  const [sortBy, setSortBy] = useState('featured');
  const navigate = useNavigate();

  const filters = CATEGORY_FILTERS[categoryKey] || [];

  useEffect(() => {
    let cancelled = false;
    setActiveFilter('all');
    window.scrollTo(0, 0);

    if (!needsApi(categoryKey)) {
      setProducts(itemsForCategory(categoryKey, []));
      setStatus('ready');
      return undefined;
    }

    setStatus('loading');
    productService
      .listProducts()
      .then((data) => {
        if (cancelled) return;
        setProducts(itemsForCategory(categoryKey, data));
        setStatus('ready');
      })
      .catch(() => !cancelled && setStatus('error'));

    return () => {
      cancelled = true;
    };
  }, [categoryKey]);

  const matches = filters.find((f) => f.id === activeFilter)?.match || (() => true);
  const visibleProducts = products.filter(matches).sort((a, b) => {
    if (sortBy === 'price-low') return a.price - b.price;
    if (sortBy === 'price-high') return b.price - a.price;
    return a.id - b.id;
  });

  return (
    <div className="category-page-container">
      <h1 className="category-page-title">{title}</h1>

      {/* Icon filters for this collection */}
      <div className="category-icons-grid category-page-filters">
        {filters.map((filter) => {
          const IconComp = filter.icon;
          const isActive = activeFilter === filter.id;
          return (
            <button
              key={filter.id}
              type="button"
              className={`category-pill-btn ${isActive ? 'active' : ''}`}
              onClick={() => setActiveFilter(filter.id)}
              aria-pressed={isActive}
            >
              <div className="category-circle-icon">
                <IconComp size={30} color={isActive ? '#FFFFFF' : '#8C2D42'} />
              </div>
              <span className="category-label">{filter.label}</span>
            </button>
          );
        })}
      </div>

      <div className="category-controls-bar">
        <span className="category-item-count">
          {status === 'ready' ? `${visibleProducts.length} item${visibleProducts.length === 1 ? '' : 's'}` : ''}
        </span>

        <div className="sort-dropdown-wrapper">
          <label htmlFor="sort-select">Sort by:</label>
          <select
            id="sort-select"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="sort-select"
          >
            <option value="featured">Featured</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
          </select>
        </div>
      </div>

      {status === 'error' && (
        <p className="state-msg">
          Couldn't load collection. Please ensure the Willow API is running.
        </p>
      )}

      {status === 'loading' && <p className="state-msg">Loading {title}…</p>}

      {status === 'ready' && visibleProducts.length === 0 && (
        <div className="empty-category-box">
          <h3>Nothing here yet.</h3>
          <p>Try another filter or browse the full collection.</p>
          {activeFilter !== 'all' && (
            <button className="reset-filter-btn" onClick={() => setActiveFilter('all')}>
              Show all
            </button>
          )}
        </div>
      )}

      {status === 'ready' && visibleProducts.length > 0 && (
        <div className="grid">
          {visibleProducts.map((p) => {
            const TypeIcon = TYPE_ICONS[p.type];
            return (
              <div className="card" key={p.id} onClick={() => navigate(`/product/${p.id}`)}>
                <div className="swatch" style={{ background: `${p.hex}22` }}>
                  {TypeIcon ? <TypeIcon size={96} color={p.hex} /> : <Garment type={p.type} hex={p.hex} />}
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
            );
          })}
        </div>
      )}
    </div>
  );
}
