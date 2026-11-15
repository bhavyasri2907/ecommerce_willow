import { useCart } from '../../../context/CartContext.jsx';
import { ACCOUNT_PROFILE } from '../accountNav.js';
import AccountHero from './AccountHero.jsx';
import QuickLinks from './QuickLinks.jsx';

/** Landing view of /account: greeting banner and shortcuts. */
export default function AccountOverview() {
  const { wishlistCount } = useCart();
  const wishlistText = wishlistCount
    ? `${wishlistCount} saved item${wishlistCount === 1 ? '' : 's'}`
    : undefined;

  return (
    <>
      <AccountHero firstName={ACCOUNT_PROFILE.firstName} />
      <QuickLinks descriptions={{ wishlist: wishlistText }} />
    </>
  );
}
