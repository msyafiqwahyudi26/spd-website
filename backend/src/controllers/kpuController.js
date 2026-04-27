/**
 * KPU Satu Data Proxy Controller
 *
 * Proxies public KPU data endpoints with:
 *  - In-memory cache (24 hours TTL) — KPU election data is historical, not live
 *  - File-based persistent backup — if KPU goes down or changes endpoints,
 *    the last successful fetch is served from disk so the page never goes blank
 *
 * Data sources:
 *  - sirekap-obj-data.kpu.go.id  — Sirekap hitung cepat (Pilpres & partisipasi)
 *  - satupetadata.kpu.go.id       — Data pemilih per provinsi (DP4 → DPT)
 */

const https = require('https');
const http  = require('http');
const path  = require('path');
const fs    = require('fs');
const { ok, fail } = require('../lib/response');

/* ── Backup directory (backend/data/) ─────────────────────────────────── */
const BACKUP_DIR = path.join(__dirname, '..', '..', 'data');
if (!fs.existsSync(BACKUP_DIR)) fs.mkdirSync(BACKUP_DIR, { recursive: true });

function backupPath(key) {
  // key like 'kpu:pemilih' → 'kpu-backup-pemilih.json'
  return path.join(BACKUP_DIR, `kpu-backup-${key.replace('kpu:', '')}.json`);
}

/** Persist data to disk. Non-fatal — logs warn on failure. */
function saveBackup(key, data) {
  try {
    fs.writeFileSync(backupPath(key), JSON.stringify({ savedAt: new Date().toISOString(), data }), 'utf8');
  } catch (e) {
    console.warn('[KPU backup] Could not write backup for', key, ':', e.message);
  }
}

/** Load last-known-good data from disk. Returns null if unavailable. */
function loadBackup(key) {
  try {
    const raw = fs.readFileSync(backupPath(key), 'utf8');
    const parsed = JSON.parse(raw);
    if (parsed && parsed.data) {
      // Annotate with backup metadata so frontend can show a warning
      return { ...parsed.data, _fromBackup: true, _backupSavedAt: parsed.savedAt };
    }
  } catch {
    // No backup file yet or corrupt — that's fine
  }
  return null;
}

/* ── In-memory cache ───────────────────────────────────────────────────── */
const cache = new Map();

function getCached(key) {
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) { cache.delete(key); return null; }
  return entry.data;
}

// Default TTL: 24 hours — all KPU data is historical (Pemilu 2024 is over)
const DAY_MS = 24 * 60 * 60 * 1000;

function setCached(key, data, ttlMs = DAY_MS) {
  cache.set(key, { data, expiresAt: Date.now() + ttlMs });
}

/* ── Generic fetch helpers ─────────────────────────────────────────────── */
function _fetchJson(lib, url, timeoutMs = 20000) {
  return new Promise((resolve, reject) => {
    const req = lib.get(url, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'SPDIndonesia-DataProxy/1.0',
      },
    }, (res) => {
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

function fetchJson(url, timeoutMs = 20000)     { return _fetchJson(https, url, timeoutMs); }
function fetchJsonHttp(url, timeoutMs = 20000) { return _fetchJson(http,  url, timeoutMs); }

/* ── Endpoint definitions ──────────────────────────────────────────────── */
const SIREKAP_PPWP   = 'https://sirekap-obj-data.kpu.go.id/pemilu/hhcw/ppwp.json';
const SIREKAP_DPR    = 'https://sirekap-obj-data.kpu.go.id/pemilu/hhcw/pdpr.json';
const SIREKAP_PART   = 'https://sirekap-obj-data.kpu.go.id/pemilu/partisipasi/ppwp.json';

/* ── Sirekap shapers ───────────────────────────────────────────────────── */
function shapePpwp(raw) {
  const chart = raw?.chart || {};
  const candidates = Object.entries(chart).map(([id, suara]) => ({ id, suara }));
  const totalSuara = candidates.reduce((s, c) => s + (c.suara || 0), 0);
  return { source: 'sirekap', type: 'ppwp', candidates, totalSuara, raw: raw?.table ?? null };
}

function shapeDpr(raw) {
  const chart = raw?.chart || {};
  const partai = Object.entries(chart).map(([id, suara]) => ({ id, suara }));
  const totalSuara = partai.reduce((s, p) => s + (p.suara || 0), 0);
  return { source: 'sirekap', type: 'dpr', partai, totalSuara };
}

function shapePartisipasi(raw) {
  return {
    source: 'sirekap',
    type: 'partisipasi',
    persenPartisipasi: raw?.persen_partisipasi ?? null,
    totalTps:          raw?.total_tps          ?? null,
    tpsMelapor:        raw?.tps_melapor        ?? null,
    data: raw,
  };
}

/* ── Controllers ───────────────────────────────────────────────────────── */

/** GET /api/kpu/ppwp — Hasil hitung suara Pilpres 2024 */
exports.ppwp = async (req, res, next) => {
  const cacheKey = 'kpu:ppwp';
  try {
    let data = getCached(cacheKey);
    if (!data) {
      const raw = await fetchJson(SIREKAP_PPWP);
      data = shapePpwp(raw);
      setCached(cacheKey, data, DAY_MS);
      saveBackup(cacheKey, data);
    }
    return ok(res, data);
  } catch (err) {
    console.warn('[KPU proxy] ppwp fetch failed:', err.message);
    const backup = loadBackup(cacheKey);
    if (backup) return ok(res, backup);
    return fail(res, 502, 'Data KPU sementara tidak tersedia');
  }
};

/** GET /api/kpu/dpr — Hasil hitung suara DPR 2024 */
exports.dpr = async (req, res, next) => {
  const cacheKey = 'kpu:dpr';
  try {
    let data = getCached(cacheKey);
    if (!data) {
      const raw = await fetchJson(SIREKAP_DPR);
      data = shapeDpr(raw);
      setCached(cacheKey, data, DAY_MS);
      saveBackup(cacheKey, data);
    }
    return ok(res, data);
  } catch (err) {
    console.warn('[KPU proxy] dpr fetch failed:', err.message);
    const backup = loadBackup(cacheKey);
    if (backup) return ok(res, backup);
    return fail(res, 502, 'Data KPU sementara tidak tersedia');
  }
};

/** GET /api/kpu/partisipasi — Tingkat partisipasi Pemilu 2024 */
exports.partisipasi = async (req, res, next) => {
  const cacheKey = 'kpu:partisipasi';
  try {
    let data = getCached(cacheKey);
    if (!data) {
      const raw = await fetchJson(SIREKAP_PART);
      data = shapePartisipasi(raw);
      setCached(cacheKey, data, DAY_MS);   // 24h — final data doesn't change
      saveBackup(cacheKey, data);
    }
    return ok(res, data);
  } catch (err) {
    console.warn('[KPU proxy] partisipasi fetch failed:', err.message);
    const backup = loadBackup(cacheKey);
    if (backup) return ok(res, backup);
    return fail(res, 502, 'Data KPU sementara tidak tersedia');
  }
};

/** GET /api/kpu/status — Cache state + backup availability */
exports.status = (req, res) => {
  const entries = [];
  for (const [key, entry] of cache.entries()) {
    const backupExists = fs.existsSync(backupPath(key));
    let backupSavedAt = null;
    if (backupExists) {
      try {
        const b = JSON.parse(fs.readFileSync(backupPath(key), 'utf8'));
        backupSavedAt = b.savedAt;
      } catch {}
    }
    entries.push({
      key,
      expiresAt:    new Date(entry.expiresAt).toISOString(),
      ttlSec:       Math.round((entry.expiresAt - Date.now()) / 1000),
      backupExists,
      backupSavedAt,
    });
  }
  return ok(res, { cached: entries, count: entries.length });
};

/** POST /api/kpu/cache/clear — Force-expire cache (admin only) */
exports.clearCache = (req, res) => {
  const count = cache.size;
  cache.clear();
  return ok(res, { cleared: count });
};

/* ── Satu Peta Data KPU (satupetadata.kpu.go.id) ──────────────────────── */

const SATUPETA_BASE = 'http://satupetadata.kpu.go.id/assets/gis//json/geojsonRIDP4.php';

const PEMILIH_TYPES = [
  { key: 'dp4',   label: 'DP4',   desc: 'Daftar Penduduk Potensial Pemilih Pemilu' },
  { key: 'dps',   label: 'DPS',   desc: 'Daftar Pemilih Sementara' },
  { key: 'dpshp', label: 'DPSHP', desc: 'DPS Hasil Perbaikan' },
  { key: 'dpt',   label: 'DPT',   desc: 'Daftar Pemilih Tetap' },
  { key: 'dplk',  label: 'DPLK',  desc: 'Daftar Pemilih Lokasi Khusus' },
];

function shapeGeoJson(raw) {
  if (!raw || !Array.isArray(raw.features)) return [];
  return raw.features
    .map(f => ({
      kdProv:   f.properties?.KD_PROV  ?? '',
      provinsi: f.properties?.PROVINSI ?? '',
      jumlah:   f.properties?.JML      ?? 0,
    }))
    .sort((a, b) => a.provinsi.localeCompare(b.provinsi));
}

/**
 * GET /api/kpu/pemilih
 *
 * Aggregated DP4→DPT data for all 38 provinces.
 * Cached 24h in memory + persisted to disk as backup.
 * If satupetadata is unreachable, serves last saved backup so the page
 * always shows data (even if KPU changes the endpoint next election cycle).
 */
exports.pemilih = async (req, res, next) => {
  const cacheKey = 'kpu:pemilih';
  try {
    let data = getCached(cacheKey);

    if (!data) {
      // Fetch all 5 voter-list types in parallel
      const fetches = await Promise.allSettled(
        PEMILIH_TYPES.map(t =>
          fetchJsonHttp(`${SATUPETA_BASE}?x=${t.key}`)
            .then(raw => ({ key: t.key, rows: shapeGeoJson(raw) }))
        )
      );

      const provMap = {};
      const nasional = {};
      const meta = [];

      for (let i = 0; i < PEMILIH_TYPES.length; i++) {
        const t = PEMILIH_TYPES[i];
        const result = fetches[i];

        if (result.status === 'rejected') {
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

      // Require at least dp4 data to be valid — if all failed, throw
      if (!nasional.dp4 && !nasional.dpt) {
        throw new Error('All satupetadata fetches failed');
      }

      data = {
        source:    'satupetadata.kpu.go.id',
        pemilu:    'Pemilu 2024',
        updatedAt: new Date().toISOString(),
        nasional,
        provinsi,
        meta,
      };

      setCached(cacheKey, data, DAY_MS);
      saveBackup(cacheKey, data);   // persist to disk for offline fallback
    }

    return ok(res, data);
  } catch (err) {
    console.warn('[KPU proxy] pemilih fetch failed:', err.message);
    // Serve last known good data from disk if available
    const backup = loadBackup(cacheKey);
    if (backup) {
      setCached(cacheKey, backup, DAY_MS); // re-warm memory cache with backup
      return ok(res, backup);
    }
    return fail(res, 502, 'Data pemilih KPU sementara tidak tersedia');
  }
};
