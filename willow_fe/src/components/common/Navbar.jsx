import { useState } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext.jsx';
import WillowLogo from './WillowLogo.jsx';
import AnnouncementBar from './AnnouncementBar.jsx';
import {
  SearchIcon,
  UserIcon,
  HeartIcon,
  ShoppingCartIcon,
  MenuIcon,
  CloseIcon,
} from '../../assets/icons/NavIcons.jsx';

const NAV_CATEGORIES = [
  { name: 'HOME', path: '/' },
  { name: 'MEN', path: '/men' },
  { name: 'ALL', path: '/all' },
  { name: 'WOMEN', path: '/women' },
  { name: 'BAGS', path: '/bags' },
  { name: 'SHOES', path: '/shoes' },
  { name: 'ACCESSORIES', path: '/accessories' },
  { name: 'SALE', path: '/sale', isSale: true },
];

const ICON_SIZE = 24;

/** Count bubble on a navbar icon. Hidden at zero; large counts collapse to 99+. */
function CountBadge({ count }) {
  if (!count) return null;
  return <span className="icon-badge">{count > 99 ? '99+' : count}</span>;
}

export default function Navbar() {
  const { count, wishlistCount } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/?search=${encodeURIComponent(searchQuery)}`);
      setSearchOpen(false);
    }
  };

  return (
    <header className="willow-header-container">
      <AnnouncementBar />
      {/* Main Navbar */}
      <nav className="willow-navbar">
        {/* Mobile Hamburger Button */}
        <button
          type="button"
          className="mobile-menu-btn"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle Navigation Menu"
        >
          {mobileMenuOpen ? <CloseIcon size={24} /> : <MenuIcon size={24} />}
        </button>

        {/* Left: Category Navigation Links (Desktop) */}
        <div className="nav-links-left">
          {NAV_CATEGORIES.map((cat) => (
            <NavLink
              key={cat.name}
              to={cat.path}
              end={cat.path === '/'}
              className={({ isActive }) =>
                `nav-item ${cat.isSale ? 'sale' : ''} ${isActive ? 'active' : ''}`
              }
            >
              {cat.name}
            </NavLink>
          ))}
        </div>

        {/* Center: Willow Brand Logo */}
        <div className="nav-logo-center">
          <Link to="/" aria-label="Willow Homepage" className="logo-link">
            <WillowLogo height={78} color="#2C181E" />
          </Link>
        </div>

        {/* Right: Utility Icons */}
        <div className="nav-icons-right">
          {/* Search Action */}
          <button
            type="button"
            className="icon-action-btn"
            onClick={() => setSearchOpen(!searchOpen)}
            title="Search"
            aria-label="Search items"
          >
            <SearchIcon size={ICON_SIZE} />
          </button>

          {/* User Account Action */}
          <button
            type="button"
            className="icon-action-btn desktop-only"
            onClick={() => navigate('/account')}
            title="My Account"
            aria-label="My Account"
          >
            <UserIcon size={ICON_SIZE} />
          </button>

          {/* Wishlist Action */}
          <button
            type="button"
            className="icon-action-btn desktop-only badge-btn"
            onClick={() => navigate('/wishlist')}
            title="Wishlist"
            aria-label={`Wishlist, ${wishlistCount} item${wishlistCount === 1 ? '' : 's'}`}
          >
            <HeartIcon size={ICON_SIZE} />
            <CountBadge count={wishlistCount} />
          </button>

          {/* Shopping Bag / Cart Action */}
          <button
            type="button"
            className="icon-action-btn bag-action-btn badge-btn"
            onClick={() => navigate('/cart')}
            title="Shopping Bag"
            aria-label={`Shopping bag, ${count} item${count === 1 ? '' : 's'}`}
          >
            <ShoppingCartIcon size={ICON_SIZE} />
            <CountBadge count={count} />
          </button>
        </div>
      </nav>

      {/* Expandable Search Overlay */}
      {searchOpen && (
        <div className="search-bar-overlay">
          <form onSubmit={handleSearchSubmit} className="search-form">
            <SearchIcon size={18} color="#2C181E" className="search-form-icon" />
            <input
              type="text"
              placeholder="Search dresses, bags, accessories, shoes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              autoFocus
              className="search-input"
            />
            <button
              type="button"
              className="search-close-btn"
              onClick={() => setSearchOpen(false)}
            >
              <CloseIcon size={18} />
            </button>
          </form>
        </div>
      )}

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="mobile-menu-drawer">
          <div className="mobile-drawer-content">
            <div className="mobile-categories">
              {NAV_CATEGORIES.map((cat) => (
                <NavLink
                  key={cat.name}
                  to={cat.path}
                  end={cat.path === '/'}
                  onClick={() => setMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    `mobile-nav-item ${cat.isSale ? 'sale' : ''} ${isActive ? 'active' : ''}`
                  }
                >
                  {cat.name}
                </NavLink>
              ))}
            </div>

            <div className="mobile-footer-actions">
              <Link to="/account" className="mobile-action-link" onClick={() => setMobileMenuOpen(false)}>
                <UserIcon size={20} /> My Account
              </Link>
              <Link to="/wishlist" className="mobile-action-link" onClick={() => setMobileMenuOpen(false)}>
                <HeartIcon size={20} /> Wishlist{wishlistCount > 0 ? ` (${wishlistCount})` : ''}
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
