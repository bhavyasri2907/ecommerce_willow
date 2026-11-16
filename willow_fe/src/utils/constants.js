/** Base URL of the willow_be API. Override with VITE_API_URL in .env. */
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

/**
 * Collection pages: each entry becomes a route rendered by pages/Products.jsx.
 * The icon filters for each page live in features/products/categoryFilters.js.
 */
export const CATEGORY_PAGES = [
  { path: '/new-in', categoryKey: 'new-in', title: 'New In' },
  { path: '/men', categoryKey: 'men', title: 'Men' },
  { path: '/all', categoryKey: 'all', title: 'All Products' },
  { path: '/women', categoryKey: 'women', title: 'Women' },
  { path: '/bags', categoryKey: 'bags', title: 'Bags' },
  { path: '/shoes', categoryKey: 'shoes', title: 'Shoes' },
  { path: '/accessories', categoryKey: 'accessories', title: 'Accessories' },
  { path: '/sale', categoryKey: 'sale', title: 'Sale' },
];
