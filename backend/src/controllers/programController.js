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

const toPublic = (r) => ({
  id: r.id,
  title: r.title,
  slug: r.slug,
  description: r.description,
  image: r.image,
  link: r.link,
  sortOrder: r.sortOrder,
});

exports.list = async (req, res, next) => {
  try {
    const rows = await prisma.program.findMany({
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
    return ok(res, toPublic(row));
  } catch (err) { next(err); }
};

exports.create = async (req, res, next) => {
  try {
    const { errors, data } = validate(req.body, {
      title:       v.string({ required: true, max: 300 }),
      description: v.string({ max: 2000 }),
      image:       v.string({ max: 500 }),
      link:        v.string({ max: 500 }),
    });
    if (errors) return fail(res, 400, errors);

    const maxOrder = await prisma.program.aggregate({ _max: { sortOrder: true } });
    const sortOrder = (maxOrder._max.sortOrder ?? -1) + 1;

    const created = await prisma.program.create({
      data: {
        title: data.title,
        slug: makeSlug(data.title),
        description: data.description || '',
        image: data.image || null,
        link:  data.link  || null,
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
      description: v.string({ max: 2000 }),
      image:       v.string({ max: 500 }),
      link:        v.string({ max: 500 }),
    });
    if (errors) return fail(res, 400, errors);

    const updated = await prisma.program.update({
      where: { id },
      data: {
        title:       data.title       !== undefined ? data.title       : existing.title,
        description: data.description !== undefined ? data.description : existing.description,
        image:       data.image       !== undefined ? (data.image || null) : existing.image,
        link:        data.link        !== undefined ? (data.link  || null) : existing.link,
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
