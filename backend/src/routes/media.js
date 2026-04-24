const router = require('express').Router();
const ctrl = require('../controllers/mediaController');
const requireAuth = require('../middlewares/auth');
const requireRole = require('../middlewares/requireRole');
const { uploadImage } = require('../middlewares/upload');
const { fail } = require('../lib/response');

// Admin: list and manage
router.get('/',         requireAuth, requireRole('admin'), ctrl.list);
router.post('/',        requireAuth, requireRole('admin'),
  (req, res, next) => uploadImage(req, res, (err) => {
    if (!err) return next();
    if (err.code === 'LIMIT_FILE_SIZE') return fail(res, 413, 'Ukuran file melebihi 5 MB');
    const msg = err.clientMessage || 'Unggahan gagal';
    const status = err.status || 400;
    return fail(res, status, msg);
  }),
  ctrl.upload);
router.patch('/:id/key', requireAuth, requireRole('admin'), ctrl.setKey);
router.delete('/:id',    requireAuth, requireRole('admin'), ctrl.remove);

// Public: lookup by semantic key — safe because it returns only the URL
// of an admin-curated asset.
router.get('/by-key/:key', ctrl.getByKey);

module.exports = router;
