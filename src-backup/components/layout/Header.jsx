import { useState } from 'react';
import logo from '../../assets/logo-spd.svg';

const NAV_LINKS = [
  { label: 'Beranda', href: '/' },
  { label: 'Tentang Kami', href: '/tentang-kami' },
  { label: 'Program', href: '/program' },
  { label: 'Publikasi', href: '/publikasi' },
  { label: 'Data Pemilu', href: '/data-pemilu' },
  { label: 'Kontak', href: '/kontak' },
];

export default function Header({ activePath = '/' }) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <a href="/" className="flex items-center shrink-0">
            <img
              src={logo}
              alt="Sindikasi Pemilu dan Demokrasi"
              className="h-10 w-auto"
            />
          </a>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map((link) => {
              const isActive = activePath === link.href;
              return (
                <a
                  key={link.href}
                  href={link.href}
                  className={`
                    px-3 py-2 rounded-md text-sm font-medium transition-colors
                    ${isActive
                      ? 'text-orange-500 font-semibold'
                      : 'text-slate-700 hover:text-orange-500 hover:bg-orange-50'
                    }
                  `}
                >
                  {link.label}
                </a>
              );
            })}
          </nav>

          {/* Mobile Hamburger */}
          <button
            onClick={() => setMenuOpen((prev) => !prev)}
            className="md:hidden p-2 rounded-md text-slate-600 hover:text-orange-500 hover:bg-orange-50 transition-colors"
            aria-label="Toggle menu"
            aria-expanded={menuOpen}
          >
            {menuOpen ? (
              // X icon
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              // Hamburger icon
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {menuOpen && (
        <div className="md:hidden border-t border-slate-100 bg-white">
          <nav className="max-w-6xl mx-auto px-4 py-2 flex flex-col gap-1">
            {NAV_LINKS.map((link) => {
              const isActive = activePath === link.href;
              return (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  className={`
                    px-3 py-2.5 rounded-md text-sm font-medium transition-colors
                    ${isActive
                      ? 'text-orange-500 bg-orange-50 font-semibold'
                      : 'text-slate-700 hover:text-orange-500 hover:bg-orange-50'
                    }
                  `}
                >
                  {link.label}
                </a>
              );
            })}
          </nav>
        </div>
      )}
    </header>
  );
}
