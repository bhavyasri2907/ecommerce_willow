import { request } from './api.js';

/** KPIs, time series and breakdowns for the Overview and Analytics pages. */
export const dashboardService = {
  /** range: number of days (7 | 30 | 90). */
  getAnalytics: (range, signal) => request('/seller/analytics', { params: { range }, signal }),
};
