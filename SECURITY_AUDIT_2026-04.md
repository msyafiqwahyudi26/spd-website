# Security Audit Report — SPD Indonesia Website
## Comprehensive Security Review
**Date:** April 27, 2026  
**Auditor:** Claude Security Review  
**Scope:** Full stack authentication, authorization, data protection, and API security

---

## Executive Summary

The SPD Indonesia website demonstrates **strong foundational security practices** with proper JWT implementation, role-based access control, and rate limiting. However, several **critical and high-severity gaps** exist that create real attack surface, particularly around:

1. **No idle logout timeout enforcement** — sessions can persist indefinitely
2. **Password policy too weak** — minimum 6 characters is insufficient
3. **No CSRF protection** on state-changing requests
4. **No 2FA/MFA implementation** — single factor authentication only
5. **Insufficient API endpoint hardening** — some sensitive operations lack proper role segregation
6. **Token blacklist not persistent** — cleared on server restart
7. **No login attempt logging to DB** — audit trail incomplete
8. **SQLite in production** — not suitable for multi-user concurrent access

---

## Detailed Findings

### 1. AUTHENTICATION & SESSION MANAGEMENT

#### [AUTH-001] — NO IDLE LOGOUT ENFORCEMENT — SEVERITY: KRITIS
**File:** `src/hooks/useIdleLogout.js` (lines 1-68)  
**Issue:** The idle logout hook exists but is optional and frontend-only.
- Default timeout: **5 minutes** (configurable via `VITE_IDLE_TIMEOUT_MINUTES`)
- Implementation: React-based, relies on user activity tracking in browser
- **Problem:** If a user doesn't interact with the dashboard, the timer runs. But if a tab is backgrounded, logout still occurs. More critically, the logout is **client-side only** — if the session is left open in another tab, the server still honors the old token.

**Specific Attack:** 
```
1. Attacker gains physical access to unattended admin PC
2. Admin has /dashboard open but hasn't interacted in 3 minutes (timer running)
3. Attacker opens new tab, navigates to /dashboard — the httpOnly cookie is still valid
4. Attacker gains access because frontend-only logout didn't blacklist the token
```

**Impact:** Unattended sessions can be hijacked. No server-side session timeout means a token issued 7 days ago is still valid if never explicitly logged out.

**Fix (Priority: CRITICAL):**
- Implement **server-side session expiry** independent of frontend activity
- Add `issuedAt` claim to JWT
- Reject tokens older than 8 hours even if not expired (sliding window)
- Implement `/api/auth/refresh` endpoint to issue new tokens (server validates previous token freshness)
- Force frontend to re-authenticate every 8 hours
- Option: Reduce JWT `expiresIn` from 7 days to 24 hours

**Recommended Code Change:**
```javascript
// backend/src/middlewares/auth.js — add after line 56
const now = Math.floor(Date.now() / 1000);
const maxAge = 8 * 60 * 60; // 8 hours
if (payload.iat && (now - payload.iat) > maxAge) {
  return fail(res, 401, 'Token kedaluwarsa, login ulang diperlukan');
}
```

---

#### [AUTH-002] — WEAK PASSWORD POLICY — SEVERITY: TINGGI
**File:** `backend/src/controllers/userController.js` (lines 28-30)  
**Issue:**
```javascript
if (password.length < 6) {
  return fail(res, 400, 'Password minimal 6 karakter');
}
```

**Problem:** 6 characters is insufficient for admin accounts. Modern NIST guidelines recommend **minimum 12 characters** or complexity requirements.

**Impact:** Passwords like "123456", "abc123", "pasw0d" are accepted. Brute force takes ~minutes on modern hardware.

**Fix (Priority: TINGGI):**
```javascript
// backend/src/lib/passwordPolicy.js (new file)
function validatePassword(pwd) {
  if (pwd.length < 12) return 'Password minimal 12 karakter';
  if (!/[A-Z]/.test(pwd)) return 'Harus mengandung huruf besar';
  if (!/[a-z]/.test(pwd)) return 'Harus mengandung huruf kecil';
  if (!/[0-9]/.test(pwd)) return 'Harus mengandung angka';
  if (!/[!@#$%^&*]/.test(pwd)) return 'Harus mengandung karakter spesial';
  return null;
}
```

Apply in `userController.js` create/update and `authController.js` updateMe.

---

#### [AUTH-003] — NO MULTI-FACTOR AUTHENTICATION — SEVERITY: TINGGI
**File:** `backend/src/controllers/authController.js` (lines 55-87)  
**Issue:** Login only requires email + password. No 2FA, TOTP, or email verification.

**Impact:** Compromised password = full admin access.

**Fix (Priority: TINGGI):**
1. **Email-based OTP (quick win):**
   - On login, generate 6-digit code, store in DB with 10-min TTL
   - Return `{ requiresOtp: true }` to frontend
   - Frontend shows OTP entry form
   - Verify at `/api/auth/verify-otp` endpoint before issuing JWT

2. **TOTP (Time-based OTP) — better security:**
   - Use `speakeasy` npm package
   - On first login after enabling: show QR code for authenticator app
   - Require TOTP on subsequent logins

---

#### [AUTH-004] — TOKEN BLACKLIST NOT PERSISTENT — SEVERITY: TINGGI
**File:** `backend/src/lib/tokenBlacklist.js` (lines 1-72)  
**Issue:** Blacklist is in-memory only. On server restart:
```
1. Server stops
2. All entries in _store (Map) are lost
3. Server restarts
4. Tokens that were "logged out" are no longer blacklisted
5. Attacker with captured token from before restart can still use it
```

**Specific Attack:**
```
1. Attacker captures admin token via network sniff
2. Admin logs out (token added to blacklist)
3. Server crashes / PM2 restarts backend
4. Attacker replays the token — blacklist is gone
5. API accepts the token
```

**Impact:** Logout protection is lost on any server restart.

**Fix (Priority: TINGGI):**
- Move blacklist to database:
```javascript
// backend/src/lib/tokenBlacklist.js (updated)
const prisma = require('./prisma');

async function addToBlacklist(jti, exp) {
  await prisma.tokenBlacklist.create({
    data: { jti, expiresAt: new Date(exp * 1000) }
  });
}

async function isBlacklisted(jti) {
  const entry = await prisma.tokenBlacklist.findUnique({ where: { jti } });
  if (!entry) return false;
  if (entry.expiresAt < new Date()) {
    await prisma.tokenBlacklist.delete({ where: { jti } });
    return false;
  }
  return true;
}
```

- Add schema:
```prisma
model TokenBlacklist {
  jti       String   @id
  expiresAt DateTime
  @@index([expiresAt])
}
```

---

#### [AUTH-005] — NO LOGIN ATTEMPT LOGGING TO AUDIT TRAIL — SEVERITY: SEDANG
**File:** `backend/src/controllers/authController.js` (line 79)  
**Issue:** Only **successful** logins are logged. Failed attempts are silently ignored.

**Impact:** No audit trail for brute force attempts. Admin cannot detect attacks in progress.

**Fix:**
```javascript
// backend/src/controllers/authController.js — login handler
if (!user || user.provider !== 'local' || !verified) {
  // Log failed attempt
  await prisma.log.create({
    data: {
      action: 'LOGIN_FAILED',
      entity: 'auth',
      entityId: 'unknown',
      details: `Email: ${data.email}, Reason: ${!user ? 'user_not_found' : !verified ? 'invalid_password' : 'provider_mismatch'}`,
    }
  });
  return fail(res, 401, 'Email atau password salah');
}
```

---

### 2. AUTHORIZATION & ROLE-BASED ACCESS CONTROL

#### [RBAC-001] — INSUFFICIENT ROLE SEGREGATION — SEVERITY: TINGGI
**Files:** 
- `backend/src/routes/publications.js` (line 17)
- `backend/src/routes/events.js` 
- `backend/src/routes/programs.js`

**Issue:**
```javascript
const canEdit = requireRole('admin', 'publisher');
router.post('/',     requireAuth, canEdit, ctrl.create);
router.put('/:id',   requireAuth, canEdit, ctrl.update);
router.delete('/:id', requireAuth, canEdit, ctrl.remove);
```

**Problem:** Publishers and admins have identical permissions on CRUD operations. But in `dashboard/PublikasiManager.jsx`, there's no backend check that publishers can only edit their own items.

**Specific Attack:**
```
1. Publisher Alice creates publication
2. Publisher Bob (different user) navigates to /api/publications/{alice-id}
3. Backend has NO check that Bob doesn't own this
4. Bob PATCH /{alice-id} → backend updates Alice's publication
```

**Impact:** Cross-publisher data tampering. Publishers can modify other publishers' content.

**Fix (Priority: TINGGI):**
- Add `createdBy` field to Publication/Event/Program schema:
```prisma
model Publication {
  // ... existing fields
  createdBy String
  @@index([createdBy])
}
```

- Add ownership check in controller:
```javascript
exports.update = async (req, res, next) => {
  const pub = await prisma.publication.findUnique({ where: { id: req.params.id } });
  if (!pub) return fail(res, 404, 'Tidak ditemukan');
  
  // Publishers can only edit their own
  if (req.user.role === 'publisher' && pub.createdBy !== req.user.userId) {
    return fail(res, 403, 'Akses ditolak');
  }
  
  // proceed with update
};
```

---

#### [RBAC-002] — FRONTEND ROUTE PROTECTION INCOMPLETE — SEVERITY: SEDANG
**File:** `src/App.jsx` (lines 94-121)  
**Issue:**
```jsx
<Route path="/dashboard" element={<Dashboard />}>
  <Route index element={<DashboardOverview />} />
  {/* No requireAuth wrapper here — rely on Dashboard.jsx check */}
  <Route path="publikasi" element={<PublikasiManager />} />
  {/* ... */}
  <Route element={<RequireAdmin />}>
    {/* Admin-only routes */}
  </Route>
</Route>
```

**Problem:** Dashboard shell (`<Dashboard />`) does the auth check, but nested routes don't have their own protection. If a route is navigated to directly before Dashboard renders, there could be a flash of content.

**Impact:** Low practical risk (backend still protects), but UI is vulnerable to timing attacks / race conditions.

**Fix:**
- Add `requireAuth` wrapper at `/dashboard` level:
```jsx
<Route path="/dashboard" element={<Dashboard />}>
  <Route element={<RequireAuth />}>  {/* NEW */}
    <Route index element={<DashboardOverview />} />
    <Route path="publikasi" element={<PublikasiManager />} />
    {/* ... */}
  </Route>
</Route>
```

---

### 3. CROSS-SITE REQUEST FORGERY (CSRF)

#### [CSRF-001] — NO CSRF TOKEN PROTECTION — SEVERITY: TINGGI
**File:** `backend/server.js` (lines 95-102)  
**Issue:** CORS is configured, but no CSRF token is required on state-changing requests.

**Vulnerable Flow:**
```
1. Admin logged into /dashboard in Tab A (httpOnly cookie exists)
2. Admin visits malicious site in Tab B
3. Malicious site contains: <img src="https://spdindonesia.org/api/settings" />
4. Browser automatically sends httpOnly cookie
5. If endpoint is GET (wrong design) or forgery uses form POST with auto-submit, CSRF succeeds
```

**Current Mitigation:** SameSite=strict on cookie prevents most browsers from sending it cross-site. But:
- Older browsers don't support SameSite
- Legacy browsers on target list may still be vulnerable

**Impact:** State-changing endpoints (PUT /api/settings, DELETE /api/users) could be triggered without admin knowledge.

**Fix (Priority: TINGGI):**
1. **Use POST for state changes** (not GET):
   - Change `/api/publications/:id/view` to POST (already done)
   - Ensure all other state changes use PUT/DELETE/PATCH

2. **Add CSRF token middleware:**
```javascript
// backend/src/middlewares/csrf.js
const crypto = require('crypto');

const tokens = new Map();

exports.csrfToken = (req, res, next) => {
  const token = crypto.randomBytes(32).toString('hex');
  tokens.set(token, Date.now());
  res.set('X-CSRF-Token', token);
  req.csrfToken = token;
  next();
};

exports.verifyCsrf = (req, res, next) => {
  const token = req.get('X-CSRF-Token') || req.body._csrf;
  if (!token || !tokens.has(token)) {
    return fail(res, 403, 'CSRF token tidak valid');
  }
  tokens.delete(token);
  next();
};
```

3. **Apply to state-changing routes:**
```javascript
// backend/server.js
const { verifyCsrf } = require('./src/middlewares/csrf');

app.use('/api', verifyCsrf); // Apply to all API routes
```

---

### 4. API ENDPOINT HARDENING

#### [API-001] — MISSING AUTHENTICATION ON CONTACTS ENDPOINT — SEVERITY: SEDANG
**File:** `backend/src/routes/contacts.js` (line 18)  
**Issue:**
```javascript
router.post('/', contactLimiter, ctrl.create);  // NO requireAuth
```

**Why this is okay (but risky):**
- Contact form is intentionally public
- Rate limiter is present (max 5 per hour)

**Risk:** Rate limiter is per-IP. If attacker spams from multiple IPs (botnet/proxy), they can exceed limit. Current store is in-memory so gets cleared on restart.

**Fix (Priority: SEDANG):**
- Move rate limit store to Redis or database (persistent)
- Consider honeypot field to block simple bots:
```javascript
const { spam, contact_url, ...safe } = req.body;
if (spam || contact_url) return fail(res, 400, 'Invalid submission');
```

---

#### [API-002] — NO RATE LIMIT ON PUBLIC ENDPOINTS — SEVERITY: SEDANG
**File:** `backend/src/routes/publications.js` (lines 19-20)  
**Issue:**
```javascript
router.get('/', ctrl.getAll);        // NO rate limit
router.get('/:id', ctrl.getOne);     // NO rate limit
```

**Problem:** Scraping public content is unlimited. Attacker can enumerate all publications or cause resource exhaustion.

**Impact:** DB queries not protected from DoS.

**Fix:**
```javascript
const contentLimiter = createRateLimit({
  windowMs: 60 * 1000,
  max: 100,  // 100 requests per IP per minute
  prefix: 'content',
});

router.get('/', contentLimiter, ctrl.getAll);
router.get('/:id', contentLimiter, ctrl.getOne);
```

---

### 5. DATA PROTECTION & EXPOSURE

#### [DATA-001] — USER PASSWORD EXPOSED IN ERROR MESSAGES — SEVERITY: SEDANG
**File:** `backend/src/controllers/userController.js` (line 22)  
**Issue:** While not directly exposed in response, password is processed unsafely:
```javascript
const password = (req.body.password || '').trim();
// If logging errors, password might leak
```

**Best practice:** Never log sensitive fields.

**Fix:**
```javascript
// backend/src/lib/logger.js — add sanitizer
function sanitizeDetails(obj) {
  const keys = Object.keys(obj);
  return keys
    .filter(k => !['password', 'secret', 'token', 'JWT_SECRET'].includes(k))
    .reduce((acc, k) => ({ ...acc, [k]: obj[k] }), {});
}
```

---

#### [DATA-002] — SETTINGS ENDPOINT RETURNS NON-PUBLIC DATA — SEVERITY: SEDANG
**File:** `backend/src/controllers/settingsController.js` (lines 26-54)  
**Issue:** The `toPublic()` function is correctly filtering, so actually no issue here. ✓ Good practice.

---

#### [DATA-003] — MEDIA ENDPOINT ALLOWS UNRESTRICTED LISTING — SEVERITY: SEDANG
**File:** `backend/src/routes/media.js` (line 24)  
**Issue:**
```javascript
router.get('/by-key/:key', ctrl.getByKey);  // Public endpoint
```

**Problem:** If semantic keys are predictable (homepage.hero, footer.logo), attacker can enumerate all media. Not a major risk but should be documented.

**Impact:** Public asset discovery.

**Fix:** Require auth for `/media` listing but allow `/media/by-key/:key` (public).

---

### 6. UPLOAD & FILE HANDLING

#### [UPLOAD-001] — FILE UPLOAD VALIDATION INCOMPLETE — SEVERITY: SEDANG
**File:** `backend/src/middlewares/upload.js` (lines 43-51)  
**Issue:**
```javascript
const ALLOWED = /^(image\/(jpeg|png|gif|webp)|application\/pdf)$/;

function fileFilter(req, file, cb) {
  if (ALLOWED.test(file.mimetype)) {
    cb(null, true);
  } else {
    // reject
  }
}
```

**Problem:** MIME type is checked, but not the actual file magic bytes. Attacker can upload malicious file with faked MIME type.

**Impact:** If uploaded files are ever executed (unlikely with Express static) or displayed in a context where scripts run, RCE risk.

**Fix (Priority: SEDANG):**
```javascript
const fileType = require('file-type');  // npm install file-type

async function fileFilter(req, file, cb) {
  try {
    // Don't trust mimetype — check magic bytes
    const type = await fileType.fromBuffer(file.buffer);
    const allowed = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf'];
    if (type && allowed.includes(type.mime)) {
      cb(null, true);
    } else {
      cb(new Error('File type tidak diizinkan'));
    }
  } catch (err) {
    cb(err);
  }
}
```

---

#### [UPLOAD-002] — SVG INTENTIONALLY EXCLUDED — SEVERITY: RENDAH (Good practice)
**File:** `backend/src/middlewares/upload.js` (lines 17-18)  
**Note:** SVG is correctly excluded because inline `<script>` tags create stored-XSS vector. ✓

---

### 7. ENVIRONMENT & CONFIGURATION

#### [CONFIG-001] — JWT_SECRET VALIDATION — SEVERITY: KRITIS (if misconfigured)
**File:** `backend/server.js` (lines 12-15)  
**Status:** ✓ Good — server refuses to start if JWT_SECRET < 32 chars

**Note:** Ensure `backend/.env` is never committed. Check `.gitignore`.

---

#### [CONFIG-002] — FRONTEND API URL HARDCODED FOR LOCALHOST IN DEV — SEVERITY: RENDAH
**File:** `src/lib/api.js` (lines 1-10)  
**Issue:**
```javascript
const BASE_URL = RAW_BASE || 'http://localhost:5000/api';
```

**Problem:** If VITE_API_URL is not set in production, frontend points to localhost.

**Fix:** Make production build fail if VITE_API_URL is missing:
```javascript
if (!RAW_BASE && import.meta.env.PROD) {
  throw new Error('VITE_API_URL is required in production');
}
```

---

### 8. DATABASE & PERSISTENCE

#### [DB-001] — SQLITE NOT SUITABLE FOR PRODUCTION — SEVERITY: TINGGI
**File:** `backend/prisma/schema.prisma` (lines 5-7)  
**Issue:** SQLite is file-based, not designed for:
- Concurrent writes (admin + publisher both editing)
- Transactions under load
- Multi-process (PM2 cluster mode)
- Backups / HA

**Problem:** At scale, concurrent requests cause "database is locked" errors.

**Impact:** Unreliable under load. Production should use PostgreSQL.

**Fix (Priority: TINGGI):**
1. Migrate to PostgreSQL:
```bash
# Change .env DATABASE_URL
DATABASE_URL="postgresql://spd_user:pass@localhost:5432/spd?schema=public"

# Update schema.prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

# Push
npx prisma migrate deploy
```

---

#### [DB-002] — NO ENCRYPTION AT REST — SEVERITY: SEDANG
**Issue:** Database file (SQLite) and backups are unencrypted.

**Fix:** 
- PostgreSQL: enable SSL/TLS for connections
- Use encrypted backups
- Enable encryption at storage layer (VPS provider)

---

### 9. SESSION SECURITY

#### [SESSION-001] — COOKIE SAMESIITE CORRECTLY SET — SEVERITY: RENDAH (Good)
**File:** `backend/src/controllers/authController.js` (line 20)  
**Status:** ✓ `sameSite: 'strict'` is correct

---

### 10. LOGGING & AUDIT TRAIL

#### [LOG-001] — INCOMPLETE ACTIVITY LOGGING — SEVERITY: SEDANG
**File:** `backend/src/lib/logger.js` (assumed to exist)  
**Issue:** Not all sensitive actions are logged. Examples:
- Token blacklist additions (logout)
- Failed login attempts (only in some code paths)
- Failed auth checks
- Rate limit triggers

**Fix:**
- Log all auth events: success, failure, timeout, 2FA
- Log all role-based access denials
- Log all data modification (create, update, delete)

---

## Risk Matrix

| Finding | Severity | Exploitability | Impact | Priority |
|---------|----------|-----------------|--------|----------|
| No idle logout | KRITIS | High | Session hijacking | Immediate |
| Weak password policy | TINGGI | High | Account compromise | High |
| No 2FA | TINGGI | High | Account compromise | High |
| Non-persistent token blacklist | TINGGI | Medium | Post-logout access | High |
| Cross-publisher data access | TINGGI | Medium | Data tampering | High |
| No CSRF protection | TINGGI | Medium | Unwanted state changes | High |
| SQLite in production | TINGGI | Medium | System reliability | High |
| No login attempt logging | SEDANG | Low | Audit trail gaps | Medium |
| Weak file upload validation | SEDANG | Low | RCE (unlikely) | Medium |
| No rate limit on public APIs | SEDANG | Medium | DoS | Medium |
| No MFA | TINGGI | High | Account compromise | High |

---

## Remediation Roadmap

### Phase 1 (Critical — Next Sprint)
1. Implement server-side session timeout (8-hour max)
2. Move token blacklist to database
3. Enforce password policy (12 chars, complexity)
4. Add `createdBy` field and ownership checks on publications/events/programs

### Phase 2 (High Priority — 2 Weeks)
1. Implement email-based OTP as first MFA option
2. Add CSRF token validation
3. Migrate from SQLite to PostgreSQL
4. Add login failure logging to audit trail

### Phase 3 (Medium Priority — 1 Month)
1. Implement TOTP (authenticator app) option
2. Add rate limiting to public GET endpoints
3. Improve file upload validation (magic bytes)
4. Implement session revocation API

### Phase 4 (Nice to Have)
1. Implement IP allowlist for admin accounts
2. Add login anomaly detection (new country, device)
3. Implement JWT rotation (refresh tokens)
4. Add security headers audit in CI/CD

---

## Positive Findings (What's Secure)

✓ **httpOnly Cookie** — JWT stored securely, not accessible to JavaScript  
✓ **Helmet.js** — Security headers properly configured  
✓ **CORS Validation** — Origin whitelist enforced  
✓ **Rate Limiting** — Present on sensitive endpoints (login, contact)  
✓ **Bcrypt** — Passwords hashed with proper cost factor (10)  
✓ **SQL Injection Protection** — Prisma ORM prevents raw SQL injection  
✓ **SVG Upload Blocked** — Correctly prevents stored-XSS vector  
✓ **Admin Self-Demotion Blocked** — Good guardrail in user update  
✓ **JWT Signature Validation** — Algorithm locked to HS256, secret required

---

## Testing Recommendations

1. **Brute Force Test:** Attempt login 10+ times — verify rate limiter kicks in
2. **Token Replay:** Capture JWT, log out, attempt replay — should fail
3. **Idle Timeout:** Leave dashboard open 10 minutes without interaction — should log out
4. **CSRF Test:** Use browser dev tools to craft cross-site request to settings endpoint
5. **Cross-Publisher Test:** Login as Publisher A, try to edit Publisher B's publications
6. **SQLite Concurrency:** Simulate 50 concurrent write requests — measure failures

---

## Conclusion

The application has **solid foundational security** but requires **immediate remediation** of critical issues before production use. The idle logout, weak passwords, and non-persistent token blacklist are the highest risks.

Estimated effort to Phase 1 remediation: **10-15 days of development**.

Recommended: Prioritize login/auth security first, then data access control, then deployment infrastructure.

