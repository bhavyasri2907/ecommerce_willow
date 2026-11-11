import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { AlertTriangle, Bell, Menu as MenuIcon, Search, ShoppingBag } from 'lucide-react';
import { sellerApi } from '../api/seller.js';
import { useQuery } from '../hooks/useQuery.js';
import { useLive } from '../live/LiveProvider.jsx';
import { formatCurrency, timeAgo } from '../utils/format.js';
import { navItemFor } from './navigation.js';

function NotificationsMenu() {
  const { feed, unread, markRead } = useLive();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!open) return undefined;
    markRead();
    const close = (e) => !ref.current?.contains(e.target) && setOpen(false);
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [open, markRead]);

  return (
    <div className="notif" ref={ref}>
      <button className="icon-btn icon-btn--bordered" aria-label={`Notifications${unread ? `, ${unread} new` : ''}`} onClick={() => setOpen((o) => !o)}>
        <Bell size={18} />
        {unread > 0 && <span className="notif__dot">{unread > 9 ? '9+' : unread}</span>}
      </button>
      {open && (
        <div className="notif__panel" role="dialog" aria-label="Notifications">
          <div className="notif__header">Activity</div>
          {feed.length === 0 ? (
            <p className="notif__empty">New orders and stock alerts will appear here as they happen.</p>
          ) : (
            <ul className="notif__list">
              {feed.map((event) => {
                const isOrder = event.type === 'order.created';
                const p = event.payload;
                return (
                  <li key={event.id}>
                    <button
                      className="notif__item"
                      onClick={() => {
                        setOpen(false);
                        navigate(isOrder ? `/orders?order=${p.id}` : '/inventory?filter=low');
                      }}
                    >
                      <span className={`notif__icon ${isOrder ? 'is-order' : 'is-alert'}`} aria-hidden>
                        {isOrder ? <ShoppingBag size={15} /> : <AlertTriangle size={15} />}
                      </span>
                      <span className="notif__text">
                        <strong>{isOrder ? `New order ${p.orderNumber}` : p.stock === 0 ? `${p.name} sold out` : `${p.name} is low`}</strong>
                        <span>
                          {isOrder ? `${p.customerName} · ${formatCurrency(p.total)}` : `${p.stock} left in stock`} · {timeAgo(event.at)}
                        </span>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

export default function Topbar({ onMenu }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const inputRef = useRef(null);
  const item = navItemFor(location.pathname);
  const Icon = item?.icon;

  const { data: store } = useQuery((signal) => sellerApi.storeProfile(signal), [], { live: ['store.'] });

  useEffect(() => {
    const onKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  function submit(e) {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;
    // Order numbers and emails go to Orders; everything else searches the catalogue.
    const target = /^wl-\d+$/i.test(q) || q.includes('@') ? '/orders' : '/products';
    navigate(`${target}?q=${encodeURIComponent(q)}`);
    setQuery('');
    inputRef.current?.blur();
  }

  const initials = (store?.storeName || 'W').slice(0, 1).toUpperCase();

  return (
    <header className="topbar">
      <button className="icon-btn topbar__menu" onClick={onMenu} aria-label="Open navigation">
        <MenuIcon size={20} />
      </button>
      <div className="topbar__title">
        {Icon && <Icon size={18} aria-hidden />}
        <span>{item?.label ?? 'Seller Panel'}</span>
      </div>

      <form className="global-search" onSubmit={submit} role="search">
        <Search size={16} aria-hidden />
        <input
          ref={inputRef}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search products or orders"
          aria-label="Search products or orders"
        />
        <kbd>Ctrl K</kbd>
      </form>

      <NotificationsMenu />

      <div className="account" title={store?.storeName}>
        {store?.logoUrl ? (
          <img src={store.logoUrl} alt="" className="account__avatar" />
        ) : (
          <span className="account__avatar account__avatar--initials" aria-hidden>{initials}</span>
        )}
        <span className="account__text">
          <strong>{store?.storeName ?? 'Willow'}</strong>
          <span>{store?.ownerName ?? 'Seller'}</span>
        </span>
      </div>
    </header>
  );
}
