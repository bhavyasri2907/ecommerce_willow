import { HeartIcon, ShoppingBagIcon, UserIcon } from '../../assets/icons/NavIcons.jsx';
import {
  CreditCardIcon, GiftIcon, HeadsetIcon, LogOutIcon, MapPinIcon, PackageIcon, StarIcon,
} from '../../assets/icons/AccountIcons.jsx';

/**
 * Single source of truth for the account area: the sidebar, the quick links and the
 * section pages are all built from this list.
 *  - `to`      where the item goes
 *  - `tone`    colour of the quick-link icon tile (see account.css)
 *  - `section` present when the item is a page inside /account; holds that page's copy
 *  - `signOut` the item ends the session before going to `to`
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
    description: 'View, track or return your orders',
    to: '/account/orders',
    icon: PackageIcon,
    sidebarIcon: ShoppingBagIcon,
    tone: 'plum',
    section: {
      slug: 'orders',
      intro: 'Track deliveries and cancel orders that have not been packed yet.',
      emptyTitle: 'No orders yet',
      emptyText: 'When you place an order it will show up here with live tracking.',
      action: { label: 'Start shopping', to: '/all' },
    },
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
    section: {
      slug: 'addresses',
      intro: 'Save the places you ship to most for a faster checkout.',
      emptyTitle: 'No saved addresses',
      emptyText: 'The address you use at checkout will be saved here.',
    },
  },
  {
    key: 'payments',
    label: 'Payment Methods',
    description: 'Cards, UPI and more',
    to: '/account/payments',
    icon: CreditCardIcon,
    tone: 'gold',
    section: {
      slug: 'payments',
      intro: 'Cards and UPI IDs you have chosen to remember.',
      emptyTitle: 'No saved payment methods',
      emptyText: 'Choose "save for next time" at checkout and it will appear here.',
    },
  },
  {
    key: 'gift-cards',
    label: 'Gift Cards & Vouchers',
    description: 'Redeem your rewards',
    to: '/account/gift-cards',
    icon: GiftIcon,
    tone: 'gold',
    section: {
      slug: 'gift-cards',
      intro: 'Gift card balances and voucher codes linked to your account.',
      emptyTitle: 'No gift cards or vouchers',
      emptyText: 'Rewards you receive or redeem will be listed here.',
    },
  },
  {
    key: 'reviews',
    label: 'My Reviews',
    description: 'Share your experience',
    to: '/account/reviews',
    icon: StarIcon,
    tone: 'sage',
    section: {
      slug: 'reviews',
      intro: 'Everything you have rated and reviewed.',
      emptyTitle: 'No reviews yet',
      emptyText: 'After an order is delivered you can review the pieces you bought.',
      action: { label: 'Browse the collection', to: '/all' },
    },
  },
  {
    key: 'help',
    label: 'Help Center',
    description: 'Find answers to your questions',
    to: '/account/help',
    icon: HeadsetIcon,
    tone: 'plum',
    section: {
      slug: 'help',
      intro: 'Answers about orders, delivery, returns and payments.',
      emptyTitle: 'Help articles are on the way',
      emptyText: 'We are putting together guides for the most common questions.',
    },
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

export function findAccountSection(slug) {
  return ACCOUNT_NAV.find((item) => item.section?.slug === slug);
}
