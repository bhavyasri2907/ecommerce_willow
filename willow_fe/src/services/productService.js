import { request } from './api.js';

/** Catalogue and outfit-pairing calls. */
export const productService = {
  listProducts: (type) => request(`/products${type ? `?type=${type}` : ''}`),
  getProduct: (id) => request(`/products/${id}`),

  /** Seller-approved matches for a top, ranked by the style assistant. */
  getAiMatches: (topId) => request(`/ai/recommendations/${topId}`),

  approveMatch: (topId, pantsId) =>
    request('/recommendations', {
      method: 'POST',
      body: JSON.stringify({ topId, pantsId }),
    }),
  revokeMatch: (topId, pantsId) =>
    request(`/recommendations?topId=${topId}&pantsId=${pantsId}`, { method: 'DELETE' }),
};
