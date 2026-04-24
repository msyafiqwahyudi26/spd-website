const router = require('express').Router();
const ctrl = require('../controllers/userController');
const requireAuth = require('../middlewares/auth');
const requireRole = require('../middlewares/requireRole');

router.get('/',    requireAuth, requireRole('admin'), ctrl.getAll);
router.post('/',   requireAuth, requireRole('admin'), ctrl.create);
router.delete('/:id', requireAuth, requireRole('admin'), ctrl.remove);

module.exports = router;
