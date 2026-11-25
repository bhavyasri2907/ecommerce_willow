import { request } from './api.js';

/** What shoppers can see about the stores selling on Willow. */
export const storeService = {
  /** { id, storeName, tagline, description, logoUrl } */
  getStore: (storeId) => request(`/stores/${storeId}`),
  /** One { storeId, storeName, shippingFee, freeShippingThreshold, returnWindowDays } per store asked for. */
  getPolicies: (storeIds) => request(`/stores/policies?ids=${storeIds.join(',')}`),
};
