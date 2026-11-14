import { request } from './client.js';

/** Every willow_be endpoint the seller panel uses, in one place. */
export const sellerApi = {
  // Catalogue
  listProducts: (params, signal) => request('/seller/products', { params, signal }),
  productSummary: (type, signal) => request('/seller/products/summary', { params: { type }, signal }),
  getProduct: (id, signal) => request(`/seller/products/${id}`, { signal }),
  createProduct: (body) => request('/seller/products', { method: 'POST', body }),
  updateProduct: (id, body) => request(`/seller/products/${id}`, { method: 'PUT', body }),
  setProductStatus: (id, status) => request(`/seller/products/${id}/status`, { method: 'PATCH', body: { status } }),
  deleteProduct: (id) => request(`/seller/products/${id}`, { method: 'DELETE' }),
  bulkProducts: (ids, action) => request('/seller/products/bulk', { method: 'POST', body: { ids, action } }),

  // Orders
  listOrders: (params, signal) => request('/seller/orders', { params, signal }),
  orderCounts: (signal) => request('/seller/orders/counts', { signal }),
  getOrder: (id, signal) => request(`/seller/orders/${id}`, { signal }),
  setOrderStatus: (id, status) => request(`/seller/orders/${id}/status`, { method: 'PATCH', body: { status } }),

  // Inventory
  inventory: (params, signal) => request('/seller/inventory', { params, signal }),
  inventorySummary: (signal) => request('/seller/inventory/summary', { signal }),
  adjustStock: (productId, body) => request(`/seller/inventory/${productId}/adjust`, { method: 'POST', body }),
  stockMovements: (params, signal) => request('/seller/inventory/movements', { params, signal }),

  // Analytics
  analytics: (range, signal) => request('/seller/analytics', { params: { range }, signal }),

  // Curated picks (approve / revoke reuse the storefront's recommendation endpoints)
  curations: (signal) => request('/seller/curations', { signal }),
  approvePick: (topId, matchId) => request('/recommendations', { method: 'POST', body: { topId, pantsId: matchId } }),
  revokePick: (topId, matchId) => request('/recommendations', { method: 'DELETE', params: { topId, pantsId: matchId } }),

  // Store
  storeProfile: (signal) => request('/seller/store', { signal }),
  updateStoreProfile: (body) => request('/seller/store', { method: 'PUT', body }),
  settings: (signal) => request('/seller/settings', { signal }),
  updateSettings: (body) => request('/seller/settings', { method: 'PUT', body }),
};
