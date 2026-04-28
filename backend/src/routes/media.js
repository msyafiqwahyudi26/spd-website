const router = require('express').Router();
const ctrl = require('../controllers/mediaController');
const requireAuth = require('../middlewares/auth');
const requireRole = require('../middlewares/requireRole');
const { uploadImage, compressUpload } = require('../middlewares/upload');
const { fail } = require('../lib/response');
const { createRateLimit } = require('../middlewares/rateLimit');

// Throttle public media key lookups to prevent enumeration attacks.
const byKeyLimiter = createRateLimit({
  windowMs: 60 * 1000,   // 1 minute
  max: 60,               // 60 lookups per minute per IP
  prefix: 'media-key',
  message: 'Terlalu banyak permintaan. Coba lagi nanti.',
});

// Admin: list and manage
router.get('/',         requireAuth, requireRole('admin'), ctrl.list);
router.post('/',        requireAuth, requireRole('admin'),
  (req, res, next) => uploadImage(req, res, (err) => {
    if (!err) return next();
    if (err.code === 'LIMIT_FILE_SIZE') return fail(res, 413, 'Ukuran file melebihi 25 MB');
    const msg = err.clientMessage || 'Unggahan gagal';
    const status = err.status || 400;
    return fail(res, status, msg);
  }),
  compressUpload,
  ctrl.upload);
router.patch('/:id/key', requireAuth, requireRole('admin'), ctrl.setKey);
router.delete('/:id',    requireAuth, requireRole('admin'), ctrl.remove);

// Public: lookup by semantic key — safe because it returns only the URL
// of an admin-curated asset. Rate-limited to prevent key enumeration.
router.get('/by-key/:key', byKeyLimiter, ctrl.getByKey);

module.exports = router;
