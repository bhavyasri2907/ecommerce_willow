import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { productService } from '../services/productService.js';
import { storeService } from '../services/storeService.js';
import ProductCard from '../features/products/components/ProductCard.jsx';

/** One seller's shop window (/store/:storeId): who they are and everything they have on sale. */
export default function StorePage() {
  const { storeId } = useParams();
  const navigate = useNavigate();
  const [store, setStore] = useState(null);
  const [products, setProducts] = useState([]);
  const [status, setStatus] = useState('loading'); // loading | ready | missing

  useEffect(() => {
    let cancelled = false;
    setStatus('loading');
    window.scrollTo(0, 0);

    Promise.all([storeService.getStore(storeId), productService.listProducts({ storeId })])
      .then(([info, items]) => {
        if (cancelled) return;
        setStore(info);
        setProducts([...items].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
        setStatus('ready');
      })
      .catch(() => !cancelled && setStatus('missing'));

    return () => {
      cancelled = true;
    };
  }, [storeId]);

  if (status === 'loading') return <p className="state-msg">Loading store…</p>;
  if (status === 'missing') {
    return (
      <div className="empty-category-box" style={{ marginTop: 40 }}>
        <h3>We couldn't find that store.</h3>
        <p>It may have closed, or the link may be wrong.</p>
        <button className="reset-filter-btn" onClick={() => navigate('/all')}>Browse all products</button>
      </div>
    );
  }

  return (
    <div className="category-page-container">
      <header className="store-header">
        {store.logoUrl && <img className="store-header__logo" src={store.logoUrl} alt="" />}
        <p className="store-header__eyebrow">Seller on Willow</p>
        <h1 className="category-page-title">{store.storeName}</h1>
        {store.tagline && <p className="store-header__tagline">{store.tagline}</p>}
        {store.description && <p className="store-header__about">{store.description}</p>}
      </header>

      <div className="category-controls-bar">
        <span className="category-item-count">
          {products.length} item{products.length === 1 ? '' : 's'}
        </span>
      </div>

      {products.length === 0 ? (
        <div className="empty-category-box">
          <h3>Nothing on sale yet.</h3>
          <p>This store hasn't listed any products so far.</p>
        </div>
      ) : (
        <div className="grid">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}
