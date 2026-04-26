/**
 * tokenBlacklist.js
 * ------------------
 * Persistent store of invalidated JWT `jti` values, backed by SQLite via
 * Prisma. An in-memory Map acts as a fast read cache so most auth checks
 * don't hit the database.
 *
 * Persistence matters because the backend restarts when deployed (PM2).
 * Without persistence a captured token can be replayed via Authorization:
 * Bearer in the window between restart and natural `exp` (up to 8 hours).
 *
 * Interface is async — callers must await both addToBlacklist and isBlacklisted.
 * Express middleware supports async, so this is a drop-in replacement.
 */

const prisma = require('./prisma');

// In-memory cache: Map<jti, exp-unix-seconds>
const _store = new Map();

// Load state — we start an init Promise immediately and await it in
// isBlacklisted to avoid checking the DB before the cache is warm.
let _initialized = false;
let _initPromise = null;

async function _initialize() {
  try {
    const now = new Date();
    const rows = await prisma.blacklistedToken.findMany({
      where: { expiresAt: { gt: now } },
      select: { jti: true, expiresAt: true },
    });
    for (const row of rows) {
      _store.set(row.jti, Math.floor(row.expiresAt.getTime() / 1000));
    }
  } catch (err) {
    // Non-fatal: we fall back to in-memory-only mode for this process lifetime.
    console.warn('[tokenBlacklist] DB init failed — in-memory only this session:', err.message);
  }
  _initialized = true;
}

// Kick off init immediately (non-blocking startup)
_initPromise = _initialize();

/**
 * Add a jti to the blacklist until its natural expiry.
 * Persists to DB so the entry survives server restarts.
 */
async function addToBlacklist(jti, exp) {
  if (typeof jti !== 'string' || !jti || typeof exp !== 'number') return;

  // Fast in-memory write first
  _store.set(jti, exp);

  // Persist to DB (best-effort — don't throw if DB is unavailable)
  try {
    await prisma.blacklistedToken.upsert({
      where: { jti },
      update: { expiresAt: new Date(exp * 1000) },
      create: { jti, expiresAt: new Date(exp * 1000) },
    });
  } catch (err) {
    console.warn('[tokenBlacklist] Failed to persist token to DB:', err.message);
  }
}

/**
 * Check whether a jti has been blacklisted.
 * Automatically evicts expired entries found during the check.
 */
async function isBlacklisted(jti) {
  if (!jti) return false;

  // Ensure DB cache is loaded before first real check
  if (!_initialized) await _initPromise;

  // Fast path — hit in-memory cache first
  const exp = _store.get(jti);
  if (exp !== undefined) {
    const now = Math.floor(Date.now() / 1000);
    if (exp < now) {
      _store.delete(jti);
      return false;
    }
    return true;
  }

  // Slow path — jti not in cache (e.g. added by another process).
  // Direct DB lookup, then cache the result.
  try {
    const row = await prisma.blacklistedToken.findUnique({
      where: { jti },
      select: { jti: true, expiresAt: true },
    });
    if (!row) return false;
    const now = Math.floor(Date.now() / 1000);
    const expSec = Math.floor(row.expiresAt.getTime() / 1000);
    if (expSec < now) {
      // Expired — clean up lazily and report valid (JWT verifier rejects it anyway)
      prisma.blacklistedToken.delete({ where: { jti } }).catch(() => {});
      return false;
    }
    _store.set(jti, expSec); // cache for subsequent checks
    return true;
  } catch {
    // Fail open: if the DB is unreachable, don't block all requests.
    // The JWT's own exp claim is still enforced independently.
    return false;
  }
}

// Hourly pruning — keeps both the in-memory Map and the DB table lean.
const _pruneInterval = setInterval(async () => {
  const now = Math.floor(Date.now() / 1000);
  for (const [jti, exp] of _store) {
    if (exp < now) _store.delete(jti);
  }
  try {
    await prisma.blacklistedToken.deleteMany({
      where: { expiresAt: { lt: new Date() } },
    });
  } catch { /* ignore */ }
}, 60 * 60 * 1000);

// Don't block process exit on this timer
if (_pruneInterval.unref) _pruneInterval.unref();

module.exports = { addToBlacklist, isBlacklisted };
