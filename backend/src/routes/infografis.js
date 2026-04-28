const router = require('express').Router();
const ctrl = require('../controllers/infografisController');
const requireAuth = require('../middlewares/auth');
const requireRole = require('../middlewares/requireRole');

const canEdit = requireRole('admin', 'publisher');

router.get('/',           ctrl.list);
router.get('/:slug',      ctrl.getBySlug);
router.post('/',          requireAuth, canEdit, ctrl.create);
router.put('/:id',        requireAuth, canEdit, ctrl.update);
router.delete('/:id',     requireAuth, canEdit, ctrl.remove);

module.exports = router;
