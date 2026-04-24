const prisma = require('../lib/prisma');
const { ok } = require('../lib/response');

const DEFAULT_LIMIT = 50;
const MAX_LIMIT = 200;

exports.getAll = async (req, res, next) => {
  try {
    const rawLimit = parseInt(req.query.limit, 10);
    const rawOffset = parseInt(req.query.offset, 10);
    const limit = Number.isFinite(rawLimit)
      ? Math.min(Math.max(rawLimit, 1), MAX_LIMIT)
      : DEFAULT_LIMIT;
    const offset = Number.isFinite(rawOffset) && rawOffset > 0 ? rawOffset : 0;

    const [items, total] = await Promise.all([
      prisma.log.findMany({
        orderBy: { createdAt: 'desc' },
        skip: offset,
        take: limit,
      }),
      prisma.log.count(),
    ]);

    return ok(res, {
      items,
      total,
      limit,
      offset,
      hasMore: offset + items.length < total,
    });
  } catch (err) {
    next(err);
  }
};
