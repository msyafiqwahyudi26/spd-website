const prisma = require('../lib/prisma');
const { log } = require('../lib/logger');
const { ok, fail } = require('../lib/response');

const safeJson = (v, fallback = []) => {
  if (Array.isArray(v)) return v;
  try { return JSON.parse(v) || fallback; } catch { return fallback; }
};

const toSlug = (str) =>
  str
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 80) || 'infografis';

async function makeUniqueSlug(base, excludeId = null) {
  let slug = base;
  let n = 1;
  while (true) {
    const existing = await prisma.infografis.findUnique({ where: { slug } });
    if (!existing || existing.id === excludeId) return slug;
    slug = `${base}-${n++}`;
  }
}

const toPublic = (r) => ({
  id:          r.id,
  slug:        r.slug,
  title:       r.title,
  imageUrl:    r.imageUrl,
  caption:     r.caption,
  description: r.description || '',
  slides:      safeJson(r.slides),
  sortOrder:   r.sortOrder,
  createdAt:   r.createdAt,
});

exports.list = async (req, res, next) => {
  try {
    const rows = await prisma.infografis.findMany({
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
    });
    return ok(res, rows.map(toPublic));
  } catch (err) { next(err); }
};

exports.getBySlug = async (req, res, next) => {
  try {
    const row = await prisma.infografis.findUnique({ where: { slug: req.params.slug } });
    if (!row) return fail(res, 404, 'Infografis tidak ditemukan');
    return ok(res, toPublic(row));
  } catch (err) { next(err); }
};

exports.create = async (req, res, next) => {
  try {
    const title       = (req.body.title       || '').trim().slice(0, 200);
    const imageUrl    = (req.body.imageUrl    || '').trim().slice(0, 2000);
    const caption     = (req.body.caption     || '').trim().slice(0, 500);
    const description = (req.body.description || '').trim().slice(0, 2000);
    const slides      = JSON.stringify(safeJson(req.body.slides));

    if (!title || !imageUrl) return fail(res, 400, 'Judul dan gambar cover diperlukan');

    const slugBase = toSlug(title);
    const slug     = await makeUniqueSlug(slugBase);

    const max = await prisma.infografis.aggregate({ _max: { sortOrder: true } });
    const sortOrder = (max._max.sortOrder ?? -1) + 1;

    const row = await prisma.infografis.create({
      data: { title, slug, imageUrl, caption, description, slides, sortOrder },
    });
    log('infografis_create', 'infografis', {
      entityId: row.id,
      userId: req.user?.userId,
      userName: req.user?.name || '',
      details: title,
    });
    return ok(res, toPublic(row), 201);
  } catch (err) { next(err); }
};

exports.update = async (req, res, next) => {
  try {
    const { id } = req.params;
    const existing = await prisma.infografis.findUnique({ where: { id } });
    if (!existing) return fail(res, 404, 'Infografis tidak ditemukan');

    const data = {};
    if (typeof req.body.title       === 'string') data.title       = req.body.title.trim().slice(0, 200);
    if (typeof req.body.imageUrl    === 'string') data.imageUrl    = req.body.imageUrl.trim().slice(0, 2000);
    if (typeof req.body.caption     === 'string') data.caption     = req.body.caption.trim().slice(0, 500);
    if (typeof req.body.description === 'string') data.description = req.body.description.trim().slice(0, 2000);
    if (req.body.slides !== undefined)            data.slides      = JSON.stringify(safeJson(req.body.slides));
    if (typeof req.body.sortOrder   === 'number') data.sortOrder   = req.body.sortOrder;

    // Re-generate slug if title changed and no custom slug provided
    if (data.title && data.title !== existing.title) {
      data.slug = await makeUniqueSlug(toSlug(data.title), id);
    }

    const row = await prisma.infografis.update({ where: { id }, data });
    log('infografis_update', 'infografis', {
      entityId: id,
      userId: req.user?.userId,
      userName: req.user?.name || '',
      details: existing.title,
    });
    return ok(res, toPublic(row));
  } catch (err) { next(err); }
};

exports.remove = async (req, res, next) => {
  try {
    const { id } = req.params;
    const existing = await prisma.infografis.findUnique({ where: { id } });
    if (!existing) return fail(res, 404, 'Infografis tidak ditemukan');
    await prisma.infografis.delete({ where: { id } });
    log('infografis_delete', 'infografis', {
      entityId: id,
      userId: req.user?.userId,
      userName: req.user?.name || '',
      details: existing.title,
    });
    return ok(res, { message: 'Infografis dihapus' });
  } catch (err) { next(err); }
};
