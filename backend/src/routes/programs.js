const router = require('express').Router();
const ctrl = require('../controllers/programController');
const requireAuth = require('../middlewares/auth');
const requireRole = require('../middlewares/requireRole');

// Public reads. Writes require admin OR publisher (same as publications).
const canEdit = requireRole('admin', 'publisher');

router.get('/',    ctrl.list);
router.get('/:id', ctrl.getOne);
router.post('/',     requireAuth, canEdit, ctrl.create);
router.put('/:id',   requireAuth, canEdit, ctrl.update);
router.delete('/:id', requireAuth, canEdit, ctrl.remove);

module.exports = router;
