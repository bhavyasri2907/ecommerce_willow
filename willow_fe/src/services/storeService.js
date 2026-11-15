import { request } from './api.js';

/** Store-wide information set by the seller. */
export const storeService = {
  /** { shippingFee, freeShippingThreshold, returnWindowDays } */
  getPolicies: () => request('/store/policies'),
};
