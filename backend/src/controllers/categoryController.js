const prisma = require('../lib/prisma');
const { log } = require('../lib/logger');
const { ok, fail } = require('../lib/response');

const ALLOWED_COLORS = new Set([
  'text-slate-500', 'text-orange-500', 'text-teal-500',
  'text-blue-500', 'text-red-500', 'text-emerald-500',
]);
const ALLOWED_BGS = new Set([
  'bg-slate-100', 'bg-orange-50', 'bg-teal-50',
  'bg-blue-50', 'bg-red-50', 'bg-emerald-50',
]);

function toPublic(row) {
  return {
    id:    row.id,
    value: row.value,
    color: row.color,
    bg:    row.bg,
  };
}

exports.getAll = async (req, res, next) => {
  try {
    const rows = await prisma.category.findMany({
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
    });
    return ok(res, rows.map(toPublic));
  } catch (err) {
    next(err);
  }
};

exports.create = async (req, res, next) => {
  try {
    const value = (req.body.value || '').trim().toUpperCase().slice(0, 64);
    const color = typeof req.body.color === 'string' ? req.body.color : 'text-slate-500';
    const bg    = typeof req.body.bg    === 'string' ? req.body.bg    : 'bg-slate-100';

    if (!value) return fail(res, 400, 'Nama kategori diperlukan');
    if (!ALLOWED_COLORS.has(color) || !ALLOWED_BGS.has(bg)) {
      return fail(res, 400, 'Warna tidak valid');
    }

    const agg = await prisma.category.aggregate({ _max: { sortOrder: true } });
    const nextOrder = (agg._max.sortOrder ?? -1) + 1;

    const created = await prisma.category.create({
      data: { value, color, bg, sortOrder: nextOrder },
    });

    log('create_category', 'category', {
      entityId: created.id,
      userId:   req.user?.userId,
      userName: req.user?.name || '',
      details:  value,
    });

    return ok(res, toPublic(created), 201);
  } catch (err) {
    next(err);
  }
};

exports.remove = async (req, res, next) => {
  try {
    const { id } = req.params;
    const existing = await prisma.category.findUnique({ where: { id } });
    if (!existing) return fail(res, 404, 'Kategori tidak ditemukan');

    await prisma.category.delete({ where: { id } });

    log('delete_category', 'category', {
      entityId: id,
      userId:   req.user?.userId,
      userName: req.user?.name || '',
      details:  existing.value,
    });

    return ok(res, { message: 'Kategori dihapus' });
  } catch (err) {
    next(err);
  }
};
