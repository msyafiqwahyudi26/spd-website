const prisma = require('../lib/prisma');
const bcrypt = require('bcryptjs');
const { log } = require('../lib/logger');
const { ok, fail } = require('../lib/response');

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
    if (password.length < 6) {
      return fail(res, 400, 'Password minimal 6 karakter');
    }

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
