import { useEffect, useState } from 'react';
import { productService } from '../services/productService.js';
import ProductCard from '../features/products/components/ProductCard.jsx';
import { CATEGORY_FILTERS, itemsForCategory } from '../features/products/categoryFilters.js';

/** A collection page (Men, Women, Bags, Sale, ...): icon filters, sort and the product grid. */
export default function Products({ categoryKey, title }) {
  const [products, setProducts] = useState([]);
  const [status, setStatus] = useState('loading');
  const [activeFilter, setActiveFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');

  const filters = CATEGORY_FILTERS[categoryKey] || [];

  useEffect(() => {
    let cancelled = false;
    setActiveFilter('all');
    setStatus('loading');
    window.scrollTo(0, 0);

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
  const visibleProducts = products.filter(matches);
  // "Newest" keeps the order the list arrives in; the price sorts reorder a copy.
  if (sortBy === 'price-low') visibleProducts.sort((a, b) => a.price - b.price);
  if (sortBy === 'price-high') visibleProducts.sort((a, b) => b.price - a.price);

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
            <option value="newest">Newest</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
          </select>
        </div>
      </div>

      {status === 'error' && (
        <p className="state-msg">
          Couldn't load this collection. Please check your connection and try again.
        </p>
      )}

      {status === 'loading' && <p className="state-msg">Loading {title}…</p>}

      {status === 'ready' && visibleProducts.length === 0 && (
        <div className="empty-category-box">
          <h3>Nothing here yet.</h3>
          <p>
            {activeFilter === 'all'
              ? 'New pieces are added often — check back soon.'
              : 'Try another filter or browse the full collection.'}
          </p>
          {activeFilter !== 'all' && (
            <button className="reset-filter-btn" onClick={() => setActiveFilter('all')}>
              Show all
            </button>
          )}
        </div>
      )}

      {status === 'ready' && visibleProducts.length > 0 && (
        <div className="grid">
          {visibleProducts.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}
