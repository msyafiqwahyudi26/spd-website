/**
 * seed-all.js
 * Migrate all static fallback data (from src/data/about.jsx) into the database.
 * Safe to re-run: only inserts if the table is empty (skips if data already exists).
 *
 * Usage (from project root):
 *   node backend/scripts/seed-all.js
 */

require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/* ── Seed data (mirrors src/data/about.jsx) ─────────────────────────────── */

const STATS = [
  { value: '9',    label: 'Tahun Pengalaman',   sortOrder: 0 },
  { value: '15',   label: 'Mitra Kolaborasi',    sortOrder: 1 },
  { value: '35',   label: 'Program & Event',     sortOrder: 2 },
  { value: '100+', label: 'Youth Hub Members',   sortOrder: 3 },
  { value: '20',   label: 'Kota Jangkauan',      sortOrder: 4 },
];

const PARTNERS = [
  { name: 'KPU',                   sortOrder: 0 },
  { name: 'BAWASLU',               sortOrder: 1 },
  { name: 'Mahkamah Konstitusi',   sortOrder: 2 },
  { name: 'DPP',                   sortOrder: 3 },
  { name: 'Perpustakaan Nasional', sortOrder: 4 },
  { name: 'Universitas Indonesia', sortOrder: 5 },
  { name: 'UGM',                   sortOrder: 6 },
  { name: 'LIPI',                  sortOrder: 7 },
  { name: 'FISIP UNDIP',           sortOrder: 8 },
];

const TEAM = [
  {
    name: 'Erik Kurniawan',
    role: 'Direktur Eksekutif',
    expertise: 'Hukum Tata Negara',
    bio: 'Erik memimpin SPD dengan latar belakang hukum tata negara dan reformasi kelembagaan. Fokus kajiannya adalah desain sistem pemilu dan tata kelola partai politik di Indonesia.',
    featured: true,
    sortOrder: 0,
  },
  {
    name: 'Aqidatul Izza Zain',
    role: 'Peneliti',
    expertise: 'Studi Partai Politik',
    bio: 'Aqidatul fokus pada riset partai politik dan perilaku pemilih. Beberapa tulisannya membahas politik uang dan kandidasi internal partai.',
    featured: false,
    sortOrder: 1,
  },
  {
    name: 'M. Adnan Maghribbi',
    role: 'Peneliti',
    expertise: 'Data Politik & Komputasi Sosial',
    bio: 'Adnan memimpin tim data SPD, menerjemahkan riset menjadi visualisasi yang dapat diakses publik di Dashboard Pemilu Terbuka.',
    featured: false,
    sortOrder: 2,
  },
  {
    name: 'Putra Satria',
    role: 'Peneliti',
    expertise: 'Partisipasi Publik',
    bio: 'Putra menangani program pelatihan dan riset lapangan SPD, dengan fokus pada partisipasi publik dalam pengawasan pemilu.',
    featured: false,
    sortOrder: 3,
  },
  {
    name: 'Lisa Safitri',
    role: 'Admin & Keuangan',
    expertise: 'Manajemen Organisasi',
    bio: 'Lisa menangani operasional dan memastikan transparansi keuangan SPD sesuai standar akuntansi nirlaba.',
    featured: false,
    sortOrder: 4,
  },
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

const MISSIONS = [
  { text: 'Meningkatkan profesionalisme dan integritas dalam penelitian dan aktivisme demokrasi.', sortOrder: 0 },
  { text: 'Mendukung transparansi dan akuntabilitas penyelenggaraan pemilu.', sortOrder: 1 },
  { text: 'Mendorong inovasi dan kebijakan pemilu yang berbasis data.', sortOrder: 2 },
  { text: 'Membangun komunitas analitik dan kebijakan yang handal.', sortOrder: 3 },
  { text: 'Memfasilitasi ruang partisipasi bagi generasi muda dalam politik dengan mengembangkan Youth Hub Community in Politica.', sortOrder: 4 },
];

const CORE_VALUES = [
  {
    iconKey: 'collaboration',
    title: 'Kolaboratif',
    description: 'Membangun kemitraan strategis dengan berbagai pihak untuk menciptakan dampak kebijakan yang lebih besar.',
    sortOrder: 0,
  },
  {
    iconKey: 'data',
    title: 'Berbasis Data',
    description: 'Menggunakan pendekatan berbasis data dan fakta dalam setiap pengambilan keputusan dan rekomendasi kebijakan yang kami buat.',
    sortOrder: 1,
  },
  {
    iconKey: 'innovation',
    title: 'Inovatif',
    description: 'Mengembangkan pendekatan-pendekatan baru dan inovatif dalam menghadapi tantangan demokrasi dan kepemiluan.',
    sortOrder: 2,
  },
  {
    iconKey: 'youth',
    title: 'Inklusif',
    description: 'Memfasilitasi ruang partisipasi bagi semua pihak, termasuk generasi muda melalui Youth Hub Community.',
    sortOrder: 3,
  },
];

const PROGRAMS = [
  {
    title: 'Youth Hub Community in Politica',
    slug: 'youth-hub-community-in-politica',
    status: 'published',
    category: 'Pemberdayaan',
    description: 'Program inkubasi kepemimpinan politik bagi generasi muda yang ingin berkontribusi aktif dalam demokrasi Indonesia. Youth Hub menyediakan ruang diskusi, pelatihan, dan jaringan lintas daerah.',
    fullContent: JSON.stringify([
      { type: 'lead', text: 'Youth Hub Community in Politica adalah program unggulan SPD yang dirancang untuk melibatkan generasi muda secara bermakna dalam proses demokrasi Indonesia.' },
      { type: 'heading', text: 'Latar Belakang' },
      { type: 'paragraph', text: 'Partisipasi pemuda dalam politik Indonesia masih terbatas pada momen elektoral. Youth Hub hadir untuk mengubah paradigma tersebut dengan membangun komunitas analis muda yang aktif sepanjang tahun.' },
      { type: 'heading', text: 'Program yang Kami Jalankan' },
      { type: 'paragraph', text: 'Workshop bulanan analisis kebijakan, school of democracy regional, mentoring dengan praktisi politik, dan penerbitan Policy Brief oleh anggota muda.' },
    ]),
    image: null,
    gallery: JSON.stringify([]),
    link: null,
    sortOrder: 0,
  },
  {
    title: 'Dashboard Pemilu Terbuka',
    slug: 'dashboard-pemilu-terbuka',
    status: 'published',
    category: 'Riset & Analisis',
    description: 'Platform data pemilu berbasis web yang menyajikan hasil rekapitulasi, tren partisipasi, dan analisis geospasial secara terbuka dan dapat diakses publik.',
    fullContent: JSON.stringify([
      { type: 'lead', text: 'Dashboard Pemilu Terbuka adalah inisiatif teknologi SPD untuk memastikan data pemilu Indonesia dapat diakses, dipahami, dan diverifikasi oleh siapa saja.' },
      { type: 'heading', text: 'Fitur Utama' },
      { type: 'paragraph', text: 'Visualisasi hasil pemilu per TPS, peta distribusi suara, tren partisipasi historis 2009–2024, dan data suara tidak sah yang terstruktur.' },
      { type: 'heading', text: 'Dampak' },
      { type: 'paragraph', text: 'Digunakan oleh jurnalis, peneliti, dan pemantau pemilu untuk memverifikasi data resmi KPU secara independen.' },
    ]),
    image: null,
    gallery: JSON.stringify([]),
    link: null,
    sortOrder: 1,
  },
  {
    title: 'Pengawasan Pemilu Berbasis Komunitas',
    slug: 'pengawasan-pemilu-berbasis-komunitas',
    status: 'published',
    category: 'Pengawasan Pemilu',
    description: 'Jaringan pemantau pemilu independen yang tersebar di berbagai daerah untuk memastikan proses pemilu berjalan jujur, adil, dan transparan.',
    fullContent: JSON.stringify([
      { type: 'lead', text: 'Program pengawasan berbasis komunitas SPD membangun kapasitas pemantau lokal yang mampu mendokumentasikan dan melaporkan pelanggaran pemilu secara sistematis.' },
      { type: 'heading', text: 'Metodologi' },
      { type: 'paragraph', text: 'Pelatihan pemantau, standar dokumentasi pelanggaran, integrasi laporan digital, dan koordinasi dengan Bawaslu di tingkat kabupaten/kota.' },
    ]),
    image: null,
    gallery: JSON.stringify([]),
    link: null,
    sortOrder: 2,
  },
];

const APPROACHES = [
  {
    iconKey: 'collaboration',
    title: 'Kolaborasi Multi-Pihak',
    description: 'Kami membangun jembatan antara masyarakat sipil, pemerintah, akademisi, dan komunitas untuk mendorong reformasi yang inklusif.',
    sortOrder: 0,
  },
  {
    iconKey: 'data',
    title: 'Riset Berbasis Data',
    description: 'Setiap rekomendasi kebijakan didasarkan pada riset kuantitatif dan kualitatif yang ketat, bukan asumsi.',
    sortOrder: 1,
  },
  {
    iconKey: 'youth',
    title: 'Pemberdayaan Pemuda',
    description: 'Youth Hub Community in Politica memberi ruang bagi generasi muda untuk berpartisipasi aktif dalam demokrasi.',
    sortOrder: 2,
  },
  {
    iconKey: 'innovation',
    title: 'Inovasi Teknologi',
    description: 'Kami mengembangkan platform data terbuka dan alat digital untuk meningkatkan transparansi dan partisipasi publik.',
    sortOrder: 3,
  },
];

/* ── Seed functions ─────────────────────────────────────────────────────── */

async function seedTable(name, count, seedFn) {
  if (count > 0) {
    console.log(`  ⏭  ${name}: ${count} rows exist — skipping`);
    return;
  }
  await seedFn();
  console.log(`  ✅ ${name}: seeded`);
}

async function main() {
  console.log('\n🌱  SPD Seed Script — migrating static data to database\n');

  const counts = await Promise.all([
    prisma.stat.count(),
    prisma.partner.count(),
    prisma.teamMember.count(),
    prisma.milestone.count(),
    prisma.missionItem.count(),
    prisma.coreValue.count(),
    prisma.approach.count(),
    prisma.program.count(),
  ]);

  const [statC, partnerC, teamC, milestoneC, missionC, cvC, approachC, programC] = counts;

  await seedTable('Stats', statC, () =>
    prisma.stat.createMany({ data: STATS }));

  await seedTable('Partners', partnerC, () =>
    prisma.partner.createMany({ data: PARTNERS }));

  await seedTable('Team', teamC, async () => {
    for (const m of TEAM) await prisma.teamMember.create({ data: m });
  });

  await seedTable('Milestones', milestoneC, () =>
    prisma.milestone.createMany({ data: MILESTONES }));

  await seedTable('Missions', missionC, () =>
    prisma.missionItem.createMany({ data: MISSIONS }));

  await seedTable('Core Values', cvC, () =>
    prisma.coreValue.createMany({ data: CORE_VALUES }));

  await seedTable('Approaches', approachC, () =>
    prisma.approach.createMany({ data: APPROACHES }));

  await seedTable('Programs', programC, async () => {
    for (const p of PROGRAMS) await prisma.program.create({ data: p });
  });

  console.log('\n✨  Done! All tables populated. The dashboard is ready to use.\n');
}

main()
  .catch((e) => { console.error('Seed failed:', e); process.exit(1); })
  .finally(() => prisma.$disconnect());
