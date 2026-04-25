/**
 * Uniform response helpers.
 *
 * Every successful response:  { success: true,  data }
 * Every failed response:      { success: false, message }
 *
 * Extra top-level keys may be added for specific cases (e.g. `retryAfter`
 * on rate-limit responses) but `success` and `data`/`message` are the
 * contract the frontend depends on.
 */

function ok(res, data = null, status = 200) {
  return res.status(status).json({ success: true, data });
}

function fail(res, status, message, extra) {
  const body = { success: false, message: String(message || 'Terjadi kesalahan') };
  if (extra && typeof extra === 'object') Object.assign(body, extra);
  return res.status(status).json(body);
}

module.exports = { ok, fail };
