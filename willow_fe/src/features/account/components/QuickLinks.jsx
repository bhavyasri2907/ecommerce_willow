import { Link } from 'react-router-dom';
import { ChevronRightIcon } from '../../../assets/icons/NavIcons.jsx';
import { useAuth } from '../../../context/AuthContext.jsx';
import { QUICK_LINKS } from '../accountNav.js';

/**
 * Grid of shortcut cards. `descriptions` overrides a card's subtitle by key,
 * e.g. { wishlist: '3 saved items' }.
 */
export default function QuickLinks({ descriptions = {} }) {
  const { logout } = useAuth();
  return (
    <section className="quick-links" aria-labelledby="quick-links-title">
      <h2 id="quick-links-title" className="quick-links__title">Quick Links</h2>
      <div className="quick-links__grid">
        {QUICK_LINKS.map(({ key, label, description, to, icon: Icon, tone, signOut }) => (
          <Link key={key} to={to} className="quick-link" onClick={signOut ? logout : undefined}>
            <span className={`quick-link__icon quick-link__icon--${tone}`}>
              <Icon size={26} />
            </span>
            <span className="quick-link__text">
              <span className="quick-link__label">{label}</span>
              <span className="quick-link__desc">{descriptions[key] ?? description}</span>
            </span>
            <ChevronRightIcon size={18} className="quick-link__chevron" />
          </Link>
        ))}
      </div>
    </section>
  );
}
