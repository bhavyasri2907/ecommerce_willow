import { request, upload } from './api.js';

/** Catalogue endpoints (willow_be: /api/seller/products). */
export const productService = {
  listProducts: (params, signal) => request('/seller/products', { params, signal }),
  getProductSummary: (type, signal) => request('/seller/products/summary', { params: { type }, signal }),
  getProduct: (id, signal) => request(`/seller/products/${id}`, { signal }),
  createProduct: (body) => request('/seller/products', { method: 'POST', body }),
  updateProduct: (id, body) => request(`/seller/products/${id}`, { method: 'PUT', body }),
  updateProductStatus: (id, status) => request(`/seller/products/${id}/status`, { method: 'PATCH', body: { status } }),
  deleteProduct: (id) => request(`/seller/products/${id}`, { method: 'DELETE' }),
  /** Stores a photo and returns { url } to put in a product's `images`. */
  uploadImage: (file) => upload('/seller/uploads', file),
  bulkUpdateProducts: (ids, action) => request('/seller/products/bulk', { method: 'POST', body: { ids, action } }),
};
