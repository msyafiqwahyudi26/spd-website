import { NavLink } from 'react-router-dom';
import { useI18n } from '@/i18n';

export default function AboutSubNav() {
  const { t } = useI18n();

  const TABS = [
    { id: 'overview',  label: t('nav.about'),         href: '/tentang-kami' },
    { id: 'profil',    label: t('about.profil'),       href: '/tentang-kami/profil' },
    { id: 'visi-misi', label: t('about.visimisi'),     href: '/tentang-kami/visi-misi' },
    { id: 'struktur',  label: t('about.struktur'),     href: '/tentang-kami/struktur' },
    { id: 'mitra',     label: t('about.mitra'),        href: '/tentang-kami/mitra' },
    { id: 'laporan',   label: t('about.laporan'),      href: '/tentang-kami/laporan-tahunan' },
  ];

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
