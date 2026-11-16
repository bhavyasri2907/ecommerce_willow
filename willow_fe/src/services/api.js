import { API_BASE_URL } from '../utils/constants.js';

const TOKEN_KEY = 'willow_token';

/** The signed-in shopper's session token, kept in this browser until they log out. */
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

/**
 * Shared fetch wrapper for the willow_be API. Sends the session token when there is one.
 * Throws an Error carrying the server's message for any non-2xx response; the error also
 * has `status` and, for validation failures, `fields` ({ fieldName: message }).
 */
export async function request(path, options = {}) {
  const token = tokenStore.get();
  const { headers, ...rest } = options;

  let res;
  try {
    res = await fetch(`${API_BASE_URL}${path}`, {
      ...rest,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...headers,
      },
    });
  } catch {
    const error = new Error("Couldn't reach Willow. Check your connection and try again.");
    error.status = 0;
    throw error;
  }

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    const error = new Error(body.error || `Request to ${path} failed (${res.status})`);
    error.status = res.status;
    error.fields = body.fields || {};
    throw error;
  }
  if (res.status === 204) return null;
  const text = await res.text();
  return text ? JSON.parse(text) : null;
}
