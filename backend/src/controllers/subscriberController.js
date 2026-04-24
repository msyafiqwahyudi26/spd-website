const prisma = require('../lib/prisma');
const emailService = require('../services/emailService');
const { log } = require('../lib/logger');
const { ok, fail } = require('../lib/response');
const { validate, v } = require('../lib/validate');

exports.subscribe = async (req, res, next) => {
  try {
    const { errors, data } = validate(req.body, {
      email: v.email({ required: true }),
    });
    if (errors) return fail(res, 400, errors);

    // Only notify admin the first time (or on re-activation after unsubscribe).
    const existing = await prisma.subscriber.findUnique({ where: { email: data.email } });
    const isNewOrReactivated = !existing || existing.status !== 'active';

    const sub = await prisma.subscriber.upsert({
      where:  { email: data.email },
      update: { status: 'active', unsubscribedAt: null },
      create: { email: data.email, status: 'active' },
    });

    log('subscribe', 'subscriber', {
      entityId: sub.id,
      details:  data.email,
    });

    if (isNewOrReactivated) {
      emailService
        .sendSubscriberNotification({ email: sub.email })
        .then((result) => {
          if (!result.ok) {
            log('subscriber_notification_failed', 'subscriber', {
              entityId: sub.id,
              details: result.reason || 'unknown',
            });
          }
        })
        .catch(() => {});
    }

    return ok(res, { message: 'Berhasil berlangganan', email: sub.email }, 201);
  } catch (err) {
    next(err);
  }
};

exports.unsubscribe = async (req, res, next) => {
  try {
    const { errors, data } = validate(req.body, {
      email: v.email({ required: true }),
    });
    if (errors) return fail(res, 400, errors);

    const existing = await prisma.subscriber.findUnique({ where: { email: data.email } });
    // Respond 200 either way to avoid leaking which emails are subscribed.
    if (existing && existing.status === 'active') {
      await prisma.subscriber.update({
        where: { email: data.email },
        data: { status: 'unsubscribed', unsubscribedAt: new Date() },
      });
      log('unsubscribe', 'subscriber', { entityId: existing.id, details: data.email });
    }

    return ok(res, { message: 'Permintaan berhenti berlangganan diproses' });
  } catch (err) {
    next(err);
  }
};

exports.list = async (req, res, next) => {
  try {
    const rows = await prisma.subscriber.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return ok(res, rows.map((r) => ({
      id: r.id,
      email: r.email,
      status: r.status,
      createdAt: r.createdAt,
      unsubscribedAt: r.unsubscribedAt,
    })));
  } catch (err) {
    next(err);
  }
};
