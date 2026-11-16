import { useCart } from '../../../context/CartContext.jsx';
import { useAuth } from '../../../context/AuthContext.jsx';
import AccountHero from './AccountHero.jsx';
import QuickLinks from './QuickLinks.jsx';

/** Landing view of /account: greeting banner and shortcuts. */
export default function AccountOverview() {
  const { wishlistCount } = useCart();
  const { user } = useAuth();
  const wishlistText = wishlistCount
    ? `${wishlistCount} saved item${wishlistCount === 1 ? '' : 's'}`
    : undefined;

  return (
    <>
      <AccountHero firstName={user.firstName} />
      <QuickLinks descriptions={{ wishlist: wishlistText }} />
    </>
  );
}
