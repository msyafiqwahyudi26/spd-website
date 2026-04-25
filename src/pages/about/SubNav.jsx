import { NavLink } from 'react-router-dom';

const TABS = [
  { id: 'overview',  label: 'Tentang Kami',    href: '/tentang-kami' },
  { id: 'profil',    label: 'Profil',           href: '/tentang-kami/profil' },
  { id: 'visi-misi', label: 'Visi & Misi',      href: '/tentang-kami/visi-misi' },
  { id: 'struktur',  label: 'Struktur',          href: '/tentang-kami/struktur' },
  { id: 'mitra',     label: 'Mitra',             href: '/tentang-kami/mitra' },
  { id: 'laporan',   label: 'Laporan Tahunan',   href: '/tentang-kami/laporan-tahunan' },
];

export default function AboutSubNav() {
  return (
    <div className="bg-white border-b border-slate-100 sticky top-20 z-40">
      <div className="max-w-6xl mx-auto px-4">
        <nav className="flex overflow-x-auto scrollbar-hide gap-0">
          {TABS.map((tab) => (
            <NavLink
              key={tab.id}
              to={tab.href}
              end={tab.href === '/tentang-kami'}
              className={({ isActive }) =>
                `px-4 py-3.5 text-sm font-medium whitespace-nowrap border-b-2 transition-colors duration-200 ${
                  isActive
                    ? 'text-orange-500 border-orange-500'
                    : 'text-slate-500 border-transparent hover:text-slate-800 hover:border-slate-300'
                }`
              }
            >
              {tab.label}
            </NavLink>
          ))}
        </nav>
      </div>
    </div>
  );
}
