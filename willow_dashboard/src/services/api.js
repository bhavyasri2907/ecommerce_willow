export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

/** Error thrown for any non-2xx response. `fields` holds per-field validation messages. */
export class ApiError extends Error {
  constructor(message, status, fields = {}) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.fields = fields;
  }
}

function buildQuery(params = {}) {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') search.append(key, value);
  });
  const qs = search.toString();
  return qs ? `?${qs}` : '';
}

export async function request(path, { method = 'GET', params, body, signal } = {}) {
  let res;
  try {
    res = await fetch(`${API_BASE_URL}${path}${buildQuery(params)}`, {
      method,
      signal,
      headers: body !== undefined ? { 'Content-Type': 'application/json' } : undefined,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch (err) {
    if (err.name === 'AbortError') throw err;
    throw new ApiError(`Can't reach the Willow API at ${API_BASE_URL}. Is willow_be running?`, 0);
  }

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new ApiError(data.error || `Request failed (${res.status})`, res.status, data.fields || {});
  }
  if (res.status === 204) return null;
  const text = await res.text();
  return text ? JSON.parse(text) : null;
}
