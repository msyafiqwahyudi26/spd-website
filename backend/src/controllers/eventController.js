const prisma = require('../lib/prisma');
const { log } = require('../lib/logger');
const { ok, fail } = require('../lib/response');

// Parse `startsAt` from the request body. Accepts ISO strings, empty string,
// null, or undefined. Returns { ok: true, value } or { ok: false, error }.
function parseStartsAt(raw) {
  if (raw === undefined) return { ok: true, value: undefined }; // not touched
  if (raw === null || raw === '') return { ok: true, value: null };
  if (typeof raw !== 'string') return { ok: false, error: 'startsAt tidak valid' };
  const d = new Date(raw);
  if (Number.isNaN(d.getTime())) return { ok: false, error: 'startsAt tidak valid' };
  return { ok: true, value: d };
}

function makeSlug(title) {
  return (
    title
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim() +
    '-' +
    Date.now()
  );
}

exports.getAll = async (req, res, next) => {
  try {
    // Events with a real startsAt sort by that (descending so newest upcoming
    // is first when we later support filters); legacy rows without startsAt
    // fall back to createdAt. nulls: 'last' keeps them after dated events.
    const events = await prisma.event.findMany({
      orderBy: [
        { startsAt: { sort: 'desc', nulls: 'last' } },
        { createdAt: 'desc' },
      ],
    });
    return ok(res, events);
  } catch (err) {
    next(err);
  }
};

exports.getOne = async (req, res, next) => {
  try {
    const { id } = req.params;
    const event = await prisma.event.findFirst({
      where: { OR: [{ id }, { slug: id }] },
    });
    if (!event) return fail(res, 404, 'Event tidak ditemukan');
    return ok(res, event);
  } catch (err) {
    next(err);
  }
};

exports.create = async (req, res, next) => {
  try {
    const title       = (req.body.title       || '').trim().slice(0, 300);
    const date        = (req.body.date        || '').trim().slice(0, 64);
    const location    = (req.body.location    || '').trim().slice(0, 200);
    const description = (req.body.description || '').trim().slice(0, 2000);
    const { image }   = req.body;

    if (!title) return fail(res, 400, 'Judul diperlukan');

    const starts = parseStartsAt(req.body.startsAt);
    if (!starts.ok) return fail(res, 400, starts.error);

    const event = await prisma.event.create({
      data: {
        title,
        slug: makeSlug(title),
        date,
        startsAt: starts.value ?? null,
        location,
        description,
        image: image || null,
      },
    });

    log('create_event', 'event', {
      entityId: event.id,
      userId:   req.user?.userId,
      userName: req.user?.name || '',
      details:  title,
    });

    return ok(res, event, 201);
  } catch (err) {
    next(err);
  }
};

exports.update = async (req, res, next) => {
  try {
    const { id } = req.params;
    const existing = await prisma.event.findUnique({ where: { id } });
    if (!existing) return fail(res, 404, 'Event tidak ditemukan');

    const { title, date, location, description, image } = req.body;

    const starts = parseStartsAt(req.body.startsAt);
    if (!starts.ok) return fail(res, 400, starts.error);

    const event = await prisma.event.update({
      where: { id },
      data: {
        title:       title       !== undefined ? (title       || '').trim().slice(0, 300)  : existing.title,
        date:        date        !== undefined ? (date        || '').trim().slice(0, 64)   : existing.date,
        startsAt:    starts.value !== undefined ? starts.value                             : existing.startsAt,
        location:    location    !== undefined ? (location    || '').trim().slice(0, 200)  : existing.location,
        description: description !== undefined ? (description || '').trim().slice(0, 2000) : existing.description,
        image:       image       !== undefined ? (image || null)                 : existing.image,
      },
    });

    log('update_event', 'event', {
      entityId: id,
      userId:   req.user?.userId,
      userName: req.user?.name || '',
      details:  existing.title,
    });

    return ok(res, event);
  } catch (err) {
    next(err);
  }
};

exports.remove = async (req, res, next) => {
  try {
    const { id } = req.params;
    const existing = await prisma.event.findUnique({ where: { id } });
    if (!existing) return fail(res, 404, 'Event tidak ditemukan');

    await prisma.event.delete({ where: { id } });

    log('delete_event', 'event', {
      entityId: id,
      userId:   req.user?.userId,
      userName: req.user?.name || '',
      details:  existing.title,
    });

    return ok(res, { message: 'Event berhasil dihapus' });
  } catch (err) {
    next(err);
  }
};
