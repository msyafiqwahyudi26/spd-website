const prisma = require('../lib/prisma');
const { ok } = require('../lib/response');

function dayKey(date) {
  const d = new Date(date);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function buildDailyBuckets(days) {
  const buckets = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    buckets.push({ date: dayKey(d), contacts: 0, publications: 0, events: 0, logins: 0 });
  }
  return buckets;
}

exports.getSummary = async (req, res, next) => {
  try {
    const [pubCount, eventCount, contactCount, unreadCount, repliedCount, userCount, topPubs] = await Promise.all([
      prisma.publication.count(),
      prisma.event.count(),
      prisma.contact.count(),
      prisma.contact.count({ where: { status: 'unread' } }),
      prisma.contact.count({ where: { status: 'replied' } }),
      prisma.user.count(),
      prisma.publication.findMany({
        orderBy: { views: 'desc' },
        take: 5,
        select: { id: true, title: true, slug: true, views: true, category: true },
      }),
    ]);

    return ok(res, {
      publications:    pubCount,
      events:          eventCount,
      contacts:        contactCount,
      unreadContacts:  unreadCount,
      repliedContacts: repliedCount,
      users:           userCount,
      topPublications: topPubs,
    });
  } catch (err) {
    next(err);
  }
};

exports.getDaily = async (req, res, next) => {
  try {
    const days = Math.min(Math.max(parseInt(req.query.days, 10) || 7, 1), 30);
    const buckets = buildDailyBuckets(days);
    if (buckets.length === 0) return ok(res, { days, buckets: [] });
    const start = new Date(buckets[0].date + 'T00:00:00');
    const index = Object.fromEntries(buckets.map((b, i) => [b.date, i]));

    const [contacts, publications, events, logins] = await Promise.all([
      prisma.contact.findMany({
        where: { createdAt: { gte: start } },
        select: { createdAt: true },
      }),
      prisma.publication.findMany({
        where: { createdAt: { gte: start } },
        select: { createdAt: true },
      }),
      prisma.event.findMany({
        where: { createdAt: { gte: start } },
        select: { createdAt: true },
      }),
      prisma.log.findMany({
        where: { action: 'login', createdAt: { gte: start } },
        select: { createdAt: true },
      }),
    ]);

    const bump = (rows, field) => {
      for (const row of rows) {
        const key = dayKey(row.createdAt);
        const i = index[key];
        if (i !== undefined) buckets[i][field] += 1;
      }
    };

    bump(contacts, 'contacts');
    bump(publications, 'publications');
    bump(events, 'events');
    bump(logins, 'logins');

    return ok(res, { days, buckets });
  } catch (err) {
    next(err);
  }
};
