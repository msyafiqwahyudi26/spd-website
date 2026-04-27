import Hero from '../../components/sections/Hero';
import AboutSubNav from './SubNav';
import PartnersGrid from '../../components/sections/PartnersGrid';
import { MITRA } from '../../data/about';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';
import { useI18n } from '@/i18n';

const FALLBACK = MITRA.map((m) => ({ id: m.id, name: m.name.replace(/\n/g, ' ') }));

export default function Mitra() {
  const { t } = useI18n();
  const [animRef, visible] = useScrollAnimation();

  return (
    <>
      <Hero
        title={t('about.mitra')}
        subtitle={t('about.mitra.hero.subtitle')}
        bgImage={null}
      />
      <AboutSubNav />

      <section
        ref={animRef}
        className={`py-16 px-4 bg-white ${visible ? 'animate-fade-up' : 'opacity-0'}`}
      >
        <div className="max-w-4xl mx-auto">
          <div className="mb-10">
            <h2 className="text-2xl font-bold text-slate-800 mb-3">{t('about.mitra.section.title')}</h2>
            <p className="text-sm text-slate-500 leading-relaxed max-w-2xl">
              {t('about.mitra.section.subtitle')}
            </p>
          </div>

          <PartnersGrid fallback={FALLBACK} />
        </div>
      </section>
    </>
  );
}
