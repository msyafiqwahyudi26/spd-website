const { ok, fail } = require('../lib/response');
const { validate, v } = require('../lib/validate');
const prisma = require('../lib/prisma');
const { log } = require('../lib/logger');

const parseFloat2 = (val) => {
  if (val === null || val === undefined || val === '') return null;
  const n = parseFloat(val);
  return isNaN(n) ? null : n;
};
const parseInt2 = (val) => {
  if (val === null || val === undefined || val === '') return null;
  const n = parseInt(val, 10);
  return isNaN(n) ? null : n;
};

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
  catatan:        r.catatan ?? '',
  sortOrder:      r.sortOrder,
  createdAt:      r.createdAt,
  updatedAt:      r.updatedAt,
});

exports.list = async (req, res, next) => {
  try {
    const { tahun, jenis } = req.query;
    const where = {};
    if (tahun) where.tahun = parseInt(tahun, 10);
    if (jenis) where.jenisPemilu = jenis;

    const rows = await prisma.electionData.findMany({
      where,
      orderBy: [{ tahun: 'desc' }, { sortOrder: 'asc' }, { jenisPemilu: 'asc' }],
    });
    return ok(res, rows.map(toPublic));
  } catch (err) {
    next(err);
  }
};

exports.getOne = async (req, res, next) => {
  try {
    const row = await prisma.electionData.findUnique({ where: { id: req.params.id } });
    if (!row) return fail(res, 404, 'Data tidak ditemukan');
    return ok(res, toPublic(row));
  } catch (err) {
    next(err);
  }
};

exports.create = async (req, res, next) => {
  try {
    const { errors, data } = validate(req.body, {
      tahun:          v.string({ required: true }),
      jenisPemilu:    v.string({ required: true, max: 100 }),
      partisipasi:    v.string({}),
      suaraTidakSah:  v.string({}),
      suaraSah:       v.string({}),
      jumlahDPT:      v.string({}),
      jumlahTPS:      v.string({}),
      jumlahKabKota:  v.string({}),
      jumlahProvinsi: v.string({}),
      catatan:        v.string({ max: 1000 }),
      sortOrder:      v.string({}),
    });
    if (errors) return fail(res, 400, errors);

    const row = await prisma.electionData.create({
      data: {
        tahun:          parseInt2(data.tahun),
        jenisPemilu:    data.jenisPemilu,
        partisipasi:    parseFloat2(data.partisipasi),
        suaraTidakSah:  parseFloat2(data.suaraTidakSah),
        suaraSah:       parseFloat2(data.suaraSah),
        jumlahDPT:      data.jumlahDPT ? BigInt(parseInt2(data.jumlahDPT)) : null,
        jumlahTPS:      parseInt2(data.jumlahTPS),
        jumlahKabKota:  parseInt2(data.jumlahKabKota),
        jumlahProvinsi: parseInt2(data.jumlahProvinsi),
        catatan:        data.catatan || '',
        sortOrder:      parseInt2(data.sortOrder) ?? 0,
      },
    });

    await log('create_election_data', 'ElectionData', {
      entityId: row.id,
      userId:   req.user?.userId,
      userName: req.user?.name || '',
      details:  `${row.tahun} ${row.jenisPemilu}`,
    });

    return ok(res, toPublic(row), 201);
  } catch (err) {
    if (err.code === 'P2002') return fail(res, 409, 'Data untuk tahun dan jenis pemilu ini sudah ada');
    next(err);
  }
};

exports.update = async (req, res, next) => {
  try {
    const existing = await prisma.electionData.findUnique({ where: { id: req.params.id } });
    if (!existing) return fail(res, 404, 'Data tidak ditemukan');

    const { errors, data } = validate(req.body, {
      tahun:          v.string({}),
      jenisPemilu:    v.string({ max: 100 }),
      partisipasi:    v.string({}),
      suaraTidakSah:  v.string({}),
      suaraSah:       v.string({}),
      jumlahDPT:      v.string({}),
      jumlahTPS:      v.string({}),
      jumlahKabKota:  v.string({}),
      jumlahProvinsi: v.string({}),
      catatan:        v.string({ max: 1000 }),
      sortOrder:      v.string({}),
    });
    if (errors) return fail(res, 400, errors);

    const row = await prisma.electionData.update({
      where: { id: req.params.id },
      data: {
        ...(data.tahun         !== undefined && { tahun:          parseInt2(data.tahun) }),
        ...(data.jenisPemilu   !== undefined && { jenisPemilu:    data.jenisPemilu }),
        ...(data.partisipasi   !== undefined && { partisipasi:    parseFloat2(data.partisipasi) }),
        ...(data.suaraTidakSah !== undefined && { suaraTidakSah:  parseFloat2(data.suaraTidakSah) }),
        ...(data.suaraSah      !== undefined && { suaraSah:       parseFloat2(data.suaraSah) }),
        ...(data.jumlahDPT     !== undefined && { jumlahDPT:      data.jumlahDPT ? BigInt(parseInt2(data.jumlahDPT)) : null }),
        ...(data.jumlahTPS     !== undefined && { jumlahTPS:      parseInt2(data.jumlahTPS) }),
        ...(data.jumlahKabKota !== undefined && { jumlahKabKota:  parseInt2(data.jumlahKabKota) }),
        ...(data.jumlahProvinsi!== undefined && { jumlahProvinsi: parseInt2(data.jumlahProvinsi) }),
        ...(data.catatan       !== undefined && { catatan:         data.catatan }),
        ...(data.sortOrder     !== undefined && { sortOrder:       parseInt2(data.sortOrder) ?? 0 }),
      },
    });

    await log('update_election_data', 'ElectionData', {
      entityId: row.id,
      userId:   req.user?.userId,
      userName: req.user?.name || '',
      details:  `${row.tahun} ${row.jenisPemilu}`,
    });

    return ok(res, toPublic(row));
  } catch (err) {
    if (err.code === 'P2002') return fail(res, 409, 'Data untuk tahun dan jenis pemilu ini sudah ada');
    next(err);
  }
};

exports.remove = async (req, res, next) => {
  try {
    const existing = await prisma.electionData.findUnique({ where: { id: req.params.id } });
    if (!existing) return fail(res, 404, 'Data tidak ditemukan');

    await prisma.electionData.delete({ where: { id: req.params.id } });

    await log('delete_election_data', 'ElectionData', {
      entityId: req.params.id,
      userId:   req.user?.userId,
      userName: req.user?.name || '',
      details:  `${existing.tahun} ${existing.jenisPemilu}`,
    });

    return ok(res, { deleted: true });
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// Seed — data historis lengkap pemilu Indonesia 1955–2024
// Idempotent: hanya insert jika belum ada (skip existing rows).
// Sumber: KPU RI, BPS, Kompaspedia, databoks.katadata.co.id
// ─────────────────────────────────────────────────────────────────────────────
exports.seed = async (req, res, next) => {
  const SEED = [
    // ── Era Demokrasi Parlementer ──────────────────────────────────────────
    {
      tahun: 1955, jenisPemilu: 'DPR',
      partisipasi: 91.40, suaraTidakSah: 11.24, suaraSah: 88.76,
      jumlahDPT: 43104464, jumlahTPS: 167654, jumlahKabKota: 208, jumlahProvinsi: 10,
      catatan: 'Pemilu pertama RI, 29 Sept 1955. Presiden dipilih oleh parlemen. Sumber: KPU RI / Arsip Nasional',
      sortOrder: 1,
    },
    {
      tahun: 1955, jenisPemilu: 'Konstituante',
      partisipasi: 91.03, suaraTidakSah: 10.98, suaraSah: 89.02,
      jumlahDPT: 43104464, jumlahTPS: 167654, jumlahKabKota: 208, jumlahProvinsi: 10,
      catatan: 'Pemilu Konstituante, 15 Des 1955. Badan pembuat UUD. Sumber: KPU RI / Arsip Nasional',
      sortOrder: 2,
    },

    // ── Era Orde Baru ──────────────────────────────────────────────────────
    {
      tahun: 1971, jenisPemilu: 'DPR',
      partisipasi: 96.60, suaraTidakSah: 2.49, suaraSah: 97.51,
      jumlahDPT: 58558227, jumlahTPS: 324843, jumlahKabKota: 281, jumlahProvinsi: 26,
      catatan: 'Pemilu Orde Baru pertama, 5 Juli 1971. Golkar menang 62,8%. Sumber: KPU RI',
      sortOrder: 1,
    },
    {
      tahun: 1977, jenisPemilu: 'DPR',
      partisipasi: 96.90, suaraTidakSah: 2.74, suaraSah: 97.26,
      jumlahDPT: 69871092, jumlahTPS: 281079, jumlahKabKota: 281, jumlahProvinsi: 27,
      catatan: 'Pemilu 2 Mei 1977. Tiga kontestan: Golkar, PPP, PDI. Sumber: KPU RI',
      sortOrder: 1,
    },
    {
      tahun: 1982, jenisPemilu: 'DPR',
      partisipasi: 96.47, suaraTidakSah: 2.46, suaraSah: 97.54,
      jumlahDPT: 82132513, jumlahTPS: 276971, jumlahKabKota: 296, jumlahProvinsi: 27,
      catatan: 'Pemilu 4 Mei 1982. Golkar 64,3%. Sumber: KPU RI',
      sortOrder: 1,
    },
    {
      tahun: 1987, jenisPemilu: 'DPR',
      partisipasi: 96.43, suaraTidakSah: 2.18, suaraSah: 97.82,
      jumlahDPT: 93737633, jumlahTPS: 276971, jumlahKabKota: 305, jumlahProvinsi: 27,
      catatan: 'Pemilu 23 April 1987. Golkar 73,1%. Sumber: KPU RI',
      sortOrder: 1,
    },
    {
      tahun: 1992, jenisPemilu: 'DPR',
      partisipasi: 95.10, suaraTidakSah: 2.26, suaraSah: 97.74,
      jumlahDPT: 107565413, jumlahTPS: 299909, jumlahKabKota: 305, jumlahProvinsi: 27,
      catatan: 'Pemilu 9 Juni 1992. Golkar 68,1%. Sumber: KPU RI',
      sortOrder: 1,
    },
    {
      tahun: 1997, jenisPemilu: 'DPR',
      partisipasi: 93.59, suaraTidakSah: 2.33, suaraSah: 97.67,
      jumlahDPT: 125640987, jumlahTPS: 308761, jumlahKabKota: 314, jumlahProvinsi: 27,
      catatan: 'Pemilu terakhir Orde Baru, 29 Mei 1997. Golkar 74,5%. Sumber: KPU RI',
      sortOrder: 1,
    },

    // ── Era Reformasi ──────────────────────────────────────────────────────
    {
      tahun: 1999, jenisPemilu: 'DPR',
      partisipasi: 92.74, suaraTidakSah: 8.45, suaraSah: 91.55,
      jumlahDPT: 118159009, jumlahTPS: 299288, jumlahKabKota: 319, jumlahProvinsi: 27,
      catatan: 'Pemilu pertama era Reformasi, 7 Juni 1999. 48 partai. Presiden dipilih MPR. Sumber: KPU RI',
      sortOrder: 1,
    },
    {
      tahun: 1999, jenisPemilu: 'Presiden',
      partisipasi: 92.74, suaraTidakSah: null, suaraSah: null,
      jumlahDPT: 118159009, jumlahTPS: 299288, jumlahKabKota: 319, jumlahProvinsi: 27,
      catatan: 'Presiden Abdurrahman Wahid dipilih MPR, bukan pemilu langsung. Partisipasi mengacu ke Pileg 1999.',
      sortOrder: 2,
    },

    // 2004 — Pemilu pertama presiden dipilih langsung
    {
      tahun: 2004, jenisPemilu: 'DPR',
      partisipasi: 84.07, suaraTidakSah: 9.49, suaraSah: 90.51,
      jumlahDPT: 153320240, jumlahTPS: 584890, jumlahKabKota: 440, jumlahProvinsi: 32,
      catatan: 'Pileg 5 April 2004. 24 partai. Sumber: KPU RI',
      sortOrder: 1,
    },
    {
      tahun: 2004, jenisPemilu: 'Presiden',
      partisipasi: 78.23, suaraTidakSah: 3.47, suaraSah: 96.53,
      jumlahDPT: 153320240, jumlahTPS: 584890, jumlahKabKota: 440, jumlahProvinsi: 32,
      catatan: 'Pilpres Putaran I, 5 Juli 2004. Pertama kali presiden dipilih langsung. Sumber: KPU RI',
      sortOrder: 2,
    },

    // 2009
    {
      tahun: 2009, jenisPemilu: 'DPR',
      partisipasi: 70.99, suaraTidakSah: 5.07, suaraSah: 94.93,
      jumlahDPT: 176367056, jumlahTPS: 519920, jumlahKabKota: 471, jumlahProvinsi: 33,
      catatan: 'Pileg 9 April 2009. 38 partai. Golput tertinggi saat itu ~29%. Sumber: KPU RI',
      sortOrder: 1,
    },
    {
      tahun: 2009, jenisPemilu: 'Presiden',
      partisipasi: 71.70, suaraTidakSah: 2.74, suaraSah: 97.26,
      jumlahDPT: 176367056, jumlahTPS: 519920, jumlahKabKota: 471, jumlahProvinsi: 33,
      catatan: 'Pilpres 8 Juli 2009. SBY menang 1 putaran (60,8%). Sumber: KPU RI',
      sortOrder: 2,
    },

    // 2014
    {
      tahun: 2014, jenisPemilu: 'DPR',
      partisipasi: 75.11, suaraTidakSah: 4.92, suaraSah: 95.08,
      jumlahDPT: 185826024, jumlahTPS: 545778, jumlahKabKota: 497, jumlahProvinsi: 34,
      catatan: 'Pileg 9 April 2014. 12 partai. Sumber: KPU RI',
      sortOrder: 1,
    },
    {
      tahun: 2014, jenisPemilu: 'Presiden',
      partisipasi: 70.59, suaraTidakSah: 2.27, suaraSah: 97.73,
      jumlahDPT: 185826024, jumlahTPS: 545778, jumlahKabKota: 497, jumlahProvinsi: 34,
      catatan: 'Pilpres 9 Juli 2014. Jokowi vs Prabowo. Sumber: KPU RI',
      sortOrder: 2,
    },

    // 2019 — Pemilu serentak pertama (pileg + pilpres bersamaan)
    {
      tahun: 2019, jenisPemilu: 'DPR',
      partisipasi: 81.97, suaraTidakSah: 9.13, suaraSah: 90.87,
      jumlahDPT: 192828520, jumlahTPS: 813336, jumlahKabKota: 514, jumlahProvinsi: 34,
      catatan: 'Pileg serentak 17 April 2019. 16 partai. Sumber: KPU RI',
      sortOrder: 1,
    },
    {
      tahun: 2019, jenisPemilu: 'Presiden',
      partisipasi: 81.97, suaraTidakSah: 1.06, suaraSah: 98.94,
      jumlahDPT: 192828520, jumlahTPS: 813336, jumlahKabKota: 514, jumlahProvinsi: 34,
      catatan: 'Pilpres serentak 17 April 2019. Jokowi–Maruf vs Prabowo–Sandi. Sumber: KPU RI',
      sortOrder: 2,
    },

    // 2024 — Pemilu serentak (pileg + pilpres + pilkada)
    {
      tahun: 2024, jenisPemilu: 'DPR',
      partisipasi: 81.78, suaraTidakSah: 7.52, suaraSah: 92.48,
      jumlahDPT: 204807222, jumlahTPS: 823220, jumlahKabKota: 514, jumlahProvinsi: 38,
      catatan: 'Pileg serentak 14 Februari 2024. 18 partai. Sumber: KPU RI',
      sortOrder: 1,
    },
    {
      tahun: 2024, jenisPemilu: 'Presiden',
      partisipasi: 81.78, suaraTidakSah: 2.49, suaraSah: 97.51,
      jumlahDPT: 204807222, jumlahTPS: 823220, jumlahKabKota: 514, jumlahProvinsi: 38,
      catatan: 'Pilpres serentak 14 Februari 2024. Prabowo–Gibran menang 1 putaran (58,6%). Sumber: KPU RI',
      sortOrder: 2,
    },
  ];

  try {
    let created = 0, skipped = 0;
    for (const item of SEED) {
      const exists = await prisma.electionData.findUnique({
        where: { tahun_jenisPemilu: { tahun: item.tahun, jenisPemilu: item.jenisPemilu } },
      });
      if (exists) { skipped++; continue; }
      await prisma.electionData.create({
        data: {
          ...item,
          jumlahDPT: item.jumlahDPT != null ? BigInt(item.jumlahDPT) : null,
        },
      });
      created++;
    }

    await log('seed_election_data', 'ElectionData', {
      entityId: 'seed',
      userId:   req.user?.userId,
      userName: req.user?.name || '',
      details:  `Seeded ${created} rows (1955–2024), skipped ${skipped}`,
    });

    return ok(res, { created, skipped, total: SEED.length });
  } catch (err) {
    next(err);
  }
};
