import {
  DressCategoryIcon,
  TopsCategoryIcon,
  BottomsCategoryIcon,
  BagsCategoryIcon,
  ShoesCategoryIcon,
  AccessoriesCategoryIcon,
  NewInCategoryIcon,
  SaleCategoryIcon,
} from '../../../assets/icons/CategoryIcons.jsx';

const CATEGORIES = [
  { id: 'dresses', label: 'DRESSES', icon: DressCategoryIcon, filterType: 'TOP' },
  { id: 'tops', label: 'TOPS', icon: TopsCategoryIcon, filterType: 'TOP' },
  { id: 'bottoms', label: 'BOTTOMS', icon: BottomsCategoryIcon, filterType: 'PANTS' },
  { id: 'bags', label: 'BAGS', icon: BagsCategoryIcon, filterType: null },
  { id: 'shoes', label: 'SHOES', icon: ShoesCategoryIcon, filterType: null },
  { id: 'accessories', label: 'ACCESSORIES', icon: AccessoriesCategoryIcon, filterType: null },
  { id: 'new-in', label: 'NEW IN', icon: NewInCategoryIcon, filterType: null },
  { id: 'sale', label: 'SALE', icon: SaleCategoryIcon, filterType: null },
];

export default function ShopByCategory({ activeCategory, onSelectCategory }) {
  return (
    <section className="shop-by-category-section">
      <div className="category-header-title">
        <span className="title-line"></span>
        <h2>SHOP BY CATEGORY</h2>
        <span className="title-line"></span>
      </div>

      <div className="category-icons-grid">
        {CATEGORIES.map((cat) => {
          const IconComp = cat.icon;
          const isActive = activeCategory === cat.id;

          return (
            <button
              key={cat.id}
              type="button"
              className={`category-pill-btn ${isActive ? 'active' : ''}`}
              onClick={() => onSelectCategory(cat.id, cat.filterType)}
              aria-label={`Shop ${cat.label}`}
            >
              <div className="category-circle-icon">
                <IconComp size={30} color={isActive ? '#FFFFFF' : '#8C2D42'} />
              </div>
              <span className="category-label">{cat.label}</span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
