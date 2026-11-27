import { request } from './api.js';

/** Product reviews (willow_be). Reading a product's reviews is public; the rest needs a signed-in shopper. */
export const reviewService = {
  /**
   * { average, count, breakdown: [{ stars, count }] (5 stars first), reviews: { content, page, totalPages, ... } }.
   * `sort` is NEWEST, HIGHEST or LOWEST.
   */
  forProduct: (productId, { sort = 'NEWEST', page = 0, size = 5 } = {}) =>
    request(`/products/${productId}/reviews?sort=${sort}&page=${page}&size=${size}`),

  /** { canReview, review }: whether the shopper may review this product (needs a delivered order) and their review. */
  status: (productId) => request(`/account/reviews/product/${productId}`),
  /** The shopper's reviews, most recent first. */
  mine: () => request('/account/reviews'),
  /** Delivered products the shopper hasn't reviewed yet. */
  pending: () => request('/account/reviews/pending'),
  /** Writes or replaces the shopper's review: { rating, title, comment }. */
  save: (productId, review) =>
    request(`/account/reviews/product/${productId}`, { method: 'PUT', body: JSON.stringify(review) }),
  remove: (productId) => request(`/account/reviews/product/${productId}`, { method: 'DELETE' }),
};
