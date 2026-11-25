import { request } from './api.js';

/** Seller sign-up and sign-in (willow_be: /api/seller/auth). register and login return { token, seller }. */
export const authService = {
  /** Opens a new store. body: { storeName, fullName, email, phone, password } */
  register: (body) => request('/seller/auth/register', { method: 'POST', body }),
  login: (email, password) => request('/seller/auth/login', { method: 'POST', body: { email, password } }),
  me: () => request('/seller/auth/me'),
  /** `token` is passed explicitly because it has already been removed from storage by then. */
  logout: (token) => request('/seller/auth/logout', { method: 'POST', token }),
};
