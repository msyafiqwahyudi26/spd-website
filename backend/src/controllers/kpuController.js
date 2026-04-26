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
const http  = require('http');
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

/* ── Generic fetch helpers ─────────────────────────────────────────────── */
function _fetchJson(lib, url, timeoutMs = 15000) {
  return new Promise((resolve, reject) => {
    const req = lib.get(url, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'SPDIndonesia-DataProxy/1.0',
      },
    }, (res) => {
      // Follow one level of redirect
      if (res.statusCode === 301 || res.statusCode === 302) {
        res.resume();
        const loc = res.headers.location;
        if (!loc) return reject(new Error(`Redirect without Location from ${url}`));
        const redirectLib = loc.startsWith('https') ? https : http;
        return _fetchJson(redirectLib, loc, timeoutMs).then(resolve).catch(reject);
      }
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

// For HTTPS endpoints (Sirekap)
function fetchJson(url, timeoutMs = 15000) {
  return _fetchJson(https, url, timeoutMs);
}

// For HTTP endpoints (satupetadata.kpu.go.id)
function fetchJsonHttp(url, timeoutMs = 15000) {
  return _fetchJson(http, url, timeoutMs);
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

/* ── Satu Peta Data KPU (satupetadata.kpu.go.id) ──────────────────────── */

// Base URL for satupetadata GeoJSON (HTTP, not HTTPS)
const SATUPETA_BASE = 'http://satupetadata.kpu.go.id/assets/gis//json/geojsonRIDP4.php';

// Data types available from satupetadata
const PEMILIH_TYPES = [
  { key: 'dp4',   label: 'DP4',   desc: 'Daftar Penduduk Potensial Pemilih Pemilu' },
  { key: 'dps',   label: 'DPS',   desc: 'Daftar Pemilih Sementara' },
  { key: 'dpshp', label: 'DPSHP', desc: 'DPS Hasil Perbaikan' },
  { key: 'dpt',   label: 'DPT',   desc: 'Daftar Pemilih Tetap' },
  { key: 'dplk',  label: 'DPLK',  desc: 'Daftar Pemilih Lokasi Khusus' },
];

/**
 * Shape raw GeoJSON from satupetadata into a clean per-province array.
 * Strips polygon geometry (very large) and only keeps the properties.
 */
function shapeGeoJson(raw, typeKey, typeLabel) {
  if (!raw || !Array.isArray(raw.features)) return [];
  return raw.features
    .map(f => ({
      kdProv:   f.properties?.KD_PROV   ?? '',
      provinsi: f.properties?.PROVINSI  ?? '',
      jumlah:   f.properties?.JML       ?? 0,
    }))
    .sort((a, b) => a.provinsi.localeCompare(b.provinsi));
}

/**
 * GET /api/kpu/pemilih
 *
 * Returns aggregated data pemilih (DP4 → DPT) from satupetadata.kpu.go.id
 * for all 38 provinces. Cached for 24 hours — this is historical Pemilu 2024
 * data that doesn't change.
 *
 * Response shape:
 * {
 *   updatedAt: ISO string,
 *   nasional: { dp4, dps, dpshp, dpt, dplk },   // national totals
 *   provinsi: [                                    // per-province breakdown
 *     { kdProv, provinsi, dp4, dps, dpshp, dpt, dplk }
 *   ],
 *   meta: [{ key, label, desc, total }]            // dataset metadata
 * }
 */
exports.pemilih = async (req, res, next) => {
  try {
    const cacheKey = 'kpu:pemilih';
    let data = getCached(cacheKey);

    if (!data) {
      // Fetch all 5 types in parallel from satupetadata
      const fetches = await Promise.allSettled(
        PEMILIH_TYPES.map(t =>
          fetchJsonHttp(`${SATUPETA_BASE}?x=${t.key}`)
            .then(raw => ({ key: t.key, rows: shapeGeoJson(raw, t.key, t.label) }))
        )
      );

      // Build province map — keyed by KD_PROV
      const provMap = {};
      const nasional = {};
      const meta = [];

      for (let i = 0; i < PEMILIH_TYPES.length; i++) {
        const t = PEMILIH_TYPES[i];
        const result = fetches[i];

        if (result.status === 'rejected') {
          // Partial failure: mark this dataset as unavailable
          meta.push({ key: t.key, label: t.label, desc: t.desc, total: null, error: true });
          continue;
        }

        const rows = result.value.rows;
        const total = rows.reduce((s, r) => s + r.jumlah, 0);
        nasional[t.key] = total;
        meta.push({ key: t.key, label: t.label, desc: t.desc, total });

        for (const row of rows) {
          if (!provMap[row.kdProv]) {
            provMap[row.kdProv] = { kdProv: row.kdProv, provinsi: row.provinsi };
          }
          provMap[row.kdProv][t.key] = row.jumlah;
        }
      }

      const provinsi = Object.values(provMap)
        .sort((a, b) => a.provinsi.localeCompare(b.provinsi));

      data = {
        source: 'satupetadata.kpu.go.id',
        pemilu: 'Pemilu 2024',
        updatedAt: new Date().toISOString(),
        nasional,
        provinsi,
        meta,
      };

      // Cache 24 hours — historical data, changes rarely if ever
      setCached(cacheKey, data, 24 * 60 * 60 * 1000);
    }

    return ok(res, data);
  } catch (err) {
    console.warn('[KPU proxy] pemilih fetch failed:', err.message);
    return fail(res, 502, 'Data pemilih KPU sementara tidak tersedia');
  }
};
