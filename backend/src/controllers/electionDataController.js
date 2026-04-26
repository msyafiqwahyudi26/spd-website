/**
 * electionDataController.js
 * ─────────────────────────
 * CRUD untuk model ElectionData — statistik pemilu per tahun & jenis.
 * GET  /api/election-data          → publik (semua tahun + jenis)
 * GET  /api/election-data/:id      → publik (satu record)
 * POST /api/election-data          → admin only (buat baru)
 * PUT  /api/election-data/:id      → admin only (update)
 * DELETE /api/election-data/:id   → admin only (hapus)
 * POST /api/election-data/seed    → admin only (seed data awal)
 */

const { ok, fail } = require('../lib/response');
const { validate, v } = require('../lib/validate');
const prisma = require('../lib/prisma');
const { logAction } = require('../lib/logger');

/* ── Helpers ─────────────────────────────────────────────────────────────── */
const toPublic = (r) => ({
  id:             r.id,
  tahun:          r.tahun,
  jenisPemilu:    r.jenisPemilu,
  partisipasi:    r.partisipasi,
  suaraTidakSah:  r.suaraTidakSah,
  suaraSah:       r.suaraSah,
  jumlahDPT:      r.jumlahDPT != null ? Number(r.jumlahDPT) : null,
  jumlahTPS:      r.jumlahTPS,
  jumlahKabKota:  r.jumlahKabKota,
  jumlahProvinsi: r.jumlahProvinsi,
  catatan:        r.catatan,
  sortOrder:      r.sortOrder,
  updatedAt:      r.updatedAt,
});

const parseFloat2 = (val) => {
  if (val === '' || val === null || val === undefined) return null;
  const n = parseFloat(val);
  return isNaN(n) ? null : n;
};

const parseInt2 = (val) => {
  if (val === '' || val === null || val === undefined) return null;
  const n = parseInt(val, 10);
  return isNaN(n) ? null : n;
};

/* ── List (publik) ──────────────────────────────────────────────────────── */
exports.list = async (req, res) => {
  try {
    const { tahun, jenis } = req.query;
    const where = {};
    if (tahun)  where.tahun       = parseInt(tahun, 10);
    if (jenis)  where.jenisPemilu = jenis;

    const rows = await prisma.electionData.findMany({
      where,
      orderBy: [{ tahun: 'desc' }, { sortOrder: 'asc' }],
    });
    return ok(res, rows.map(toPublic));
  } catch (err) {
    console.error('[electionData.list]', err);
    return fail(res, 500, 'Gagal mengambil data pemilu');
  }
};

/* ── Get one (publik) ────────────────────────────────────────────────────── */
exports.getOne = async (req, res) => {
  try {
    const row = await prisma.electionData.findUnique({ where: { id: req.params.id } });
    if (!row) return fail(res, 404, 'Data tidak ditemukan');
    return ok(res, toPublic(row));
  } catch (err) {
    return fail(res, 500, 'Gagal mengambil data');
  }
};

/* ── Create (admin) ──────────────────────────────────────────────────────── */
exports.create = async (req, res) => {
  const body = req.body;

  // Check duplicate
  const existing = await prisma.electionData.findFirst({
    where: { tahun: parseInt2(body.tahun), jenisPemilu: body.jenisPemilu },
  });
  if (existing) return fail(res, 409, `Data untuk ${body.tahun} – ${body.jenisPemilu} sudah ada`);

  try {
    const row = await prisma.electionData.create({
      data: {
        tahun:          parseInt2(body.tahun) ?? 2024,
        jenisPemilu:    body.jenisPemilu?.trim() || 'Presiden',
        partisipasi:    parseFloat2(body.partisipasi),
        suaraTidakSah:  parseFloat2(body.suaraTidakSah),
        suaraSah:       parseFloat2(body.suaraSah),
        jumlahDPT:      parseInt2(body.jumlahDPT),
        jumlahTPS:      parseInt2(body.jumlahTPS),
        jumlahKabKota:  parseInt2(body.jumlahKabKota),
        jumlahProvinsi: parseInt2(body.jumlahProvinsi),
        catatan:        body.catatan?.trim() || '',
        sortOrder:      parseInt2(body.sortOrder) ?? 0,
      },
    });

    await logAction({
      action: 'CREATE', entity: 'ElectionData', entityId: row.id,
      userId: req.user?.id, userName: req.user?.name || '',
      details: `${row.tahun} – ${row.jenisPemilu}`,
    });

    return ok(res, toPublic(row), 201);
  } catch (err) {
    console.error('[electionData.create]', err);
    return fail(res, 500, 'Gagal menyimpan data');
  }
};

/* ── Update (admin) ──────────────────────────────────────────────────────── */
exports.update = async (req, res) => {
  const { id } = req.params;
  const body = req.body;

  const existing = await prisma.electionData.findUnique({ where: { id } });
  if (!existing) return fail(res, 404, 'Data tidak ditemukan');

  // Duplicate check (excluding self)
  if (body.tahun || body.jenisPemilu) {
    const tahun = parseInt2(body.tahun) ?? existing.tahun;
    const jenis = body.jenisPemilu?.trim() || existing.jenisPemilu;
    const dup = await prisma.electionData.findFirst({
      where: { tahun, jenisPemilu: jenis, NOT: { id } },
    });
    if (dup) return fail(res, 409, `Data untuk ${tahun} – ${jenis} sudah ada`);
  }

  try {
    const row = await prisma.electionData.update({
      where: { id },
      data: {
        tahun:          body.tahun         != null ? (parseInt2(body.tahun) ?? existing.tahun) : undefined,
        jenisPemilu:    body.jenisPemilu   != null ? body.jenisPemilu.trim() : undefined,
        partisipasi:    body.partisipasi   !== undefined ? parseFloat2(body.partisipasi)   : undefined,
        suaraTidakSah:  body.suaraTidakSah !== undefined ? parseFloat2(body.suaraTidakSah) : undefined,
        suaraSah:       body.suaraSah      !== undefined ? parseFloat2(body.suaraSah)      : undefined,
        jumlahDPT:      body.jumlahDPT     !== undefined ? parseInt2(body.jumlahDPT)       : undefined,
        jumlahTPS:      body.jumlahTPS     !== undefined ? parseInt2(body.jumlahTPS)       : undefined,
        jumlahKabKota:  body.jumlahKabKota !== undefined ? parseInt2(body.jumlahKabKota)   : undefined,
        jumlahProvinsi: body.jumlahProvinsi !== undefined ? parseInt2(body.jumlahProvinsi) : undefined,
        catatan:        body.catatan       != null ? body.catatan.trim() : undefined,
        sortOrder:      body.sortOrder     != null ? (parseInt2(body.sortOrder) ?? 0) : undefined,
      },
    });

    await logAction({
      action: 'UPDATE', entity: 'ElectionData', entityId: row.id,
      userId: req.user?.id, userName: req.user?.name || '',
      details: `${row.tahun} – ${row.jenisPemilu}`,
    });

    return ok(res, toPublic(row));
  } catch (err) {
    console.error('[electionData.update]', err);
    return fail(res, 500, 'Gagal mengupdate data');
  }
};

/* ── Remove (admin) ──────────────────────────────────────────────────────── */
exports.remove = async (req, res) => {
  const { id } = req.params;
  const existing = await prisma.electionData.findUnique({ where: { id } });
  if (!existing) return fail(res, 404, 'Data tidak ditemukan');

  await prisma.electionData.delete({ where: { id } });

  await logAction({
    action: 'DELETE', entity: 'ElectionData', entityId: id,
    userId: req.user?.id, userName: req.user?.name || '',
    details: `${existing.tahun} – ${existing.jenisPemilu}`,
  });

  return ok(res, { deleted: true });
};

/* ── Seed (admin) ────────────────────────────────────────────────────────── */
// Data resmi KPU pasca-pemilu. Bisa dipanggil ulang — pakai upsert.
const SEED_DATA = [
  // ── 2024 ──
  { tahun: 2024, jenisPemilu: 'Presiden',      partisipasi: 81.78, suaraTidakSah: 2.49,  suaraSah: 97.51, jumlahDPT: 204807222, jumlahTPS: 823220, jumlahKabKota: 514, jumlahProvinsi: 38, catatan: 'Sumber: KPU RI, final', sortOrder: 0 },
  { tahun: 2024, jenisPemilu: 'DPR',           partisipasi: 81.78, suaraTidakSah: 7.62,  suaraSah: 92.38, jumlahDPT: 204807222, jumlahTPS: 823220, jumlahKabKota: 514, jumlahProvinsi: 38, catatan: 'Sumber: KPU RI, final', sortOrder: 1 },
  { tahun: 2024, jenisPemilu: 'DPD',           partisipasi: 81.78, suaraTidakSah: 7.39,  suaraSah: 92.61, jumlahDPT: 204807222, jumlahTPS: 823220, jumlahKabKota: 514, jumlahProvinsi: 38, catatan: 'Sumber: KPU RI, final', sortOrder: 2 },
  // ── 2019 ──
  { tahun: 2019, jenisPemilu: 'Presiden',      partisipasi: 81.97, suaraTidakSah: 2.35,  suaraSah: 97.65, jumlahDPT: 192828520, jumlahTPS: 813336, jumlahKabKota: 509, jumlahProvinsi: 34, catatan: 'Sumber: KPU RI, final', sortOrder: 0 },
  { tahun: 2019, jenisPemilu: 'DPR',           partisipasi: 81.97, suaraTidakSah: 11.12, suaraSah: 88.88, jumlahDPT: 192828520, jumlahTPS: 813336, jumlahKabKota: 509, jumlahProvinsi: 34, catatan: 'Sumber: KPU RI, final', sortOrder: 1 },
  // ── 2014 ──
  { tahun: 2014, jenisPemilu: 'Presiden',      partisipasi: 70.59, suaraTidakSah: 2.81,  suaraSah: 97.19, jumlahDPT: 185826024, jumlahTPS: 545784, jumlahKabKota: 497, jumlahProvinsi: 34, catatan: 'Sumber: KPU RI, final', sortOrder: 0 },
  { tahun: 2014, jenisPemilu: 'DPR',           partisipasi: 75.11, suaraTidakSah: 8.21,  suaraSah: 91.79, jumlahDPT: 185826024, jumlahTPS: 545784, jumlahKabKota: 497, jumlahProvinsi: 34, catatan: 'Sumber: KPU RI, final', sortOrder: 1 },
  // ── 2009 ──
  { tahun: 2009, jenisPemilu: 'Presiden',      partisipasi: 71.17, suaraTidakSah: 3.06,  suaraSah: 96.94, jumlahDPT: 176411434, jumlahTPS: 519920, jumlahKabKota: 480, jumlahProvinsi: 33, catatan: 'Sumber: KPU RI, final', sortOrder: 0 },
  { tahun: 2009, jenisPemilu: 'DPR',           partisipasi: 70.99, suaraTidakSah: 10.51, suaraSah: 89.49, jumlahDPT: 171265442, jumlahTPS: 519920, jumlahKabKota: 480, jumlahProvinsi: 33, catatan: 'Sumber: KPU RI, final', sortOrder: 1 },
  // ── 2004 ──
  { tahun: 2004, jenisPemilu: 'Presiden',      partisipasi: 78.23, suaraTidakSah: 3.35,  suaraSah: 96.65, jumlahDPT: 153320544, jumlahTPS: 584776, jumlahKabKota: 440, jumlahProvinsi: 32, catatan: 'Sumber: KPU RI, final', sortOrder: 0 },
  { tahun: 2004, jenisPemilu: 'DPR',           partisipasi: 84.07, suaraTidakSah: 3.55,  suaraSah: 96.45, jumlahDPT: 148000000, jumlahTPS: 584776, jumlahKabKota: 440, jumlahProvinsi: 32, catatan: 'Sumber: KPU RI, final', sortOrder: 1 },
  // ── 1999 ──
  { tahun: 1999, jenisPemilu: 'DPR',           partisipasi: 92.74, suaraTidakSah: 3.33,  suaraSah: 96.67, jumlahDPT: 118158778, jumlahTPS: 299892, jumlahKabKota: 310, jumlahProvinsi: 27, catatan: 'Pemilu pertama era reformasi. Sumber: KPU RI', sortOrder: 0 },
];

exports.seed = async (req, res) => {
  try {
    let created = 0, skipped = 0;
    for (const d of SEED_DATA) {
      const exists = await prisma.electionData.findFirst({
        where: { tahun: d.tahun, jenisPemilu: d.jenisPemilu },
      });
      if (exists) { skipped++; continue; }
      await prisma.electionData.create({ data: d });
      created++;
    }
    return ok(res, { created, skipped, total: SEED_DATA.length });
  } catch (err) {
    console.error('[electionData.seed]', err);
    return fail(res, 500, 'Gagal seed data pemilu');
  }
};
