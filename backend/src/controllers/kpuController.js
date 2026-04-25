/**
 * KPU Satu Data Proxy Controller
 *
 * Proxies public KPU data endpoints with in-memory caching (TTL 1 hour by
 * default) so the frontend always loads fast and KPU servers aren't hammered.
 *
 * Data sources:
 *  - sirekap-obj-data.kpu.go.id  — real-time hitung cepat (Sirekap)
 *  - opendata.kpu.go.id           — historical open datasets
 */

const https = require('https');
const { ok, fail } = require('../lib/response');

/* ── In-memory cache ───────────────────────────────────────────────────── */
const cache = new Map();

function getCached(key) {
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) { cache.delete(key); return null; }
  return entry.data;
}

function setCached(key, data, ttlMs = 60 * 60 * 1000) {
  cache.set(key, { data, expiresAt: Date.now() + ttlMs });
}

/* ── Generic fetch helper ──────────────────────────────────────────────── */
function fetchJson(url, timeoutMs = 10000) {
  return new Promise((resolve, reject) => {
    const req = https.get(url, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'SPDIndonesia-DataProxy/1.0',
      },
    }, (res) => {
      if (res.statusCode !== 200) {
        res.resume();
        return reject(new Error(`HTTP ${res.statusCode} from ${url}`));
      }
      let body = '';
      res.setEncoding('utf8');
      res.on('data', (chunk) => { body += chunk; });
      res.on('end', () => {
        try { resolve(JSON.parse(body)); }
        catch (e) { reject(new Error('Invalid JSON from KPU endpoint')); }
      });
    });
    req.setTimeout(timeoutMs, () => {
      req.destroy();
      reject(new Error('KPU request timed out'));
    });
    req.on('error', reject);
  });
}

/* ── Endpoint definitions ──────────────────────────────────────────────── */
// Sirekap: live hitung suara Pilpres 2024 (nasional)
const SIREKAP_PPWP   = 'https://sirekap-obj-data.kpu.go.id/pemilu/hhcw/ppwp.json';
// Sirekap: live hitung suara DPR 2024 (nasional)
const SIREKAP_DPR    = 'https://sirekap-obj-data.kpu.go.id/pemilu/hhcw/pdpr.json';
// Sirekap: partisipasi nasional (TPS yang sudah lapor)
const SIREKAP_PART   = 'https://sirekap-obj-data.kpu.go.id/pemilu/partisipasi/ppwp.json';

/* ── Helpers to reshape Sirekap payload ───────────────────────────────── */
function shapePpwp(raw) {
  // Sirekap PPWP shape: { chart: { [paslon_id]: votes }, tungsura: { ... } }
  const chart = raw?.chart || {};
  const candidates = Object.entries(chart).map(([id, suara]) => ({ id, suara }));
  const totalSuara = candidates.reduce((s, c) => s + (c.suara || 0), 0);
  return {
    source: 'sirekap',
    type: 'ppwp',
    candidates,
    totalSuara,
    raw: raw?.table ?? null,
  };
}

function shapeDpr(raw) {
  const chart = raw?.chart || {};
  const partai = Object.entries(chart).map(([id, suara]) => ({ id, suara }));
  const totalSuara = partai.reduce((s, p) => s + (p.suara || 0), 0);
  return { source: 'sirekap', type: 'dpr', partai, totalSuara };
}

function shapePartisipasi(raw) {
  // Shape: { persen_partisipasi, total_tps, tps_melapor, ... }
  return {
    source: 'sirekap',
    type: 'partisipasi',
    persenPartisipasi: raw?.persen_partisipasi ?? null,
    totalTps: raw?.total_tps ?? null,
    tpsMelapor: raw?.tps_melapor ?? null,
    data: raw,
  };
}

/* ── Controllers ───────────────────────────────────────────────────────── */

/**
 * GET /api/kpu/ppwp
 * Hasil hitung suara Pilpres 2024 (Sirekap, nasional)
 */
exports.ppwp = async (req, res, next) => {
  try {
    const cacheKey = 'kpu:ppwp';
    let data = getCached(cacheKey);
    if (!data) {
      const raw = await fetchJson(SIREKAP_PPWP);
      data = shapePpwp(raw);
      setCached(cacheKey, data, 60 * 60 * 1000); // 1 hour
    }
    return ok(res, data);
  } catch (err) {
    console.warn('[KPU proxy] ppwp fetch failed:', err.message);
    return fail(res, 502, 'Data KPU sementara tidak tersedia');
  }
};

/**
 * GET /api/kpu/dpr
 * Hasil hitung suara DPR 2024 (Sirekap, nasional)
 */
exports.dpr = async (req, res, next) => {
  try {
    const cacheKey = 'kpu:dpr';
    let data = getCached(cacheKey);
    if (!data) {
      const raw = await fetchJson(SIREKAP_DPR);
      data = shapeDpr(raw);
      setCached(cacheKey, data, 60 * 60 * 1000);
    }
    return ok(res, data);
  } catch (err) {
    console.warn('[KPU proxy] dpr fetch failed:', err.message);
    return fail(res, 502, 'Data KPU sementara tidak tersedia');
  }
};

/**
 * GET /api/kpu/partisipasi
 * Tingkat partisipasi Pemilu 2024 (Sirekap)
 */
exports.partisipasi = async (req, res, next) => {
  try {
    const cacheKey = 'kpu:partisipasi';
    let data = getCached(cacheKey);
    if (!data) {
      const raw = await fetchJson(SIREKAP_PART);
      data = shapePartisipasi(raw);
      setCached(cacheKey, data, 60 * 60 * 1000);
    }
    return ok(res, data);
  } catch (err) {
    console.warn('[KPU proxy] partisipasi fetch failed:', err.message);
    return fail(res, 502, 'Data KPU sementara tidak tersedia');
  }
};

/**
 * GET /api/kpu/status
 * Health-check: returns cache state & timestamps without hitting KPU
 */
exports.status = (req, res) => {
  const entries = [];
  for (const [key, entry] of cache.entries()) {
    entries.push({
      key,
      expiresAt: new Date(entry.expiresAt).toISOString(),
      ttlSec: Math.round((entry.expiresAt - Date.now()) / 1000),
    });
  }
  return ok(res, { cached: entries, count: entries.length });
};

/**
 * POST /api/kpu/cache/clear  (admin only)
 * Force-expire all cached KPU data so next request re-fetches from source
 */
exports.clearCache = (req, res) => {
  const count = cache.size;
  cache.clear();
  return ok(res, { cleared: count });
};
