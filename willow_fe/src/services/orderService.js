import { request } from './api.js';

/** The signed-in shopper's orders (willow_be: /api/orders). */
export const orderService = {
  /**
   * Places the bag. `checkout` is { checkoutRef, addressId, paymentMethod, items: [{ productId, size, quantity }] }.
   * Returns one order per store the bag drew from. Resending the same checkoutRef returns the same orders.
   */
  placeOrder: (checkout) => request('/orders', { method: 'POST', body: JSON.stringify(checkout) }),
  /** { content, page, size, totalElements, totalPages }, newest first. */
  listOrders: ({ page = 0, size = 10 } = {}) => request(`/orders?page=${page}&size=${size}`),
  getOrder: (orderNumber) => request(`/orders/${encodeURIComponent(orderNumber)}`),
  cancelOrder: (orderNumber, reason) =>
    request(`/orders/${encodeURIComponent(orderNumber)}/cancel`, { method: 'POST', body: JSON.stringify({ reason }) }),
};
