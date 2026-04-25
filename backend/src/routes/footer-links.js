const router = require('express').Router();
const ctrl = require('../controllers/footerLinkController');
const requireAuth = require('../middlewares/auth');
const requireRole = require('../middlewares/requireRole');

router.get('/',       ctrl.list);
router.post('/',      requireAuth, requireRole('admin'), ctrl.create);
router.put('/:id',    requireAuth, requireRole('admin'), ctrl.update);
router.delete('/:id', requireAuth, requireRole('admin'), ctrl.remove);

module.exports = router;
