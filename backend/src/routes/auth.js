const router = require('express').Router();
const authController = require('../controllers/authController');
const requireAuth = require('../middlewares/auth');
const { createRateLimit } = require('../middlewares/rateLimit');

const loginLimiter = createRateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  prefix: 'login',
  message: 'Terlalu banyak percobaan login. Coba lagi dalam beberapa menit.',
});

router.post('/login', loginLimiter, authController.login);

// Clears the httpOnly auth cookie. No requireAuth here because an expired
// or invalid token should still allow the user to log out cleanly.
router.post('/logout', authController.logout);

// Placeholder for Google Workspace sign-in; returns 501 until the
// provider is enabled in services/authProviders.js.
router.post('/google', loginLimiter, authController.google);

router.get('/me', requireAuth, authController.me);
router.patch('/me', requireAuth, authController.updateMe);

module.exports = router;
