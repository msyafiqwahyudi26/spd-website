const prisma = require('../lib/prisma');
const { log } = require('../lib/logger');
const { ok, fail } = require('../lib/response');
const { validate, v } = require('../lib/validate');

function toPublic(row) {
  return {
    id:        row.id,
    value:     row.value,
    label:     row.label,
    sortOrder: row.sortOrder,
  };
}

exports.list = async (req, res, next) => {
  try {
    const rows = await prisma.stat.findMany({
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
    });
    return ok(res, rows.map(toPublic));
  } catch (err) {
    next(err);
  }
};

exports.create = async (req, res, next) => {
  try {
    const { errors, data } = validate(req.body, {
      value: v.string({ required: true, max: 32 }),
      label: v.string({ required: true, max: 120 }),
    });
    if (errors) return fail(res, 400, errors);

    const maxOrder = await prisma.stat.aggregate({ _max: { sortOrder: true } });
    const sortOrder = (maxOrder._max.sortOrder ?? -1) + 1;

    const created = await prisma.stat.create({
      data: { value: data.value, label: data.label, sortOrder },
    });

    log('stat_create', 'stat', {
      entityId: created.id,
      userId:   req.user?.userId,
      userName: req.user?.name || '',
      details:  `${data.value} — ${data.label}`,
    });

    return ok(res, toPublic(created), 201);
  } catch (err) {
    next(err);
  }
};

exports.update = async (req, res, next) => {
  try {
    const { id } = req.params;
    const existing = await prisma.stat.findUnique({ where: { id } });
    if (!existing) return fail(res, 404, 'Stat tidak ditemukan');

    const { errors, data } = validate(req.body, {
      value: v.string({ max: 32 }),
      label: v.string({ max: 120 }),
    });
    if (errors) return fail(res, 400, errors);

    const updated = await prisma.stat.update({
      where: { id },
      data: {
        value: data.value !== undefined ? data.value : existing.value,
        label: data.label !== undefined ? data.label : existing.label,
      },
    });

    log('stat_update', 'stat', {
      entityId: id,
      userId:   req.user?.userId,
      userName: req.user?.name || '',
      details:  `${updated.value} — ${updated.label}`,
    });

    return ok(res, toPublic(updated));
  } catch (err) {
    next(err);
  }
};

exports.remove = async (req, res, next) => {
  try {
    const { id } = req.params;
    const existing = await prisma.stat.findUnique({ where: { id } });
    if (!existing) return fail(res, 404, 'Stat tidak ditemukan');

    await prisma.stat.delete({ where: { id } });

    log('stat_delete', 'stat', {
      entityId: id,
      userId:   req.user?.userId,
      userName: req.user?.name || '',
      details:  `${existing.value} — ${existing.label}`,
    });

    return ok(res, { message: 'Stat dihapus' });
  } catch (err) {
    next(err);
  }
};
