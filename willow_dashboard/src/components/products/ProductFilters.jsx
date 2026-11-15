import { Tabs } from '../common/Tabs.jsx';
import { Select } from '../common/Input.jsx';

/** Status tabs plus the toolbar (result count and category filter) above the product table. */
export default function ProductFilters({ tabs, tab, onTabChange, categories, category, onCategoryChange, title, subtitle }) {
  return (
    <>
      <Tabs tabs={tabs} value={tab} onChange={onTabChange} ariaLabel="Product status" />

      <div className="table-toolbar">
        <div>
          <h2 className="table-toolbar__title">{title}</h2>
          <p className="table-toolbar__sub">{subtitle}</p>
        </div>
        <div className="table-toolbar__filters">
          <Select
            aria-label="Category"
            value={category}
            onChange={(e) => onCategoryChange(e.target.value)}
            placeholder="All categories"
            options={categories}
          />
        </div>
      </div>
    </>
  );
}
