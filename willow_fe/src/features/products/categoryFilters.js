import {
  AllCategoryIcon,
  TopsCategoryIcon,
  BottomsCategoryIcon,
  BagsCategoryIcon,
  ShoesCategoryIcon,
  AccessoriesCategoryIcon,
  MenCategoryIcon,
  WomenCategoryIcon,
} from '../../assets/icons/CategoryIcons.jsx';

/**
 * Bags, shoes and accessories are not in the API catalogue yet, so they are curated here.
 * `gender` decides which of them show on the Men / Women pages ('unisex' shows on both).
 */
export const CURATED_EXTRAS = [
  { id: 901, name: 'Leather Tote Bag', type: 'BAG', gender: 'women', color: 'Tan', hex: '#8C5230', style: 'Smart', price: 2999 },
  { id: 902, name: 'Canvas Crossbody', type: 'BAG', gender: 'unisex', color: 'Cream', hex: '#B9A77C', style: 'Casual', price: 1799 },
  { id: 903, name: 'Saddle Shoulder Bag', type: 'BAG', gender: 'women', color: 'Burgundy', hex: '#5C1D24', style: 'Smart Casual', price: 2499 },
  { id: 904, name: 'Leather Messenger Bag', type: 'BAG', gender: 'men', color: 'Brown', hex: '#5C3A21', style: 'Smart', price: 3299 },
  { id: 911, name: 'Classic Canvas Lows', type: 'SHOES', gender: 'unisex', color: 'Burgundy', hex: '#7D2D40', style: 'Casual', price: 2499 },
  { id: 912, name: 'Minimalist Leather Loafers', type: 'SHOES', gender: 'men', color: 'Black', hex: '#231519', style: 'Smart', price: 3499 },
  { id: 913, name: 'Suede Chelsea Boots', type: 'SHOES', gender: 'men', color: 'Taupe', hex: '#9C8A79', style: 'Smart Casual', price: 3999 },
  { id: 914, name: 'Block Heel Sandals', type: 'SHOES', gender: 'women', color: 'Nude', hex: '#B98A72', style: 'Smart', price: 2799 },
  { id: 921, name: 'Gold Hoop Earrings', type: 'ACCESSORY', gender: 'women', color: 'Gold', hex: '#C9A24B', style: 'Smart', price: 699 },
  { id: 922, name: 'Mesh Gold Watch', type: 'ACCESSORY', gender: 'unisex', color: 'Gold', hex: '#D4AF37', style: 'Smart', price: 1599 },
  { id: 923, name: 'Italian Leather Belt', type: 'ACCESSORY', gender: 'men', color: 'Brown', hex: '#5C3A21', style: 'Casual', price: 1299 },
];

/** Icon shown on a product card for types the Garment drawing doesn't cover. */
export const TYPE_ICONS = {
  BAG: BagsCategoryIcon,
  SHOES: ShoesCategoryIcon,
  ACCESSORY: AccessoriesCategoryIcon,
};

const byType = (type) => (p) => p.type === type;
const forGender = (gender) => (p) => p.gender === gender || p.gender === 'unisex';

const ALL = { id: 'all', label: 'All', icon: AllCategoryIcon, match: () => true };
const BAGS = { id: 'bags', label: 'Bags', icon: BagsCategoryIcon, match: byType('BAG') };
const SHOES = { id: 'shoes', label: 'Shoes', icon: ShoesCategoryIcon, match: byType('SHOES') };
const ACCESSORIES = { id: 'accessories', label: 'Accessories', icon: AccessoriesCategoryIcon, match: byType('ACCESSORY') };
const tops = (label) => ({ id: 'tops', label, icon: TopsCategoryIcon, match: byType('TOP') });
const bottoms = (label) => ({ id: 'bottoms', label, icon: BottomsCategoryIcon, match: byType('PANTS') });

const CLOTHING = [ALL, tops('Tops'), bottoms('Bottoms')];
const BY_GENDER = [
  ALL,
  { id: 'men', label: 'Men', icon: MenCategoryIcon, match: forGender('men') },
  { id: 'women', label: 'Women', icon: WomenCategoryIcon, match: forGender('women') },
];

/** Icon filters shown on each collection page, keyed by the page's categoryKey. */
export const CATEGORY_FILTERS = {
  men: [ALL, tops('Shirts'), bottoms('Pants'), SHOES, BAGS, ACCESSORIES],
  women: [ALL, tops('Tops'), bottoms('Bottoms'), SHOES, BAGS, ACCESSORIES],
  all: [ALL, tops('Tops'), bottoms('Bottoms'), BAGS, SHOES, ACCESSORIES],
  bags: BY_GENDER,
  shoes: BY_GENDER,
  accessories: BY_GENDER,
  'new-in': CLOTHING,
  sale: CLOTHING,
};

/** Pages made up only of curated extras, so they don't need the API. */
const EXTRAS_ONLY = { bags: 'BAG', shoes: 'SHOES', accessories: 'ACCESSORY' };

export const needsApi = (categoryKey) => !EXTRAS_ONLY[categoryKey];

/** The products a collection page shows, given the API catalogue. */
export function itemsForCategory(categoryKey, apiProducts) {
  if (EXTRAS_ONLY[categoryKey]) return CURATED_EXTRAS.filter(byType(EXTRAS_ONLY[categoryKey]));

  switch (categoryKey) {
    case 'men':
      // The API has no gender field yet: smart styles and pants stand in for menswear.
      return [
        ...apiProducts.filter((p) => p.style === 'Smart' || p.style === 'Smart Casual' || p.type === 'PANTS'),
        ...CURATED_EXTRAS.filter(forGender('men')),
      ];
    case 'women':
      return [
        ...apiProducts.filter((p) => p.style === 'Casual' || p.type === 'TOP'),
        ...CURATED_EXTRAS.filter(forGender('women')),
      ];
    case 'all':
      return [...apiProducts, ...CURATED_EXTRAS];
    case 'new-in':
      return apiProducts.slice(0, 8);
    case 'sale':
      return apiProducts.map((p) => ({ ...p, price: Math.round(p.price * 0.85), originalPrice: p.price }));
    default:
      return apiProducts;
  }
}
