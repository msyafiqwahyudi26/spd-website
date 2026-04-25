/**
 * seed-defaults.js
 * ─────────────────────────────────────────────────────────────────────────
 * Inserts the static fallback data (yang ada di frontend JS) ke database
 * supaya bisa diedit dari dashboard.
 *
 * AMAN dijalankan berkali-kali:
 *   - Kalau tabel sudah ada isinya → di-skip (tidak ditimpa)
 *   - Kalau tabel kosong → di-insert
 *
 * Cara pakai:
 *   cd backend
 *   node scripts/seed-defaults.js
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/* ── Data ──────────────────────────────────────────────────────────────── */

const APPROACHES = [
  {
    iconKey: 'collaboration',
    iconUrl: '',
    title: 'Kolaborasi Multi-Pihak',
    description: 'Program advokasi politik untuk pemilih muda dalam rangka mempromosikan dialog yang konstruktif, partisipatif aktif, dan harapan perbedaan melalui proses politik elektoral.',
    sortOrder: 0,
  },
  {
    iconKey: 'data',
    iconUrl: '',
    title: 'Pusat Data Pemilu',
    description: 'Mengembangkan program pusat data pemilu dan inisiatif platform data untuk mendukung transparansi informasi.',
    sortOrder: 1,
  },
  {
    iconKey: 'youth',
    iconUrl: '',
    title: 'Youth Hub Community',
    description: 'Memfasilitasi ruang partisipasi bagi generasi muda dalam politik melalui pengembangan Youth Hub Community in Politica.',
    sortOrder: 2,
  },
];

const CORE_VALUES = [
  {
    iconKey: 'collaboration',
    iconUrl: '',
    title: 'Kolaboratif',
    description: 'Membangun kemitraan strategis dengan berbagai pihak untuk menciptakan dampak kebijakan yang lebih besar.',
    sortOrder: 0,
  },
  {
    iconKey: 'data',
    iconUrl: '',
    title: 'Berbasis Data',
    description: 'Menggunakan pendekatan berbasis data dan fakta dalam setiap pengambilan keputusan dan rekomendasi kebijakan yang kami buat.',
    sortOrder: 1,
  },
  {
    iconKey: 'lightbulb',
    iconUrl: '',
    title: 'Inovatif',
    description: 'Mengembangkan pendekatan-pendekatan baru dan inovatif dalam menghadapi tantangan demokrasi dan kepemiluan.',
    sortOrder: 2,
  },
  {
    iconKey: 'users',
    iconUrl: '',
    title: 'Inklusif',
    description: 'Memfasilitasi ruang partisipasi bagi semua pihak, termasuk generasi muda melalui Youth Hub Community.',
    sortOrder: 3,
  },
];

const MISSIONS = [
  { text: 'Meningkatkan profesionalisme dan integritas dalam penelitian dan aktivisme demokrasi.', sortOrder: 0 },
  { text: 'Mendukung transparansi dan akuntabilitas penyelenggaraan pemilu.', sortOrder: 1 },
  { text: 'Mendorong inovasi dan kebijakan pemilu yang berbasis data.', sortOrder: 2 },
  { text: 'Membangun komunitas analitik dan kebijakan yang handal.', sortOrder: 3 },
  { text: 'Memfasilitasi ruang partisipasi bagi generasi muda dalam politik dengan mengembangkan Youth Hub Community in Politica.', sortOrder: 4 },
];

const MILESTONES = [
  {
    year: '27 April 2016',
    tag: 'TONGGAK',
    title: 'Sindikasi Pemilu dan Demokrasi Didirikan',
    description: 'SPD resmi berdiri sebagai organisasi masyarakat sipil yang berfokus pada riset dan advokasi pemilu serta demokrasi di Indonesia.',
    sortOrder: 0,
  },
  {
    year: '2016–2017',
    tag: 'ADVOKASI',
    title: 'Tim Pakar Pemerintah dalam Pembahasan UU No. 7 Tahun 2017',
    description: 'SPD terlibat sebagai tim pakar dalam penyusunan Undang-Undang Pemilu, memberikan masukan berbasis riset untuk reformasi sistem pemilu.',
    sortOrder: 1,
  },
  {
    year: '2018',
    tag: 'RISET',
    title: 'Kajian Tipologi Partai Politik dan Skema Pendanaan Partai',
    description: 'Riset komprehensif tentang tipologi partai politik Indonesia dan skema pendanaan yang berkontribusi pada transparansi demokrasi internal partai.',
    sortOrder: 2,
  },
];

const STATS = [
  { value: '9',    label: 'Tahun Pengalaman', sortOrder: 0 },
  { value: '15',   label: 'Mitra Kolaborasi', sortOrder: 1 },
  { value: '35',   label: 'Program & Event',  sortOrder: 2 },
  { value: '100+', label: 'Youth Hub Members', sortOrder: 3 },
  { value: '20',   label: 'Kota Jangkauan',   sortOrder: 4 },
];

/* ── Helpers ───────────────────────────────────────────────────────────── */

async function seedTable(name, countFn, insertFn) {
  const count = await countFn();
  if (count > 0) {
    console.log(`  ⏭  ${name}: sudah ada ${count} baris — di-skip`);
    return;
  }
  await insertFn();
  console.log(`  ✓  ${name}: data default berhasil di-insert`);
}

/* ── Main ──────────────────────────────────────────────────────────────── */

async function run() {
  console.log('\nSeed defaults...\n');

  await seedTable(
    'Approach',
    () => prisma.approach.count(),
    () => prisma.approach.createMany({ data: APPROACHES }),
  );

  await seedTable(
    'CoreValue',
    () => prisma.coreValue.count(),
    () => prisma.coreValue.createMany({ data: CORE_VALUES }),
  );

  await seedTable(
    'MissionItem',
    () => prisma.missionItem.count(),
    () => prisma.missionItem.createMany({ data: MISSIONS }),
  );

  await seedTable(
    'Milestone',
    () => prisma.milestone.count(),
    () => prisma.milestone.createMany({ data: MILESTONES }),
  );

  await seedTable(
    'Stat',
    () => prisma.stat.count(),
    () => prisma.stat.createMany({ data: STATS }),
  );

  console.log('\nSelesai! Semua data default sudah masuk ke database.\n');
}

run()
  .catch((err) => { console.error('Error:', err.message); process.exit(1); })
  .finally(() => prisma.$disconnect());
