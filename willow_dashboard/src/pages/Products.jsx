import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Archive, ArrowDown, ArrowUp, ArrowUpDown, Eye, EyeOff, FileEdit, Package, Pencil, Plus, Trash2 } from 'lucide-react';
import { sellerApi } from '../api/seller.js';
import { useQuery } from '../hooks/useQuery.js';
import { useDebounce } from '../hooks/useDebounce.js';
import { useToast } from '../components/toast/ToastProvider.jsx';
import PageHeader from '../components/ui/PageHeader.jsx';
import Button from '../components/ui/Button.jsx';
import { Card } from '../components/ui/Card.jsx';
import { Tabs } from '../components/ui/Tabs.jsx';
import { Checkbox, SearchInput, Select } from '../components/ui/Form.jsx';
import { ProductStatusBadge } from '../components/ui/Badge.jsx';
import ProductThumb from '../components/ui/ProductThumb.jsx';
import Pagination from '../components/ui/Pagination.jsx';
import Menu from '../components/ui/Menu.jsx';
import { ConfirmDialog } from '../components/ui/Overlay.jsx';
import { EmptyState, ErrorState, SkeletonRows } from '../components/ui/States.jsx';
import { useCategories } from '../hooks/useCategories.js';
import { formatCurrency, formatNumber } from '../utils/format.js';

const TAB_FILTERS = {
  all: {},
  LIVE: { status: 'LIVE' },
  DRAFT: { status: 'DRAFT' },
  ARCHIVED: { status: 'ARCHIVED' },
  low: { stock: 'low' },
  out: { stock: 'out' },
};

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

export default function Products() {
  const [params, setParams] = useSearchParams();
  const navigate = useNavigate();
  const toast = useToast();
  const { categories, labelOf } = useCategories();

  const type = params.get('type') || '';
  const tab = params.get('tab') || 'all';
  const page = Number(params.get('page') || 0);
  const size = Number(params.get('size') || 10);
  const sort = params.get('sort') || 'createdAt';
  const dir = params.get('dir') || 'desc';
  const [search, setSearch] = useState(params.get('q') || '');
  const q = useDebounce(search, 300);

  const [selected, setSelected] = useState(new Set());
  const [confirm, setConfirm] = useState(null);

  function update(changes, { resetPage = true } = {}) {
    const next = new URLSearchParams(params);
    Object.entries(changes).forEach(([k, v]) => (v === '' || v === null || v === undefined ? next.delete(k) : next.set(k, v)));
    if (resetPage && !('page' in changes)) next.delete('page');
    setParams(next, { replace: true });
  }

  // Keep ?q= in sync with the debounced search box (and accept searches from the topbar).
  useEffect(() => {
    if ((params.get('q') || '') !== q) update({ q });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);
  useEffect(() => {
    const fromUrl = params.get('q') || '';
    if (fromUrl !== search && fromUrl !== q) setSearch(fromUrl);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params]);

  useEffect(() => setSelected(new Set()), [type, tab, q, page, size]);

  const listParams = { ...TAB_FILTERS[tab], type: type || undefined, q: q || undefined, page, size, sort, dir };
  const products = useQuery((signal) => sellerApi.listProducts(listParams, signal), [JSON.stringify(listParams)], {
    live: ['product.', 'inventory.', 'order.', 'settings.'],
  });
  const summary = useQuery((signal) => sellerApi.productSummary(type || undefined, signal), [type], {
    live: ['product.', 'inventory.', 'settings.'],
  });

  const s = summary.data;
  const tabs = [
    { value: 'all', label: 'All', count: s?.total },
    { value: 'LIVE', label: 'Live', count: s?.byStatus.LIVE },
    { value: 'DRAFT', label: 'Draft', count: s?.byStatus.DRAFT },
    { value: 'ARCHIVED', label: 'Archived', count: s?.byStatus.ARCHIVED },
    { value: 'low', label: 'Low Stock', count: s?.lowStock },
    { value: 'out', label: 'Out of Stock', count: s?.outOfStock },
  ];

  const rows = products.data?.content ?? [];
  const allSelected = rows.length > 0 && rows.every((r) => selected.has(r.id));
  const someSelected = rows.some((r) => selected.has(r.id));
  const heading = type ? labelOf(type) : 'Products';
  const tabLabel = tabs.find((t) => t.value === tab)?.label;

  const toggleSort = (key) => update({ sort: key, dir: sort === key && dir === 'desc' ? 'asc' : 'desc' });

  function toggleRow(id, on) {
    setSelected((prev) => {
      const next = new Set(prev);
      on ? next.add(id) : next.delete(id);
      return next;
    });
  }

  async function changeStatus(product, status) {
    try {
      await sellerApi.setProductStatus(product.id, status);
      toast.success(`${product.name} is now ${status.toLowerCase()}`);
    } catch (err) {
      toast.error('Could not update product', err.message);
    }
  }

  async function runBulk(action) {
    try {
      const result = await sellerApi.bulkProducts([...selected], action);
      setSelected(new Set());
      (result.skipped ? toast.warning : toast.success)(result.message);
    } catch (err) {
      toast.error('Bulk action failed', err.message);
      throw err;
    }
  }

  async function deleteOne(product) {
    try {
      await sellerApi.deleteProduct(product.id);
      toast.success(`${product.name} deleted`);
    } catch (err) {
      toast.error('Could not delete', err.message);
      throw err;
    }
  }

  const emptyCopy = useMemo(() => {
    if (q) return { title: 'No matching products', description: `Nothing matches "${q}". Try a different name or SKU.` };
    if (tab === 'low') return { title: 'No low-stock products', description: 'Every product is above your low-stock threshold.' };
    if (tab === 'out') return { title: 'Nothing is sold out', description: 'All active products have stock.' };
    return { title: 'No products yet', description: 'Add your first product to start selling.' };
  }, [q, tab]);

  return (
    <>
      <PageHeader
        eyebrow={type ? 'Products' : undefined}
        title={heading}
        description="Oversee your catalogue: pricing, stock and what's visible on the storefront."
        actions={
          <>
            <SearchInput value={search} onChange={setSearch} placeholder="Search name, SKU or colour" />
            <Button variant="primary" icon={Plus} onClick={() => navigate('/products/new')}>
              Add Product
            </Button>
          </>
        }
      />

      <Card padded={false} className="table-card">
        <Tabs tabs={tabs} value={tab} onChange={(v) => update({ tab: v === 'all' ? '' : v })} ariaLabel="Product status" />

        <div className="table-toolbar">
          <div>
            <h2 className="table-toolbar__title">
              {formatNumber(products.data?.totalElements ?? 0)} {heading === 'Products' ? '' : heading} {tab === 'all' ? 'Items' : tabLabel}
            </h2>
            <p className="table-toolbar__sub">
              {products.refreshing ? 'Updating…' : 'Let’s boost your sales with the right stock and pricing.'}
            </p>
          </div>
          <div className="table-toolbar__filters">
            <Select
              aria-label="Category"
              value={type}
              onChange={(e) => update({ type: e.target.value })}
              placeholder="All categories"
              options={categories}
            />
          </div>
        </div>

        {selected.size > 0 && (
          <div className="bulk-bar" role="region" aria-label="Bulk actions">
            <span><strong>{selected.size}</strong> selected</span>
            <div className="bulk-bar__actions">
              <Button size="sm" icon={Eye} onClick={() => setConfirm({ kind: 'bulk', action: 'PUBLISH' })}>Publish</Button>
              <Button size="sm" icon={FileEdit} onClick={() => setConfirm({ kind: 'bulk', action: 'DRAFT' })}>Move to draft</Button>
              <Button size="sm" icon={Archive} onClick={() => setConfirm({ kind: 'bulk', action: 'ARCHIVE' })}>Archive</Button>
              <Button size="sm" variant="danger" icon={Trash2} onClick={() => setConfirm({ kind: 'bulk', action: 'DELETE' })}>Delete</Button>
              <Button size="sm" variant="ghost" onClick={() => setSelected(new Set())}>Clear</Button>
            </div>
          </div>
        )}

        {products.error ? (
          <ErrorState error={products.error} onRetry={products.refetch} />
        ) : products.loading && !products.data ? (
          <SkeletonRows rows={size > 10 ? 10 : size} columns={6} />
        ) : rows.length === 0 ? (
          <EmptyState
            icon={Package}
            {...emptyCopy}
            action={!q && tab === 'all' && <Button variant="primary" icon={Plus} onClick={() => navigate('/products/new')}>Add Product</Button>}
          />
        ) : (
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th scope="col" className="col-check">
                    <Checkbox
                      checked={allSelected}
                      indeterminate={!allSelected && someSelected}
                      onChange={(on) => setSelected(on ? new Set(rows.map((r) => r.id)) : new Set())}
                      label="Select all on this page"
                    />
                  </th>
                  {COLUMNS.map((c) => (
                    <SortHeader key={c.key} column={c} sort={sort} dir={dir} onSort={toggleSort} />
                  ))}
                  <th scope="col" className="col-actions"><span className="sr-only">Actions</span></th>
                </tr>
              </thead>
              <tbody>
                {rows.map((p) => (
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
                        <span>{formatCurrency(p.price)}</span>
                        {p.discountPercent && <span className="price-cell__was">{formatCurrency(p.originalPrice)}</span>}
                      </div>
                    </td>
                    <td><ProductStatusBadge status={p.status} /></td>
                    <td className="col-actions">
                      <Menu
                        label={`Actions for ${p.name}`}
                        items={[
                          { label: 'Edit', icon: Pencil, onClick: () => navigate(`/products/${p.id}/edit`) },
                          { label: 'Publish', icon: Eye, onClick: () => changeStatus(p, 'LIVE'), hidden: p.status === 'LIVE' },
                          { label: 'Unpublish (draft)', icon: EyeOff, onClick: () => changeStatus(p, 'DRAFT'), hidden: p.status !== 'LIVE' },
                          { label: 'Archive', icon: Archive, onClick: () => changeStatus(p, 'ARCHIVED'), hidden: p.status === 'ARCHIVED' },
                          { label: 'Delete', icon: Trash2, tone: 'danger', onClick: () => setConfirm({ kind: 'delete', product: p }) },
                        ]}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {products.data && (
          <Pagination
            page={products.data.page}
            size={products.data.size}
            totalElements={products.data.totalElements}
            totalPages={products.data.totalPages}
            onPageChange={(p) => update({ page: p || '' }, { resetPage: false })}
            onSizeChange={(n) => update({ size: n === 10 ? '' : n })}
          />
        )}
      </Card>

      <ConfirmDialog
        open={confirm?.kind === 'delete'}
        onClose={() => setConfirm(null)}
        onConfirm={() => deleteOne(confirm.product)}
        title="Delete product?"
        message={confirm?.product ? `"${confirm.product.name}" will be removed permanently. Products that already have orders can only be archived.` : ''}
        confirmLabel="Delete"
      />
      <ConfirmDialog
        open={confirm?.kind === 'bulk'}
        onClose={() => setConfirm(null)}
        onConfirm={() => runBulk(confirm.action)}
        tone={confirm?.action === 'DELETE' ? 'danger' : 'primary'}
        title={`${{ PUBLISH: 'Publish', DRAFT: 'Move to draft', ARCHIVE: 'Archive', DELETE: 'Delete' }[confirm?.action] ?? ''} ${selected.size} product${selected.size === 1 ? '' : 's'}?`}
        message={
          {
            PUBLISH: 'They will become visible on the storefront.',
            DRAFT: 'They will be hidden from the storefront until published again.',
            ARCHIVE: 'They will be hidden from the storefront and from inventory views.',
            DELETE: 'This cannot be undone. Products with orders will be skipped (archive those instead).',
          }[confirm?.action]
        }
        confirmLabel="Confirm"
      />
    </>
  );
}
