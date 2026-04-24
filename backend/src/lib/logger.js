const prisma = require('./prisma');

async function log(action, entity, opts = {}) {
  try {
    await prisma.log.create({
      data: {
        action,
        entity,
        entityId: opts.entityId || null,
        userId:   opts.userId   || null,
        userName: opts.userName || '',
        details:  opts.details  || '',
      },
    });
  } catch {}
}

module.exports = { log };
