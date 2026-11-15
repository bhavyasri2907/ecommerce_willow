import { request } from './api.js';

/** Order endpoints (willow_be: /api/seller/orders). */
export const orderService = {
  listOrders: (params, signal) => request('/seller/orders', { params, signal }),
  getOrderCounts: (signal) => request('/seller/orders/counts', { signal }),
  getOrder: (id, signal) => request(`/seller/orders/${id}`, { signal }),
  updateOrderStatus: (id, status) => request(`/seller/orders/${id}/status`, { method: 'PATCH', body: { status } }),
};
