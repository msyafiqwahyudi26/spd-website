import { createContext, useContext, useEffect, useMemo, useState } from 'react';

/**
 * Minimal i18n for public-facing UI chrome.
 *
 * Scope is deliberate: we translate navigation, CTA buttons, section
 * headings, and QuickEntry labels — the parts a non-Indonesian visitor
 * needs to navigate. Long-form content (articles, research, misi items)
 * stays in the authoring language; an English visitor reads Indonesian
 * content the same way an Indonesian visitor would read an English
 * journal. This keeps the system honest: we translate what we can
 * maintain, not what we can't.
 */

const STORAGE_KEY = 'spd_lang';
const DEFAULT_LANG = 'id';
const SUPPORTED = ['id', 'en'];

const DICT = {
  id: {
    // Nav
    'nav.home':       'Beranda',
    'nav.about':      'Tentang Kami',
    'nav.program':    'Program',
    'nav.publikasi':  'Publikasi',
    'nav.event':      'Event',
    'nav.data':       'Data Pemilu',
    'nav.kontak':     'Kontak',

    // About dropdown
    'about.profil':    'Profil Lembaga',
    'about.visimisi':  'Visi & Misi',
    'about.struktur':  'Struktur Organisasi',
    'about.mitra':     'Mitra Kolaborasi',
    'about.laporan':   'Laporan Tahunan',

    // Publikasi dropdown
    'publikasi.semua': 'Semua Publikasi',
    'publikasi.riset': 'Hasil Riset SPD',
    'publikasi.buku':  'Buku SPD',

    // Hero (landing)
    'hero.learnMore':  'Pelajari Lebih Lanjut',
    'hero.viewPrograms': 'Lihat Program Kami',

    // QuickEntry tiles
    'quick.section':        'Aktivitas terkini',
    'quick.allPublikasi':   'Semua publikasi',
    'quick.publikasi':      'Publikasi Terbaru',
    'quick.event':          'Event Terbaru',
    'quick.dataPemilu':     'Data Pemilu',
    'quick.dashboardTitle': 'Dashboard Pemilu Terbuka',
    'quick.subscribe':      'Berlangganan',
    'quick.subscribeHead':  'Dapatkan update lewat email',
    'quick.subscribeHelp':  'Riset, opini, dan analisis terbaru.',
    'quick.emailPlaceholder': 'email@anda.com',
    'quick.subscribeBtn':   'Ikut',
    'quick.empty.pub':      'Belum ada publikasi',
    'quick.empty.evt':      'Belum ada event',
    'quick.loading':        'Memuat…',

    // Footer
    'footer.nav':       'Navigasi',
    'footer.services':  'Layanan',
    'footer.newsletter': 'Newsletter',
    'footer.newsletterCopy': 'Dapatkan update terbaru tentang perkembangan pemilu Indonesia.',
    'footer.copyright': '© 2026 SPD-Indonesia. Hak cipta dilindungi undang-undang.',

    // 404
    'notfound.title':  'Halaman tidak ditemukan',
    'notfound.body':   'Maaf, halaman yang Anda cari tidak tersedia atau sudah dipindahkan.',
    'notfound.home':   'Kembali ke Beranda',
    'notfound.contact': 'Hubungi Kami',

    // FeatureCards
    'feature.title': 'Pendekatan Kami',
    'feature.desc': 'Tiga pilar yang membedakan cara SPD bekerja — kolaborasi multihak, data terbuka, dan ruang bagi generasi muda dalam politik.',

    // ProgramCards
    'program.title': 'Program dan Inisiatif',
    'program.desc': 'Berbagai inisiatif dan program yang kami jalankan untuk memperkuat ekosistem demokrasi dan reformasi kepemiluan di Indonesia.',
    'program.readMore': 'Selengkapnya',
    'program.viewAll': 'Lihat Semua Program',
    'program.empty': 'Belum ada program atau inisiatif yang dapat ditampilkan saat ini.',
    'program.emptyTitle': 'Tidak ada program',

    // PublikasiSection
    'pub.title': 'Publikasi dan Analisis',
    'pub.desc': 'Artikel, riset, dan analisis SPD tentang pemilu dan demokrasi di Indonesia.',
    'pub.search': 'Cari publikasi...',
    'pub.sortNewest': 'Terbaru',
    'pub.sortOldest': 'Terlama',
    'pub.read': 'Baca',
    'pub.viewAll': 'Lihat Semua Artikel',
    'pub.empty': 'Belum ada publikasi yang diterbitkan dengan kriteria ini.',
    'pub.emptyTitle': 'Tidak ada publikasi',

    // Common
    'common.back': 'Kembali',
    'common.loading': 'Memuat…',
    'common.viewDetail': 'Lihat Detail',
    'common.readMore': 'Selengkapnya',
    'common.allCategories': 'Semua',

    // Kontak page
    'kontak.title': 'Hubungi Kami',
    'kontak.subtitle': 'Ada pertanyaan, usulan kerja sama, atau ingin bergabung dengan kami? Kami siap mendengar.',
    'kontak.name': 'Nama Lengkap',
    'kontak.email': 'Alamat Email',
    'kontak.subject': 'Subjek',
    'kontak.message': 'Pesan',
    'kontak.send': 'Kirim Pesan',
    'kontak.sending': 'Mengirim...',
    'kontak.success': 'Pesan berhasil dikirim! Kami akan menghubungi Anda segera.',
    'kontak.error': 'Gagal mengirim pesan. Silakan coba lagi.',
    'kontak.address': 'Alamat',
    'kontak.phone': 'Telepon',
    'kontak.office': 'Jam Kantor',

    // Event
    'event.title': 'Event dan Kegiatan',
    'event.subtitle': 'Kegiatan terbaru SPD Indonesia',
    'event.viewDetail': 'Lihat Detail',
    'event.register': 'Daftar Sekarang',
    'event.date': 'Tanggal',
    'event.location': 'Lokasi',
    'event.noEvents': 'Belum ada kegiatan yang dijadwalkan.',
    'event.upcoming': 'Akan Datang',
    'event.past': 'Sudah Lewat',
    'event.filterAll': 'Semua',
    'event.filterUpcoming': 'Mendatang',
    'event.filterPast': 'Sudah Berlalu',
    'event.found': 'event ditemukan',
    'event.search': 'Cari event...',
    'event.empty': 'Belum ada event yang tersedia.',

    // About
    'about.page.title': 'Tentang Kami',
    'about.profil.title': 'Profil Lembaga',
    'about.visi.title': 'Visi',
    'about.misi.title': 'Misi',
    'about.struktur.title': 'Struktur Organisasi',
    'about.mitra.title': 'Mitra Kolaborasi',
    'about.laporan.title': 'Laporan Tahunan',
    'about.laporan.download': 'Unduh Laporan',
    'about.team.title': 'Tim Kami',

    // Data Pemilu
    'data.title': 'Data Pemilu',
    'data.subtitle': 'Data dan statistik pemilihan umum Indonesia',
    'data.participation': 'Partisipasi Pemilih',
    'data.infografis': 'Infografis',
    'data.source': 'Sumber: KPU RI',
  },

  en: {
    'nav.home':       'Home',
    'nav.about':      'About Us',
    'nav.program':    'Programs',
    'nav.publikasi':  'Publications',
    'nav.event':      'Events',
    'nav.data':       'Election Data',
    'nav.kontak':     'Contact',

    'about.profil':    'Institutional Profile',
    'about.visimisi':  'Vision & Mission',
    'about.struktur':  'Organizational Structure',
    'about.mitra':     'Partners',
    'about.laporan':   'Annual Reports',

    // Publications dropdown
    'publikasi.semua': 'All Publications',
    'publikasi.riset': 'SPD Research',
    'publikasi.buku':  'SPD Books',

    'hero.learnMore':  'Learn More',
    'hero.viewPrograms': 'View Our Programs',

    'quick.section':        'Recent activity',
    'quick.allPublikasi':   'All publications',
    'quick.publikasi':      'Latest Publication',
    'quick.event':          'Latest Event',
    'quick.dataPemilu':     'Election Data',
    'quick.dashboardTitle': 'Open Election Dashboard',
    'quick.subscribe':      'Subscribe',
    'quick.subscribeHead':  'Get updates by email',
    'quick.subscribeHelp':  'Research, opinion, and analysis.',
    'quick.emailPlaceholder': 'your@email.com',
    'quick.subscribeBtn':   'Join',
    'quick.empty.pub':      'No publications yet',
    'quick.empty.evt':      'No events yet',
    'quick.loading':        'Loading…',

    'footer.nav':       'Navigation',
    'footer.services':  'Services',
    'footer.newsletter': 'Newsletter',
    'footer.newsletterCopy': 'Get the latest on Indonesian electoral affairs.',
    'footer.copyright': '© 2026 SPD-Indonesia. All rights reserved.',

    'notfound.title':  'Page not found',
    'notfound.body':   'The page you requested is not available or has moved.',
    'notfound.home':   'Back to Home',
    'notfound.contact': 'Contact Us',

    // FeatureCards
    'feature.title': 'Our Approach',
    'feature.desc': 'Three pillars that define how SPD works — multi-stakeholder collaboration, open data, and space for young people in politics.',

    // ProgramCards
    'program.title': 'Programs & Initiatives',
    'program.desc': 'The initiatives and programs we run to strengthen the democracy ecosystem and electoral reform in Indonesia.',
    'program.readMore': 'Learn more',
    'program.viewAll': 'View All Programs',
    'program.empty': 'No programs or initiatives to display at this time.',
    'program.emptyTitle': 'No programs',

    // PublikasiSection
    'pub.title': 'Publications & Analysis',
    'pub.desc': 'Articles, research, and analysis from SPD on elections and democracy in Indonesia.',
    'pub.search': 'Search publications...',
    'pub.sortNewest': 'Newest',
    'pub.sortOldest': 'Oldest',
    'pub.read': 'Read',
    'pub.viewAll': 'View All Articles',
    'pub.empty': 'No publications matching this criteria.',
    'pub.emptyTitle': 'No publications',

    // Common
    'common.back': 'Back',
    'common.loading': 'Loading…',
    'common.viewDetail': 'View Details',
    'common.readMore': 'Read more',
    'common.allCategories': 'All',

    // Kontak page
    'kontak.title': 'Contact Us',
    'kontak.subtitle': 'Have a question, a collaboration idea, or want to join us? We\'d love to hear from you.',
    'kontak.name': 'Full Name',
    'kontak.email': 'Email Address',
    'kontak.subject': 'Subject',
    'kontak.message': 'Message',
    'kontak.send': 'Send Message',
    'kontak.sending': 'Sending...',
    'kontak.success': 'Message sent successfully! We will get back to you shortly.',
    'kontak.error': 'Failed to send message. Please try again.',
    'kontak.address': 'Address',
    'kontak.phone': 'Phone',
    'kontak.office': 'Office Hours',

    // Event
    'event.title': 'Events & Activities',
    'event.subtitle': 'Latest activities from SPD Indonesia',
    'event.viewDetail': 'View Details',
    'event.register': 'Register Now',
    'event.date': 'Date',
    'event.location': 'Location',
    'event.noEvents': 'No events scheduled yet.',
    'event.upcoming': 'Upcoming',
    'event.past': 'Past',
    'event.filterAll': 'All',
    'event.filterUpcoming': 'Upcoming',
    'event.filterPast': 'Past',
    'event.found': 'events found',
    'event.search': 'Search events...',
    'event.empty': 'No events available yet.',

    // About
    'about.page.title': 'About Us',
    'about.profil.title': 'Institutional Profile',
    'about.visi.title': 'Vision',
    'about.misi.title': 'Mission',
    'about.struktur.title': 'Organizational Structure',
    'about.mitra.title': 'Collaboration Partners',
    'about.laporan.title': 'Annual Reports',
    'about.laporan.download': 'Download Report',
    'about.team.title': 'Our Team',

    // Data Pemilu
    'data.title': 'Election Data',
    'data.subtitle': 'Indonesian general election data and statistics',
    'data.participation': 'Voter Participation',
    'data.infografis': 'Infographics',
    'data.source': 'Source: KPU RI',
  },
};

const I18nContext = createContext({
  lang: DEFAULT_LANG,
  setLang: () => {},
  t: (key) => key,
});

function loadInitial() {
  if (typeof window === 'undefined') return DEFAULT_LANG;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored && SUPPORTED.includes(stored)) return stored;
  } catch { /* ignore */ }
  return DEFAULT_LANG;
}

export function I18nProvider({ children }) {
  const [lang, setLangState] = useState(loadInitial);

  const setLang = (next) => {
    if (!SUPPORTED.includes(next)) return;
    setLangState(next);
    try { localStorage.setItem(STORAGE_KEY, next); } catch { /* ignore */ }
  };

  const value = useMemo(() => {
    const table = DICT[lang] || DICT[DEFAULT_LANG];
    const t = (key, fallback) => {
      if (key in table) return table[key];
      // In dev we'd want to surface missing keys; silent fallback in prod
      // prevents a missing string from breaking the page.
      return fallback !== undefined ? fallback : key;
    };
    return { lang, setLang, t };
  }, [lang]);

  // Update <html lang> so screen readers and SEO know what they're reading.
  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.lang = lang;
    }
  }, [lang]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  return useContext(I18nContext);
}

export { SUPPORTED, DEFAULT_LANG };
