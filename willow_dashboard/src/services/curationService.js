import { request } from './api.js';

/** Curated picks: outfit pairings between the store's own products. */
export const curationService = {
  listCurations: (signal) => request('/seller/curations', { signal }),
  approvePick: (topId, matchId) => request('/seller/recommendations', { method: 'POST', body: { topId, pantsId: matchId } }),
  revokePick: (topId, matchId) => request('/seller/recommendations', { method: 'DELETE', params: { topId, pantsId: matchId } }),
};
