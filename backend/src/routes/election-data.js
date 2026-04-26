const router      = require('express').Router();
const ctrl        = require('../controllers/electionDataController');
const requireAuth = require('../middlewares/auth');
const requireRole = require('../middlewares/requireRole');

const canAdmin = requireRole('admin');

// Public — anyone can read election stats
router.get('/',       ctrl.list);
router.get('/:id',    ctrl.getOne);

// Admin-only mutations
router.post('/seed',  requireAuth, canAdmin, ctrl.seed);
router.post('/',      requireAuth, canAdmin, ctrl.create);
router.put('/:id',    requireAuth, canAdmin, ctrl.update);
router.delete('/:id', requireAuth, canAdmin, ctrl.remove);

module.exports = router;
