import { request } from './api.js';

/** The signed-in shopper's address book (willow_be: /api/account/addresses). Default address comes first. */
export const addressService = {
  list: () => request('/account/addresses'),
  create: (address) => request('/account/addresses', { method: 'POST', body: JSON.stringify(address) }),
  update: (id, address) => request(`/account/addresses/${id}`, { method: 'PUT', body: JSON.stringify(address) }),
  makeDefault: (id) => request(`/account/addresses/${id}/default`, { method: 'PATCH' }),
  remove: (id) => request(`/account/addresses/${id}`, { method: 'DELETE' }),
};
