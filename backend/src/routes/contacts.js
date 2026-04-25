const router = require('express').Router();
const ctrl = require('../controllers/contactController');
const requireAuth = require('../middlewares/auth');
const requireRole = require('../middlewares/requireRole');
const { createRateLimit } = require('../middlewares/rateLimit');

const contactLimiter = createRateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  prefix: 'contact',
  message: 'Anda sudah mengirim terlalu banyak pesan. Coba lagi nanti.',
});

// Inbox is admin-only: reading visitor messages and replying is privileged.
// Publishers are content-only per the role spec.
const adminOnly = requireRole('admin');

router.post('/',            contactLimiter, ctrl.create);
router.get('/stats',        requireAuth, adminOnly, ctrl.getStats);
router.get('/',             requireAuth, adminOnly, ctrl.getAll);
router.patch('/:id/read',   requireAuth, adminOnly, ctrl.markRead);
router.post('/:id/reply',   requireAuth, adminOnly, ctrl.reply);

module.exports = router;
