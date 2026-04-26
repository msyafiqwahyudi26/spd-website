const prisma = require('../lib/prisma');
const bcrypt = require('bcryptjs');
const { log } = require('../lib/logger');
const { ok, fail } = require('../lib/response');

/**
 * Validate password strength.
 * Returns an error message string, or null if the password is acceptable.
 */
function validatePassword(password) {
  if (!password || password.length < 12) return 'Password minimal 12 karakter';
  if (!/[A-Z]/.test(password)) return 'Password harus mengandung minimal 1 huruf kapital';
  if (!/[0-9]/.test(password)) return 'Password harus mengandung minimal 1 angka';
  return null;
}

exports.getAll = async (req, res, next) => {
  try {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: 'asc' },
      select: { id: true, email: true, name: true, role: true, createdAt: true },
    });
    return ok(res, users);
  } catch (err) {
    next(err);
  }
};

exports.create = async (req, res, next) => {
  try {
    const name     = (req.body.name     || '').trim().slice(0, 200);
    const email    = (req.body.email    || '').trim().toLowerCase().slice(0, 200);
    const password = (req.body.password || '').trim();
    const role     = req.body.role === 'publisher' ? 'publisher' : 'admin';

    if (!name || !email || !password) {
      return fail(res, 400, 'Nama, email, dan password diperlukan');
    }
    const pwErr = validatePassword(password);
    if (pwErr) return fail(res, 400, pwErr);

    const hashed = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { name, email, password: hashed, role },
      select: { id: true, email: true, name: true, role: true, createdAt: true },
    });

    log('create_user', 'user', {
      entityId: user.id,
      userId:   req.user.userId,
      userName: req.user.name || '',
      details:  `${email} (${role})`,
    });

    return ok(res, user, 201);
  } catch (err) {
    next(err);
  }
};

exports.update = async (req, res, next) => {
  try {
    const { id } = req.params;
    const existing = await prisma.user.findUnique({ where: { id } });
    if (!existing) return fail(res, 404, 'User tidak ditemukan');

    // Optional fields. Undefined = leave unchanged.
    const name = req.body.name !== undefined ? String(req.body.name).trim().slice(0, 200) : undefined;
    const role = req.body.role !== undefined ? (req.body.role === 'publisher' ? 'publisher' : 'admin') : undefined;
    const newPassword = typeof req.body.password === 'string' ? req.body.password.trim() : '';

    // Guardrails: an admin can't lock themselves out of admin access by
    // demoting their own account — the last admin standing must stay admin.
    if (role === 'publisher' && id === req.user.userId) {
      return fail(res, 400, 'Tidak dapat menurunkan peran akun sendiri');
    }

    const data = {};
    if (name !== undefined && name.length > 0) data.name = name;
    if (role !== undefined)                    data.role = role;
    if (newPassword) {
      const pwErr = validatePassword(newPassword);
      if (pwErr) return fail(res, 400, pwErr);
      data.password = await bcrypt.hash(newPassword, 10);
    }

    if (Object.keys(data).length === 0) {
      return ok(res, { id: existing.id, email: existing.email, name: existing.name, role: existing.role, createdAt: existing.createdAt });
    }

    const updated = await prisma.user.update({
      where: { id },
      data,
      select: { id: true, email: true, name: true, role: true, createdAt: true },
    });

    log('update_user', 'user', {
      entityId: id,
      userId:   req.user.userId,
      userName: req.user.name || '',
      details:  Object.keys(data).join(', '),
    });

    return ok(res, updated);
  } catch (err) {
    next(err);
  }
};

exports.remove = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (id === req.user.userId) {
      return fail(res, 400, 'Tidak dapat menghapus akun sendiri');
    }
    const existing = await prisma.user.findUnique({ where: { id } });
    if (!existing) return fail(res, 404, 'User tidak ditemukan');

    await prisma.user.delete({ where: { id } });

    log('delete_user', 'user', {
      entityId: id,
      userId:   req.user.userId,
      userName: req.user.name || '',
      details:  existing.email,
    });

    return ok(res, { message: 'User berhasil dihapus' });
  } catch (err) {
    next(err);
  }
};
