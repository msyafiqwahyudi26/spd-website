/**
 * tokenBlacklist.js
 * ------------------
 * In-memory store of invalidated JWT `jti` values.
 *
 * Problem it solves: httpOnly cookies are cleared on logout, but the raw JWT
 * is still cryptographically valid until its `exp`. If a token was ever
 * captured (network sniffer, server log, etc.) it could be replayed via the
 * `Authorization: Bearer` fallback header indefinitely — unless we track
 * which tokens have been explicitly logged out.
 *
 * Each token carries a unique `jti` (JWT ID) set at sign time. On logout we
 * record that jti here. The auth middleware rejects any token whose jti is
 * in this list, even if the signature is otherwise valid.
 *
 * Memory management: entries are pruned once their JWT `exp` passes, so the
 * Set never grows unboundedly. A background timer prunes every hour.
 *
 * For multi-instance / multi-process deploys (e.g. PM2 cluster mode), swap
 * this for a Redis-backed store — the interface is identical, just make the
 * two exported functions async and await them in the callers.
 */

// Map<jti: string, expiresAt: unix-seconds>
const _store = new Map();

/**
 * Add a jti to the blacklist until its natural expiry.
 * @param {string} jti   - The JWT ID claim
 * @param {number} exp   - JWT `exp` as unix-seconds
 */
function addToBlacklist(jti, exp) {
  if (typeof jti === 'string' && jti && typeof exp === 'number') {
    _store.set(jti, exp);
  }
}

/**
 * Check whether a jti has been blacklisted.
 * Automatically evicts expired entries found during the check.
 * @param  {string|undefined} jti
 * @returns {boolean}
 */
function isBlacklisted(jti) {
  if (!jti) return false;
  const exp = _store.get(jti);
  if (exp === undefined) return false;

  const now = Math.floor(Date.now() / 1000);
  if (exp < now) {
    // Token has expired anyway — clean up and report not-blacklisted
    // (the JWT verifier will reject it for expiry independently).
    _store.delete(jti);
    return false;
  }

  return true;
}

// Periodic pruning — runs every hour, removes entries whose JWT exp has
// already passed. Safe no-op if the store is empty.
const pruneInterval = setInterval(() => {
  const now = Math.floor(Date.now() / 1000);
  for (const [jti, exp] of _store) {
    if (exp < now) _store.delete(jti);
  }
}, 60 * 60 * 1000);

// Don't block process exit
if (pruneInterval.unref) pruneInterval.unref();

module.exports = { addToBlacklist, isBlacklisted };
