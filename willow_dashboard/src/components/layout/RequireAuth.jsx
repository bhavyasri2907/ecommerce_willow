import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthProvider.jsx';
import Loader from '../common/Loader.jsx';

/**
 * Shows the panel only to a signed-in seller. Anyone else goes to /login and is brought back
 * to the page they wanted after signing in - unless they just signed out on purpose, in which
 * case the next seller to sign in starts on the overview.
 */
export default function RequireAuth({ children }) {
  const { seller, status, signedOut } = useAuth();
  const location = useLocation();

  if (status === 'loading') return <Loader />;
  if (!seller) {
    const state = signedOut ? undefined : { from: location.pathname + location.search };
    return <Navigate to="/login" replace state={state} />;
  }
  return children;
}
