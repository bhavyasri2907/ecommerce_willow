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
 * Which products each collection page shows, and the icon filters on it. Everything is
 * worked out from what the seller entered: `type` (category), `gender` (who it is for),
 * the compare-at price (sale) and the date it was added (new in).
 */

const byType = (type) => (p) => p.type === type;
/** Unisex products belong on both the Men and Women pages. */
const forGender = (gender) => (p) => p.gender === gender || p.gender === 'UNISEX';
const newestFirst = (a, b) => new Date(b.createdAt) - new Date(a.createdAt);

const ALL = { id: 'all', label: 'All', icon: AllCategoryIcon, match: () => true };
const BAGS = { id: 'bags', label: 'Bags', icon: BagsCategoryIcon, match: byType('BAG') };
const SHOES = { id: 'shoes', label: 'Shoes', icon: ShoesCategoryIcon, match: byType('SHOES') };
const ACCESSORIES = { id: 'accessories', label: 'Accessories', icon: AccessoriesCategoryIcon, match: byType('ACCESSORY') };
const tops = (label) => ({ id: 'tops', label, icon: TopsCategoryIcon, match: byType('TOP') });
const bottoms = (label) => ({ id: 'bottoms', label, icon: BottomsCategoryIcon, match: byType('PANTS') });

const BY_TYPE = [ALL, tops('Tops'), bottoms('Bottoms'), BAGS, SHOES, ACCESSORIES];
const BY_GENDER = [
  ALL,
  { id: 'men', label: 'Men', icon: MenCategoryIcon, match: forGender('MEN') },
  { id: 'women', label: 'Women', icon: WomenCategoryIcon, match: forGender('WOMEN') },
];

/** Icon filters shown on each collection page, keyed by the page's categoryKey. */
export const CATEGORY_FILTERS = {
  men: [ALL, tops('Shirts'), bottoms('Pants'), SHOES, BAGS, ACCESSORIES],
  women: [ALL, tops('Tops'), bottoms('Bottoms'), SHOES, BAGS, ACCESSORIES],
  all: BY_TYPE,
  bags: BY_GENDER,
  shoes: BY_GENDER,
  accessories: BY_GENDER,
  'new-in': BY_TYPE,
  sale: BY_TYPE,
};

const NEW_IN_COUNT = 12;

/** The live products a collection page shows, newest first. */
export function itemsForCategory(categoryKey, products) {
  const newest = [...products].sort(newestFirst);
  switch (categoryKey) {
    case 'men':
      return newest.filter(forGender('MEN'));
    case 'women':
      return newest.filter(forGender('WOMEN'));
    case 'bags':
      return newest.filter(byType('BAG'));
    case 'shoes':
      return newest.filter(byType('SHOES'));
    case 'accessories':
      return newest.filter(byType('ACCESSORY'));
    case 'new-in':
      return newest.slice(0, NEW_IN_COUNT);
    case 'sale':
      // On sale = the seller set a compare-at price above the selling price.
      return newest.filter((p) => p.discountPercent);
    default:
      return newest;
  }
}
