/**
 * Central media registry for the homepage redesign.
 *
 * Every section pulls its image paths from here so that:
 *   1. Swapping a placeholder for a real photo is a one-line change.
 *   2. A future CMS / dashboard can override any path via the settings API
 *      (see resolveMedia() below) without touching component code.
 *
 * Path convention: /public/images/<section>/<section>-<n>.<ext>
 * Aspect ratios (kept as comments on each group) come from the design spec.
 */

const BASE = '/images';

export const MEDIA = {
  // 1:1 brand mark — used by Header, Footer, Topbar
  logo: {
    mark: `${BASE}/logo/logo-mark.svg`,
  },

  // 16:9 optional hero background — homepage uses CSS gradient, interior
  // pages can fall back to this file via the shared <Hero> component.
  hero: {
    main: `${BASE}/hero/hero-main.svg`,
  },

  // 3:4 portraits. Ordered so index 0 is the featured member (Direktur
  // Eksekutif), matching the TEAM_FEATURED + TEAM_MEMBERS split in about.jsx.
  team: [
    {
      id: 'erik',
      name: 'Erik Kurniawan',
      role: 'Direktur Eksekutif',
      expertise: 'Hukum Tata Negara',
      photo: `${BASE}/team/team-1.svg`,
      bio: 'Erik memimpin SPD dengan latar belakang hukum tata negara dan reformasi kelembagaan, dengan fokus pada desain sistem pemilu dan tata kelola partai.',
    },
    {
      id: 'aqidatul',
      name: 'Aqidatul Izza Zain',
      role: 'Peneliti',
      expertise: 'Studi Partai Politik',
      photo: `${BASE}/team/team-2.svg`,
      bio: 'Aqidatul fokus pada riset partai politik dan perilaku pemilih, dengan beberapa tulisan membahas politik uang dan kandidasi internal partai.',
    },
    {
      id: 'adnan',
      name: 'M. Adnan Maghribbi',
      role: 'Peneliti',
      expertise: 'Data Politik & Komputasi Sosial',
      photo: `${BASE}/team/team-3.svg`,
      bio: 'Adnan memimpin tim data SPD, menerjemahkan riset menjadi visualisasi yang bisa diakses publik di Dashboard Pemilu Terbuka.',
    },
    {
      id: 'putra',
      name: 'Putra Satria',
      role: 'Peneliti',
      expertise: 'Partisipasi Publik',
      photo: `${BASE}/team/team-5.svg`,
      bio: 'Putra menangani program pelatihan dan riset lapangan SPD dengan fokus pada partisipasi publik dalam pengawasan pemilu.',
    },
    {
      id: 'lisa',
      name: 'Lisa Safitri',
      role: 'Admin & Keuangan',
      expertise: 'Manajemen Organisasi',
      photo: `${BASE}/team/team-4.svg`,
      bio: 'Lisa menangani operasional lembaga dan memastikan transparansi keuangan SPD sesuai standar akuntansi nirlaba.',
    },
  ],

  // 1:1 square milestones for the horizontal <Timeline>
  timeline: [
    { year: 2011, image: `${BASE}/timeline/timeline-2011.svg`, label: 'Berdiri sebagai kelompok studi pemilu di Yogyakarta.' },
    { year: 2014, image: `${BASE}/timeline/timeline-2014.svg`, label: 'Riset partisipasi pemilih perdana untuk Pemilu 2014.' },
    { year: 2018, image: `${BASE}/timeline/timeline-2018.svg`, label: 'Jurnal Demokrasi SPD terindeks SINTA 2.' },
    { year: 2022, image: `${BASE}/timeline/timeline-2022.svg`, label: 'Peluncuran program Jubir Warga di 18 provinsi.' },
    { year: 2026, image: `${BASE}/timeline/timeline-2026.svg`, label: 'Dashboard Pemilu Terbuka pertama di Indonesia.' },
  ],

  // 4:3 landscape rotation pool for <PhotoCollage>. Tiles pick from this pool.
  collage: [
    { src: `${BASE}/collage/collage-1.svg`,  caption: 'Diskusi publik: Pengawasan Pemilu — Bandung, 2026' },
    { src: `${BASE}/collage/collage-2.svg`,  caption: 'Sekolah Jubir Warga — Makassar' },
    { src: `${BASE}/collage/collage-3.svg`,  caption: 'Konferensi Demokrasi — Jakarta' },
    { src: `${BASE}/collage/collage-4.svg`,  caption: 'Riset partisipatif — NTT' },
    { src: `${BASE}/collage/collage-5.svg`,  caption: 'Audiensi Kebijakan — KPU' },
    { src: `${BASE}/collage/collage-6.svg`,  caption: 'Peluncuran Buku — Yogyakarta' },
    { src: `${BASE}/collage/collage-7.svg`,  caption: 'Pemantauan TPS — Bali' },
    { src: `${BASE}/collage/collage-8.svg`,  caption: 'Workshop Jurnalisme — Surabaya' },
    { src: `${BASE}/collage/collage-9.svg`,  caption: 'Youth Hub Community — Bandung' },
    { src: `${BASE}/collage/collage-10.svg`, caption: 'PilkadaFest — Semarang' },
  ],

  // 3:4 book covers for <BookGrid>
  books: [
    { id: 'kelelahan', cover: `${BASE}/books/book-1.svg`, title: 'Demokrasi yang Kelelahan',      author: 'Budiman R.',      tag: 'SPD PRESS · 2026', meta: 'Maret 2026 · 312 hal.' },
    { id: 'uang',      cover: `${BASE}/books/book-2.svg`, title: 'Politik Uang dan Jejak Digitalnya', author: 'Ayu P. & Tim SPD', tag: 'MONOGRAF',         meta: 'Februari 2026 · 186 hal.' },
    { id: 'indeks',    cover: `${BASE}/books/book-3.svg`, title: 'Indeks Demokrasi Daerah 2025',   author: 'Tim Riset SPD',    tag: 'RISET TERAPAN',    meta: 'Januari 2026 · 240 hal.' },
    { id: 'jubir',     cover: `${BASE}/books/book-4.svg`, title: 'Jubir Warga: Panduan Praktis',   author: 'Fadhil H.',        tag: 'SERI PEMILU',      meta: 'Desember 2025 · 148 hal.' },
  ],
};

/**
 * Resolve a media path, honoring any override from the settings API.
 *
 * Usage:
 *   const src = resolveMedia(MEDIA.hero.main, settings.images?.hero);
 *
 * When the CMS/dashboard later writes a real URL into settings.images.<key>,
 * components automatically pick it up without any other code change.
 */
export function resolveMedia(defaultPath, override) {
  const trimmed = typeof override === 'string' ? override.trim() : '';
  return trimmed || defaultPath;
}

export default MEDIA;
