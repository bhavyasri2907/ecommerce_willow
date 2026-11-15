import { request } from './api.js';

/** Curated picks. Approve / revoke reuse the storefront's recommendation endpoints. */
export const curationService = {
  listCurations: (signal) => request('/seller/curations', { signal }),
  approvePick: (topId, matchId) => request('/recommendations', { method: 'POST', body: { topId, pantsId: matchId } }),
  revokePick: (topId, matchId) => request('/recommendations', { method: 'DELETE', params: { topId, pantsId: matchId } }),
};
