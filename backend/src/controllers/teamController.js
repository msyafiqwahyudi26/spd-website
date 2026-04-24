const prisma = require('../lib/prisma');
const { log } = require('../lib/logger');
const { ok, fail } = require('../lib/response');
const { validate, v } = require('../lib/validate');

function toPublic(row) {
  return {
    id:        row.id,
    name:      row.name,
    role:      row.role,
    expertise: row.expertise,
    bio:       row.bio,
    photoUrl:  row.photoUrl,
    featured:  row.featured,
    sortOrder: row.sortOrder,
  };
}

exports.list = async (req, res, next) => {
  try {
    const rows = await prisma.teamMember.findMany({
      orderBy: [{ featured: 'desc' }, { sortOrder: 'asc' }, { createdAt: 'asc' }],
    });
    return ok(res, rows.map(toPublic));
  } catch (err) { next(err); }
};

exports.create = async (req, res, next) => {
  try {
    const { errors, data } = validate(req.body, {
      name:      v.string({ required: true, max: 200 }),
      role:      v.string({ required: true, max: 120 }),
      expertise: v.string({ max: 200 }),
      bio:       v.string({ max: 2000 }),
      photoUrl:  v.string({ max: 500 }),
      featured:  v.boolean(),
    });
    if (errors) return fail(res, 400, errors);

    // Only one featured member allowed. If this one is, clear any others first.
    if (data.featured) {
      await prisma.teamMember.updateMany({ where: { featured: true }, data: { featured: false } });
    }

    const maxOrder = await prisma.teamMember.aggregate({ _max: { sortOrder: true } });
    const sortOrder = (maxOrder._max.sortOrder ?? -1) + 1;

    const created = await prisma.teamMember.create({
      data: {
        name:      data.name,
        role:      data.role,
        expertise: data.expertise || '',
        bio:       data.bio || '',
        photoUrl:  data.photoUrl || null,
        featured:  !!data.featured,
        sortOrder,
      },
    });

    log('team_create', 'team', {
      entityId: created.id,
      userId:   req.user?.userId,
      userName: req.user?.name || '',
      details:  `${data.name} (${data.role})`,
    });

    return ok(res, toPublic(created), 201);
  } catch (err) { next(err); }
};

exports.update = async (req, res, next) => {
  try {
    const { id } = req.params;
    const existing = await prisma.teamMember.findUnique({ where: { id } });
    if (!existing) return fail(res, 404, 'Anggota tim tidak ditemukan');

    const { errors, data } = validate(req.body, {
      name:      v.string({ max: 200 }),
      role:      v.string({ max: 120 }),
      expertise: v.string({ max: 200 }),
      bio:       v.string({ max: 2000 }),
      photoUrl:  v.string({ max: 500 }),
      featured:  v.boolean(),
    });
    if (errors) return fail(res, 400, errors);

    if (data.featured === true && !existing.featured) {
      await prisma.teamMember.updateMany({
        where: { featured: true, NOT: { id } },
        data: { featured: false },
      });
    }

    const updated = await prisma.teamMember.update({
      where: { id },
      data: {
        name:      data.name      !== undefined ? data.name      : existing.name,
        role:      data.role      !== undefined ? data.role      : existing.role,
        expertise: data.expertise !== undefined ? data.expertise : existing.expertise,
        bio:       data.bio       !== undefined ? data.bio       : existing.bio,
        photoUrl:  data.photoUrl  !== undefined ? (data.photoUrl || null) : existing.photoUrl,
        featured:  data.featured  !== undefined ? data.featured  : existing.featured,
      },
    });

    log('team_update', 'team', {
      entityId: id,
      userId:   req.user?.userId,
      userName: req.user?.name || '',
      details:  updated.name,
    });

    return ok(res, toPublic(updated));
  } catch (err) { next(err); }
};

exports.remove = async (req, res, next) => {
  try {
    const { id } = req.params;
    const existing = await prisma.teamMember.findUnique({ where: { id } });
    if (!existing) return fail(res, 404, 'Anggota tim tidak ditemukan');

    await prisma.teamMember.delete({ where: { id } });

    log('team_delete', 'team', {
      entityId: id,
      userId:   req.user?.userId,
      userName: req.user?.name || '',
      details:  existing.name,
    });

    return ok(res, { message: 'Anggota tim dihapus' });
  } catch (err) { next(err); }
};
