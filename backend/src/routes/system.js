const router = require('express').Router();
const ctrl = require('../controllers/systemController');
const requireAuth = require('../middlewares/auth');
const requireRole = require('../middlewares/requireRole');

// All admin-only — these expose operational state.
router.get('/email-status', requireAuth, requireRole('admin'), ctrl.emailStatus);
router.post('/email-test',  requireAuth, requireRole('admin'), ctrl.emailTest);

module.exports = router;
