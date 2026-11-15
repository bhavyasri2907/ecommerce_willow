import { Link, Navigate, useParams } from 'react-router-dom';
import { findAccountSection } from '../accountNav.js';

/**
 * A page inside /account (orders, addresses, ...). Each one currently shows its
 * empty state; swap the body for real data as the backend gains customer endpoints.
 */
export default function AccountSection() {
  const { section: slug } = useParams();
  const item = findAccountSection(slug);
  if (!item) return <Navigate to="/account" replace />;

  const { label, icon: Icon, tone, section } = item;
  return (
    <section className="account-section">
      <header className="account-section__header">
        <p className="account-hero__eyebrow">My Account</p>
        <h1 className="account-section__title">{label}</h1>
        <p className="account-section__intro">{section.intro}</p>
      </header>

      <div className="account-empty">
        <span className={`quick-link__icon quick-link__icon--${tone}`}>
          <Icon size={26} />
        </span>
        <h2 className="account-empty__title">{section.emptyTitle}</h2>
        <p className="account-empty__text">{section.emptyText}</p>
        {section.action && (
          <Link to={section.action.to} className="account-empty__action">{section.action.label}</Link>
        )}
      </div>
    </section>
  );
}
