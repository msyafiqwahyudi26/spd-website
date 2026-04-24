const prisma = require('../lib/prisma');
const { log } = require('../lib/logger');
const { ok, fail } = require('../lib/response');
const { validate, v } = require('../lib/validate');

// Keep this list aligned with the frontend icon registry. Admin picks one.
const ALLOWED_ICONS = ['collaboration', 'data', 'youth', 'policy'];

function normalizeIcon(val) {
  return ALLOWED_ICONS.includes(val) ? val : 'collaboration';
}

const toPublic = (r) => ({ id: r.id, iconKey: r.iconKey, title: r.title, description: r.description, sortOrder: r.sortOrder });

exports.list = async (req, res, next) => {
  try {
    const rows = await prisma.approach.findMany({
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
    });
    return ok(res, rows.map(toPublic));
  } catch (err) { next(err); }
};

exports.create = async (req, res, next) => {
  try {
    const { errors, data } = validate(req.body, {
      title:       v.string({ required: true, max: 200 }),
      description: v.string({ max: 1000 }),
    });
    if (errors) return fail(res, 400, errors);
    const iconKey = normalizeIcon(req.body.iconKey);

    const maxOrder = await prisma.approach.aggregate({ _max: { sortOrder: true } });
    const sortOrder = (maxOrder._max.sortOrder ?? -1) + 1;

    const created = await prisma.approach.create({
      data: { iconKey, title: data.title, description: data.description || '', sortOrder },
    });

    log('approach_create', 'approach', {
      entityId: created.id, userId: req.user?.userId, userName: req.user?.name || '',
      details: `${iconKey} — ${data.title}`,
    });

    return ok(res, toPublic(created), 201);
  } catch (err) { next(err); }
};

exports.update = async (req, res, next) => {
  try {
    const { id } = req.params;
    const existing = await prisma.approach.findUnique({ where: { id } });
    if (!existing) return fail(res, 404, 'Pendekatan tidak ditemukan');
    const { errors, data } = validate(req.body, {
      title:       v.string({ max: 200 }),
      description: v.string({ max: 1000 }),
    });
    if (errors) return fail(res, 400, errors);

    const updated = await prisma.approach.update({
      where: { id },
      data: {
        iconKey:     req.body.iconKey !== undefined ? normalizeIcon(req.body.iconKey) : existing.iconKey,
        title:       data.title       !== undefined ? data.title       : existing.title,
        description: data.description !== undefined ? data.description : existing.description,
      },
    });

    log('approach_update', 'approach', {
      entityId: id, userId: req.user?.userId, userName: req.user?.name || '',
      details: `${updated.iconKey} — ${updated.title}`,
    });

    return ok(res, toPublic(updated));
  } catch (err) { next(err); }
};

exports.remove = async (req, res, next) => {
  try {
    const { id } = req.params;
    const existing = await prisma.approach.findUnique({ where: { id } });
    if (!existing) return fail(res, 404, 'Pendekatan tidak ditemukan');
    await prisma.approach.delete({ where: { id } });
    log('approach_delete', 'approach', {
      entityId: id, userId: req.user?.userId, userName: req.user?.name || '',
      details: `${existing.iconKey} — ${existing.title}`,
    });
    return ok(res, { message: 'Pendekatan dihapus' });
  } catch (err) { next(err); }
};

exports.ALLOWED_ICONS = ALLOWED_ICONS;
