const router = require('express').Router();
const ctrl = require('../controllers/settingsController');
const requireAuth = require('../middlewares/auth');
const requireRole = require('../middlewares/requireRole');

router.get('/',  ctrl.get);
router.put('/',  requireAuth, requireRole('admin'), ctrl.update);

module.exports = router;
