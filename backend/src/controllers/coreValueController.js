const prisma = require('../lib/prisma');
const { log } = require('../lib/logger');
const { ok, fail } = require('../lib/response');
const { validate, v } = require('../lib/validate');

// Mirrors approachController's icon vocabulary. Keep in sync with the
// frontend icon registry in src/data/approachIcons.jsx.
const ALLOWED_ICONS = [
  'collaboration', 'data', 'youth', 'policy',
  'megaphone', 'eye', 'vote', 'lightbulb',
  'book', 'globe', 'shield', 'users',
];
function normalizeIcon(val) {
  return ALLOWED_ICONS.includes(val) ? val : 'collaboration';
}

const toPublic = (r) => ({ id: r.id, iconKey: r.iconKey, iconUrl: r.iconUrl || '', title: r.title, description: r.description, sortOrder: r.sortOrder });

exports.list = async (req, res, next) => {
  try {
    const rows = await prisma.coreValue.findMany({
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
    const maxOrder = await prisma.coreValue.aggregate({ _max: { sortOrder: true } });
    const sortOrder = (maxOrder._max.sortOrder ?? -1) + 1;
    const iconUrl = typeof req.body.iconUrl === 'string' ? req.body.iconUrl.trim().slice(0, 500) : '';
    const created = await prisma.coreValue.create({
      data: { iconKey, iconUrl, title: data.title, description: data.description || '', sortOrder },
    });
    log('corevalue_create', 'corevalue', {
      entityId: created.id, userId: req.user?.userId, userName: req.user?.name || '',
      details: `${iconKey} — ${data.title}`,
    });
    return ok(res, toPublic(created), 201);
  } catch (err) { next(err); }
};

exports.update = async (req, res, next) => {
  try {
    const { id } = req.params;
    const existing = await prisma.coreValue.findUnique({ where: { id } });
    if (!existing) return fail(res, 404, 'Nilai tidak ditemukan');
    const { errors, data } = validate(req.body, {
      title:       v.string({ max: 200 }),
      description: v.string({ max: 1000 }),
    });
    if (errors) return fail(res, 400, errors);
    const updated = await prisma.coreValue.update({
      where: { id },
      data: {
        iconKey:     req.body.iconKey !== undefined ? normalizeIcon(req.body.iconKey) : existing.iconKey,
        iconUrl:     req.body.iconUrl !== undefined ? req.body.iconUrl.trim().slice(0, 500) : (existing.iconUrl || ''),
        title:       data.title       !== undefined ? data.title       : existing.title,
        description: data.description !== undefined ? data.description : existing.description,
      },
    });
    log('corevalue_update', 'corevalue', {
      entityId: id, userId: req.user?.userId, userName: req.user?.name || '',
      details: `${updated.iconKey} — ${updated.title}`,
    });
    return ok(res, toPublic(updated));
  } catch (err) { next(err); }
};

exports.remove = async (req, res, next) => {
  try {
    const { id } = req.params;
    const existing = await prisma.coreValue.findUnique({ where: { id } });
    if (!existing) return fail(res, 404, 'Nilai tidak ditemukan');
    await prisma.coreValue.delete({ where: { id } });
    log('corevalue_delete', 'corevalue', {
      entityId: id, userId: req.user?.userId, userName: req.user?.name || '',
      details: `${existing.iconKey} — ${existing.title}`,
    });
    return ok(res, { message: 'Nilai dihapus' });
  } catch (err) { next(err); }
};
