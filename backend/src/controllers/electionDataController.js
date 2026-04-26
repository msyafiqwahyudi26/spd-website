const { ok, fail } = require('../lib/response');
const { validate, v } = require('../lib/validate');
const prisma = require('../lib/prisma');
const { logAction } = require('../lib/logger');

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

exports.list = async (req, res) => {
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
    console.error(err);
    return fail(res, 500, 'Gagal memuat data pemilu');
  }
};

exports.getOne = async (req, res) => {
  try {
    const row = await prisma.electionData.findUnique({ where: { id: req.params.id } });
    if (!row) return fail(res, 404, 'Data tidak ditemukan');
    return ok(res, toPublic(row));
  } catch (err) {
    console.error(err);
    return fail(res, 500, 'Gagal memuat data pemilu');
  }
};

exports.create = async (req, res) => {
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

    await logAction({
      action: 'CREATE', entity: 'ElectionData', entityId: row.id,
      userId: req.user?.id, userName: req.user?.name || '',
      details: `${row.tahun} ${row.jenisPemilu}`,
    });

    return ok(res, toPublic(row), 201);
  } catch (err) {
    if (err.code === 'P2002') return fail(res, 409, 'Data untuk tahun dan jenis pemilu ini sudah ada');
    console.error(err);
    return fail(res, 500, 'Gagal menyimpan data pemilu');
  }
};

exports.update = async (req, res) => {
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

    await logAction({
      action: 'UPDATE', entity: 'ElectionData', entityId: row.id,
      userId: req.user?.id, userName: req.user?.name || '',
      details: `${row.tahun} ${row.jenisPemilu}`,
    });

    return ok(res, toPublic(row));
  } catch (err) {
    if (err.code === 'P2002') return fail(res, 409, 'Data untuk tahun dan jenis pemilu ini sudah ada');
    console.error(err);
    return fail(res, 500, 'Gagal memperbarui data pemilu');
  }
};

exports.remove = async (req, res) => {
  try {
    const existing = await prisma.electionData.findUnique({ where: { id: req.params.id } });
    if (!existing) return fail(res, 404, 'Data tidak ditemukan');

    await prisma.electionData.delete({ where: { id: req.params.id } });

    await logAction({
      action: 'DELETE', entity: 'ElectionData', entityId: req.params.id,
      userId: req.user?.id, userName: req.user?.name || '',
      details: `${existing.tahun} ${existing.jenisPemilu}`,
    });

    return ok(res, { deleted: true });
  } catch (err) {
    console.error(err);
    return fail(res, 500, 'Gagal menghapus data pemilu');
  }
};

// Seed historical data — idempotent (skip existing rows)
exports.seed = async (req, res) => {
  const SEED = [
    { tahun: 2024, jenisPemilu: 'Presiden', partisipasi: 81.78, suaraTidakSah: 2.49,  suaraSah: 97.51, jumlahDPT: 204807222, jumlahTPS: 823220, jumlahKabKota: 514, jumlahProvinsi: 38, catatan: 'Sumber: KPU RI, Pemilu 14 Februari 2024' },
    { tahun: 2024, jenisPemilu: 'DPR',      partisipasi: 81.78, suaraTidakSah: 7.52,  suaraSah: 92.48, jumlahDPT: 204807222, jumlahTPS: 823220, jumlahKabKota: 514, jumlahProvinsi: 38, catatan: 'Sumber: KPU RI, Pemilu 14 Februari 2024' },
    { tahun: 2019, jenisPemilu: 'Presiden', partisipasi: 81.97, suaraTidakSah: 1.06,  suaraSah: 98.94, jumlahDPT: 192828520, jumlahTPS: 813336, jumlahKabKota: 514, jumlahProvinsi: 34, catatan: 'Sumber: KPU RI, Pemilu 17 April 2019' },
    { tahun: 2019, jenisPemilu: 'DPR',      partisipasi: 81.97, suaraTidakSah: 9.13,  suaraSah: 90.87, jumlahDPT: 192828520, jumlahTPS: 813336, jumlahKabKota: 514, jumlahProvinsi: 34, catatan: 'Sumber: KPU RI, Pemilu 17 April 2019' },
    { tahun: 2014, jenisPemilu: 'Presiden', partisipasi: 70.59, suaraTidakSah: 2.27,  suaraSah: 97.73, jumlahDPT: 185826024, jumlahTPS: 545778, jumlahKabKota: 497, jumlahProvinsi: 34, catatan: 'Sumber: KPU RI, Pilpres 9 Juli 2014' },
    { tahun: 2014, jenisPemilu: 'DPR',      partisipasi: 75.11, suaraTidakSah: 4.92,  suaraSah: 95.08, jumlahDPT: 185826024, jumlahTPS: 545778, jumlahKabKota: 497, jumlahProvinsi: 34, catatan: 'Sumber: KPU RI, Pileg 9 April 2014' },
    { tahun: 2009, jenisPemilu: 'Presiden', partisipasi: 71.70, suaraTidakSah: 2.74,  suaraSah: 97.26, jumlahDPT: 176367056, jumlahTPS: 519920, jumlahKabKota: 471, jumlahProvinsi: 33, catatan: 'Sumber: KPU RI, Pilpres 8 Juli 2009' },
    { tahun: 2009, jenisPemilu: 'DPR',      partisipasi: 70.99, suaraTidakSah: 5.07,  suaraSah: 94.93, jumlahDPT: 176367056, jumlahTPS: 519920, jumlahKabKota: 471, jumlahProvinsi: 33, catatan: 'Sumber: KPU RI, Pileg 9 April 2009' },
    { tahun: 2004, jenisPemilu: 'Presiden', partisipasi: 78.23, suaraTidakSah: 3.47,  suaraSah: 96.53, jumlahDPT: 153320240, jumlahTPS: 584890, jumlahKabKota: 440, jumlahProvinsi: 32, catatan: 'Sumber: KPU RI, Pilpres Putaran I 5 Juli 2004' },
    { tahun: 2004, jenisPemilu: 'DPR',      partisipasi: 84.07, suaraTidakSah: 9.49,  suaraSah: 90.51, jumlahDPT: 153320240, jumlahTPS: 584890, jumlahKabKota: 440, jumlahProvinsi: 32, catatan: 'Sumber: KPU RI, Pileg 5 April 2004' },
    { tahun: 1999, jenisPemilu: 'Presiden', partisipasi: 92.74, suaraTidakSah: null,  suaraSah: null,  jumlahDPT: 118159009, jumlahTPS: 299288, jumlahKabKota: 319, jumlahProvinsi: 27, catatan: 'Presiden dipilih MPR; partisipasi mengacu ke Pemilu DPR 1999. Sumber: KPU RI' },
    { tahun: 1999, jenisPemilu: 'DPR',      partisipasi: 92.74, suaraTidakSah: 8.45,  suaraSah: 91.55, jumlahDPT: 118159009, jumlahTPS: 299288, jumlahKabKota: 319, jumlahProvinsi: 27, catatan: 'Sumber: KPU RI, Pemilu 7 Juni 1999' },
  ];

  try {
    let created = 0, skipped = 0;
    for (const item of SEED) {
      const exists = await prisma.electionData.findUnique({
        where: { tahun_jenisPemilu: { tahun: item.tahun, jenisPemilu: item.jenisPemilu } },
      });
      if (exists) { skipped++; continue; }
      await prisma.electionData.create({
        data: { ...item, jumlahDPT: item.jumlahDPT != null ? BigInt(item.jumlahDPT) : null },
      });
      created++;
    }

    await logAction({
      action: 'CREATE', entity: 'ElectionData', entityId: 'seed',
      userId: req.user?.id, userName: req.user?.name || '',
      details: `Seeded ${created} rows, skipped ${skipped}`,
    });

    return ok(res, { created, skipped, total: SEED.length });
  } catch (err) {
    console.error(err);
    return fail(res, 500, 'Gagal menjalankan seed data pemilu');
  }
};
