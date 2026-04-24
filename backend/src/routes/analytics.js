const router = require('express').Router();
const ctrl = require('../controllers/analyticsController');
const requireAuth = require('../middlewares/auth');
const requireRole = require('../middlewares/requireRole');

router.get('/',      requireAuth, requireRole('admin'), ctrl.getSummary);
router.get('/daily', requireAuth, requireRole('admin'), ctrl.getDaily);

module.exports = router;
