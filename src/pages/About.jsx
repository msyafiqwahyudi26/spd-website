import { Link } from 'react-router-dom';
import Hero from '../components/sections/Hero';
import AboutSubNav from './about/SubNav';
import StatsBanner from '../components/sections/StatsBanner';
import { STATS } from '../data/about';
import { useI18n } from '@/i18n';

function Intro() {
  const { t } = useI18n();
  return (
    <section className="py-16 px-4 bg-white">
      <div className="max-w-3xl mx-auto text-center">
        <h2 className="text-3xl font-bold text-slate-800 mb-6">{t('about.overview.intro.title')}</h2>
        <p className="text-slate-600 leading-relaxed">
          {t('about.overview.intro.text')}
        </p>
      </div>
    </section>
  );
}

function SubpageMap() {
  const { t } = useI18n();

  const SUBPAGES = [
    {
      id: 'profil',
      label: t('about.profil'),
      desc: t('about.subpage.profil.desc'),
      href: '/tentang-kami/profil',
    },
    {
      id: 'visi-misi',
      label: t('about.visimisi'),
      desc: t('about.subpage.visimisi.desc'),
      href: '/tentang-kami/visi-misi',
    },
    {
      id: 'struktur',
      label: t('about.struktur'),
      desc: t('about.subpage.struktur.desc'),
      href: '/tentang-kami/struktur',
    },
    {
      id: 'mitra',
      label: t('about.mitra'),
      desc: t('about.subpage.mitra.desc'),
      href: '/tentang-kami/mitra',
    },
    {
      id: 'laporan',
      label: t('about.laporan'),
      desc: t('about.subpage.laporan.desc'),
      href: '/tentang-kami/laporan-tahunan',
    },
  ];

  return (
    <section className="py-16 px-4 bg-slate-50 border-t border-slate-100">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-10">
          <h2 className="text-2xl font-bold text-slate-800">{t('about.overview.explore.title')}</h2>
          <p className="mt-2 text-sm text-slate-500">
            {t('about.overview.explore.subtitle')}
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {SUBPAGES.map((sp) => (
            <Link
              key={sp.id}
              to={sp.href}
              className="group bg-white border border-slate-100 rounded-xl p-5 flex flex-col transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md hover:border-orange-100"
            >
              <div className="flex items-start justify-between gap-3 mb-2">
                <span className="font-semibold text-slate-800 text-base group-hover:text-orange-600 transition-colors">
                  {sp.label}
                </span>
                <svg
                  className="w-4 h-4 text-slate-300 group-hover:text-orange-500 transition-colors shrink-0 mt-1"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                  aria-hidden="true"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                </svg>
              </div>
              <span className="text-sm text-slate-500 leading-relaxed">{sp.desc}</span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

export default function About() {
  const { t } = useI18n();
  return (
    <>
      <Hero
        title={t('nav.about')}
        subtitle={t('about.overview.hero.subtitle')}
      />
      <AboutSubNav />

      <Intro />
      <StatsBanner fallback={STATS} />
      <SubpageMap />
    </>
  );
}
