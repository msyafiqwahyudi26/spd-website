const router = require('express').Router();
const ctrl = require('../controllers/publicationController');
const requireAuth = require('../middlewares/auth');
const requireRole = require('../middlewares/requireRole');
const { createRateLimit, getClientIp } = require('../middlewares/rateLimit');

// Throttle view increments: at most 1 per 30 minutes for a given IP+publication.
// This rate-limits AND deduplicates rapid repeat hits (covers TASK 3).
const viewLimiter = createRateLimit({
  windowMs: 30 * 60 * 1000,
  max: 1,
  prefix: 'view',
  keyFn: (req) => `${getClientIp(req)}:${req.params.id}`,
  message: 'View sudah tercatat',
});

const canEdit = requireRole('admin', 'publisher');

router.get('/', ctrl.getAll);
router.get('/:id', ctrl.getOne);
router.post('/:id/view', viewLimiter, ctrl.incrementView);
router.post('/',     requireAuth, canEdit, ctrl.create);
router.put('/:id',   requireAuth, canEdit, ctrl.update);
router.delete('/:id', requireAuth, canEdit, ctrl.remove);

module.exports = router;
