const prisma = require('../lib/prisma');
const { log } = require('../lib/logger');
const { ok, fail } = require('../lib/response');
const { validate, v } = require('../lib/validate');

const toPublic = (row) => ({ id: row.id, text: row.text, sortOrder: row.sortOrder });

exports.list = async (req, res, next) => {
  try {
    const rows = await prisma.missionItem.findMany({
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
    });
    return ok(res, rows.map(toPublic));
  } catch (err) { next(err); }
};

exports.create = async (req, res, next) => {
  try {
    const { errors, data } = validate(req.body, { text: v.string({ required: true, max: 500 }) });
    if (errors) return fail(res, 400, errors);
    const maxOrder = await prisma.missionItem.aggregate({ _max: { sortOrder: true } });
    const sortOrder = (maxOrder._max.sortOrder ?? -1) + 1;
    const created = await prisma.missionItem.create({ data: { text: data.text, sortOrder } });
    log('mission_create', 'mission', {
      entityId: created.id, userId: req.user?.userId, userName: req.user?.name || '',
      details: data.text.slice(0, 80),
    });
    return ok(res, toPublic(created), 201);
  } catch (err) { next(err); }
};

exports.update = async (req, res, next) => {
  try {
    const { id } = req.params;
    const existing = await prisma.missionItem.findUnique({ where: { id } });
    if (!existing) return fail(res, 404, 'Misi tidak ditemukan');
    const { errors, data } = validate(req.body, { text: v.string({ max: 500 }) });
    if (errors) return fail(res, 400, errors);
    const updated = await prisma.missionItem.update({
      where: { id },
      data: { text: data.text !== undefined ? data.text : existing.text },
    });
    log('mission_update', 'mission', {
      entityId: id, userId: req.user?.userId, userName: req.user?.name || '',
      details: updated.text.slice(0, 80),
    });
    return ok(res, toPublic(updated));
  } catch (err) { next(err); }
};

exports.remove = async (req, res, next) => {
  try {
    const { id } = req.params;
    const existing = await prisma.missionItem.findUnique({ where: { id } });
    if (!existing) return fail(res, 404, 'Misi tidak ditemukan');
    await prisma.missionItem.delete({ where: { id } });
    log('mission_delete', 'mission', {
      entityId: id, userId: req.user?.userId, userName: req.user?.name || '',
      details: existing.text.slice(0, 80),
    });
    return ok(res, { message: 'Misi dihapus' });
  } catch (err) { next(err); }
};
