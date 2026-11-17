export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

const TOKEN_KEY = 'willow_seller_token';

/** The signed-in seller's session token, kept in this browser until they sign out. */
export const tokenStore = {
  get() {
    try {
      return localStorage.getItem(TOKEN_KEY);
    } catch {
      return null;
    }
  },
  set(token) {
    try {
      localStorage.setItem(TOKEN_KEY, token);
    } catch {
      /* storage unavailable (private mode): the session lasts until the tab closes */
    }
  },
  clear() {
    try {
      localStorage.removeItem(TOKEN_KEY);
    } catch {
      /* nothing to clear */
    }
  },
};

const unauthorizedHandlers = new Set();

/** Registers a callback for "the server no longer accepts our session". Returns an unsubscribe function. */
export function onUnauthorized(handler) {
  unauthorizedHandlers.add(handler);
  return () => unauthorizedHandlers.delete(handler);
}

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

/**
 * Calls the API as the signed-in seller. `token` overrides the saved session token
 * (used by sign-out, which has already forgotten it).
 */
export async function request(path, { method = 'GET', params, body, signal, token = tokenStore.get() } = {}) {
  const headers = {};
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  if (token) headers.Authorization = `Bearer ${token}`;

  let res;
  try {
    res = await fetch(`${API_BASE_URL}${path}${buildQuery(params)}`, {
      method,
      signal,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch (err) {
    if (err.name === 'AbortError') throw err;
    throw new ApiError(`Can't reach the Willow API at ${API_BASE_URL}. Is willow_be running?`, 0);
  }

  return readResponse(res, path);
}

/** Sends one file as multipart form data (field name `file`) as the signed-in seller. */
export async function upload(path, file) {
  const token = tokenStore.get();
  const form = new FormData();
  form.append('file', file);
  let res;
  try {
    res = await fetch(`${API_BASE_URL}${path}`, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      body: form, // the browser sets the multipart Content-Type itself
    });
  } catch {
    throw new ApiError(`Can't reach the Willow API at ${API_BASE_URL}. Is willow_be running?`, 0);
  }
  return readResponse(res, path);
}

async function readResponse(res, path) {
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    // A 401 on a sign-in attempt is just a wrong password; anywhere else the session has ended.
    if (res.status === 401 && !path.startsWith('/seller/auth/log')) {
      unauthorizedHandlers.forEach((handler) => handler());
    }
    throw new ApiError(data.error || `Request failed (${res.status})`, res.status, data.fields || {});
  }
  if (res.status === 204) return null;
  const text = await res.text();
  return text ? JSON.parse(text) : null;
}
