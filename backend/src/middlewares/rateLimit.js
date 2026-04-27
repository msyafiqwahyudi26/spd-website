/**
 * Sliding-window rate limiter backed by a pluggable store.
 *
 * Storage lives in `lib/rateLimitStore.js`. Today it's in-memory; swap
 * to a Redis-backed store by changing the import and awaiting the
 * store calls (see notes in `rateLimitStore.js`).
 */

const { fail } = require('../lib/response');
const { createMemoryStore } = require('../lib/rateLimitStore');

const store = createMemoryStore();

function getClientIp(req) {
  const xff = req.headers['x-forwarded-for'];
  if (typeof xff === 'string' && xff.length > 0) {
    return xff.split(',')[0].trim();
  }
  return req.ip || req.connection?.remoteAddress || 'unknown';
}

function createRateLimit({
  windowMs,
  max,
  prefix = 'rl',
  keyFn = (req) => getClientIp(req),
  message = 'Terlalu banyak permintaan, coba lagi nanti.',
}) {
  return (req, res, next) => {
    const key = `${prefix}:${keyFn(req)}`;
    const now = Date.now();
    const windowStart = now - windowMs;

    const fresh = store.getHits(key, windowStart);

    if (fresh.length >= max) {
      const retryAfterMs = fresh[0] + windowMs - now;
      const retryAfterSec = Math.max(1, Math.ceil(retryAfterMs / 1000));
      res.set('Retry-After', String(retryAfterSec));
      return fail(res, 429, message, { retryAfter: retryAfterSec });
    }

    store.addHit(key, now);
    next();
  };
}

// Periodic prune every 15 min (was 1 h) — keeps memory bounded under
// sustained high-traffic with many unique IPs. No-op for Redis-backed stores.
setInterval(() => {
  const cutoff = Date.now() - 24 * 60 * 60 * 1000;
  store.prune(cutoff);
}, 15 * 60 * 1000).unref?.();

module.exports = { createRateLimit, getClientIp };
