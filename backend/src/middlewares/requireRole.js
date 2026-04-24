const { fail } = require('../lib/response');

module.exports = (...roles) => (req, res, next) => {
  if (!req.user) return fail(res, 401, 'Tidak terautentikasi');
  if (!roles.includes(req.user.role)) {
    return fail(res, 403, 'Akses ditolak: role tidak mencukupi');
  }
  next();
};
