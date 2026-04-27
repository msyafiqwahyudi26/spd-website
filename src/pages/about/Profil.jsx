import { useEffect, useState } from 'react';
import Hero from '../../components/sections/Hero';
import AboutSubNav from './SubNav';
import { api } from '@/lib/api';
import { useSettings } from '../../hooks/useSettings';
import { PERJALANAN } from '../../data/about';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';
import { useI18n } from '@/i18n';

const DEFAULT_INTRO = `Sindikasi Pemilu dan Demokrasi (SPD) adalah organisasi masyarakat sipil yang didirikan pada tahun 2016 dengan komitmen untuk mempelajari dan memperkuat isu-isu pemilu dan demokrasi di Indonesia secara konsisten.

Sebagai organisasi yang berfokus pada kolaborasi multihak, SPD bertujuan untuk memperkuat ekosistem pemilu melalui inisiatif kerja kolaboratif antara organisasi masyarakat sipil (CSO), komunitas kreatif, civic-tech, komunitas bisnis, dan stakeholder lainnya.

SPD berkomitmen menjadi pusat kerja kolaboratif yang mendorong transparansi, akuntabilitas, dan inovasi dalam penyelenggaraan demokrasi dan kepemiluan Indonesia.`;

export default function Profil() {
  const { t } = useI18n();
  const [animRef1, visible1] = useScrollAnimation();
  const [animRef2, visible2] = useScrollAnimation();
  const { settings } = useSettings();
  const [milestones, setMilestones] = useState(null);

  useEffect(() => {
    let cancelled = false;
    api('/milestones')
      .then(rows => { if (!cancelled) setMilestones(Array.isArray(rows) ? rows : []); })
      .catch(() => { if (!cancelled) setMilestones([]); });
    return () => { cancelled = true; };
  }, []);

  const timeline = milestones === null || milestones.length === 0 ? PERJALANAN : milestones;
  const introText = (settings.content?.aboutIntro || '').trim() || DEFAULT_INTRO;

  return (
    <>
      <Hero
        title={t('about.profil')}
        subtitle={t('about.profil.hero.subtitle')}
        bgImage={null}
      />
      <AboutSubNav />

      {/* Sekilas SPD */}
      <section
        ref={animRef1}
        className={`py-16 px-4 bg-white ${visible1 ? 'animate-fade-up' : 'opacity-0'}`}
      >
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-bold text-slate-800 mb-6">{t('about.profil.who')}</h2>
          <div className="space-y-4 text-slate-600 leading-relaxed text-sm">
            {introText.split(/\n\n+/).map((para, i) => (
              <p key={i}>{para}</p>
            ))}
          </div>
        </div>
      </section>

      {/* Perjalanan */}
      <section
        ref={animRef2}
        className={`py-16 px-4 bg-slate-50 ${visible2 ? 'animate-fade-up' : 'opacity-0'}`}
      >
        <div className="max-w-5xl mx-auto">
          <div className="mb-10">
            <h2 className="text-2xl font-bold text-slate-800 mb-3">{t('about.profil.journey.title')}</h2>
            <p className="text-sm text-slate-500 leading-relaxed">
              {t('about.profil.journey.subtitle')}
            </p>
          </div>
          <div className="space-y-3">
            {timeline.map((item) => (
              <div key={item.id} className="bg-white rounded-xl border border-slate-100 p-5 flex gap-4 items-start">
                <div className="shrink-0 pt-0.5">
                  <span className="inline-block bg-orange-500 text-white text-sm font-bold px-3 py-1.5 rounded-lg leading-tight whitespace-nowrap">
                    {item.year}
                  </span>
                </div>
                <div className="w-px self-stretch bg-slate-200 shrink-0 mt-1" />
                <div className="flex-1 pb-1">
                  {item.tag && (
                    <span className="text-[10px] font-bold text-orange-500 tracking-widest uppercase block mb-1">{item.tag}</span>
                  )}
                  <h3 className="font-semibold text-slate-800 text-sm leading-snug mb-1">{item.title}</h3>
                  {item.description && (
                    <p className="text-xs text-slate-500 leading-relaxed">{item.description}</p>
                  )}
                </div>
              </div>
            ))}
          </d