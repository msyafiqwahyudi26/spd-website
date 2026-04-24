/**
 * seed-perpustakaan.js
 *
 * Jalankan di VPS setelah PDF sudah dicopy ke /tmp/perpustakaan-spd/
 *
 * Usage:
 *   node seed-perpustakaan.js
 *
 * Script ini akan:
 * 1. Scan semua PDF di /tmp/perpustakaan-spd/
 * 2. Copy ke /var/www/spd-website/backend/uploads/documents/
 * 3. Buat Media record di database
 * 4. Buat Publication record dengan metadata lengkap
 */

require('dotenv').config({ path: '/var/www/spd-website/backend/.env' });

const fs   = require('fs');
const path = require('path');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  datasources: { db: { url: process.env.DATABASE_URL || 'file:/var/www/spd-website/backend/prisma/prod.db' } },
});

const SOURCE_DIR = '/tmp/perpustakaan-spd';
const DEST_DIR   = '/var/www/spd-website/backend/uploads/documents';

// ─── Metadata per dokumen ────────────────────────────────────────────────────
// key = substring yang unik dari nama file (case-insensitive match)
const METADATA = [
  {
    match: 'Tata Kelola Pemilu',
    title: 'Tata Kelola Pemilu',
    description: 'Buku ini membahas secara komprehensif tata kelola penyelenggaraan pemilu di Indonesia, mencakup regulasi, kelembagaan, dan praktik penyelenggaraan pemilihan umum.',
    author: 'Sindikasi Pemilu dan Demokrasi',
    date: '2019',
    category: 'Pemilu',
    contentType: 'book',
  },
  {
    match: 'Peta Jalan Pencegahan',
    title: 'Peta Jalan Pencegahan Politik Uang di Pilkada',
    description: 'Dokumen ini menyajikan peta jalan strategis untuk mencegah praktik politik uang dalam pemilihan kepala daerah, dilengkapi dengan rekomendasi kebijakan yang terukur.',
    author: 'Sindikasi Pemilu dan Demokrasi',
    date: '2022',
    category: 'Pilkada',
    contentType: 'book',
  },
  {
    match: 'Wajah Demokrasi di Beranda Terdepan',
    title: 'Wajah Demokrasi di Beranda Terdepan Indonesia: KPU Kabupaten Kepulauan Talaud',
    description: 'Kajian tentang dinamika demokrasi dan penyelenggaraan pemilihan umum di daerah terdepan Indonesia, mengambil studi kasus Kabupaten Kepulauan Talaud.',
    author: 'KPU Kabupaten Kepulauan Talaud',
    date: '2022',
    category: 'Pemilu',
    contentType: 'book',
  },
  {
    match: 'Catatan Akhir Tahun 2021',
    title: 'Catatan Akhir Tahun 2021: Sindikasi Pemilu dan Demokrasi',
    description: 'Refleksi dan catatan kritis SPD atas perkembangan demokrasi dan kepemiluan Indonesia sepanjang tahun 2021, mencakup isu kelembagaan, partisipasi, dan tata kelola.',
    author: 'Sindikasi Pemilu dan Demokrasi',
    date: '2021',
    category: 'Demokrasi',
    contentType: 'research',
  },
  {
    match: 'Delapan Parpol Masuk Parlemen',
    title: 'Delapan Parpol Masuk Parlemen: Siapa Berani Jadi Oposisi?',
    description: 'Analisis konfigurasi kekuatan partai politik di parlemen pasca Pemilu 2019, mengulas dinamika koalisi dan peluang terbentuknya oposisi yang efektif.',
    author: 'Sindikasi Pemilu dan Demokrasi',
    date: '2019',
    category: 'Partai Politik',
    contentType: 'article',
  },
  {
    match: 'Dinamika Partisipasi Pemilih pada Pilkada Kota Blitar',
    title: 'Dinamika Partisipasi Pemilih pada Pilkada Kota Blitar 2024',
    description: 'Riset mendalam tentang pola dan dinamika partisipasi pemilih dalam Pilkada Kota Blitar 2024, mengidentifikasi faktor pendorong dan penghambat kehadiran pemilih.',
    author: 'Sindikasi Pemilu dan Demokrasi',
    date: '2024',
    category: 'Pilkada',
    contentType: 'research',
  },
  {
    match: 'Indeks Partisipasi Pilkada (IPP)',
    title: 'Indeks Partisipasi Pilkada (IPP) 2024',
    description: 'E-Book yang menyajikan metodologi dan hasil pengukuran Indeks Partisipasi Pilkada 2024 secara nasional, sebagai alat ukur kualitas partisipasi masyarakat dalam pemilihan kepala daerah.',
    author: 'Sindikasi Pemilu dan Demokrasi',
    date: '2024',
    category: 'Pilkada',
    contentType: 'research',
  },
  {
    match: 'Evaluasi Para Penyelenggara Pemilu Serentak 2024',
    title: 'Evaluasi Penyelenggara Pemilu Serentak 2024: Rekrutmen KPU & Bawaslu di DKI Jakarta',
    description: 'Evaluasi proses rekrutmen penyelenggara pemilu (KPU dan Bawaslu) di DKI Jakarta pada Pemilu Serentak 2024, mencakup analisis transparansi, akuntabilitas, dan kualitas seleksi.',
    author: 'Sindikasi Pemilu dan Demokrasi',
    date: '2024',
    category: 'Pemilu',
    contentType: 'research',
  },
  {
    match: 'Evaluasi Pencalonan Pilkada di Jawa Tengah',
    title: 'Evaluasi Pencalonan Pilkada di Jawa Tengah 2024: Melemahnya Kompetisi Lokal dan Otonomi Kandidasi',
    description: 'Kajian kritis tentang proses pencalonan dalam Pilkada Jawa Tengah 2024, menganalisis fenomena melemahnya kompetisi lokal dan otonomi proses kandidasi partai politik.',
    author: 'Sindikasi Pemilu dan Demokrasi',
    date: '2024',
    category: 'Pilkada',
    contentType: 'research',
  },
  {
    match: 'Indeks Partisipasi Pemilu 2024',
    title: 'Indeks Partisipasi Pemilu 2024',
    description: 'Laporan komprehensif tentang tingkat dan kualitas partisipasi pemilih dalam Pemilu 2024, menggunakan metodologi indeks yang mengukur berbagai dimensi keterlibatan warga dalam proses pemilihan.',
    author: 'Sindikasi Pemilu dan Demokrasi',
    date: '2024',
    category: 'Pemilu',
    contentType: 'research',
  },
  {
    match: 'Kajian Awal - Penataan Kelembagaan Pilkada',
    title: 'Kajian Awal: Penataan Kelembagaan Pilkada 2024',
    description: 'Kajian awal tentang penataan kelembagaan penyelenggaraan Pilkada 2024, mencakup analisis struktur organisasi, regulasi, dan koordinasi antarpenyelenggara.',
    author: 'Sindikasi Pemilu dan Demokrasi',
    date: '2024',
    category: 'Pilkada',
    contentType: 'research',
  },
  {
    match: 'MERAWAT KETAHANAN DEMOKRASI',
    title: 'Merawat Ketahanan Demokrasi Melalui Pendidikan Politik',
    description: 'Kajian tentang peran pendidikan politik dalam memperkuat ketahanan demokrasi Indonesia, dengan rekomendasi program dan kebijakan pendidikan kewarganegaraan yang efektif.',
    author: 'Sindikasi Pemilu dan Demokrasi',
    date: '2023',
    category: 'Demokrasi',
    contentType: 'research',
  },
  {
    match: 'Manajemen Distribusi Logistik Pilkada',
    title: 'Manajemen Distribusi Logistik Pilkada 2024',
    description: 'Analisis sistem manajemen dan distribusi logistik penyelenggaraan Pilkada 2024, mencakup perencanaan, pengadaan, distribusi, dan pengamanan perlengkapan pemilihan.',
    author: 'Sindikasi Pemilu dan Demokrasi',
    date: '2024',
    category: 'Pilkada',
    contentType: 'research',
  },
  {
    match: 'Memperkuat Sistem Presidensialisme',
    title: 'Memperkuat Sistem Presidensialisme Indonesia',
    description: 'Analisis dan rekomendasi kebijakan untuk memperkuat sistem presidensialisme Indonesia, mengkaji relasi eksekutif-legislatif dan mekanisme checks and balances.',
    author: 'Sindikasi Pemilu dan Demokrasi',
    date: '2022',
    category: 'Demokrasi',
    contentType: 'article',
  },
  {
    match: 'Mencari Pemimpin di Kota Baja',
    title: 'Mencari Pemimpin di Kota Baja: Refleksi Partisipasi dan Evaluasi Pilkada Kota Cilegon 2024',
    description: 'Refleksi mendalam tentang proses dan hasil Pilkada Kota Cilegon 2024, menganalisis pola partisipasi pemilih, profil kandidat, dan dinamika politik lokal Kota Baja.',
    author: 'Sindikasi Pemilu dan Demokrasi',
    date: '2024',
    category: 'Pilkada',
    contentType: 'research',
  },
  {
    match: 'Mendorong Kandidasi Internal Parpol',
    title: 'Mendorong Kandidasi Internal Partai Politik yang Inklusif dan Demokratis',
    description: 'Kajian tentang mekanisme dan praktik pencalonan internal partai politik, dengan rekomendasi untuk mendorong proses kandidasi yang lebih inklusif, transparan, dan demokratis.',
    author: 'Sindikasi Pemilu dan Demokrasi',
    date: '2022',
    category: 'Partai Politik',
    contentType: 'article',
  },
  {
    match: 'Mengurai Tren Politik Lokal',
    title: 'Mengurai Tren Politik Lokal: Pilkada Sulawesi Selatan 2024',
    description: 'Analisis tren politik lokal dalam Pilkada Sulawesi Selatan 2024, mengkaji peta kekuatan politik, dinamika pencalonan, dan faktor-faktor yang memengaruhi hasil pemilihan.',
    author: 'Sindikasi Pemilu dan Demokrasi',
    date: '2024',
    category: 'Pilkada',
    contentType: 'research',
  },
  {
    match: 'e-Book - Menjajaki Reformasi Elektoral',
    title: 'Menjajaki Reformasi Elektoral',
    description: 'Buku elektronik yang mengeksplorasi berbagai opsi dan agenda reformasi elektoral di Indonesia, mencakup sistem pemilu, ambang batas parlemen, dan mekanisme pencalonan.',
    author: 'Aditya Perdana et al.',
    date: '2022',
    category: 'Pemilu',
    contentType: 'book',
  },
  {
    match: 'Menjajaki Reformasi Elektoral',
    title: 'Menjajaki Reformasi Elektoral (Edisi Cetak)',
    description: 'Buku yang mengeksplorasi berbagai opsi dan agenda reformasi elektoral di Indonesia, mencakup sistem pemilu, ambang batas parlemen, dan mekanisme pencalonan. Edisi cetak lengkap.',
    author: 'Aditya Perdana et al.',
    date: '2022',
    category: 'Pemilu',
    contentType: 'book',
  },
  {
    match: 'Menjawab Tantangan Data Pemilih',
    title: 'Menjawab Tantangan Data Pemilih',
    description: 'Kajian tentang permasalahan dan tantangan dalam pengelolaan data pemilih di Indonesia, serta rekomendasi untuk meningkatkan akurasi dan integritas daftar pemilih tetap.',
    author: 'Sindikasi Pemilu dan Demokrasi',
    date: '2022',
    category: 'Pemilu',
    contentType: 'research',
  },
  {
    match: 'Naskah Buku Selayar',
    title: 'Refleksi Pilkada Selayar',
    description: 'Kajian mendalam tentang penyelenggaraan pilkada di Kabupaten Selayar, menganalisis dinamika lokal, partisipasi pemilih, dan implikasi hasil pilkada bagi tata kelola daerah.',
    author: 'Sindikasi Pemilu dan Demokrasi',
    date: '2024',
    category: 'Pilkada',
    contentType: 'book',
  },
  {
    match: 'PILKADA DI ERA KELELAHAN POLITIK',
    title: 'Pilkada di Era Kelelahan Politik: Refleksi Partisipasi Pilkada Minahasa Utara 2024',
    description: 'Kajian tentang fenomena kelelahan politik dan dampaknya terhadap partisipasi pemilih dalam Pilkada Minahasa Utara 2024, menganalisis faktor-faktor yang memengaruhi keengganan pemilih.',
    author: 'Sindikasi Pemilu dan Demokrasi',
    date: '2024',
    category: 'Pilkada',
    contentType: 'research',
  },
  {
    match: 'Pemilu 2019 dalam Angka',
    title: 'Pemilu 2019 dalam Angka: Provinsi DKI Jakarta',
    description: 'Kompilasi data statistik Pemilu 2019 di Provinsi DKI Jakarta, mencakup data pemilih, partisipasi, hasil perolehan suara, dan analisis distribusi suara per daerah pemilihan.',
    author: 'KPU Provinsi DKI Jakarta',
    date: '2019',
    category: 'Pemilu',
    contentType: 'research',
  },
  {
    match: 'Pilkada oleh DPRD',
    title: 'Pilkada oleh DPRD: Apa yang Hendak Diperbaiki?',
    description: 'Analisis kritis terhadap wacana pengembalian mekanisme pemilihan kepala daerah melalui DPRD, mengkaji argumentasi pro-kontra, implikasi demokratis, dan alternatif kebijakan.',
    author: 'Sindikasi Pemilu dan Demokrasi',
    date: '2026',
    category: 'Pilkada',
    contentType: 'article',
  },
  {
    match: 'Ambang Batas Parlemen_ Besaran',
    title: 'Policy Brief: Mengenal Ambang Batas Parlemen — Besaran dan Batasan Toleransi Suara Terbuang',
    description: 'Policy brief yang mengkaji besaran ambang batas parlemen di Indonesia, menganalisis dampaknya terhadap suara terbuang dan representasi politik, serta merekomendasikan threshold yang optimal.',
    author: 'Sindikasi Pemilu dan Demokrasi',
    date: '2023',
    category: 'Pemilu',
    contentType: 'article',
  },
  {
    match: 'Setelah Ambang Batas',
    title: 'Policy Brief: Setelah Ambang Batas — Mencari Format Baru Penjaringan Calon Presiden di Indonesia',
    description: 'Policy brief yang menganalisis mekanisme pencalonan presiden pasca putusan Mahkamah Konstitusi tentang ambang batas pencalonan, serta merekomendasikan format baru yang demokratis.',
    author: 'Sindikasi Pemilu dan Demokrasi',
    date: '2023',
    category: 'Pemilu',
    contentType: 'article',
  },
  {
    match: 'Potret Dana Kampanye',
    title: 'Potret Dana Kampanye',
    description: 'Kajian komprehensif tentang pola pendanaan kampanye dalam pemilihan umum Indonesia, menganalisis sumber dana, pengeluaran, transparansi, dan implikasi terhadap integritas pemilu.',
    author: 'Mada Sukmajati',
    date: '2020',
    category: 'Pemilu',
    contentType: 'book',
  },
  {
    match: 'Potret Tahapan_ Pemilihan Bupati',
    title: 'Potret Tahapan Pemilihan Bupati dan Wakil Bupati Sumbawa 2020',
    description: 'Dokumentasi dan analisis tahapan penyelenggaraan Pilkada Kabupaten Sumbawa 2020, mencakup persiapan, pelaksanaan, dan evaluasi setiap tahapan pemilihan.',
    author: 'Sindikasi Pemilu dan Demokrasi',
    date: '2020',
    category: 'Pilkada',
    contentType: 'research',
  },
  {
    match: 'Refleksi Partisipasi Pilkada Sulawesi Utara',
    title: 'Refleksi Partisipasi Pilkada Sulawesi Utara 2024',
    description: 'Analisis dan refleksi tentang tingkat dan kualitas partisipasi pemilih dalam Pilkada Sulawesi Utara 2024, mengidentifikasi faktor-faktor yang memengaruhi kehadiran pemilih.',
    author: 'Sindikasi Pemilu dan Demokrasi',
    date: '2024',
    category: 'Pilkada',
    contentType: 'research',
  },
  {
    match: 'SERI I',
    title: 'Seri Partisipasi Pemilu I: Partisipasi Penyusunan Daftar Pemilih',
    description: 'Seri pertama kajian partisipasi pemilu yang memfokuskan pada keterlibatan masyarakat dalam proses penyusunan daftar pemilih, menganalisis mekanisme, tantangan, dan rekomendasi perbaikan.',
    author: 'Sindikasi Pemilu dan Demokrasi',
    date: '2022',
    category: 'Pemilu',
    contentType: 'research',
  },
  {
    match: 'SERI II',
    title: 'Seri Partisipasi Pemilu II: Potret Partisipasi Masyarakat dalam Rekrutmen Penyelenggara Ad-Hoc',
    description: 'Seri kedua kajian partisipasi pemilu yang menganalisis keterlibatan masyarakat dalam proses rekrutmen penyelenggara pemilu ad-hoc (PPS, KPPS, Pantarlih).',
    author: 'Sindikasi Pemilu dan Demokrasi',
    date: '2022',
    category: 'Pemilu',
    contentType: 'research',
  },
  {
    match: 'SERI III',
    title: 'Seri Partisipasi Pemilu III: Potret Partisipasi Pemilu pada Tahapan Pendaftaran dan Verifikasi Partai Politik',
    description: 'Seri ketiga yang mengkaji partisipasi masyarakat dan pemangku kepentingan dalam tahapan pendaftaran dan verifikasi partai politik sebagai peserta pemilihan umum.',
    author: 'Sindikasi Pemilu dan Demokrasi',
    date: '2022',
    category: 'Partai Politik',
    contentType: 'research',
  },
  {
    match: 'SERI IV',
    title: 'Seri Partisipasi Pemilu IV: Potret Strategi Menembus Keterbatasan',
    description: 'Seri keempat yang mengkaji strategi-strategi inovatif yang digunakan pemilih dan kelompok marginal untuk menembus berbagai keterbatasan dalam berpartisipasi dalam pemilu.',
    author: 'Sindikasi Pemilu dan Demokrasi',
    date: '2022',
    category: 'Pemilu',
    contentType: 'research',
  },
  {
    match: 'SPD_EBOOK-Selamat Datang Otokrasi',
    title: 'Selamat Datang Otokrasi (2024)',
    description: 'E-book yang menganalisis tren kemunduran demokrasi dan kebangkitan otokrasi di Indonesia pada tahun 2024, mencakup indikator-indikator pelemahan institusi demokratis dan upaya konsolidasi kekuasaan.',
    author: 'Sindikasi Pemilu dan Demokrasi',
    date: '2024',
    category: 'Demokrasi',
    contentType: 'book',
  },
  {
    match: 'Seri V',
    title: 'Seri Partisipasi Pemilu V: Partisipasi Politik dan Perilaku Pemilih dalam Pemilu Legislatif',
    description: 'Seri kelima yang menganalisis perilaku pemilih dan pola partisipasi politik dalam pemilihan legislatif, mencakup motivasi memilih, pengaruh kampanye, dan dinamika daerah pemilihan.',
    author: 'Sindikasi Pemilu dan Demokrasi',
    date: '2022',
    category: 'Pemilu',
    contentType: 'research',
  },
  {
    match: 'Seri VI',
    title: 'Seri Partisipasi Pemilu VI: Partisipasi dalam Perancangan Daerah Pemilihan dan Alokasi Kursi',
    description: 'Seri keenam yang mengkaji keterlibatan publik dalam proses perancangan daerah pemilihan (dapil) dan alokasi kursi legislatif, serta implikasinya terhadap representasi politik.',
    author: 'Sindikasi Pemilu dan Demokrasi',
    date: '2022',
    category: 'Pemilu',
    contentType: 'research',
  },
  {
    match: 'Strategi Pengembangan SDM Pilkada 2024 Jawa Timur',
    title: 'Strategi Pengembangan SDM Pilkada 2024 Jawa Timur',
    description: 'Kajian tentang strategi pengembangan sumber daya manusia penyelenggara Pilkada 2024 di Jawa Timur, mencakup pelatihan, kapasitasi, dan peningkatan profesionalisme petugas pemilihan.',
    author: 'Sindikasi Pemilu dan Demokrasi',
    date: '2024',
    category: 'Pilkada',
    contentType: 'research',
  },
  {
    match: 'Sumba Tengah',
    title: 'Refleksi Pilkada Sumba Tengah',
    description: 'Kajian tentang penyelenggaraan pilkada di Kabupaten Sumba Tengah, menganalisis konteks sosial-budaya lokal, dinamika pencalonan, partisipasi pemilih, dan hasil pilkada.',
    author: 'Sindikasi Pemilu dan Demokrasi',
    date: '2024',
    category: 'Pilkada',
    contentType: 'research',
  },
  {
    match: 'TIPOLOGI PARTAI POLITIK DAN SKEMA PENDANAAN',
    title: 'Tipologi Partai Politik dan Skema Pendanaan Partai Politik',
    description: 'Kajian tentang tipologi partai politik di Indonesia berdasarkan ideologi, struktur organisasi, dan basis dukungan, serta analisis skema pendanaan dan implikasinya terhadap akuntabilitas partai.',
    author: 'Sindikasi Pemilu dan Demokrasi',
    date: '2023',
    category: 'Partai Politik',
    contentType: 'research',
  },
  {
    match: 'TIPOLOGI PARTISIPASI PEMILIH DALAM PEMILIHAN UMUM PRESIDEN',
    title: 'Tipologi Partisipasi Pemilih dalam Pemilihan Umum Presiden 2024',
    description: 'Analisis tipologi pemilih berdasarkan pola partisipasi dalam Pemilu Presiden 2024, mengidentifikasi berbagai segmen pemilih dan karakteristik perilaku politiknya.',
    author: 'Sindikasi Pemilu dan Demokrasi',
    date: '2024',
    category: 'Pemilu',
    contentType: 'research',
  },
  {
    match: 'TIPOLOGI PARTISIPASI PEMILIH DALAM PEMILU LEGISLATIF',
    title: 'Tipologi Partisipasi Pemilih dalam Pemilu Legislatif 2024',
    description: 'Analisis tipologi pemilih berdasarkan pola partisipasi dalam Pemilu Legislatif 2024, mengkaji perbedaan motivasi dan perilaku memilih antara pemilihan presiden dan legislatif.',
    author: 'Sindikasi Pemilu dan Demokrasi',
    date: '2024',
    category: 'Pemilu',
    contentType: 'research',
  },
  {
    match: 'TIPOLOGI PARTISIPASI PEMILIH DALAM PEMILU LUAR NEGERI',
    title: 'Tipologi Partisipasi Pemilih dalam Pemilu Luar Negeri',
    description: 'Kajian khusus tentang pola partisipasi pemilih diaspora Indonesia dalam pemilihan umum luar negeri, mencakup tantangan logistik, regulasi, dan strategi peningkatan partisipasi.',
    author: 'Sindikasi Pemilu dan Demokrasi',
    date: '2024',
    category: 'Pemilu',
    contentType: 'research',
  },
];

// ─── Helper: safe filename ────────────────────────────────────────────────────
function safeFilename(original) {
  const ext  = path.extname(original).toLowerCase();
  const base = path.basename(original, ext)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 80);
  return `${Date.now()}-${base}${ext}`;
}

// ─── Helper: generate unique slug ────────────────────────────────────────────
function makeSlug(title) {
  return (
    title
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim()
      .slice(0, 80) +
    '-' +
    Date.now()
  );
}

// ─── Helper: get metadata for a filename ─────────────────────────────────────
function getMetadata(filename) {
  const name = path.basename(filename, path.extname(filename));
  for (const m of METADATA) {
    if (name.toLowerCase().includes(m.match.toLowerCase())) {
      return m;
    }
  }
  // Fallback: use cleaned filename as title
  const title = name
    .replace(/[_\-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  return {
    title,
    description: `Dokumen dari koleksi Perpustakaan Digital Sindikasi Pemilu dan Demokrasi (SPD) Indonesia.`,
    author: 'Sindikasi Pemilu dan Demokrasi',
    date: '2024',
    category: 'Pemilu',
    contentType: 'research',
  };
}

// ─── Main ─────────────────────────────────────────────────────────────────────
async function main() {
  console.log('🚀 SPD Perpustakaan Digital — Seeder\n');

  if (!fs.existsSync(SOURCE_DIR)) {
    console.error(`❌ Source directory not found: ${SOURCE_DIR}`);
    console.error('   Pastikan PDF sudah di-copy ke /tmp/perpustakaan-spd/ terlebih dahulu.');
    process.exit(1);
  }

  if (!fs.existsSync(DEST_DIR)) {
    fs.mkdirSync(DEST_DIR, { recursive: true });
    console.log(`📁 Created destination: ${DEST_DIR}`);
  }

  const files = fs.readdirSync(SOURCE_DIR).filter(f => f.toLowerCase().endsWith('.pdf'));
  console.log(`📄 Found ${files.length} PDF files\n`);

  let success = 0;
  let skipped = 0;
  let errors  = 0;

  for (const file of files) {
    const srcPath  = path.join(SOURCE_DIR, file);
    const safeName = safeFilename(file);
    const destPath = path.join(DEST_DIR, safeName);
    const url      = `/uploads/documents/${safeName}`;
    const meta     = getMetadata(file);
    const size     = fs.statSync(srcPath).size;

    try {
      // Check if a publication with similar title already exists
      const existing = await prisma.publication.findFirst({
        where: { title: { contains: meta.title.slice(0, 30) } },
      });

      if (existing) {
        console.log(`⏭  Skipped (duplicate): ${meta.title.slice(0, 60)}`);
        skipped++;
        continue;
      }

      // Copy file to uploads directory
      fs.copyFileSync(srcPath, destPath);

      // Create Media record
      const media = await prisma.media.create({
        data: {
          url,
          type: 'application/pdf',
          filename: file,
          size,
        },
      });

      // Create Publication record
      await prisma.publication.create({
        data: {
          title:       meta.title,
          slug:        makeSlug(meta.title),
          category:    meta.category,
          description: meta.description,
          author:      meta.author,
          date:        meta.date,
          contentType: meta.contentType,
          pdfUrl:      url,
          fullContent: '[]',
          gallery:     '[]',
        },
      });

      const sizeMB = (size / 1024 / 1024).toFixed(1);
      console.log(`✅ ${meta.title.slice(0, 65)} (${sizeMB} MB)`);
      success++;

      // Small delay to avoid slug collisions (timestamp-based)
      await new Promise(r => setTimeout(r, 5));

    } catch (err) {
      console.error(`❌ Error on "${file}": ${err.message}`);
      // Clean up copied file if DB insert failed
      try { if (fs.existsSync(destPath)) fs.unlinkSync(destPath); } catch {}
      errors++;
    }
  }

  console.log(`\n─────────────────────────────────────`);
  console.log(`✅ Berhasil  : ${success}`);
  console.log(`⏭  Dilewati  : ${skipped} (sudah ada)`);
  console.log(`❌ Gagal     : ${errors}`);
  console.log(`─────────────────────────────────────`);
  console.log('\nSelesai! Buka https://spdindonesia.org untuk melihat hasilnya.');
}

main()
  .catch(err => { console.error(err); process.exit(1); })
  .finally(() => prisma.$disconnect());
