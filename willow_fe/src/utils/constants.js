/** Base URL of the willow_be API. Override with VITE_API_URL in .env. */
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

/** Collection pages: each entry becomes a route rendered by pages/Products.jsx. */
export const CATEGORY_PAGES = [
  {
    path: '/new-in',
    categoryKey: 'new-in',
    title: 'New In',
    subtitle: 'Discover our latest arrivals and newly curated top & bottom pairings.',
    badge: 'JUST ARRIVED',
  },
  {
    path: '/men',
    categoryKey: 'men',
    title: "Men's Collection",
    subtitle: 'Thoughtfully paired shirts, pants & smart casual sets for men.',
    badge: "MEN'S EDIT",
  },
  {
    path: '/all',
    categoryKey: 'all',
    title: 'All Collection',
    subtitle: 'Explore the complete Willow catalog of paired tops, bottoms & accessories.',
    badge: 'FULL CATALOG',
  },
  {
    path: '/women',
    categoryKey: 'women',
    title: "Women's Collection",
    subtitle: 'Elevated blouses, trousers & curated outfit pairs for women.',
    badge: "WOMEN'S EDIT",
  },
  {
    path: '/bags',
    categoryKey: 'bags',
    title: 'Bags & Leather Goods',
    subtitle: 'Handcrafted bags & leather accessories designed to complete every look.',
    badge: 'HANDBAGS & TOTES',
  },
  {
    path: '/shoes',
    categoryKey: 'shoes',
    title: 'Shoes & Footwear',
    subtitle: 'Sneakers, loafers & heels styled to match your favorite pairs.',
    badge: 'FOOTWEAR EDIT',
  },
  {
    path: '/accessories',
    categoryKey: 'accessories',
    title: 'Accessories',
    subtitle: 'Jewelry, belts & finishing touches curated by Willow stylists.',
    badge: 'ACCENTS & JEWELRY',
  },
  {
    path: '/sale',
    categoryKey: 'sale',
    title: 'Special Sale',
    subtitle: 'Limited time offers & up to 40% off selected matched sets.',
    badge: 'SEASONAL SALE',
    isSalePage: true,
  },
];
