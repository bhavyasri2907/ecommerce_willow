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

  /** Seller-approved matches for a top, ranked by the style assistant. */
  getAiMatches: (topId) => request(`/ai/recommendations/${topId}`),
};
