const router = require('express').Router();
const ctrl = require('../controllers/subscriberController');
const requireAuth = require('../middlewares/auth');
const requireRole = require('../middlewares/requireRole');
const { createRateLimit } = require('../middlewares/rateLimit');

const subscribeLimiter = createRateLimit({
  windowMs: 60 * 60 * 1000,
  max: 10,
  prefix: 'subscribe',
  message: 'Terlalu banyak permintaan berlangganan. Coba lagi nanti.',
});

router.post('/',             subscribeLimiter, ctrl.subscribe);
router.post('/unsubscribe',  subscribeLimiter, ctrl.unsubscribe);
router.get('/',              requireAuth, requireRole('admin'), ctrl.list);

module.exports = router;
