const router = require('express').Router();
const ctrl = require('../controllers/logController');
const requireAuth = require('../middlewares/auth');
const requireRole = require('../middlewares/requireRole');

router.get('/', requireAuth, requireRole('admin'), ctrl.getAll);

module.exports = router;
