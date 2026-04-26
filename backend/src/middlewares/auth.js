const jwt = require('jsonwebtoken');
const { fail } = require('../lib/response');
const { isBlacklisted } = require('../lib/tokenBlacklist');

/**
 * Parse a single cookie value from the raw Cookie header.
 * This avoids adding the cookie-parser package as a dependency.
 */
function getCookie(req, name) {
  const cookieHeader = req.headers.cookie;
  if (!cookieHeader) return null;
  for (const part of cookieHeader.split(';')) {
    const [k, ...v] = part.trim().split('=');
    if (k.trim() === name) return v.join('=').trim();
  }
  return null;
}

/**
 * Strict JWT validation.
 *
 * Token source priority:
 *   1. httpOnly cookie `spd_token` (preferred — not accessible via JS)
 *   2. Authorization: Bearer <token> header (API clients / backward compat)
 *
 * Rejects:
 * - No token in either location
 * - Non-Bearer schemes
 * - Empty bearer token
 * - Expired tokens (TokenExpiredError)
 * - Malformed / wrong-signature tokens (JsonWebTokenError)
 * - Tokens missing the `userId` claim (defence against forged payloads)
 */
module.exports = (req, res, next) => {
  // 1. Try httpOnly cookie first
  let token = getCookie(req, 'spd_token');

  // 2. Fall back to Authorization header (for API clients / Postman)
  if (!token) {
    const authHeader = req.headers.authorization;
    if (authHeader && typeof authHeader === 'string') {
      const [scheme, bearerToken] = authHeader.split(' ');
      if (scheme === 'Bearer' && bearerToken) {
        token = bearerToken;
      }
    }
  }

  if (!token) {
    return fail(res, 401, 'Token tidak ditemukan');
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET, {
      algorithms: ['HS256'],
    });

    if (!payload || typeof payload !== 'object' || !payload.userId) {
      return fail(res, 401, 'Token tidak valid');
    }

    // Reject tokens that have been explicitly invalidated (e.g. after logout).
    // This prevents a captured token from being replayed via Bearer header
    // even though the httpOnly cookie was cleared.
    if (isBlacklisted(payload.jti)) {
      return fail(res, 401, 'Token sudah tidak valid');
    }

    req.user = payload;
    return next();
  } catch (err) {
    if (err && err.name === 'TokenExpiredError') {
      return fail(res, 401, 'Token sudah kadaluarsa');
    }
    return fail(res, 401, 'Token tidak valid');
  }
};
