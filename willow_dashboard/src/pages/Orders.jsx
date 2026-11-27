import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ShoppingCart } from 'lucide-react';
import { orderService } from '../services/orderService.js';
import { useFetch } from '../hooks/useFetch.js';
import { useDebounce } from '../hooks/useDebounce.js';
import { useLiveEvent } from '../context/LiveProvider.jsx';
import PageHeader from '../components/common/PageHeader.jsx';
import { Card } from '../components/common/Card.jsx';
import { Tabs } from '../components/common/Tabs.jsx';
import { SearchInput } from '../components/common/Input.jsx';
import Pagination from '../components/common/Pagination.jsx';
import EmptyState from '../components/common/EmptyState.jsx';
import ErrorState from '../components/common/ErrorState.jsx';
import { SkeletonRows } from '../components/common/Loader.jsx';
import OrderTable from '../components/orders/OrderTable.jsx';
import OrderDetailsDrawer from '../components/orders/OrderDetailsDrawer.jsx';
import { ORDER_STATUS, ORDER_TABS } from '../constants/orderStatus.js';
import { formatNumber } from '../utils/formatNumber.js';

export default function Orders() {
  const [params, setParams] = useSearchParams();
  const tab = params.get('tab') || 'ALL';
  const page = Number(params.get('page') || 0);
  const size = Number(params.get('size') || 10);
  const sort = params.get('sort') || 'createdAt';
  const dir = params.get('dir') || 'desc';
  const openOrder = params.get('order');
  const [search, setSearch] = useState(params.get('q') || '');
  const q = useDebounce(search, 300);
  const [newIds, setNewIds] = useState(new Set());

  function update(changes, { resetPage = true } = {}) {
    const next = new URLSearchParams(params);
    Object.entries(changes).forEach(([k, v]) => (v === '' || v === null || v === undefined ? next.delete(k) : next.set(k, v)));
    if (resetPage && !('page' in changes) && !('order' in changes)) next.delete('page');
    setParams(next, { replace: !('order' in changes) });
  }

  useEffect(() => {
    if ((params.get('q') || '') !== q) update({ q });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);
  useEffect(() => {
    const fromUrl = params.get('q') || '';
    if (fromUrl !== search && fromUrl !== q) setSearch(fromUrl);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params]);

  useLiveEvent('order.created', (event) => {
    const id = event.payload.id;
    setNewIds((prev) => new Set(prev).add(id));
    setTimeout(() => setNewIds((prev) => { const n = new Set(prev); n.delete(id); return n; }), 6000);
  });

  const listParams = { status: tab === 'ALL' ? undefined : tab, q: q || undefined, page, size, sort, dir };
  const orders = useFetch((signal) => orderService.listOrders(listParams, signal), [JSON.stringify(listParams)], { live: ['order.'] });
  const counts = useFetch((signal) => orderService.getOrderCounts(signal), [], { live: ['order.'] });

  const tabs = ORDER_TABS.map((s) => ({ value: s, label: s === 'ALL' ? 'All' : ORDER_STATUS[s].label, count: counts.data?.[s] }));
  const rows = orders.data?.content ?? [];
  const toggleSort = (key) => update({ sort: key, dir: sort === key && dir === 'desc' ? 'asc' : 'desc' });

  return (
    <>
      <PageHeader
        title="Orders"
        description="Confirm, pack and ship orders. New storefront orders appear here in real time."
        actions={<SearchInput value={search} onChange={setSearch} placeholder="Order #, customer, phone, city or pincode" />}
      />

      <Card padded={false} className="table-card">
        <Tabs tabs={tabs} value={tab} onChange={(v) => update({ tab: v === 'ALL' ? '' : v })} ariaLabel="Order status" />

        <div className="table-toolbar">
          <div>
            <h2 className="table-toolbar__title">
              {formatNumber(orders.data?.totalElements ?? 0)} {tab === 'ALL' ? '' : ORDER_STATUS[tab].label} Orders
            </h2>
            <p className="table-toolbar__sub">{orders.refreshing ? 'Updating…' : 'Click an order to see details and move it forward.'}</p>
          </div>
        </div>

        {orders.error ? (
          <ErrorState error={orders.error} onRetry={orders.refetch} />
        ) : orders.loading && !orders.data ? (
          <SkeletonRows rows={size > 10 ? 10 : size} columns={6} />
        ) : rows.length === 0 ? (
          <EmptyState icon={ShoppingCart} title="No orders here" description={q ? `Nothing matches "${q}".` : 'Orders in this state will show up here.'} />
        ) : (
          <OrderTable
            orders={rows}
            sort={sort}
            dir={dir}
            onSort={toggleSort}
            onSelect={(order) => update({ order: order.id })}
            selectedId={openOrder}
            newIds={newIds}
          />
        )}

        {orders.data && (
          <Pagination
            page={orders.data.page}
            size={orders.data.size}
            totalElements={orders.data.totalElements}
            totalPages={orders.data.totalPages}
            onPageChange={(p) => update({ page: p || '' }, { resetPage: false })}
            onSizeChange={(n) => update({ size: n === 10 ? '' : n })}
          />
        )}
      </Card>

      {openOrder && <OrderDetailsDrawer key={openOrder} orderId={openOrder} onClose={() => update({ order: '' })} />}
    </>
  );
}
