require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

const DEFAULT_CATEGORIES = [
  { value: 'RISET SINGKAT', color: 'text-orange-500', bg: 'bg-orange-50', sortOrder: 0 },
  { value: 'RISET',         color: 'text-teal-500',   bg: 'bg-teal-50',   sortOrder: 1 },
  { value: 'OPINI',         color: 'text-slate-500',  bg: 'bg-slate-100', sortOrder: 2 },
  { value: 'ANALISIS',      color: 'text-blue-500',   bg: 'bg-blue-50',   sortOrder: 3 },
];

const ADMIN_EMAIL = process.env.INITIAL_ADMIN_EMAIL || 'admin@spdindonesia.org';
const ADMIN_NAME  = process.env.INITIAL_ADMIN_NAME  || 'Admin SPD Indonesia';
const ADMIN_PASSWORD = process.env.INITIAL_ADMIN_PASSWORD || null;

async function main() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!ADMIN_PASSWORD && isProd) {
    console.error('\x1b[31m[FATAL] INITIAL_ADMIN_PASSWORD must be set when seeding in production.\x1b[0m');
    process.exit(1);
  }

  const password = ADMIN_PASSWORD || 'admin123';
  const hashed = await bcrypt.hash(password, 10);

  // upsert with update:{} so re-seeding never overwrites a rotated password.
  const admin = await prisma.user.upsert({
    where: { email: ADMIN_EMAIL },
    update: {},
    create: {
      email: ADMIN_EMAIL,
      password: hashed,
      name: ADMIN_NAME,
      role: 'admin',
    },
  });

  await prisma.setting.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      siteName: 'SPD Indonesia',
      email: 'kontak@spdindonesia.org',
      logoUrl: '',
      heroUrl: '',
      placeholderUrl: '',
    },
  });

  for (const cat of DEFAULT_CATEGORIES) {
    await prisma.category.upsert({
      where: { value: cat.value },
      update: {},
      create: cat,
    });
  }

  console.log('Seed selesai.');
  console.log('Admin email:', admin.email);
  if (!ADMIN_PASSWORD) {
    console.warn('\x1b[33m[WARN] INITIAL_ADMIN_PASSWORD was not set.\x1b[0m');
    console.warn('       Default password "admin123" was used for FIRST admin creation only.');
    console.warn('       Re-running seed will NOT change an existing password.');
    console.warn('       Rotate it via the dashboard or: set INITIAL_ADMIN_PASSWORD and re-create the user.');
  } else {
    console.log('Admin password was taken from INITIAL_ADMIN_PASSWORD env.');
  }
}

main()
  .catch((err) => { console.error(err); process.exit(1); })
  .finally(() => prisma.$disconnect());
