import {
  BarChart3,
  Boxes,
  LayoutDashboard,
  Package,
  PlusSquare,
  Settings,
  ShoppingCart,
  Sparkles,
  Store,
} from 'lucide-react';

/** Single source of truth for sidebar entries and topbar page titles. */
export const NAV_SECTIONS = [
  {
    title: 'General Menu',
    items: [
      { key: 'overview', label: 'Overview', to: '/', icon: LayoutDashboard, end: true },
      { key: 'products', label: 'Products', to: '/products', icon: Package, expandable: true },
      { key: 'add-product', label: 'Add Product', to: '/products/new', icon: PlusSquare },
      { key: 'curated', label: "Seller's Curated Picks", to: '/curated', icon: Sparkles },
      { key: 'inventory', label: 'Inventory', to: '/inventory', icon: Boxes },
      { key: 'orders', label: 'Orders', to: '/orders', icon: ShoppingCart },
      { key: 'analytics', label: 'Analytics', to: '/analytics', icon: BarChart3 },
    ],
  },
  {
    title: 'Store',
    items: [
      { key: 'store', label: 'Store Profile', to: '/store', icon: Store },
      { key: 'settings', label: 'Settings', to: '/settings', icon: Settings },
    ],
  },
];

const ALL_ITEMS = NAV_SECTIONS.flatMap((s) => s.items);

/** Finds the nav entry for a pathname (most specific match wins). */
export function navItemFor(pathname) {
  if (/^\/products\/\d+\/edit/.test(pathname)) return { ...ALL_ITEMS.find((i) => i.key === 'products'), label: 'Edit Product' };
  return [...ALL_ITEMS]
    .sort((a, b) => b.to.length - a.to.length)
    .find((i) => (i.end ? pathname === i.to : pathname === i.to || pathname.startsWith(`${i.to}/`)));
}
