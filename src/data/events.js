import MEDIA from '../config/media';

// Fallback data used when the /events API is unreachable. Image paths come
// from the central MEDIA registry so the dashboard can override each record
// (the API payload's `image` field takes precedence over these defaults).
export const INITIAL_EVENTS = [
  {
    id: 1,
    slug: 'forum-kepemiluan-nasional-2024',
    title: 'Forum Kepemiluan Nasional 2024',
    date: '20 November 2024',
    location: 'Jakarta, Indonesia',
    description:
      'Forum diskusi tahunan yang mempertemukan para pemangku kepentingan kepemiluan — penyelenggara, pengawas, akademisi, dan masyarakat sipil — untuk mengevaluasi penyelenggaraan Pemilu 2024 dan merumuskan agenda reformasi kepemiluan ke depan.',
    image: MEDIA.collage[2].src,
  },
  {
    id: 2,
    slug: 'workshop-integritas-pemilu-2025',
    title: 'Workshop Integritas Pemilu dan Pengawasan Partisipatif',
    date: '5 Februari 2025',
    location: 'Yogyakarta, Indonesia',
    description:
      'Workshop intensif dua hari yang membekali relawan pengawas pemilu dengan metode pemantauan berbasis data, pelaporan pelanggaran, dan strategi advokasi. Diikuti oleh 80 peserta dari 15 kabupaten/kota di Jawa Tengah dan DIY.',
    image: MEDIA.collage[7].src,
  },
  {
    id: 3,
    slug: 'seminar-demokrasi-digital-2025',
    title: 'Seminar Demokrasi Digital dan Literasi Politik',
    date: '15 Maret 2025',
    location: 'Bandung, Indonesia',
    description:
      'Seminar nasional yang membahas tantangan demokrasi di era digital: disinformasi, polarisasi politik online, dan peran platform media sosial dalam proses pemilu. Menghadirkan pakar teknologi, akademisi komunikasi politik, dan praktisi penyelenggara pemilu.',
    image: MEDIA.collage[0].src,
  },
  {
    id: 4,
    slug: 'youth-hub-politica-2025',
    title: 'Youth Hub Community in Politica — Batch 3',
    date: '1 April 2025',
    location: 'Online & Jakarta',
    description:
      'Program inkubasi kepemimpinan politik bagi generasi muda berusia 18–30 tahun. Batch ketiga ini berfokus pada pengembangan kapasitas advokasi kebijakan, analisis data pemilu, dan partisipasi konstruktif dalam proses demokrasi.',
    image: MEDIA.collage[8].src,
  },
];
