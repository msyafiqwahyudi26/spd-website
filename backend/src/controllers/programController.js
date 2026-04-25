const prisma = require('../lib/prisma');
const { log } = require('../lib/logger');
const { ok, fail } = require('../lib/response');
const { validate, v } = require('../lib/validate');

function makeSlug(title) {
  return (
    title.toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim() +
    '-' + Date.now()
  );
}

function safeJson(val, fallback = []) {
  if (Array.isArray(val)) return val;
  if (!val || val === '' || val === 'null') return fallback;
  try { return JSON.parse(val); } catch { return fallback; }
}

const toPublic = (r) => ({
  id:          r.id,
  title:       r.title,
  slug:        r.slug,
  status:      r.status ?? 'published',
  category:    r.category ?? '',
  description: r.description,
  fullContent: safeJson(r.fullContent),
  image:       r.image,
  gallery:     safeJson(r.gallery),
  link:        r.link,
  sortOrder:   r.sortOrder,
  createdAt:   r.createdAt,
});

/* ── Public list — only published ─────────────────────────────────────────── */
exports.list = async (req, res, next) => {
  try {
    const isAdmin = req.user?.role === 'admin' || req.user?.role === 'publisher';
    const where = isAdmin ? {} : { status: 'published' };
    const rows = await prisma.program.findMany({
      where,
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
    });
    return ok(res, rows.map(toPublic));
  } catch (err) { next(err); }
};

exports.getOne = async (req, res, next) => {
  try {
    const { id } = req.params;
    const row = await prisma.program.findFirst({
      where: { OR: [{ id }, { slug: id }] },
    });
    if (!row) return fail(res, 404, 'Program tidak ditemukan');
    // Only published programs accessible without auth
    if (row.status === 'draft' && !(req.user?.role === 'admin' || req.user?.role === 'publisher')) {
      return fail(res, 404, 'Program tidak ditemukan');
    }
    return ok(res, toPublic(row));
  } catch (err) { next(err); }
};

exports.create = async (req, res, next) => {
  try {
    const { errors, data } = validate(req.body, {
      title:       v.string({ required: true, max: 300 }),
      status:      v.string({ max: 20 }),
      category:    v.string({ max: 100 }),
      description: v.string({ max: 4000 }),
      fullContent: v.string({ max: 50000 }),
      image:       v.string({ max: 500 }),
      gallery:     v.string({ max: 10000 }),
      link:        v.string({ max: 500 }),
    });
    if (errors) return fail(res, 400, errors);

    const maxOrder = await prisma.program.aggregate({ _max: { sortOrder: true } });
    const sortOrder = (maxOrder._max.sortOrder ?? -1) + 1;

    const created = await prisma.program.create({
      data: {
        title:       data.title,
        slug:        makeSlug(data.title),
        status:      data.status  || 'published',
        category:    data.category || '',
        description: data.description || '',
        fullContent: data.fullContent || '[]',
        image:       data.image || null,
        gallery:     data.gallery || '[]',
        link:        data.link  || null,
        sortOrder,
      },
    });

    log('program_create', 'program', {
      entityId: created.id,
      userId:   req.user?.userId,
      userName: req.user?.name || '',
      details:  data.title,
    });

    return ok(res, toPublic(created), 201);
  } catch (err) { next(err); }
};

exports.update = async (req, res, next) => {
  try {
    const { id } = req.params;
    const existing = await prisma.program.findUnique({ where: { id } });
    if (!existing) return fail(res, 404, 'Program tidak ditemukan');

    const { errors, data } = validate(req.body, {
      title:       v.string({ max: 300 }),
      status:      v.string({ max: 20 }),
      category:    v.string({ max: 100 }),
      description: v.string({ max: 4000 }),
      fullContent: v.string({ max: 50000 }),
      image:       v.string({ max: 500 }),
      gallery:     v.string({ max: 10000 }),
      link:        v.string({ max: 500 }),
    });
    if (errors) return fail(res, 400, errors);

    const updated = await prisma.program.update({
      where: { id },
      data: {
        title:       data.title       !== undefined ? data.title       : existing.title,
        status:      data.status      !== undefined ? data.status      : existing.status,
        category:    data.category    !== undefined ? data.category    : existing.category,
        description: data.description !== undefined ? data.description : existing.description,
        fullContent: data.fullContent !== undefined ? data.fullContent : existing.fullContent,
        image:       data.image       !== undefined ? (data.image || null) : existing.image,
        gallery:     data.gallery     !== undefined ? data.gallery     : existing.gallery,
        link:        data.link        !== undefined ? (data.link || null) : existing.link,
      },
    });

    log('program_update', 'program', {
      entityId: id,
      userId:   req.user?.userId,
      userName: req.user?.name || '',
      details:  updated.title,
    });

    return ok(res, toPublic(updated));
  } catch (err) { next(err); }
};

exports.remove = async (req, res, next) => {
  try {
    const { id } = req.params;
    const existing = await prisma.program.findUnique({ where: { id } });
    if (!existing) return fail(res, 404, 'Program tidak ditemukan');

    await prisma.program.delete({ where: { id } });

    log('program_delete', 'program', {
      entityId: id,
      userId:   req.user?.userId,
      userName: req.user?.name || '',
      details:  existing.title,
    });

    return ok(res, { message: 'Program dihapus' });
  } catch (err) { next(err); }
};
