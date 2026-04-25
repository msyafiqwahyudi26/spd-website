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
