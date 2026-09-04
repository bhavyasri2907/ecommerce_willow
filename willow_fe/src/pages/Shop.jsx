import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/client.js';
import Garment from '../icons/Garment.jsx';
import ShopByCategory from '../components/ShopByCategory.jsx';

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
      <div className="hero">
        <div>
          <h1>Dress in<br />pairs, not<br />pieces.</h1>
          <p className="sub">
            Willow pairs every top with pants its own sellers have chosen — then lets a style
            assistant tell you why they work.
          </p>
          <button
            className="hero-cta"
            onClick={() => document.getElementById('catalog').scrollIntoView({ behavior: 'smooth' })}
          >
            Explore Collection
          </button>
        </div>
        <div className="hero-side">
          Every recommendation on Willow starts with the seller, not a guess. Our style assistant
          only ever ranks and explains matches a seller has already approved — so what you see is
          always something you can actually buy.
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
