require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');
const fs = require('fs');
const emailService = require('./src/services/emailService');
const { ok: okResponse, fail } = require('./src/lib/response');
const { createRateLimit } = require('./src/middlewares/rateLimit');

// ── Startup env validation ──────────────────────────────────────────────
if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
  console.error('\x1b[31m[FATAL] JWT_SECRET must be set and at least 32 characters long. Refusing to start.\x1b[0m');
  process.exit(1);
}

const IS_PROD = process.env.NODE_ENV === 'production';

if (IS_PROD && !process.env.FRONTEND_URL) {
  console.error('\x1b[31m[FATAL] FRONTEND_URL must be set in production.\x1b[0m');
  process.exit(1);
}

{
  const email = emailService.validateConfig();
  if (!email.configured) {
    console.warn('\x1b[33m[WARN] Email is NOT configured.\x1b[0m');
    console.warn(`        Missing env: ${email.missing.join(', ')}`);
    console.warn('        Contact notifications and admin replies will be disabled.');
  } else {
    console.log(`[OK] Email configured. Inbound notifications → ${email.inboundTarget}`);
    if (email.missingInbound) {
      console.warn('[INFO] EMAIL_TO not set — defaulting to info@spdindonesia.org.');
    }
  }
}

const app = express();

const TRUST_PROXY_RAW = process.env.TRUST_PROXY;
const TRUST_PROXY = TRUST_PROXY_RAW !== undefined && TRUST_PROXY_RAW !== ''
  ? Number.parseInt(TRUST_PROXY_RAW, 10)
  : 1;
app.set('trust proxy', Number.isFinite(TRUST_PROXY) ? TRUST_PROXY : 1);

const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// ── Security headers ────────────────────────────────────────────────────
// Helmet sets sensible defaults: X-Content-Type-Options, X-DNS-Prefetch-Control,
// Strict-Transport-Security (2 years, includeSubDomains), Referrer-Policy,
// X-Download-Options, X-Frame-Options DENY, X-Permitted-Cross-Domain-Policies.
// CSP is configured below. Disabled for local dev by default so the Vite
// dev server's inline scripts don't get blocked — in production we enable
// a permissive-but-sane policy. Individual apps that need a stricter CSP
// should tighten it once the frontend is fully in production.
app.use(helmet({
  contentSecurityPolicy: IS_PROD
    ? {
        useDefaults: true,
        directives: {
          defaultSrc: ["'self'"],
          imgSrc: ["'self'", 'data:', 'blob:', 'https:'],
          scriptSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          connectSrc: ["'self'", process.env.FRONTEND_URL].filter(Boolean),
          fontSrc: ["'self'", 'data:'],
          objectSrc: ["'none'"],
          frameAncestors: ["'none'"],
          baseUri: ["'self'"],
          formAction: ["'self'"],
        },
      }
    : false,
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  crossOriginEmbedderPolicy: false,
  hsts: IS_PROD ? { maxAge: 63072000, includeSubDomains: true, preload: true } : false,
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
  frameguard: { action: 'deny' },
}));

const ALLOWED_ORIGINS = IS_PROD
  ? [process.env.FRONTEND_URL].filter(Boolean)
  : [
      process.env.FRONTEND_URL || 'http://localhost:5173',
      'http://localhost:5173',
      'http://localhost:5174',
      'http://localhost:4173',
      'http://127.0.0.1:5173',
      'http://127.0.0.1:5174',
    ];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (ALLOWED_ORIGINS.includes(origin)) return callback(null, true);
    callback(new Error(`CORS: origin ${origin} not allowed`));
  },
  credentials: true,
}));

app.use(express.json({ limit: '1mb' }));
app.use('/uploads', express.static(uploadsDir, {
  // Prevent uploaded content from being treated as executable by the browser.
  setHeaders: (res) => {
    res.set('X-Content-Type-Options', 'nosniff');
    res.set('Cache-Control', 'public, max-age=31536000, immutable');
  },
}));

// Broad API rate limit: second layer under the stricter per-route limits
// (login / contact / subscribe / view). Sized to be generous for normal
// dashboard usage while capping script-driven abuse per IP.
const globalApiLimiter = createRateLimit({
  windowMs: 60 * 1000,
  max: 300,
  prefix: 'api',
  message: 'Terlalu banyak permintaan, coba lagi sebentar lagi.',
});
app.use('/api', globalApiLimiter);

// Root friendly response — visitors (or a misconfigured frontend) hitting
// http://host/ see an informative payload instead of Express's raw
// "Cannot GET /". Real API work happens under /api/*.
app.get('/', (req, res) => {
  return okResponse(res, {
    status: 'ok',
    message: 'SPD Backend is running. API base is /api',
    apiBase: '/api',
    health: '/api',
    version: '1.1.0',
  });
});

app.get('/api', (req, res) => {
  return okResponse(res, { status: 'ok', message: 'SPD Backend is running', version: '1.1.0' });
});

app.use('/api/auth',         require('./src/routes/auth'));
app.use('/api/publications', require('./src/routes/publications'));
app.use('/api/events',       require('./src/routes/events'));
app.use('/api/programs',     require('./src/routes/programs'));
app.use('/api/contacts',     require('./src/routes/contacts'));
app.use('/api/users',        require('./src/routes/users'));
app.use('/api/analytics',    require('./src/routes/analytics'));
app.use('/api/logs',         require('./src/routes/logs'));
app.use('/api/settings',     require('./src/routes/settings'));
app.use('/api/categories',   require('./src/routes/categories'));
app.use('/api/media',        require('./src/routes/media'));
app.use('/api/partners',     require('./src/routes/partners'));
app.use('/api/stats',        require('./src/routes/stats'));
app.use('/api/team',            require('./src/routes/team'));
app.use('/api/milestones',      require('./src/routes/milestones'));
app.use('/api/missions',        require('./src/routes/missions'));
app.use('/api/approaches',      require('./src/routes/approaches'));
app.use('/api/core-values',     require('./src/routes/core-values'));
app.use('/api/footer-links',    require('./src/routes/footer-links'));
app.use('/api/system',          require('./src/routes/system'));
app.use('/api/annual-reports',  require('./src/routes/annual-reports'));
app.use('/api/subscribers',  require('./src/routes/subscribers'));
app.use('/api/infografis',    require('./src/routes/infografis'));
app.use('/api/election-data', require('./src/routes/election-data'));
app.use('/api/kpu',           require('./src/routes/kpu'));

app.use('/api/*', (req, res) => {
  return fail(res, 404, `Route ${req.method} ${req.originalUrl} not found`);
});

// ── Global error handler ────────────────────────────────────────────────
// Client-facing messages are generic; full error + stack is logged server-side.
app.use((err, req, res, next) => {
  if (err && err.message && err.message.startsWith('CORS:')) {
    console.warn(`[CORS] ${req.method} ${req.originalUrl} — ${err.message}`);
    return fail(res, 403, 'Akses ditolak');
  }

  const ts = new Date().toISOString();
  console.error(`[${ts}] ${req.method} ${req.originalUrl}\n`, err && err.stack ? err.stack : err);

  if (err && typeof err.code === 'string' && err.code.startsWith('P')) {
    switch (err.code) {
      case 'P2002': return fail(res, 409, 'Data sudah ada');
      case 'P2025': return fail(res, 404, 'Data tidak ditemukan');
      case 'P2003': return fail(res, 400, 'Data tidak valid');
      default:      return fail(res, 500, 'Terjadi kesalahan pada server');
    }
  }

  if (err && typeof err.status === 'number' && typeof err.clientMessage === 'string') {
    return fail(res, err.status, err.clientMessage);
  }

  if (err && err.type === 'entity.too.large') {
    return fail(res, 413, 'Ukuran data terlalu besar');
  }

  return fail(res, 500, 'Terjadi kesalahan pada server');
});

const PORT = parseInt(process.env.PORT, 10) || 5000;

// R7: Bind to 127.0.0.1 (loopback only) so the port is never reachable
// directly from the internet — all public traffic must go through Nginx.
const BIND_HOST = process.env.NODE_ENV === 'production' ? '127.0.0.1' : '0.0.0.0';
const server = app.listen(PORT, BIND_HOST, () => {
  console.log(`SPD Backend running on http://${BIND_HOST}:${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/api`);
});

server.on('error', (err) => {
  if (err && err.code === 'EADDRINUSE') {
    console.error('\x1b[31m[FATAL] Port ' + PORT + ' is already in use.\x1b[0m');
    console.error('        Another backend is still running (or a crashed process is holding the port).');
    console.error('        Fix it with:   npm run kill-port');
    console.error('        Or reset the full dev env:   npm run dev:reset');
    process.exit(1);
  }
  throw err;
});

// Graceful shutdown so Ctrl+C / nodemon restarts don't leave zombies.
let shuttingDown = false;
function shutdown(signal) {
  if (shuttingDown) return;
  shuttingDown = true;
  console.log(`\n[${signal}] Shutting down gracefully...`);
  server.close(() => process.exit(0));
  // Hard cutoff so a stuck connection can't stall shutdown forever.
  setTimeout(() => process.exit(1), 5000).unref();
}
process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT',  () => shutdown('SIGINT'));
