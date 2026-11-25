import { request } from './api.js';

/** Catalogue calls. The storefront lists live products from every store. */
export const productService = {
  /** Optional filters: { type, storeId }. */
  listProducts: ({ type, storeId } = {}) => {
    const params = new URLSearchParams();
    if (type) params.set('type', type);
    if (storeId) params.set('storeId', storeId);
    const query = params.toString();
    return request(`/products${query ? `?${query}` : ''}`);
  },
  getProduct: (id) => request(`/products/${id}`),

  /** The seller's Curated Fit: products they suggest wearing with this one. Empty if they made none. */
  getCuratedFit: (id) => request(`/products/${id}/curated-fit`),
};
