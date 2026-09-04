const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

async function request(path, options = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Request to ${path} failed (${res.status})`);
  }
  if (res.status === 204) return null;
  return res.json();
}

export const api = {
  listProducts: (type) => request(`/products${type ? `?type=${type}` : ''}`),
  getProduct: (id) => request(`/products/${id}`),
  getAiMatches: (topId) => request(`/ai/recommendations/${topId}`),
  approveMatch: (topId, pantsId) =>
    request('/recommendations', {
      method: 'POST',
      body: JSON.stringify({ topId, pantsId }),
    }),
  revokeMatch: (topId, pantsId) =>
    request(`/recommendations?topId=${topId}&pantsId=${pantsId}`, { method: 'DELETE' }),
};
