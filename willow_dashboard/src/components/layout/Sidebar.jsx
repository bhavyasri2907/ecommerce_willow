import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation, useSearchParams } from 'react-router-dom';
import { ChevronDown, ExternalLink } from 'lucide-react';
import { orderService } from '../../services/orderService.js';
import { productService } from '../../services/productService.js';
import { useFetch } from '../../hooks/useFetch.js';
import { useLive } from '../../context/LiveProvider.jsx';
import { CountPill } from '../common/Badge.jsx';
import { STOREFRONT_URL } from '../../constants/config.js';
import { NAV_SECTIONS } from '../../constants/navItems.js';
import logo from '../../assets/images/willow-logo.png';

const LIVE_LABEL = { live: 'Live updates on', connecting: 'Connecting…', offline: 'Offline' };

export default function Sidebar({ open, onNavigate }) {
  const location = useLocation();
  const [params] = useSearchParams();
  const { status } = useLive();
  const onProducts = location.pathname === '/products';
  const [productsOpen, setProductsOpen] = useState(location.pathname.startsWith('/products'));

  useEffect(() => {
    if (location.pathname.startsWith('/products')) setProductsOpen(true);
  }, [location.pathname]);

  const { data: summary } = useFetch((signal) => productService.getProductSummary(undefined, signal), [], {
    live: ['product.', 'inventory.', 'settings.'],
  });
  const { data: orderCounts } = useFetch((signal) => orderService.getOrderCounts(signal), [], { live: ['order.'] });

  const stockAlerts = summary ? summary.lowStock + summary.outOfStock : undefined;
  const badges = {
    products: summary?.total,
    inventory: stockAlerts ? { value: stockAlerts, tone: 'warning' } : undefined,
    orders: orderCounts?.PENDING ? { value: orderCounts.PENDING, tone: 'accent' } : undefined,
  };

  return (
    <aside className={`sidebar ${open ? 'is-open' : ''}`} aria-label="Main navigation">
      <Link to="/" className="brand" onClick={onNavigate}>
        <img src={logo} alt="Willow" className="brand__logo" />
        <span className="brand__caption">Seller Panel</span>
      </Link>

      <nav className="sidebar__nav">
        {NAV_SECTIONS.map((section) => (
          <div key={section.title} className="nav-section">
            <div className="nav-section__title">{section.title}</div>
            <ul>
              {section.items.map((item) => {
                const Icon = item.icon;
                const badge = badges[item.key];
                const badgeProps = typeof badge === 'object' ? badge : { value: badge, tone: 'neutral' };

                if (item.expandable) {
                  const activeType = onProducts ? params.get('type') : null;
                  return (
                    <li key={item.key}>
                      <button
                        className={`nav-link ${location.pathname === '/products' ? 'is-active' : ''}`}
                        onClick={() => setProductsOpen((o) => !o)}
                        aria-expanded={productsOpen}
                      >
                        <Icon size={18} aria-hidden />
                        <span className="nav-link__label">{item.label}</span>
                        <ChevronDown size={16} className={`nav-link__chevron ${productsOpen ? 'is-open' : ''}`} aria-hidden />
                      </button>
                      {productsOpen && (
                        <ul className="subnav">
                          <li>
                            <Link
                              to="/products"
                              onClick={onNavigate}
                              className={`subnav__link ${onProducts && !activeType ? 'is-active' : ''}`}
                            >
                              All Products
                              <CountPill value={summary?.total} tone={onProducts && !activeType ? 'accent' : 'neutral'} />
                            </Link>
                          </li>
                          {summary?.byType.map((t) => (
                            <li key={t.type}>
                              <Link
                                to={`/products?type=${t.type}`}
                                onClick={onNavigate}
                                className={`subnav__link ${activeType === t.type ? 'is-active' : ''}`}
                              >
                                {t.label}
                                <CountPill value={t.count} tone={activeType === t.type ? 'accent' : 'neutral'} />
                              </Link>
                            </li>
                          ))}
                        </ul>
                      )}
                    </li>
                  );
                }

                return (
                  <li key={item.key}>
                    <NavLink to={item.to} end={item.end ?? true} onClick={onNavigate} className={({ isActive }) => `nav-link ${isActive ? 'is-active' : ''}`}>
                      <Icon size={18} aria-hidden />
                      <span className="nav-link__label">{item.label}</span>
                      {badgeProps.value ? <CountPill value={badgeProps.value} tone={badgeProps.tone} /> : null}
                    </NavLink>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      <div className="sidebar__footer">
        <div className={`live-status live-status--${status}`} role="status">
          <span className="live-status__dot" aria-hidden />
          {LIVE_LABEL[status]}
        </div>
        <a className="storefront-link" href={STOREFRONT_URL} target="_blank" rel="noreferrer">
          View storefront <ExternalLink size={14} aria-hidden />
        </a>
      </div>
    </aside>
  );
}
