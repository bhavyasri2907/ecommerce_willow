import { useNavigate } from 'react-router-dom';
import { sellerApi } from '../api/seller.js';
import { useQuery } from '../hooks/useQuery.js';
import { useLiveEvent } from '../live/LiveProvider.jsx';
import { useToast } from '../components/toast/ToastProvider.jsx';
import { formatCurrency } from '../utils/format.js';

/** Turns live events into toasts, honouring the seller's notification settings. */
export default function LiveNotifications() {
  const toast = useToast();
  const navigate = useNavigate();
  const { data: settings } = useQuery((signal) => sellerApi.settings(signal), [], { live: ['settings.'] });

  useLiveEvent('order.created', (event) => {
    if (settings && !settings.orderNotifications) return;
    const o = event.payload;
    toast.show({
      tone: 'order',
      title: `New order ${o.orderNumber}`,
      description: `${o.customerName} · ${o.itemCount} item${o.itemCount === 1 ? '' : 's'} · ${formatCurrency(o.total)}`,
      action: { label: 'View order', onClick: () => navigate(`/orders?order=${o.id}`) },
    });
  });

  useLiveEvent('inventory.low', (event) => {
    if (settings && !settings.lowStockAlerts) return;
    const p = event.payload;
    toast.show({
      tone: 'warning',
      title: p.stock === 0 ? `${p.name} is sold out` : `${p.name} is running low`,
      description: p.stock === 0 ? 'Restock it to keep it on sale.' : `Only ${p.stock} left (threshold ${p.threshold}).`,
      action: { label: 'Restock', onClick: () => navigate(`/inventory?adjust=${p.productId}`) },
      duration: 7000,
    });
  });

  return null;
}
