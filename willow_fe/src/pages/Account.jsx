import { Outlet } from 'react-router-dom';
import AccountSidebar from '../features/account/components/AccountSidebar.jsx';
import { useAuth } from '../context/AuthContext.jsx';

/** My Account shell: sidebar on the left, the active account view on the right. */
export default function Account() {
  const { user } = useAuth();
  return (
    <div className="account">
      <AccountSidebar profile={user} />
      <div className="account__content">
        <Outlet />
      </div>
    </div>
  );
}
