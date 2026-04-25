const RAW_BASE = import.meta.env.VITE_API_URL;

if (!RAW_BASE) {
  // Not fatal — we fall back to localhost for dev convenience. Production
  // builds without this var will hit the wrong host, hence the warning.
  // eslint-disable-next-line no-console
  console.warn('[api] VITE_API_URL is not set. Falling back to http://localhost:5000/api');
}

export const BASE_URL = RAW_BASE || 'http://localhost:5000/api';
export const AUTH_EXPIRED_EVENT = 'auth:expired';

const DEFAULT_TIMEOUT_MS = 30_000;

function emitAuthExpired() {
  // Stash a one-shot reason so Login can show "Sesi kedaluwarsa" when the
  // redirect happens. Consumed and cleared by the Login page.
  try {
    sessionStorage.setItem('spd_auth_reason', 'expired');
  } catch {}
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(AUTH_EXPIRED_EVENT));
  }
}

function extractMessage(body) {
  if (!body || typeof body !== 'object') return null;
  return (
    (typeof body.message === 'string' && body.message) ||
    (typeof body.error === 'string' && body.error) ||
    null
  );
}

/**
 * Generic fetch wrapper.
 *
 * - Uses httpOnly cookies for authentication (credentials: 'include').
 *   No token is stored in localStorage — the browser sends the cookie
 *   automatically on every request to the same origin.
 * - Adds JSON Content-Type unless body is FormData.
 * - Aborts after 30s so hung responses don't hang the UI.
 * - Unwraps the `{ success, data }` envelope transparently — callers see
 *   the inner payload. Legacy un-enveloped responses pass through as-is.
 * - On 401, dispatches `auth:expired` so the app can redirect to /login.
 */
export const api = async (endpoint, options = {}) => {
  const headers = { ...(options.headers || {}) };

  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = headers['Content-Type'] || 'application/json';
  }

  const controller = new AbortController();
  const timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  let response;
  try {
    response = await fetch(`${BASE_URL}${endpoint}`, {
      ...options,
      headers,
      // Send the httpOnly auth cookie on every request
      credentials: 'include',
      signal: options.signal || controller.signal,
    });
  } catch (err) {
    clearTimeout(timer);
    const isAbort = err && err.name === 'AbortError';
    const msg = isAbort
      ? 'Permintaan memakan waktu terlalu lama. Periksa koneksi Anda.'
      : 'Tidak dapat terhubung ke server.';
    const wrapped = new Error(msg);
    wrapped.status = 0;
    wrapped.cause = err;
    throw wrapped;
  }

  clearTimeout(timer);

  if (response.status === 401) {
    emitAuthExpired();
  }

  let body = null;
  try {
    body = await response.json();
  } catch {
    // Non-JSON response — treat as empty body.
  }

  if (!response.ok) {
    const err = new Error(extractMessage(body) || 'Terjadi kesalahan pada server');
    err.status = response.status;
    err.body = body;
    throw err;
  }

  // Unwrap the standard envelope. Legacy endpoints that return a bare
  // object/array still work — we only unwrap when the envelope is present.
  if (body && typeof body === 'object' && 'success' in body) {
    if (body.success === false) {
      const err = new Error(body.message || 'Terjadi kesalahan pada server');
      err.status = response.status;
      err.body = body;
      throw err;
    }
    return 'data' in body ? body.data : body;
  }

  return body;
};
