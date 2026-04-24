/**
 * Launch-prep sample content seed.
 *
 *   npm run seed:sample
 *
 * Idempotent: each table is populated only if empty. Safe to re-run.
 * Not a production data loader — real data should be entered via the
 * dashboard. This exists so a fresh deploy has plausible content for
 * smoke-testing and for the admin to see the site shape immediately.
 */

require('dotenv').config();
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const PUBLICATIONS = [
  {
    title: 'Partisipasi Pemilih Muda di Pemilu 2024',
    category: 'RISET',
    description: 'Kajian tentang kecenderungan partisipasi politik pemilih usia 17–29 tahun pada Pemilu 2024 di sepuluh provinsi.',
    author: 'Tim Riset SPD',
    readTime: '8 menit baca',
    date: '15 Maret 2026',
    fullContent: JSON.stringify([
      { type: 'lead', text: 'Partisipasi pemilih muda menjadi salah satu indikator paling penting untuk menilai kesehatan demokrasi elektoral Indonesia.' },
      { type: 'heading', text: 'Temuan Utama' },
      { type: 'paragraph', text: 'Tingkat partisipasi pemilih muda di sepuluh provinsi yang kami kaji menunjukkan variasi yang signifikan — dari 74% hingga 88%.' },
    ]),
    gallery: JSON.stringify([]),
  },
  {
    title: 'Transparansi Dana Kampanye: Tinjauan Regulasi',
    category: 'ANALISIS',
    description: 'Analisis kerangka hukum pelaporan dana kampanye dan titik-titik lemah yang memerlukan perbaikan regulasi.',
    author: 'Erik Kurniawan',
    readTime: '12 menit baca',
    date: '28 Februari 2026',
    fullContent: JSON.stringify([
      { type: 'lead', text: 'Regulasi dana kampanye di Indonesia memiliki kerangka yang komprehensif di atas kertas, tetapi menghadapi tantangan signifikan dalam implementasi.' },
    ]),
    gallery: JSON.stringify([]),
  },
  {
    title: 'Catatan Pilkada Serentak 2024',
    category: 'OPINI',
    description: 'Refleksi pelaksanaan Pilkada serentak dan implikasinya terhadap tata kelola pemilu ke depan.',
    author: 'Aqidatul Izza Zain',
    readTime: '6 menit baca',
    date: '10 Januari 2026',
    fullContent: JSON.stringify([
      { type: 'lead', text: 'Pilkada serentak 2024 menyisakan banyak pelajaran penting bagi tata kelola pemilu di Indonesia.' },
    ]),
    gallery: JSON.stringify([]),
  },
];

const EVENTS = [
  {
    title: 'Diskusi Publik: Evaluasi Pemilu 2024',
    date: '15 Mei 2026',
    startsAt: new Date('2026-05-15T13:00:00Z'),
    location: 'Jakarta',
    description: 'Diskusi terbuka mengevaluasi pelaksanaan Pemilu 2024 dengan menghadirkan akademisi, penyelenggara pemilu, dan perwakilan masyarakat sipil.',
  },
  {
    title: 'Sekolah Jubir Warga — Surabaya',
    date: '22 Juni 2026',
    startsAt: new Date('2026-06-22T09:00:00Z'),
    location: 'Surabaya, Jawa Timur',
    description: 'Pelatihan tiga hari untuk menyiapkan jurnalis warga dalam pemantauan proses pemilu dan advokasi kebijakan lokal.',
  },
  {
    title: 'Launching Riset: Indeks Demokrasi Daerah',
    date: '10 Juli 2026',
    startsAt: new Date('2026-07-10T10:00:00Z'),
    location: 'Yogyakarta',
    description: 'Peluncuran publikasi tahunan SPD tentang indeks demokrasi di 34 provinsi.',
  },
];

const TEAM = [
  {
    name: 'Erik Kurniawan',
    role: 'Direktur Eksekutif',
    expertise: 'Hukum Tata Negara',
    bio: 'Erik memimpin SPD dengan latar belakang hukum tata negara dan reformasi kelembagaan, dengan fokus pada desain sistem pemilu dan tata kelola partai politik.',
    featured: true,
  },
  {
    name: 'Aqidatul Izza Zain',
    role: 'Peneliti Senior',
    expertise: 'Studi Partai Politik',
    bio: 'Aqidatul memimpin program Jubir Warga dan telah menulis tiga buku tentang politik uang dan perilaku pemilih di Indonesia.',
  },
  {
    name: 'M. Adnan Maghribbi',
    role: 'Peneliti',
    expertise: 'Data Politik & Komputasi Sosial',
    bio: 'Adnan mengembangkan Dashboard Pemilu Terbuka SPD dan memimpin tim data yang menerjemahkan riset menjadi visualisasi yang bisa diakses publik.',
  },
  {
    name: 'Lisa Safitri',
    role: 'Admin & Keuangan',
    expertise: 'Manajemen Organisasi',
    bio: 'Lisa menangani operasional lembaga dan memastikan transparansi keuangan SPD sesuai standar akuntansi nirlaba internasional.',
  },
];

const PARTNERS = [
  { name: 'Komisi Pemilihan Umum' },
  { name: 'Badan Pengawas Pemilu' },
  { name: 'Mahkamah Konstitusi' },
  { name: 'Universitas Indonesia' },
  { name: 'Universitas Gadjah Mada' },
  { name: 'Perpustakaan Nasional' },
];

const STATS = [
  { value: '9',    label: 'Tahun Pengalaman' },
  { value: '15',   label: 'Mitra Kolaborasi' },
  { value: '35',   label: 'Program & Event' },
  { value: '100+', label: 'Youth Hub Members' },
  { value: '20',   label: 'Kota Jangkauan' },
];

const MILESTONES = [
  { year: '2016',      tag: 'TONGGAK',  title: 'Sindikasi Pemilu dan Demokrasi Didirikan', description: 'SPD resmi berdiri sebagai organisasi masyarakat sipil yang berfokus pada riset dan advokasi pemilu serta demokrasi di Indonesia.' },
  { year: '2016–2017', tag: 'ADVOKASI', title: 'Tim Pakar Pembahasan UU Pemilu',            description: 'SPD terlibat sebagai tim pakar dalam penyusunan Undang-Undang Pemilu, memberikan masukan berbasis riset untuk reformasi sistem pemilu.' },
  { year: '2018',      tag: 'RISET',    title: 'Kajian Tipologi Partai Politik',            description: 'Riset komprehensif tentang tipologi partai politik Indonesia dan skema pendanaan yang berkontribusi pada transparansi demokrasi internal partai.' },
];

const MISSIONS = [
  { text: 'Meningkatkan profesionalisme dan integritas dalam penelitian dan aktivisme demokrasi.' },
  { text: 'Mendukung transparansi dan akuntabilitas penyelenggaraan pemilu.' },
  { text: 'Mendorong inovasi dan kebijakan pemilu yang berbasis data.' },
  { text: 'Membangun komunitas analitik dan kebijakan yang handal.' },
  { text: 'Memfasilitasi ruang partisipasi bagi generasi muda dalam politik.' },
];

function makeSlug(title) {
  return (
    title
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim() +
    '-' +
    Date.now() +
    '-' +
    Math.floor(Math.random() * 1000)
  );
}

async function seedIfEmpty(name, countFn, insertFn) {
  const n = await countFn();
  if (n > 0) {
    console.log(`  [skip] ${name}: already has ${n} row(s)`);
    return 0;
  }
  const added = await insertFn();
  console.log(`  [ok]   ${name}: inserted ${added} row(s)`);
  return added;
}

async function main() {
  console.log('── Seeding sample content ──');

  await seedIfEmpty('publications',
    () => prisma.publication.count(),
    async () => {
      let i = 0;
      for (const p of PUBLICATIONS) {
        await prisma.publication.create({ data: { ...p, slug: makeSlug(p.title) } });
        i++;
      }
      return i;
    },
  );

  await seedIfEmpty('events',
    () => prisma.event.count(),
    async () => {
      let i = 0;
      for (const e of EVENTS) {
        await prisma.event.create({ data: { ...e, slug: makeSlug(e.title) } });
        i++;
      }
      return i;
    },
  );

  await seedIfEmpty('team',
    () => prisma.teamMember.count(),
    async () => {
      let i = 0;
      for (const t of TEAM) {
        await prisma.teamMember.create({ data: { ...t, sortOrder: i } });
        i++;
      }
      return i;
    },
  );

  await seedIfEmpty('partners',
    () => prisma.partner.count(),
    async () => {
      let i = 0;
      for (const p of PARTNERS) {
        await prisma.partner.create({ data: { ...p, sortOrder: i } });
        i++;
      }
      return i;
    },
  );

  await seedIfEmpty('stats',
    () => prisma.stat.count(),
    async () => {
      let i = 0;
      for (const s of STATS) {
        await prisma.stat.create({ data: { ...s, sortOrder: i } });
        i++;
      }
      return i;
    },
  );

  await seedIfEmpty('milestones',
    () => prisma.milestone.count(),
    async () => {
      let i = 0;
      for (const m of MILESTONES) {
        await prisma.milestone.create({ data: { ...m, sortOrder: i } });
        i++;
      }
      return i;
    },
  );

  await seedIfEmpty('missions',
    () => prisma.missionItem.count(),
    async () => {
      let i = 0;
      for (const m of MISSIONS) {
        await prisma.missionItem.create({ data: { ...m, sortOrder: i } });
        i++;
      }
      return i;
    },
  );

  console.log('── Done. Admin can now adjust everything via the dashboard. ──');
}

main()
  .catch((err) => { console.error('[seed-sample] failed:', err); process.exit(1); })
  .finally(() => prisma.$disconnect());
