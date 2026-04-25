const prisma = require('../lib/prisma');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { log } = require('../lib/logger');
const { ok, fail } = require('../lib/response');
const { validate, v } = require('../lib/validate');
const authProviders = require('../services/authProviders');

// Constant-time dummy hash used when the looked-up user does not exist.
const DUMMY_HASH = '$2a$10$7EqJtq98hPqEX7fNZaFWoO6u8TtVxYKvm6MB3E0uW2Pq0PMfE9u9i';

const IS_PROD = process.env.NODE_ENV === 'production';

/** Cookie options for the auth token */
const COOKIE_OPTIONS = {
  httpOnly: true,              // Not accessible via JavaScript — prevents XSS token theft
  secure: IS_PROD,             // HTTPS only in production
  sameSite: 'strict',          // Prevents CSRF — cookie only sent on same-site requests
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days — matches JWT expiry
  path: '/',
};

const signToken = (user) =>
  jwt.sign(
    { userId: user.id, role: user.role, name: user.name },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );

exports.login = async (req, res, next) => {
  try {
    const { errors, data } = validate(req.body, {
      email: v.email({ required: true }),
      password: v.string({ required: true, max: 200 }),
    });
    if (errors) return fail(res, 400, 'Email dan password diperlukan');

    const user = await prisma.user.findUnique({ where: { email: data.email } });

    // Only local-provider accounts have a usable password hash.
    const hash = user && user.provider === 'local' ? user.password : DUMMY_HASH;
    const verified = await bcrypt.compare(data.password, hash);

    if (!user || user.provider !== 'local' || !verified) {
      return fail(res, 401, 'Email atau password salah');
    }

    const token = signToken(user);

    // Set the token as an httpOnly cookie — it will never be readable by
    // JavaScript, which eliminates the XSS token-theft attack vector.
    res.cookie('spd_token', token, COOKIE_OPTIONS);

    log('login', 'auth', { userId: user.id, userName: user.name, details: data.email });

    return ok(res, {
      user: { id: user.id, email: user.email, name: user.name, role: user.role },
    });
  } catch (err) {
    next(err);
  }
};

exports.logout = (req, res) => {
  // Clear the auth cookie by setting it with maxAge=0.
  res.cookie('spd_token', '', { ...COOKIE_OPTIONS, maxAge: 0 });
  return ok(res, { message: 'Logout berhasil' });
};

// Placeholder: returns 501 until Google OAuth is implemented.
exports.google = async (req, res, next) => {
  try {
    if (!authProviders.isEnabled('google')) {
      return fail(res, 501, 'Google auth belum diaktifkan');
    }

    const { idToken } = req.body || {};
    if (!idToken) return fail(res, 400, 'idToken diperlukan');

    const profile = await authProviders.getProvider('google').verify(idToken);
    const user = await prisma.user.upsert({
      where: { provider_providerId: { provider: 'google', providerId: profile.providerId } },
      update: { name: profile.name, email: profile.email },
      create: {
        provider: 'google',
        providerId: profile.providerId,
        email: profile.email,
        name: profile.name,
        password: '!oauth-placeholder',
        role: 'publisher',
      },
    });

    const token = signToken(user);
    res.cookie('spd_token', token, COOKIE_OPTIONS);

    log('login', 'auth', { userId: user.id, userName: user.name, details: `google:${profile.email}` });

    return ok(res, {
      user: { id: user.id, email: user.email, name: user.name, role: user.role },
    });
  } catch (err) {
    if (err && err.status) return fail(res, err.status, err.message || 'Google auth gagal');
    next(err);
  }
};

exports.me = async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.user.userId } });
    if (!user) return fail(res, 404, 'User tidak ditemukan');
    return ok(res, { id: user.id, email: user.email, name: user.name, role: user.role });
  } catch (err) {
    next(err);
  }
};

exports.updateMe = async (req, res, next) => {
  try {
    const existing = await prisma.user.findUnique({ where: { id: req.user.userId } });
    if (!existing) return fail(res, 404, 'User tidak ditemukan');

    const name =
      typeof req.body.name === 'string' ? req.body.name.trim().slice(0, 200) : undefined;
    const currentPassword =
      typeof req.body.currentPassword === 'string' ? req.body.currentPassword : '';
    const newPassword =
      typeof req.body.newPassword === 'string' ? req.body.newPassword.trim() : '';

    const data = {};
    if (name && name !== existing.name) data.name = name;

    if (newPassword) {
      if (newPassword.length < 8) return fail(res, 400, 'Password baru minimal 8 karakter');
      if (existing.provider !== 'local')
        return fail(res, 400, 'Akun ini tidak memakai password lokal');
      if (!currentPassword)
        return fail(res, 400, 'Password saat ini diperlukan untuk mengubah password');
      const verified = await bcrypt.compare(currentPassword, existing.password);
      if (!verified) return fail(res, 401, 'Password saat ini salah');
      data.password = await bcrypt.hash(newPassword, 10);
    }

    if (Object.keys(data).length === 0) {
      return ok(res, {
        id: existing.id,
        email: existing.email,
        name: existing.name,
        role: existing.role,
      });
    }

    const updated = await prisma.user.update({
      where: { id: existing.id },
      data,
      select: { id: true, email: true, name: true, role: true },
    });

    log('update_profile', 'auth', {
      userId: existing.id,
      userName: updated.name,
      details: Object.keys(data).join(', '),
    });

    return ok(res, updated);
  } catch (err) {
    next(err);
  }
};
