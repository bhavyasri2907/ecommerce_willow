import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Package, Plus } from 'lucide-react';
import { productService } from '../services/productService.js';
import { useFetch } from '../hooks/useFetch.js';
import { useDebounce } from '../hooks/useDebounce.js';
import { useCategories } from '../hooks/useCategories.js';
import { useToast } from '../context/ToastProvider.jsx';
import PageHeader from '../components/common/PageHeader.jsx';
import Button from '../components/common/Button.jsx';
import { Card } from '../components/common/Card.jsx';
import { SearchInput } from '../components/common/Input.jsx';
import Pagination from '../components/common/Pagination.jsx';
import { ConfirmDialog } from '../components/common/Modal.jsx';
import EmptyState from '../components/common/EmptyState.jsx';
import ErrorState from '../components/common/ErrorState.jsx';
import { SkeletonRows } from '../components/common/Loader.jsx';
import ProductFilters from '../components/products/ProductFilters.jsx';
import ProductTable from '../components/products/ProductTable.jsx';
import { PRODUCT_TAB_FILTERS } from '../constants/productStatus.js';
import { formatNumber } from '../utils/formatNumber.js';

const BULK_ACTIONS = {
  PUBLISH: { label: 'Publish', message: 'They will become visible on the storefront.' },
  DRAFT: { label: 'Move to draft', message: 'They will be hidden from the storefront until published again.' },
  ARCHIVE: { label: 'Archive', message: 'They will be hidden from the storefront and from inventory views.' },
  DELETE: { label: 'Delete', message: 'This cannot be undone. Products with orders will be skipped (archive those instead).' },
};

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

  const listParams = { ...PRODUCT_TAB_FILTERS[tab], type: type || undefined, q: q || undefined, page, size, sort, dir };
  const products = useFetch((signal) => productService.listProducts(listParams, signal), [JSON.stringify(listParams)], {
    live: ['product.', 'inventory.', 'order.', 'settings.'],
  });
  const summary = useFetch((signal) => productService.getProductSummary(type || undefined, signal), [type], {
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
  const heading = type ? labelOf(type) : 'Products';
  const tabLabel = tabs.find((t) => t.value === tab)?.label;

  const toggleSort = (key) => update({ sort: key, dir: sort === key && dir === 'desc' ? 'asc' : 'desc' });

  async function changeStatus(product, status) {
    try {
      await productService.updateProductStatus(product.id, status);
      toast.success(`${product.name} is now ${status.toLowerCase()}`);
    } catch (err) {
      toast.error('Could not update product', err.message);
    }
  }

  async function runBulk(action) {
    try {
      const result = await productService.bulkUpdateProducts([...selected], action);
      setSelected(new Set());
      (result.skipped ? toast.warning : toast.success)(result.message);
    } catch (err) {
      toast.error('Bulk action failed', err.message);
      throw err;
    }
  }

  async function deleteOne(product) {
    try {
      await productService.deleteProduct(product.id);
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
        <ProductFilters
          tabs={tabs}
          tab={tab}
          onTabChange={(v) => update({ tab: v === 'all' ? '' : v })}
          categories={categories}
          category={type}
          onCategoryChange={(v) => update({ type: v })}
          title={`${formatNumber(products.data?.totalElements ?? 0)} ${heading === 'Products' ? '' : heading} ${tab === 'all' ? 'Items' : tabLabel}`}
          subtitle={products.refreshing ? 'Updating…' : 'Let’s boost your sales with the right stock and pricing.'}
        />

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
          <ProductTable
            products={rows}
            selected={selected}
            onSelectedChange={setSelected}
            sort={sort}
            dir={dir}
            onSort={toggleSort}
            onStatusChange={changeStatus}
            onDelete={(product) => setConfirm({ kind: 'delete', product })}
            onBulkAction={(action) => setConfirm({ kind: 'bulk', action })}
          />
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
        title={`${BULK_ACTIONS[confirm?.action]?.label ?? ''} ${selected.size} product${selected.size === 1 ? '' : 's'}?`}
        message={BULK_ACTIONS[confirm?.action]?.message}
        confirmLabel="Confirm"
      />
    </>
  );
}
