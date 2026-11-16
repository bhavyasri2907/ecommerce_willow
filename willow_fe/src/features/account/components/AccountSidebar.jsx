import { NavLink } from 'react-router-dom';
import { UserIcon } from '../../../assets/icons/NavIcons.jsx';
import { useAuth } from '../../../context/AuthContext.jsx';
import { ACCOUNT_NAV } from '../accountNav.js';

/** Profile summary and the account navigation. */
export default function AccountSidebar({ profile }) {
  const { logout } = useAuth();
  return (
    <aside className="account-sidebar">
      {/* The column stretches to the page height; the inner block stays in view while scrolling. */}
      <div className="account-sidebar__inner">
        <div className="account-profile">
          <span className="account-profile__avatar" aria-hidden="true">
            <UserIcon size={44} />
          </span>
          <div className="account-profile__text">
            <p className="account-profile__name">{profile.fullName}</p>
            <p className="account-profile__email">{profile.email}</p>
          </div>
        </div>

        <nav className="account-nav" aria-label="Account">
          {ACCOUNT_NAV.map((item) => {
            const Icon = item.sidebarIcon ?? item.icon;
            return (
              <NavLink
                key={item.key}
                to={item.to}
                end
                onClick={item.signOut ? logout : undefined}
                className={({ isActive }) => `account-nav__link ${isActive && item.to !== '/' ? 'is-active' : ''}`}
              >
                <Icon size={20} />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
