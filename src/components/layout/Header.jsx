import { useState } from 'react';
import { NavLink, Link } from 'react-router-dom';
import logo from '../../assets/logo-spd.svg';
import { resolveMedia } from '../../config/media';
import { useSettings } from '../../hooks/useSettings';

const TENTANG_ITEMS = [
  { id: 'tk-profil', label: 'Profil Lembaga', href: '/tentang-kami/profil' },
  { id: 'tk-visi', label: 'Visi & Misi', href: '/tentang-kami/visi-misi' },
  { id: 'tk-struktur', label: 'Struktur Organisasi', href: '/tentang-kami/struktur' },
  { id: 'tk-mitra', label: 'Mitra Kolaborasi', href: '/tentang-kami/mitra' },
  { id: 'tk-laporan', label: 'Laporan Tahunan', href: '/tentang-kami/laporan-tahunan' },
];

const NAV_LINKS = [
  { id: 'nav-home', label: 'Beranda', href: '/' },
  { id: 'nav-about', label: 'Tentang Kami', href: '/tentang-kami', children: TENTANG_ITEMS },
  { id: 'nav-program', label: 'Program', href: '/program' },
  { id: 'nav-publikasi', label: 'Publikasi', href: '/publikasi' },
  { id: 'nav-event', label: 'Event', href: '/event' },
  { id: 'nav-data', label: 'Data Pemilu', href: '/data-pemilu' },
  { id: 'nav-kontak', label: 'Kontak', href: '/kontak' },
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

function Caret() {
  return (
    <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 opacity-60" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

function DesktopItem({ link }) {
  if (!link.children) {
    return (
      <NavLink to={link.href} end={link.href === '/'} className={navClass}>
        {link.label}
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
        {link.label} <Caret />
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
            {child.label}
          </Link>
        ))}
      </div>
    </div>
  );
}

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { settings } = useSettings();
  // Dashboard can override settings.images.logo; bundled orange SPD logo is the default.
  const logoSrc = resolveMedia(logo, settings.images?.logo);

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-20">

          {/* Logo */}
          <NavLink to="/" className="flex items-center shrink-0">
            <img
              src={logoSrc}
              alt={settings.siteName || 'SPD Indonesia'}
              onError={(e) => { e.currentTarget.src = logo; }}
              className="h-14 sm:h-30 w-auto object-contain"
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
          <nav className="max-w-6xl mx-auto px-4 py-2 flex flex-col gap-1" aria-label="Navigasi seluler">
            {NAV_LINKS.map((link) => (
              <div key={link.id}>
                <NavLink
                  to={link.href}
                  end={link.href === '/'}
                  className={mobileNavClass}
                  onClick={() => setMenuOpen(false)}
                >
                  {link.label}
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
                        {child.label}
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
