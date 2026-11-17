import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthProvider.jsx';
import Loader from '../common/Loader.jsx';

/** Shows the panel only to a signed-in seller; everyone else goes to /login and comes back after. */
export default function RequireAuth({ children }) {
  const { seller, status } = useAuth();
  const location = useLocation();

  if (status === 'loading') return <Loader />;
  if (!seller) return <Navigate to="/login" replace state={{ from: location.pathname + location.search }} />;
  return children;
}
