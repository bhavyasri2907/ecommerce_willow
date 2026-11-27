import { HeartIcon, ShoppingBagIcon, UserIcon } from '../../assets/icons/NavIcons.jsx';
import { EditIcon, LogOutIcon, MapPinIcon, PackageIcon, StarIcon } from '../../assets/icons/AccountIcons.jsx';

/**
 * Single source of truth for the account area: the sidebar and the quick links are built from this list.
 *  - `to`          where the item goes
 *  - `tone`        colour of the quick-link icon tile (see account.css)
 *  - `sidebarOnly` shown in the sidebar but not as a quick link
 *  - `signOut`     the item ends the session before going to `to`
 */
export const ACCOUNT_NAV = [
  {
    key: 'account',
    label: 'My Account',
    to: '/account',
    icon: UserIcon,
    sidebarOnly: true,
  },
  {
    key: 'orders',
    label: 'My Orders',
    description: 'View, track or cancel your orders',
    to: '/account/orders',
    icon: PackageIcon,
    sidebarIcon: ShoppingBagIcon,
    tone: 'plum',
  },
  {
    key: 'reviews',
    label: 'My Reviews',
    description: 'Rate the pieces you have received',
    to: '/account/reviews',
    icon: StarIcon,
    tone: 'gold',
  },
  {
    key: 'wishlist',
    label: 'Wishlist',
    description: 'Your saved items',
    to: '/wishlist',
    icon: HeartIcon,
    tone: 'rose',
  },
  {
    key: 'addresses',
    label: 'Addresses',
    description: 'Manage your delivery addresses',
    to: '/account/addresses',
    icon: MapPinIcon,
    tone: 'sage',
  },
  {
    key: 'profile',
    label: 'Profile',
    description: 'Edit your name, email, phone and password',
    to: '/account/profile',
    icon: EditIcon,
    tone: 'plum',
  },
  {
    key: 'logout',
    label: 'Logout',
    description: 'Sign out from your account',
    to: '/',
    signOut: true,
    icon: LogOutIcon,
    tone: 'rose',
  },
];

export const QUICK_LINKS = ACCOUNT_NAV.filter((item) => !item.sidebarOnly);
