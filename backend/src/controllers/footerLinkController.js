const prisma = require('../lib/prisma');
const { log } = require('../lib/logger');
const { ok, fail } = require('../lib/response');
const { validate, v } = require('../lib/validate');

const ALLOWED_SECTIONS = ['nav', 'layanan'];

const toPublic = (r) => ({ id: r.id, section: r.section, label: r.label, url: r.url, sortOrder: r.sortOrder });

exports.list = async (req, res, next) => {
  try {
    const rows = await prisma.footerLink.findMany({
      orderBy: [{ section: 'asc' }, { sortOrder: 'asc' }, { createdAt: 'asc' }],
    });
    return ok(res, rows.map(toPublic));
  } catch (err) { next(err); }
};

exports.create = async (req, res, next) => {
  try {
    const section = typeof req.body.section === 'string' ? req.body.section.trim().toLowerCase() : '';
    if (!ALLOWED_SECTIONS.includes(section)) {
      return fail(res, 400, `section harus salah satu: ${ALLOWED_SECTIONS.join(', ')}`);
    }
    const { errors, data } = validate(req.body, {
      label: v.string({ required: true, max: 100 }),
      url:   v.string({ required: true, max: 500 }),
    });
    if (errors) return fail(res, 400, errors);

    const maxOrder = await prisma.footerLink.aggregate({
      where: { section }, _max: { sortOrder: true },
    });
    const sortOrder = (maxOrder._max.sortOrder ?? -1) + 1;

    const created = await prisma.footerLink.create({
      data: { section, label: data.label, url: data.url, sortOrder },
    });

    log('footer_link_create', 'footer_link', {
      entityId: created.id, userId: req.user?.userId, userName: req.user?.name || '',
      details: `${section} — ${data.label}`,
    });

    return ok(res, toPublic(created), 201);
  } catch (err) { next(err); }
};

exports.update = async (req, res, next) => {
  try {
    const { id } = req.params;
    const existing = await prisma.footerLink.findUnique({ where: { id } });
    if (!existing) return fail(res, 404, 'Link tidak ditemukan');

    const { errors, data } = validate(req.body, {
      label: v.string({ max: 100 }),
      url:   v.string({ max: 500 }),
    });
    if (errors) return fail(res, 400, errors);

    // Section change allowed; validate if provided.
    let section = existing.section;
    if (req.body.section !== undefined) {
      const next = String(req.body.section).trim().toLowerCase();
      if (!ALLOWED_SECTIONS.includes(next)) {
        return fail(res, 400, `section harus salah satu: ${ALLOWED_SECTIONS.join(', ')}`);
      }
      section = next;
    }

    const updated = await prisma.footerLink.update({
      where: { id },
      data: {
        section,
        label: data.label !== undefined ? data.label : existing.label,
        url:   data.url   !== undefined ? data.url   : existing.url,
      },
    });

    log('footer_link_update', 'footer_link', {
      entityId: id, userId: req.user?.userId, userName: req.user?.name || '',
      details: `${section} — ${updated.label}`,
    });

    return ok(res, toPublic(updated));
  } catch (err) { next(err); }
};

exports.remove = async (req, res, next) => {
  try {
    const { id } = req.params;
    const existing = await prisma.footerLink.findUnique({ where: { id } });
    if (!existing) return fail(res, 404, 'Link tidak ditemukan');
    await prisma.footerLink.delete({ where: { id } });
    log('footer_link_delete', 'footer_link', {
      entityId: id, userId: req.user?.userId, userName: req.user?.name || '',
      details: `${existing.section} — ${existing.label}`,
    });
    return ok(res, { message: 'Link dihapus' });
  } catch (err) { next(err); }
};
