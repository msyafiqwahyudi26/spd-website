const jwt = require('jsonwebtoken');
const { fail } = require('../lib/response');

/**
 * Stricter JWT validation.
 *
 * Rejects:
 *  - Missing Authorization header
 *  - Non-Bearer schemes
 *  - Empty bearer token
 *  - Expired tokens (TokenExpiredError)
 *  - Malformed / wrong-signature tokens (JsonWebTokenError)
 *  - Tokens missing the `userId` claim (defence against forged payloads)
 */
module.exports = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || typeof authHeader !== 'string') {
    return fail(res, 401, 'Token tidak ditemukan');
  }

  const [scheme, token] = authHeader.split(' ');
  if (scheme !== 'Bearer' || !token) {
    return fail(res, 401, 'Token tidak ditemukan');
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET, {
      algorithms: ['HS256'],
    });
    if (!payload || typeof payload !== 'object' || !payload.userId) {
      return fail(res, 401, 'Token tidak valid');
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
