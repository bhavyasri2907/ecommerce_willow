import { Link, useNavigate } from 'react-router-dom';
import { Archive, ArrowDown, ArrowUp, ArrowUpDown, Eye, EyeOff, FileEdit, Pencil, Trash2 } from 'lucide-react';
import Button from '../common/Button.jsx';
import { Checkbox } from '../common/Input.jsx';
import Menu from '../common/Menu.jsx';
import ProductThumb from '../common/ProductThumb.jsx';
import ProductStatusBadge from './ProductStatusBadge.jsx';
import { formatPrice } from '../../utils/formatPrice.js';
import { formatNumber } from '../../utils/formatNumber.js';

const COLUMNS = [
  { key: 'name', label: 'Product Name', sortable: true },
  { key: 'sold', label: 'Sold', sortable: true },
  { key: 'variations', label: 'Variations' },
  { key: 'stock', label: 'Stock', sortable: true },
  { key: 'price', label: 'Price', sortable: true },
  { key: 'status', label: 'Status' },
];

function SortHeader({ column, sort, dir, onSort }) {
  if (!column.sortable) return <th scope="col">{column.label}</th>;
  const active = sort === column.key;
  const Icon = !active ? ArrowUpDown : dir === 'asc' ? ArrowUp : ArrowDown;
  return (
    <th scope="col" aria-sort={active ? (dir === 'asc' ? 'ascending' : 'descending') : 'none'}>
      <button className={`th-sort ${active ? 'is-active' : ''}`} onClick={() => onSort(column.key)}>
        {column.label}
        <Icon size={13} aria-hidden />
      </button>
    </th>
  );
}

/**
 * Product list with row selection and a bulk-action bar.
 * `selected` is a Set of product ids owned by the page; `onBulkAction` receives
 * PUBLISH | DRAFT | ARCHIVE | DELETE.
 */
export default function ProductTable({ products, selected, onSelectedChange, sort, dir, onSort, onStatusChange, onDelete, onBulkAction }) {
  const navigate = useNavigate();
  const allSelected = products.length > 0 && products.every((p) => selected.has(p.id));
  const someSelected = products.some((p) => selected.has(p.id));

  function toggleRow(id, on) {
    const next = new Set(selected);
    on ? next.add(id) : next.delete(id);
    onSelectedChange(next);
  }

  return (
    <>
      {selected.size > 0 && (
        <div className="bulk-bar" role="region" aria-label="Bulk actions">
          <span><strong>{selected.size}</strong> selected</span>
          <div className="bulk-bar__actions">
            <Button size="sm" icon={Eye} onClick={() => onBulkAction('PUBLISH')}>Publish</Button>
            <Button size="sm" icon={FileEdit} onClick={() => onBulkAction('DRAFT')}>Move to draft</Button>
            <Button size="sm" icon={Archive} onClick={() => onBulkAction('ARCHIVE')}>Archive</Button>
            <Button size="sm" variant="danger" icon={Trash2} onClick={() => onBulkAction('DELETE')}>Delete</Button>
            <Button size="sm" variant="ghost" onClick={() => onSelectedChange(new Set())}>Clear</Button>
          </div>
        </div>
      )}

      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr>
              <th scope="col" className="col-check">
                <Checkbox
                  checked={allSelected}
                  indeterminate={!allSelected && someSelected}
                  onChange={(on) => onSelectedChange(on ? new Set(products.map((p) => p.id)) : new Set())}
                  label="Select all on this page"
                />
              </th>
              {COLUMNS.map((c) => (
                <SortHeader key={c.key} column={c} sort={sort} dir={dir} onSort={onSort} />
              ))}
              <th scope="col" className="col-actions"><span className="sr-only">Actions</span></th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id} className={`is-clickable ${selected.has(p.id) ? 'is-selected' : ''}`} onClick={() => navigate(`/products/${p.id}/edit`)}>
                <td className="col-check">
                  <Checkbox checked={selected.has(p.id)} onChange={(on) => toggleRow(p.id, on)} label={`Select ${p.name}`} />
                </td>
                <td>
                  <div className="product-cell">
                    <ProductThumb product={p} size={42} />
                    <div>
                      <Link to={`/products/${p.id}/edit`} className="product-cell__name" onClick={(e) => e.stopPropagation()}>
                        {p.name}
                      </Link>
                      <div className="product-cell__meta">{p.typeLabel} · {p.sku}</div>
                    </div>
                  </div>
                </td>
                <td className="num">{formatNumber(p.unitsSold)}</td>
                <td>{p.sizes.length ? `${p.sizes.length} Variant${p.sizes.length > 1 ? 's' : ''}` : 'Single'}</td>
                <td>
                  <span className={`stock-text stock-text--${p.stockStatus}`}>{formatNumber(p.stock)} Item{p.stock === 1 ? '' : 's'}</span>
                </td>
                <td>
                  <div className="price-cell">
                    <span>{formatPrice(p.price)}</span>
                    {p.discountPercent && <span className="price-cell__was">{formatPrice(p.originalPrice)}</span>}
                  </div>
                </td>
                <td><ProductStatusBadge status={p.status} /></td>
                <td className="col-actions">
                  <Menu
                    label={`Actions for ${p.name}`}
                    items={[
                      { label: 'Edit', icon: Pencil, onClick: () => navigate(`/products/${p.id}/edit`) },
                      { label: 'Publish', icon: Eye, onClick: () => onStatusChange(p, 'LIVE'), hidden: p.status === 'LIVE' },
                      { label: 'Unpublish (draft)', icon: EyeOff, onClick: () => onStatusChange(p, 'DRAFT'), hidden: p.status !== 'LIVE' },
                      { label: 'Archive', icon: Archive, onClick: () => onStatusChange(p, 'ARCHIVED'), hidden: p.status === 'ARCHIVED' },
                      { label: 'Delete', icon: Trash2, tone: 'danger', onClick: () => onDelete(p) },
                    ]}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
