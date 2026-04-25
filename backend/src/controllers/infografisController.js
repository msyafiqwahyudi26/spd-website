const prisma = require('../lib/prisma');
const { log } = require('../lib/logger');
const { ok, fail } = require('../lib/response');

const toPublic = (r) => ({
  id: r.id,
  title: r.title,
  imageUrl: r.imageUrl,
  caption: r.caption,
  sortOrder: r.sortOrder,
});

exports.list = async (req, res, next) => {
  try {
    const rows = await prisma.infografis.findMany({
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
    });
    return ok(res, rows.map(toPublic));
  } catch (err) { next(err); }
};

exports.create = async (req, res, next) => {
  try {
    const title    = (req.body.title    || '').trim().slice(0, 200);
    const imageUrl = (req.body.imageUrl || '').trim().slice(0, 2000);
    const caption  = (req.body.caption  || '').trim().slice(0, 500);
    if (!title || !imageUrl) return fail(res, 400, 'Judul dan URL gambar diperlukan');

    const max = await prisma.infografis.aggregate({ _max: { sortOrder: true } });
    const sortOrder = (max._max.sortOrder ?? -1) + 1;

    const row = await prisma.infografis.create({
      data: { title, imageUrl, caption, sortOrder },
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
    if (typeof req.body.title    === 'string') data.title    = req.body.title.trim().slice(0, 200);
    if (typeof req.body.imageUrl === 'string') data.imageUrl = req.body.imageUrl.trim().slice(0, 2000);
    if (typeof req.body.caption  === 'string') data.caption  = req.body.caption.trim().slice(0, 500);
    if (typeof req.body.sortOrder === 'number') data.sortOrder = req.body.sortOrder;

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
