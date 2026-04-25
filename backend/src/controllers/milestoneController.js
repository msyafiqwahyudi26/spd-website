const prisma = require('../lib/prisma');
const { log } = require('../lib/logger');
const { ok, fail } = require('../lib/response');
const { validate, v } = require('../lib/validate');

function toPublic(row) {
  return {
    id:          row.id,
    year:        row.year,
    tag:         row.tag,
    title:       row.title,
    description: row.description,
    sortOrder:   row.sortOrder,
  };
}

exports.list = async (req, res, next) => {
  try {
    const rows = await prisma.milestone.findMany({
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
    });
    return ok(res, rows.map(toPublic));
  } catch (err) { next(err); }
};

exports.create = async (req, res, next) => {
  try {
    const { errors, data } = validate(req.body, {
      year:        v.string({ required: true, max: 32 }),
      tag:         v.string({ max: 32 }),
      title:       v.string({ required: true, max: 200 }),
      description: v.string({ max: 2000 }),
    });
    if (errors) return fail(res, 400, errors);

    const maxOrder = await prisma.milestone.aggregate({ _max: { sortOrder: true } });
    const sortOrder = (maxOrder._max.sortOrder ?? -1) + 1;

    const created = await prisma.milestone.create({
      data: {
        year:        data.year,
        tag:         data.tag || 'TONGGAK',
        title:       data.title,
        description: data.description || '',
        sortOrder,
      },
    });

    log('milestone_create', 'milestone', {
      entityId: created.id,
      userId:   req.user?.userId,
      userName: req.user?.name || '',
      details:  `${data.year} — ${data.title}`,
    });

    return ok(res, toPublic(created), 201);
  } catch (err) { next(err); }
};

exports.update = async (req, res, next) => {
  try {
    const { id } = req.params;
    const existing = await prisma.milestone.findUnique({ where: { id } });
    if (!existing) return fail(res, 404, 'Tonggak tidak ditemukan');

    const { errors, data } = validate(req.body, {
      year:        v.string({ max: 32 }),
      tag:         v.string({ max: 32 }),
      title:       v.string({ max: 200 }),
      description: v.string({ max: 2000 }),
    });
    if (errors) return fail(res, 400, errors);

    const updated = await prisma.milestone.update({
      where: { id },
      data: {
        year:        data.year        !== undefined ? data.year        : existing.year,
        tag:         data.tag         !== undefined ? data.tag         : existing.tag,
        title:       data.title       !== undefined ? data.title       : existing.title,
        description: data.description !== undefined ? data.description : existing.description,
      },
    });

    log('milestone_update', 'milestone', {
      entityId: id,
      userId:   req.user?.userId,
      userName: req.user?.name || '',
      details:  `${updated.year} — ${updated.title}`,
    });

    return ok(res, toPublic(updated));
  } catch (err) { next(err); }
};

exports.remove = async (req, res, next) => {
  try {
    const { id } = req.params;
    const existing = await prisma.milestone.findUnique({ where: { id } });
    if (!existing) return fail(res, 404, 'Tonggak tidak ditemukan');

    await prisma.milestone.delete({ where: { id } });

    log('milestone_delete', 'milestone', {
      entityId: id,
      userId:   req.user?.userId,
      userName: req.user?.name || '',
      details:  `${existing.year} — ${existing.title}`,
    });

    return ok(res, { message: 'Tonggak dihapus' });
  } catch (err) { next(err); }
};
