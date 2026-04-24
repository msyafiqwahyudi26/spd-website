const prisma = require('../lib/prisma');
const emailService = require('../services/emailService');
const { log } = require('../lib/logger');
const { ok, fail } = require('../lib/response');
const { validate, v } = require('../lib/validate');

exports.create = async (req, res, next) => {
  try {
    const { errors, data } = validate(req.body, {
      name:    v.string({ required: true, max: 200 }),
      email:   v.email({ required: true }),
      message: v.string({ required: true, max: 5000 }),
    });
    if (errors) return fail(res, 400, errors);

    // Always persist first — email is best-effort.
    const contact = await prisma.contact.create({
      data: { name: data.name, email: data.email, message: data.message },
    });

    log('new_contact', 'contact', {
      entityId: contact.id,
      details: `${data.name} <${data.email}>`,
    });

    // Fire-and-forget notification. Never fails the request on email errors.
    emailService
      .sendContactNotification({ name: data.name, email: data.email, message: data.message })
      .then((result) => {
        if (!result.ok) {
          log('contact_notification_failed', 'contact', {
            entityId: contact.id,
            details: result.reason || 'unknown',
          });
        }
      })
      .catch(() => {});

    return ok(res, { message: 'Pesan berhasil dikirim', id: contact.id }, 201);
  } catch (err) {
    next(err);
  }
};

exports.getAll = async (req, res, next) => {
  try {
    const contacts = await prisma.contact.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return ok(res, contacts);
  } catch (err) {
    next(err);
  }
};

exports.markRead = async (req, res, next) => {
  try {
    const { id } = req.params;
    const contact = await prisma.contact.update({
      where: { id },
      data: { status: 'read' },
    });
    return ok(res, contact);
  } catch (err) {
    next(err);
  }
};

exports.getStats = async (req, res, next) => {
  try {
    const unread = await prisma.contact.count({ where: { status: 'unread' } });
    return ok(res, { unread });
  } catch (err) {
    next(err);
  }
};

exports.reply = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { errors, data } = validate(req.body, {
      subject: v.string({ required: true, max: 200 }),
      body:    v.string({ required: true, max: 10000 }),
    });
    if (errors) return fail(res, 400, errors);

    const contact = await prisma.contact.findUnique({ where: { id } });
    if (!contact) return fail(res, 404, 'Pesan tidak ditemukan');

    try {
      await emailService.sendContactReply({
        to: contact.email,
        toName: contact.name,
        subject: data.subject,
        body: data.body,
        adminName: req.user?.name || 'Admin SPD',
      });
    } catch (err) {
      if (err.code === 'EMAIL_NOT_CONFIGURED') {
        return fail(res, 503, err.message);
      }
      return fail(res, 502, 'Gagal mengirim email balasan');
    }

    const updated = await prisma.contact.update({
      where: { id },
      data: { status: 'replied' },
    });

    log('contact_reply', 'contact', {
      entityId: id,
      userId:   req.user?.userId,
      userName: req.user?.name || '',
      details:  `${contact.name} <${contact.email}>: ${data.subject}`,
    });

    return ok(res, { message: 'Balasan berhasil dikirim', contact: updated });
  } catch (err) {
    next(err);
  }
};
