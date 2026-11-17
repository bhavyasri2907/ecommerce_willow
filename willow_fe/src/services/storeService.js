import { request } from './api.js';

/** Store-wide information set by the seller. */
export const storeService = {
  /** { storeName, tagline, logoUrl } - who the shopper is buying from. */
  getInfo: () => request('/store'),
  /** { shippingFee, freeShippingThreshold, returnWindowDays } */
  getPolicies: () => request('/store/policies'),
};
