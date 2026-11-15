import { useNavigate } from 'react-router-dom';
import { ClipboardList, IndianRupee, Plus, ShoppingCart, Users } from 'lucide-react';
import { dashboardService } from '../services/dashboardService.js';
import { inventoryService } from '../services/inventoryService.js';
import { orderService } from '../services/orderService.js';
import { productService } from '../services/productService.js';
import { storeService } from '../services/storeService.js';
import { useFetch } from '../hooks/useFetch.js';
import PageHeader from '../components/common/PageHeader.jsx';
import Button from '../components/common/Button.jsx';
import { Card } from '../components/common/Card.jsx';
import ErrorState from '../components/common/ErrorState.jsx';
import StatCard from '../components/overview/StatCard.jsx';
import RevenueCard from '../components/overview/RevenueCard.jsx';
import NeedsAttention from '../components/overview/NeedsAttention.jsx';
import RecentOrders from '../components/overview/RecentOrders.jsx';
import StockAlerts from '../components/overview/StockAlerts.jsx';
import TopProducts from '../components/overview/TopProducts.jsx';
import { formatPrice } from '../utils/formatPrice.js';
import { formatNumber } from '../utils/formatNumber.js';
import { formatDate, greeting } from '../utils/formatDate.js';

export default function Overview() {
  const navigate = useNavigate();
  const store = useFetch((signal) => storeService.getStoreProfile(signal), [], { live: ['store.'] });
  const analytics = useFetch((signal) => dashboardService.getAnalytics(30, signal), [], { live: ['order.'] });
  const recent = useFetch((signal) => orderService.listOrders({ size: 6 }, signal), [], { live: ['order.'] });
  const counts = useFetch((signal) => orderService.getOrderCounts(signal), [], { live: ['order.'] });
  const catalog = useFetch((signal) => productService.getProductSummary(undefined, signal), [], { live: ['product.', 'inventory.', 'settings.'] });
  const lowStock = useFetch((signal) => inventoryService.listInventory({ filter: 'low' }, signal), [], { live: ['inventory.', 'product.', 'settings.'] });
  const outStock = useFetch((signal) => inventoryService.listInventory({ filter: 'out' }, signal), [], { live: ['inventory.', 'product.', 'settings.'] });

  const a = analytics.data;
  const k = a?.kpis;
  const spark = (key) => a?.series.map((p) => Number(p[key]));

  return (
    <>
      <PageHeader
        eyebrow={formatDate(new Date(), { weekday: 'long', day: 'numeric', month: 'long' })}
        title={`${greeting()}, ${store.data?.storeName ?? 'Willow'}`}
        description="Here's how your store is doing over the last 30 days. Everything on this page updates live."
        actions={
          <>
            <Button icon={ClipboardList} onClick={() => navigate('/orders?tab=PENDING')}>Review orders</Button>
            <Button variant="primary" icon={Plus} onClick={() => navigate('/products/new')}>Add Product</Button>
          </>
        }
      />

      {analytics.error ? (
        <Card><ErrorState error={analytics.error} onRetry={analytics.refetch} /></Card>
      ) : (
        <div className="kpi-grid">
          <StatCard label="Revenue" icon={IndianRupee} loading={!k} value={k && formatPrice(k.revenue.value)} current={k?.revenue.value} previous={k?.revenue.previous} spark={spark('revenue')} comparisonLabel="vs previous 30 days" />
          <StatCard label="Orders" icon={ShoppingCart} loading={!k} value={k && formatNumber(k.orders.value)} current={k?.orders.value} previous={k?.orders.previous} spark={spark('orders')} comparisonLabel="vs previous 30 days" />
          <StatCard label="Avg. order value" icon={ClipboardList} loading={!k} value={k && formatPrice(k.averageOrderValue.value)} current={k?.averageOrderValue.value} previous={k?.averageOrderValue.previous} comparisonLabel="vs previous 30 days" />
          <StatCard label="Customers" icon={Users} loading={!k} value={k && formatNumber(k.customers.value)} current={k?.customers.value} previous={k?.customers.previous} comparisonLabel="unique buyers" />
        </div>
      )}

      <div className="grid-2-1">
        <RevenueCard analytics={a} />
        <NeedsAttention orderCounts={counts.data} catalog={catalog.data} />
      </div>

      <div className="grid-2-1">
        <RecentOrders orders={recent.data?.content} error={recent.error} onRetry={recent.refetch} />
        <div className="stack">
          <StockAlerts lowStock={lowStock.data} outOfStock={outStock.data} threshold={catalog.data?.lowStockThreshold} />
          <TopProducts products={a?.topProducts} />
        </div>
      </div>
    </>
  );
}
