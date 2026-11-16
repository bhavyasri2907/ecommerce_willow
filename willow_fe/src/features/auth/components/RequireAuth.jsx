import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext.jsx';

/** Shows its children only to a signed-in shopper; everyone else is sent to /login and brought back after. */
export default function RequireAuth({ children }) {
  const { user, status } = useAuth();
  const location = useLocation();

  if (status === 'loading') return <p className="state-msg">Loading your account…</p>;
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  return children;
}
