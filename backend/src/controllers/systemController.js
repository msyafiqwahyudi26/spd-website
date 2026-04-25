const emailService = require('../services/emailService');
const { log } = require('../lib/logger');
const { ok, fail } = require('../lib/response');

/**
 * Admin-only system endpoints. Surface operational state that lives in
 * env vars (not DB), so the dashboard can show a real warning instead of
 * a silent log entry.
 */

exports.emailStatus = async (req, res, next) => {
  try {
    const cfg = emailService.validateConfig();
    return ok(res, {
      configured:    cfg.configured,
      missingKeys:   cfg.missing,
      inboundTarget: cfg.inboundTarget,
      // Helpful hint for the admin on what to set if not configured.
      requiredEnv:   ['EMAIL_HOST', 'EMAIL_PORT', 'EMAIL_USER', 'EMAIL_PASS', 'EMAIL_FROM', 'EMAIL_TO'],
    });
  } catch (err) { next(err); }
};

exports.emailTest = async (req, res, next) => {
  try {
    const result = await emailService.sendTestEmail();
    log(result.ok ? 'email_test_sent' : 'email_test_failed', 'system', {
      userId:   req.user?.userId,
      userName: req.user?.name || '',
      details:  result.ok ? `→ ${result.target}` : (result.reason || 'unknown'),
    });
    if (!result.ok) {
      return fail(res, result.reason === 'EMAIL_NOT_CONFIGURED' ? 503 : 502, `Gagal mengirim: ${result.reason}`);
    }
    return ok(res, { sent: true, target: result.target });
  } catch (err) { next(err); }
};
