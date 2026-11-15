import { request } from './api.js';

/** Inventory endpoints (willow_be: /api/seller/inventory). */
export const inventoryService = {
  listInventory: (params, signal) => request('/seller/inventory', { params, signal }),
  getInventorySummary: (signal) => request('/seller/inventory/summary', { signal }),
  adjustStock: (productId, body) => request(`/seller/inventory/${productId}/adjust`, { method: 'POST', body }),
  listStockMovements: (params, signal) => request('/seller/inventory/movements', { params, signal }),
};
