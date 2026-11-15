import { Outlet } from 'react-router-dom';
import AccountSidebar from '../features/account/components/AccountSidebar.jsx';
import { ACCOUNT_PROFILE } from '../features/account/accountNav.js';

/** My Account shell: sidebar on the left, the active account view on the right. */
export default function Account() {
  return (
    <div className="account">
      <AccountSidebar profile={ACCOUNT_PROFILE} />
      <div className="account__content">
        <Outlet />
      </div>
    </div>
  );
}
