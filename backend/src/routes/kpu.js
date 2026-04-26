const router = require('express').Router();
const ctrl   = require('../controllers/kpuController');
const requireAuth = require('../middlewares/auth');
const requireRole = require('../middlewares/requireRole');

const canAdmin = requireRole('admin');

// Public read endpoints — data is already public on KPU's own site
router.get('/ppwp',         ctrl.ppwp);
router.get('/dpr',          ctrl.dpr);
router.get('/partisipasi',  ctrl.partisipasi);
router.get('/pemilih',      ctrl.pemilih);   // satupetadata: DP4→DPT per 38 provinsi
router.get('/status',       ctrl.status);

// Admin-only cache management
router.post('/cache/clear', requireAuth, canAdmin, ctrl.clearCache);

module.exports = router;
