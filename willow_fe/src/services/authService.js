import { request } from './api.js';

/** Storefront account calls. register and login return { token, customer }. */
export const authService = {
  register: (details) => request('/auth/register', { method: 'POST', body: JSON.stringify(details) }),
  login: (email, password) => request('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
  me: () => request('/auth/me'),
  /** `token` is passed explicitly because it has already been removed from storage by then. */
  logout: (token) => request('/auth/logout', { method: 'POST', headers: { Authorization: `Bearer ${token}` } }),
};
