import MEDIA from '../config/media';

// Images in this file use the central MEDIA registry so the dashboard can
// override each path via settings.images or per-record API fields later.

export const SIAPA_KAMI_IMAGES = [
  { id: 'img-siapa-1', src: MEDIA.collage[0].src, alt: 'Diskusi publik SPD' },
  { id: 'img-siapa-2', src: MEDIA.collage[1].src, alt: 'Sekolah Jubir Warga' },
  { id: 'img-siapa-3', src: MEDIA.collage[2].src, alt: 'Konferensi Demokrasi' },
];

export const MISI_ITEMS = [
  { id: 'misi-1', text: 'Meningkatkan profesionalisme dan integritas dalam penelitian dan aktivisme demokrasi.' },
  { id: 'misi-2', text: 'Mendukung transparansi dan akuntabilitas penyelenggaraan pemilu.' },
  { id: 'misi-3', text: 'Mendorong inovasi dan kebijakan pemilu yang berbasis data.' },
  { id: 'misi-4', text: 'Membangun komunitas analitik dan kebijakan yang handal.' },
  { id: 'misi-5', text: 'Memfasilitasi ruang partisipasi bagi generasi muda dalam politik dengan mengembangkan Youth Hub Community in Politica.' },
];

export const CORE_VALUES = [
  {
    id: 'cv-kolaboratif',
    title: 'Kolaboratif',
    description: 'Membangun kemitraan strategis dengan berbagai pihak untuk menciptakan dampak kebijakan yang lebih besar.',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" className="w-6 h-6">
        <path d="M4.5 6.375a4.125 4.125 0 1 1 8.25 0 4.125 4.125 0 0 1-8.25 0ZM14.25 8.625a3.375 3.375 0 1 1 6.75 0 3.375 3.375 0 0 1-6.75 0ZM1.5 19.125a7.125 7.125 0 0 1 14.25 0v.003l-.001.119a.75.75 0 0 1-.363.63 13.067 13.067 0 0 1-6.761 1.873c-2.472 0-4.786-.684-6.76-1.873a.75.75 0 0 1-.364-.63l-.001-.122ZM17.25 19.128l-.001.144a2.25 2.25 0 0 1-.233.96 10.088 10.088 0 0 0 5.06-1.01.75.75 0 0 0 .42-.643 4.875 4.875 0 0 0-6.957-4.611 8.586 8.586 0 0 1 1.71 5.157v.003Z" />
      </svg>
    ),
  },
  {
    id: 'cv-berbasis-data',
    title: 'Berbasis Data',
    description: 'Menggunakan pendekatan berbasis data dan fakta dalam setiap pengambilan keputusan dan rekomendasi kebijakan yang kami buat.',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" className="w-6 h-6">
        <path d="M18.375 2.25c-1.035 0-1.875.84-1.875 1.875v15.75c0 1.035.84 1.875 1.875 1.875h.75c1.035 0 1.875-.84 1.875-1.875V4.125c0-1.036-.84-1.875-1.875-1.875h-.75ZM9.75 8.625c0-1.036.84-1.875 1.875-1.875h.75c1.036 0 1.875.84 1.875 1.875v11.25c0 1.035-.84 1.875-1.875 1.875h-.75a1.875 1.875 0 0 1-1.875-1.875V8.625ZM3 13.125c0-1.036.84-1.875 1.875-1.875h.75c1.036 0 1.875.84 1.875 1.875v6.75c0 1.035-.84 1.875-1.875 1.875h-.75A1.875 1.875 0 0 1 3 19.875v-6.75Z" />
      </svg>
    ),
  },
  {
    id: 'cv-inovatif',
    title: 'Inovatif',
    description: 'Mengembangkan pendekatan-pendekatan baru dan inovatif dalam menghadapi tantangan demokrasi dan kepemiluan.',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" className="w-6 h-6">
        <path d="M12 .75a8.25 8.25 0 0 0-4.135 15.39c.686.398 1.115 1.008 1.134 1.623a.75.75 0 0 0 .577.706c.352.083.71.148 1.074.195.323.041.6-.218.6-.544v-4.661a6.714 6.714 0 0 1-.937-.171.75.75 0 1 1 .374-1.453 5.261 5.261 0 0 0 2.626 0 .75.75 0 1 1 .374 1.452 6.712 6.712 0 0 1-.937.172v4.66c0 .327.277.586.6.545.364-.047.722-.112 1.074-.195a.75.75 0 0 0 .577-.706c.02-.615.448-1.225 1.134-1.623A8.25 8.25 0 0 0 12 .75Z" />
      </svg>
    ),
  },
  {
    id: 'cv-inklusif',
    title: 'Inklusif',
    description: 'Memfasilitasi ruang partisipasi bagi semua pihak, termasuk generasi muda melalui Youth Hub Community.',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" className="w-6 h-6">
        <path fillRule="evenodd" d="M8.25 6.75a3.75 3.75 0 1 1 7.5 0 3.75 3.75 0 0 1-7.5 0ZM15.75 9.75a3 3 0 1 1 6 0 3 3 0 0 1-6 0ZM2.25 9.75a3 3 0 1 1 6 0 3 3 0 0 1-6 0ZM6.31 15.117A6.745 6.745 0 0 1 12 12a6.745 6.745 0 0 1 6.709 7.498.75.75 0 0 1-.372.568A12.696 12.696 0 0 1 12 21.75c-2.305 0-4.47-.612-6.337-1.684a.75.75 0 0 1-.372-.568 6.787 6.787 0 0 1 1.019-4.38Z" clipRule="evenodd" />
        <path d="M5.082 14.254a8.287 8.287 0 0 0-1.308 5.135 9.687 9.687 0 0 1-1.764-.44l-.115-.04a.563.563 0 0 1-.373-.487l-.01-.121a3.75 3.75 0 0 1 3.57-4.047ZM20.226 19.389a8.287 8.287 0 0 0-1.308-5.135 3.75 3.75 0 0 1 3.57 4.047l-.01.121a.563.563 0 0 1-.373.486l-.115.04c-.567.2-1.156.349-1.764.441Z" />
      </svg>
    ),
  },
];

export const PERJALANAN = [
  {
    id: 'prj-1',
    tag: 'TONGGAK',
    title: 'Sindikasi Pemilu dan Demokrasi Didirikan',
    year: '27 April 2016',
    description: 'SPD resmi berdiri sebagai organisasi masyarakat sipil yang berfokus pada riset dan advokasi pemilu serta demokrasi di Indonesia.',
  },
  {
    id: 'prj-2',
    tag: 'ADVOKASI',
    title: 'Tim Pakar Pemerintah dalam Pembahasan UU No. 7 Tahun 2017',
    year: '2016–2017',
    description: 'SPD terlibat sebagai tim pakar dalam penyusunan Undang-Undang Pemilu, memberikan masukan berbasis riset untuk reformasi sistem pemilu.',
  },
  {
    id: 'prj-3',
    tag: 'RISET',
    title: 'Kajian Tipologi Partai Politik dan Skema Pendanaan Partai',
    year: '2018',
    description: 'Riset komprehensif tentang tipologi partai politik Indonesia dan skema pendanaan yang berkontribusi pada transparansi demokrasi internal partai.',
  },
];

export const STATS = [
  { id: 'stat-pengalaman', value: '9',    label: 'Tahun Pengalaman' },
  { id: 'stat-mitra',      value: '15',   label: 'Mitra Kolaborasi' },
  { id: 'stat-program',    value: '35',   label: 'Program & Event' },
  { id: 'stat-youth',      value: '100+', label: 'Youth Hub Members' },
  { id: 'stat-kota',       value: '20',   label: 'Kota Jangkauan' },
];

export const TEAM_FEATURED = {
  id: 'team-erik',
  name: 'Erik Kurniawan',
  role: 'Direktur Eksekutif',
  expertise: 'Hukum Tata Negara',
  src: MEDIA.team[0].photo,
  bio: 'Erik memimpin SPD dengan latar belakang hukum tata negara dan reformasi kelembagaan. Fokus kajiannya adalah desain sistem pemilu dan tata kelola partai politik di Indonesia.',
};

export const TEAM_MEMBERS = [
  {
    id: 'team-aqidatul',
    name: 'Aqidatul Izza Zain',
    role: 'Peneliti',
    expertise: 'Studi Partai Politik',
    src: MEDIA.team[1].photo,
    bio: 'Aqidatul fokus pada riset partai politik dan perilaku pemilih. Beberapa tulisannya membahas politik uang dan kandidasi internal partai.',
  },
  {
    id: 'team-adnan',
    name: 'M. Adnan Maghribbi',
    role: 'Peneliti',
    expertise: 'Data Politik & Komputasi Sosial',
    src: MEDIA.team[2].photo,
    bio: 'Adnan memimpin tim data SPD, menerjemahkan riset menjadi visualisasi yang dapat diakses publik di Dashboard Pemilu Terbuka.',
  },
  {
    id: 'team-putra',
    name: 'Putra Satria',
    role: 'Peneliti',
    expertise: 'Partisipasi Publik',
    src: MEDIA.team[3].photo,
    bio: 'Putra menangani program pelatihan dan riset lapangan SPD, dengan fokus pada partisipasi publik dalam pengawasan pemilu.',
  },
  {
    id: 'team-lisa',
    name: 'Lisa Safitri',
    role: 'Admin & Keuangan',
    expertise: 'Manajemen Organisasi',
    src: MEDIA.team[4].photo,
    bio: 'Lisa menangani operasional dan memastikan transparansi keuangan SPD sesuai standar akuntansi nirlaba.',
  },
];

export const MITRA = [
  { id: 'mitraKPU',       name: 'KPU',                    bg: 'bg-blue-700',   text: 'text-white' },
  { id: 'mitraBawaslu',   name: 'BAWASLU',                bg: 'bg-red-600',    text: 'text-white' },
  { id: 'mitraMK',        name: 'Mahkamah\nKonstitusi',   bg: 'bg-green-700',  text: 'text-white' },
  { id: 'mitraDPP',       name: 'DPP',                    bg: 'bg-red-700',    text: 'text-white' },
  { id: 'mitraPerpusnas', name: 'Perpustakaan\nNasional', bg: 'bg-slate-700',  text: 'text-white' },
  { id: 'mitraUI',        name: 'Universitas\nIndonesia', bg: 'bg-yellow-500', text: 'text-slate-900' },
  { id: 'mitraUGM',       name: 'UGM',                    bg: 'bg-blue-900',   text: 'text-white' },
  { id: 'mitraLIPI',      name: 'LIPI',                   bg: 'bg-teal-700',   text: 'text-white' },
  { id: 'mitraFISIP',     name: 'FISIP\nUNDIP',           bg: 'bg-orange-500', text: 'text-white' },
];
