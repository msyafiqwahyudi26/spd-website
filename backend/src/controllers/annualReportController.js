const prisma = require('../lib/prisma');
const { log } = require('../lib/logger');
const { ok, fail } = require('../lib/response');
const { validate, v } = require('../lib/validate');

function toPublic(row) {
  return {
    id:      row.id,
    year:    row.year,
    title:   row.title,
    summary: row.summary,
    fileUrl: row.fileUrl,
  };
}

exports.list = async (req, res, next) => {
  try {
    const rows = await prisma.annualReport.findMany({
      orderBy: [{ year: 'desc' }],
    });
    return ok(res, rows.map(toPublic));
  } catch (err) { next(err); }
};

exports.create = async (req, res, next) => {
  try {
    const year = Number.parseInt(req.body?.year, 10);
    if (!Number.isFinite(year) || year < 1900 || year > 2100) {
      return fail(res, 400, 'Tahun tidak valid');
    }

    const { errors, data } = validate(req.body, {
      title:   v.string({ required: true, max: 200 }),
      summary: v.string({ max: 2000 }),
      fileUrl: v.string({ max: 500 }),
    });
    if (errors) return fail(res, 400, errors);

    const created = await prisma.annualReport.create({
      data: {
        year,
        title:   data.title,
        summary: data.summary || '',
        fileUrl: data.fileUrl || null,
      },
    });

    log('report_create', 'annual_report', {
      entityId: created.id,
      userId:   req.user?.userId,
      userName: req.user?.name || '',
      details:  `${year} — ${data.title}`,
    });

    return ok(res, toPublic(created), 201);
  } catch (err) {
    if (err && err.code === 'P2002') {
      return fail(res, 409, 'Laporan untuk tahun ini sudah ada');
    }
    next(err);
  }
};

exports.update = async (req, res, next) => {
  try {
    const { id } = req.params;
    const existing = await prisma.annualReport.findUnique({ where: { id } });
    if (!existing) return fail(res, 404, 'Laporan tidak ditemukan');

    const { errors, data } = validate(req.body, {
      title:   v.string({ max: 200 }),
      summary: v.string({ max: 2000 }),
      fileUrl: v.string({ max: 500 }),
    });
    if (errors) return fail(res, 400, errors);

    let year = existing.year;
    if (req.body?.year !== undefined) {
      const parsed = Number.parseInt(req.body.year, 10);
      if (!Number.isFinite(parsed) || parsed < 1900 || parsed > 2100) {
        return fail(res, 400, 'Tahun tidak valid');
      }
      year = parsed;
    }

    const updated = await prisma.annualReport.update({
      where: { id },
      data: {
        year,
        title:   data.title   !== undefined ? data.title   : existing.title,
        summary: data.summary !== undefined ? data.summary : existing.summary,
        fileUrl: data.fileUrl !== undefined ? (data.fileUrl || null) : existing.fileUrl,
      },
    });

    log('report_update', 'annual_report', {
      entityId: id,
      userId:   req.user?.userId,
      userName: req.user?.name || '',
      details:  `${year} — ${updated.title}`,
    });

    return ok(res, toPublic(updated));
  } catch (err) {
    if (err && err.code === 'P2002') {
      return fail(res, 409, 'Laporan untuk tahun ini sudah ada');
    }
    next(err);
  }
};

exports.remove = async (req, res, next) => {
  try {
    const { id } = req.params;
    const existing = await prisma.annualReport.findUnique({ where: { id } });
    if (!existing) return fail(res, 404, 'Laporan tidak ditemukan');

    await prisma.annualReport.delete({ where: { id } });

    log('report_delete', 'annual_report', {
      entityId: id,
      userId:   req.user?.userId,
      userName: req.user?.name || '',
      details:  `${existing.year} — ${existing.title}`,
    });

    return ok(res, { message: 'Laporan dihapus' });
  } catch (err) { next(err); }
};
