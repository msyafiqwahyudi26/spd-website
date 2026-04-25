/**
 * Pluggable storage backend for the rate limiter.
 *
 * ────────────────────────────────────────────────────────────────────
 * Interface (synchronous today, async-ready tomorrow):
 *
 *   getHits(key, sinceTs)      → number[]  timestamps within the window
 *   addHit(key, ts)            → void
 *   prune(olderThanTs)         → void
 *
 * The only implementation shipped is `createMemoryStore`. To move to
 * Redis (or any other backend), write a `createRedisStore({ client })`
 * exporting the same three methods and swap the import in
 * `middlewares/rateLimit.js`.
 *
 * ────────────────────────────────────────────────────────────────────
 * Redis sketch (for reference, DO NOT import yet):
 *
 *   const KEY = (k) => `rl:${k}`;
 *
 *   function createRedisStore({ client }) {
 *     return {
 *       async getHits(key, sinceTs) {
 *         const k = KEY(key);
 *         // drop expired
 *         await client.zRemRangeByScore(k, 0, sinceTs);
 *         const scores = await client.zRange(k, 0, -1, { BY: 'SCORE' });
 *         return scores.map(Number);
 *       },
 *       async addHit(key, ts) {
 *         const k = KEY(key);
 *         await client.zAdd(k, [{ score: ts, value: String(ts) }]);
 *         await client.expire(k, 24 * 60 * 60); // 24h TTL
 *       },
 *       async prune(olderThanTs) {
 *         // global prune not needed with per-key TTL
 *       },
 *     };
 *   }
 *
 * Converting the middleware to async is a one-line change: `await` the
 * two calls inside `createRateLimit`.
 * ────────────────────────────────────────────────────────────────────
 */

function createMemoryStore() {
  const map = new Map();
  return {
    getHits(key, sinceTs) {
      const hits = map.get(key);
      if (!hits) return [];
      return hits.filter((t) => t > sinceTs);
    },
    addHit(key, ts) {
      const hits = map.get(key) || [];
      hits.push(ts);
      map.set(key, hits);
    },
    prune(olderThanTs) {
      for (const [key, hits] of map) {
        const fresh = hits.filter((t) => t > olderThanTs);
        if (fresh.length === 0) map.delete(key);
        else if (fresh.length !== hits.length) map.set(key, fresh);
      }
    },
  };
}

module.exports = { createMemoryStore };
