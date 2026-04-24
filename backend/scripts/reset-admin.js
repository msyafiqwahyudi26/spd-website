/**
 * Reset (or create) the primary admin account.
 *
 * Usage:
 *   npm run admin:reset
 *
 * Uses ADMIN_EMAIL + ADMIN_PASSWORD from env if present, otherwise falls
 * back to the values below. Always stores a bcrypt hash — never plaintext.
 * Safe to run repeatedly; existing account has its password rewritten.
 */

require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const EMAIL    = process.env.ADMIN_EMAIL    || 'admin@spdindonesia.org';
// R13: No hardcoded fallback password — must be set via ADMIN_PASSWORD env var in production.
// For local dev, set it in backend/.env before running.
const PASSWORD = process.env.ADMIN_PASSWORD;
const NAME     = process.env.ADMIN_NAME     || 'Admin SPD Indonesia';

if (!PASSWORD) {
  console.error('[reset-admin] ADMIN_PASSWORD env var is required. Set it in .env before running.');
  console.error('  Example: ADMIN_PASSWORD="MySecurePass123!" node scripts/reset-admin.js');
  process.exit(1);
}

async function main() {
  if (typeof PASSWORD !== 'string' || PASSWORD.length < 8) {
    console.error('[reset-admin] Password must be at least 8 characters.');
    process.exit(1);
  }

  const prisma = new PrismaClient();
  try {
    const hashed = await bcrypt.hash(PASSWORD, 10);

    const user = await prisma.user.upsert({
      where:  { email: EMAIL },
      update: { password: hashed, role: 'admin', name: NAME },
      create: { email: EMAIL, password: hashed, role: 'admin', name: NAME },
    });

    console.log('Admin account is ready:');
    console.log('  Email :', user.email);
    console.log('  Role  :', user.role);
    console.log('  Name  :', user.name);
    console.log('');
    console.log('Password has been reset. Rotate it from the dashboard once logged in.');
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((err) => {
  console.error('[reset-admin] failed:', err);
  process.exit(1);
});
