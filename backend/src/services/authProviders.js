/**
 * Auth provider abstraction.
 *
 * Today we ship a "local" provider (email + bcrypt hash, wired directly
 * into authController.login). "google" is registered as a stub so the
 * route shape exists and the User.provider column has somewhere to point,
 * but OAuth is not implemented yet.
 *
 * When you add Google OAuth later:
 *   1. Flesh out `providers.google.verify(...)` to accept the Google ID
 *      token from the frontend, call googleapis or jose to verify, and
 *      return `{ email, name, providerId, picture }`.
 *   2. In the controller, upsert a User by (provider='google', providerId),
 *      then sign the same JWT we already sign for local users.
 *
 * The controller never branches on provider beyond this registry lookup,
 * so adding a new provider is a single-file change.
 */

const providers = {
  local: {
    name: 'local',
    enabled: true,
  },
  google: {
    name: 'google',
    enabled: false,
    // Placeholder; real impl should return { email, name, providerId, picture }
    verify: async (/* idToken */) => {
      const err = new Error('Google auth belum diaktifkan');
      err.code = 'PROVIDER_NOT_ENABLED';
      err.status = 501;
      throw err;
    },
  },
};

function getProvider(name) {
  return providers[name] || null;
}

function isEnabled(name) {
  const p = providers[name];
  return !!(p && p.enabled);
}

module.exports = { providers, getProvider, isEnabled };
