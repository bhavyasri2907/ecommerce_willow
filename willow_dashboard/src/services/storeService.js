import { request } from './api.js';

/** Store profile and seller settings (willow_be: /api/seller/store, /api/seller/settings). */
export const storeService = {
  getStoreProfile: (signal) => request('/seller/store', { signal }),
  updateStoreProfile: (body) => request('/seller/store', { method: 'PUT', body }),
  getSettings: (signal) => request('/seller/settings', { signal }),
  updateSettings: (body) => request('/seller/settings', { method: 'PUT', body }),
};
