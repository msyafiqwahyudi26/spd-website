const prisma = require('../lib/prisma');
const { log } = require('../lib/logger');
const { ok, fail } = require('../lib/response');
const { validate, v } = require('../lib/validate');

function toPublic(row) {
  return {
    id:         row.id,
    name:       row.name,
    logoUrl:    row.logoUrl,
    websiteUrl: row.websiteUrl,
    sortOrder:  row.sortOrder,
  };
}

exports.list = async (req, res, next) => {
  try {
    const rows = await prisma.partner.findMany({
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
      name:       v.string({ required: true, max: 200 }),
      logoUrl:    v.string({ max: 500 }),
      websiteUrl: v.string({ max: 500 }),
    });
    if (errors) return fail(res, 400, errors);

    const maxOrder = await prisma.partner.aggregate({ _max: { sortOrder: true } });
    const sortOrder = (maxOrder._max.sortOrder ?? -1) + 1;

    const created = await prisma.partner.create({
      data: {
        name:       data.name,
        logoUrl:    data.logoUrl    || null,
        websiteUrl: data.websiteUrl || null,
        sortOrder,
      },
    });

    log('partner_create', 'partner', {
      entityId: created.id,
      userId:   req.user?.userId,
      userName: req.user?.name || '',
      details:  data.name,
    });

    return ok(res, toPublic(created), 201);
  } catch (err) {
    next(err);
  }
};

exports.update = async (req, res, next) => {
  try {
    const { id } = req.params;
    const existing = await prisma.partner.findUnique({ where: { id } });
    if (!existing) return fail(res, 404, 'Mitra tidak ditemukan');

    const { errors, data } = validate(req.body, {
      name:       v.string({ max: 200 }),
      logoUrl:    v.string({ max: 500 }),
      websiteUrl: v.string({ max: 500 }),
    });
    if (errors) return fail(res, 400, errors);

    const updated = await prisma.partner.update({
      where: { id },
      data: {
        name:       data.name       !== undefined ? data.name       : existing.name,
        logoUrl:    data.logoUrl    !== undefined ? (data.logoUrl    || null) : existing.logoUrl,
        websiteUrl: data.websiteUrl !== undefined ? (data.websiteUrl || null) : existing.websiteUrl,
      },
    });

    log('partner_update', 'partner', {
      entityId: id,
      userId:   req.user?.userId,
      userName: req.user?.name || '',
      details:  updated.name,
    });

    return ok(res, toPublic(updated));
  } catch (err) {
    next(err);
  }
};

exports.remove = async (req, res, next) => {
  try {
    const { id } = req.params;
    const existing = await prisma.partner.findUnique({ where: { id } });
    if (!existing) return fail(res, 404, 'Mitra tidak ditemukan');

    await prisma.partner.delete({ where: { id } });

    log('partner_delete', 'partner', {
      entityId: id,
      userId:   req.user?.userId,
      userName: req.user?.name || '',
      details:  existing.name,
    });

    return ok(res, { message: 'Mitra dihapus' });
  } catch (err) {
    next(err);
  }
};
