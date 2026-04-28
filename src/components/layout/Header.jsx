import { useState } from 'react';
import { NavLink, Link } from 'react-router-dom';
import logo from '../../assets/logo-spd-opt.webp';
import { resolveMedia } from '../../config/media';
import { useSettings } from '../../hooks/useSettings';
import { useI18n } from '../../i18n';

// Nav tree uses translation keys; labels are resolved at render time.
const TENTANG_ITEMS = [
  { id: 'tk-profil',   tkey: 'about.profil',    href: '/tentang-kami/profil' },
  { id: 'tk-visi',     tkey: 'about.visimisi',  href: '/tentang-kami/visi-misi' },
  { id: 'tk-struktur', tkey: 'about.struktur',  href: '/tentang-kami/struktur' },
  { id: 'tk-mitra',    tkey: 'about.mitra',     href: '/tentang-kami/mitra' },
  { id: 'tk-laporan',  tkey: 'about.laporan',   href: '/tentang-kami/laporan-tahunan' },
];

const PUBLIKASI_ITEMS = [
  { id: 'pub-semua', tkey: 'publikasi.semua', href: '/publikasi' },
  { id: 'pub-riset', tkey: 'publikasi.riset', href: '/publikasi?tipe=riset' },
  { id: 'pub-buku',  tkey: 'publikasi.buku',  href: '/publikasi?tipe=buku' },
];

const NAV_LINKS = [
  { id: 'nav-home',      tkey: 'nav.home',      href: '/beranda' },
  { id: 'nav-about',     tkey: 'nav.about',     href: '/tentang-kami', children: TENTANG_ITEMS },
  { id: 'nav-program',   tkey: 'nav.program',   href: '/program' },
  { id: 'nav-publikasi', tkey: 'nav.publikasi', href: '/publikasi', children: PUBLIKASI_ITEMS },
  { id: 'nav-event',     tkey: 'nav.event',     href: '/event' },
  { id: 'nav-data',      tkey: 'nav.data',      href: '/data-pemilu' },
  { id: 'nav-kontak',    tkey: 'nav.kontak',    href: '/kontak' },
];

const navClass = ({ isActive }) =>
  `px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive
    ? 'text-orange-500 font-semibold'
    : 'text-slate-700 hover:text-orange-500 hover:bg-orange-50'
  }`;

const mobileNavClass = ({ isActive }) =>
  `px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${isActive
    ? 'text-orange-500 bg-orange-50 font-semibold'
    : 'text-slate-700 hover:text-orange-500 hover:bg-orange-50'
  }`;

// Social icons — match the footer; keys correspond to settings.social.*.
const SOCIAL_ICONS = {
  facebook: (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5" aria-hidden="true">
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
  ),
  twitter: (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5" aria-hidden="true">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  ),
  linkedin: (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5" aria-hidden="true">
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
      <rect x="2" y="9" width="4" height="12" />
      <circle cx="4" cy="4" r="2" />
    </svg>
  ),
  instagram: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5" aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" />
    </svg>
  ),
  youtube: (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5" aria-hidden="true">
      <path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46a2.78 2.78 0 0 0-1.95 1.96A29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58A2.78 2.78 0 0 0 3.41 19.6C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.95-1.95A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z" />
      <polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" fill="white" />
    </svg>
  ),
};
const SOCIAL_LABELS = { facebook: 'Facebook', twitter: 'Twitter / X', linkedin: 'LinkedIn', instagram: 'Instagram', youtube: 'YouTube' };

// Thin utility bar above the main nav. Carries social shortcuts (from
// settings.social, so admin-editable) + a language switch placeholder.
// EN is intentionally a no-op toggle; the slot is ready when real
// translations land, and today clicking EN is visibly selectable but
// doesn't change any content.
function TopBar({ settings }) {
  const { lang, setLang } = useI18n();
  const social = settings.social || {};
  const keys = ['facebook', 'instagram', 'youtube', 'twitter', 'linkedin'].filter((k) => social[k]);

  return (
    <div className="bg-slate-900 text-slate-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-8 text-xs">
        <div className="flex items-center gap-3">
          {keys.length > 0 ? (
            keys.map((k) => (
              <a
                key={k}
                href={social[k]}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={SOCIAL_LABELS[k]}
                className="text-slate-400 hover:text-orange-400 transition-colors"
              >
                {SOCIAL_ICONS[k]}
              </a>
            ))
          ) : (
            <span className="text-slate-500 text-[11px]">
              {lang === 'en' ? 'Follow our updates on social media' : 'Ikuti update kami di media sosial'}
            </span>
          )}
        </div>
        <div className="inline-flex items-center gap-0.5 bg-slate-800 rounded p-0.5" role="group" aria-label="Pilih bahasa">
          {['id', 'en'].map((code) => (
            <button
              key={code}
              type="button"
              onClick={() => setLang(code)}
              aria-pressed={lang === code}
              className={`px-2 py-0.5 text-[11px] font-semibold rounded transition-colors uppercase ${
                lang === code ? 'bg-slate-900 text-white' : 'text-slate-400 hover:text-white'
              }`}
              title={code === 'en' ? 'Switch to English' : 'Kembali ke Bahasa Indonesia'}
            >
              {code}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function Caret() {
  return (
    <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 opacity-60" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

function DesktopItem({ link }) {
  const { t } = useI18n();
  if (!link.children) {
    return (
      <NavLink to={link.href} end={link.href === '/'} className={navClass}>
        {t(link.tkey)}
      </NavLink>
    );
  }
  return (
    <div className="relative group">
      <NavLink
        to={link.href}
        end={link.href === '/'}
        className={({ isActive }) =>
          `inline-flex items-center gap-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive
            ? 'text-orange-500 font-semibold'
            : 'text-slate-700 hover:text-orange-500 hover:bg-orange-50'
          }`
        }
      >
        {t(link.tkey)} <Caret />
      </NavLink>
      <div
        className="absolute top-full left-0 z-50 min-w-[240px] bg-white border border-slate-100 rounded-lg shadow-lg p-1.5 mt-1
                   opacity-0 invisible translate-y-1
                   group-hover:opacity-100 group-hover:visible group-hover:translate-y-0
                   group-focus-within:opacity-100 group-focus-within:visible group-focus-within:translate-y-0
                   transition-all duration-150"
      >
        {link.children.map((child) => (
          <Link
            key={child.id}
            to={child.href}
            className="block px-3 py-2 text-sm rounded text-slate-700 hover:bg-orange-50 hover:text-orange-500 transition-colors"
          >
            {t(child.tkey)}
          </Link>
        ))}
      </div>
    </div>
  );
}

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { settings } = useSettings();
  const { t } = useI18n();
  // Dashboard can override settings.images.logo; bundled orange SPD logo is the default.
  const logoSrc = resolveMedia(logo, settings.images?.logo);

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <TopBar settings={settings} />
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-20">

          {/* Logo — inline style prevents FOUC flash before Tailwind loads */}
          <NavLink to="/" className="flex items-center shrink-0">
            <img
              src={logoSrc}
              alt={settings.siteName || 'SPD Indonesia'}
              onError={(e) => { e.currentTarget.src = logo; }}
              className="w-auto object-contain"
              style={{ height: '56px', maxHeight: '56px' }}
            />
          </NavLink>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1" aria-label="Navigasi utama">
            {NAV_LINKS.map((link) => (
              <DesktopItem key={link.id} link={link} />
            ))}
          </nav>

          {/* Mobile Hamburger */}
          <button
            type="button"
            onClick={() => setMenuOpen((prev) => !prev)}
            className="md:hidden p-2 rounded-md text-slate-600 hover:text-orange-500 hover:bg-orange-50 transition-colors"
            aria-label="Toggle menu"
            aria-expanded={menuOpen}
          >
            {menuOpen ? (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-slate-100 bg-white">
          <nav className="max-w-7xl mx-auto px-4 py-2 flex flex-col gap-1" aria-label="Navigasi seluler">
            {NAV_LINKS.map((link) => (
              <div key={link.id}>
                <NavLink
                  to={link.href}
                  end={link.href === '/'}
                  className={mobileNavClass}
                  onClick={() => setMenuOpen(false)}
                >
                  {t(link.tkey)}
                </NavLink>
                {link.children && (
                  <div className="pl-4 flex flex-col">
                    {link.children.map((child) => (
                      <NavLink
                        key={child.id}
                        to={child.href}
                        className={({ isActive }) =>
                          `px-3 py-2 text-sm rounded-md transition-colors ${isActive
                            ? 'text-orange-500 font-semibold'
                            : 'text-slate-500 hover:text-orange-500'
                          }`
                        }
                        onClick={() => setMenuOpen(false)}
                      >
                        {t(child.tkey)}
                      </NavLink>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}
