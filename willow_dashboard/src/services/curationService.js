import { request } from './api.js';

/**
 * Curated Fit (willow_be: /api/seller/curations): the pieces a seller suggests wearing with
 * one of their products. A piece can be any product on Willow, from any store.
 */
export const curationService = {
  /** { products: [{ product, picks }] } - every product of the store with its fit. */
  listCurations: (signal) => request('/seller/curations', { signal }),
  /** The product a link copied from the Willow website points to. Throws if it isn't one on sale. */
  resolveLink: (link) => request('/seller/curations/resolve', { params: { link } }),
  getPicks: (productId, signal) => request(`/seller/curations/${productId}/picks`, { signal }),
  addPickByLink: (productId, link) => request(`/seller/curations/${productId}/picks`, { method: 'POST', body: { link } }),
  addPick: (productId, pickId) => request(`/seller/curations/${productId}/picks`, { method: 'POST', body: { pickId } }),
  removePick: (productId, pickId) => request(`/seller/curations/${productId}/picks/${pickId}`, { method: 'DELETE' }),
};

/** How many pieces one fit can hold; the API enforces the same limit. */
export const MAX_PICKS = 12;
