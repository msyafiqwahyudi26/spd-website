import { useEffect, useState } from 'react';
import Hero from '../../components/sections/Hero';
import AboutSubNav from './SubNav';
import { api } from '@/lib/api';
import { useSettings } from '../../hooks/useSettings';
import { MISI_ITEMS, CORE_VALUES } from '../../data/about';
import { resolveMediaUrl } from '@/lib/media';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';
import { useI18n } from '@/i18n';

const DEFAULT_VISION =
  'Menjadi pusat kerja kolaboratif multihak dalam mempromosikan penguatan demokrasi dan reformasi kepemiluan.';

const CV_ICONS = {
  collaboration: (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" className="w-6 h-6" aria-hidden="true">
      <path d="M4.5 6.375a4.125 4.125 0 1 1 8.25 0 4.125 4.125 0 0 1-8.25 0ZM14.25 8.625a3.375 3.375 0 1 1 6.75 0 3.375 3.375 0 0 1-6.75 0ZM1.5 19.125a7.125 7.125 0 0 1 14.25 0v.003l-.001.119a.75.75 0 0 1-.363.63 13.067 13.067 0 0 1-6.761 1.873c-2.472 0-4.786-.684-6.76-1.873a.75.75 0 0 1-.364-.63l-.001-.122ZM17.25 19.128l-.001.144a2.25 2.25 0 0 1-.233.96 10.088 10.088 0 0 0 5.06-1.01.75.75 0 0 0 .42-.643 4.875 4.875 0 0 0-6.957-4.611 8.586 8.586 0 0 1 1.71 5.157v.003Z" />
    </svg>
  ),
  data: (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" className="w-6 h-6" aria-hidden="true">
      <path d="M18.375 2.25c-1.035 0-1.875.84-1.875 1.875v15.75c0 1.035.84 1.875 1.875 1.875h.75c1.035 0 1.875-.84 1.875-1.875V4.125c0-1.036-.84-1.875-1.875-1.875h-.75ZM9.75 8.625c0-1.036.84-1.875 1.875-1.875h.75c1.036 0 1.875.84 1.875 1.875v11.25c0 1.035-.84 1.875-1.875 1.875h-.75a1.875 1.875 0 0 1-1.875-1.875V8.625ZM3 13.125c0-1.036.84-1.875 1.875-1.875h.75c1.036 0 1.875.84 1.875 1.875v6.75c0 1.035-.84 1.875-1.875 1.875h-.75A1.875 1.875 0 0 1 3 19.875v-6.75Z" />
    </svg>
  ),
  youth: (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" className="w-6 h-6" aria-hidden="true">
      <path fillRule="evenodd" d="M8.25 6.75a3.75 3.75 0 1 1 7.5 0 3.75 3.75 0 0 1-7.5 0ZM15.75 9.75a3 3 0 1 1 6 0 3 3 0 0 1-6 0ZM2.25 9.75a3 3 0 1 1 6 0 3 3 0 0 1-6 0ZM6.31 15.117A6.745 6.745 0 0 1 12 12a6.745 6.745 0 0 1 6.709 7.498.75.75 0 0 1-.372.568A12.696 12.696 0 0 1 12 21.75c-2.305 0-4.47-.612-6.337-1.684a.75.75 0 0 1-.372-.568 6.787 6.787 0 0 1 1.019-4.38Z" clipRule="evenodd" />
    </svg>
  ),
  policy: (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" className="w-6 h-6" aria-hidden="true">
      <path d="M12 .75a8.25 8.25 0 0 0-4.135 15.39c.686.398 1.115 1.008 1.134 1.623a.75.75 0 0 0 .577.706c.352.083.71.148 1.074.195.323.041.6-.218.6-.544v-4.661a6.714 6.714 0 0 1-.937-.171.75.75 0 1 1 .374-1.453 5.261 5.261 0 0 0 2.626 0 .75.75 0 1 1 .374 1.452 6.712 6.712 0 0 1-.937.172v4.66c0 .327.277.586.6.545.364-.047.722-.112 1.074-.195a.75.75 0 0 0 .577-.706c.02-.615.448-1.225 1.134-1.623A8.25 8.25 0 0 0 12 .75Z" />
    </svg>
  ),
};

export default function VisiMisi() {
  const { t } = useI18n();
  const [animRef1, visible1] = useScrollAnimation();
  const [animRef2, visible2] = useScrollAnimation();
  const { settings } = useSettings();
  const [missions, setMissions] = useState(null);
  const [coreValues, setCoreValues] = useState(null);

  useEffect(() => {
    let cancelled = false;
    Promise.allSettled([api('/missions'), api('/core-values')]).then(([mRes, cvRes]) => {
      if (cancelled) return;
      setMissions(mRes.status === 'fulfilled' && Array.isArray(mRes.value) ? mRes.value : []);
      setCoreValues(cvRes.status === 'fulfilled' && Array.isArray(cvRes.value) ? cvRes.value : []);
    });
    return () => { cancelled = true; };
  }, []);

  const visionText = (settings.content?.vision || '').trim() || DEFAULT_VISION;
  const missionList = missions && missions.length > 0
    ? missions
    : MISI_ITEMS.map(m => ({ id: m.id, text: m.text }));
  const coreValueList = coreValues && coreValues.length > 0
    ? coreValues.map(cv => {
        const resolvedUrl = cv.iconUrl ? resolveMediaUrl(cv.iconUrl) : '';
        const iconNode = resolvedUrl
          ? <img src={resolvedUrl} alt="" className="w-6 h-6 object-contain" style={{ filter: 'brightness(0) invert(1)' }} />
          : (CV_ICONS[cv.iconKey] || CV_ICONS.collaboration);
        return { id: cv.id, title: cv.title, description: cv.description, iconNode };
      })
    : CORE_VALUES.map(cv => ({ id: cv.id, title: cv.title, description: cv.description, iconNode: cv.icon }));

  return (
    <>
      <Hero
        title={t('about.visimisi')}
        subtitle={t('about.visimisi.hero.subtitle')}
        bgImage={null}
      />
      <AboutSubNav />

      <section
        ref={animRef1}
        className={`py-16 px-4 bg-white ${visible1 ? 'animate-fade-up' : 'opacity-0'}`}
      >
        <div className="max-w-5xl mx-auto">

          {/* Visi */}
          <div className="mb-14">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-full bg-orange-500 flex items-center justify-center shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" className="w-5 h-5">
                  <path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" />
                  <path fillRule="evenodd" d="M1.323 11.447C2.811 6.976 7.028 3.75 12.001 3.75c4.97 0 9.185 3.223 10.675 7.69.12.362.12.752 0 1.113-1.487 4.471-5.705 7.697-10.677 7.697-4.97 0-9.186-3.223-10.675-7.69a1.762 1.762 0 0 1 0-1.113ZM17.25 12a5.25 5.25 0 1 1-10.5 0 5.25 5.25 0 0 1 10.5 0Z" clipRule="evenodd" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-slate-800">{t('about.visimisi.visi')}</h2>
            </div>
            <div className="bg-orange-50 border border-orange-100 rounded-xl p-6">
              <p className="text-slate-700 leading-relaxed text-base whitespace-pre-line">{visionText}</p>
            </div>
          </div>

          {/* Misi */}
          <div>
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" className="w-5 h-5">
                  <path fillRule="evenodd" d="M8.603 3.799A4.49 4.49 0 0 1 12 2.25c1.357 0 2.573.6 3.397 1.549a4.49 4.49 0 0 1 3.498 1.307 4.491 4.491 0 0 1 1.307 3.497A4.49 4.49 0 0 1 21.75 12a4.49 4.49 0 0 1-1.549 3.397 4.491 4.491 0 0 1-1.307 3.497 4.491 4.491 0 0 1-3.497 1.307A4.49 4.49 0 0 1 12 21.75a4.49 4.49 0 0 1-3.397-1.549 4.49 4.49 0 0 1-3.498-1.306 4.491 4.491 0 0 1-1.307-3.498A4.49 4.49 0 0 1 2.25 12c0-1.357.6-2.573 1.549-3.397a4.49 4.49 0 0 1 1.307-3.497 4.49 4.49 0 0 1 3.497-1.307Zm7.007 6.387a.75.75 0 1 0-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 0 0-1.06 1.06l2.25 2.25a.75.75 0 0 0 1.14-.094l3.75-5.25Z" clipRule="evenodd" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-slate-800">{t('about.visimisi.misi')}</h2>
            </div>
            <ul className="space-y-3">
              {missionList.map((item, i) => (
                <li key={item.id} className="flex items-start gap-4 bg-slate-50 rounded-xl p-4 border border-slate-100">
                  <span className="shrink-0 w-6 h-6 rounded-full bg-orange-500 text-white text-xs font-bold flex items-center justify-center mt-0.5">
                    {i + 1}
                  </span>
                  <p className="text-sm text-slate-600 leading-relaxed">{item.text}</p>
                </li>
              ))}
            </ul>
          </div>

        </div>
      </section>

      {/* Core Values */}
      <section
        ref={animRef2}
        className={`py-16 px-4 bg-slate-50 border-t border-slate-100 ${visible2 ? 'animate-fade-up' : 'opacity-0'}`}
      >
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold text-slate-800">{t('about.visimisi.corevalue.title')}</h2>
            <p className="mt-2 text-sm text-slate-500">
              {t('about.visimisi.corevalue.subtitle')}
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {coreValueList.map((cv) => (
              <div
                key={cv.id}
                className="group bg-white border border-slate-100 rounded-xl p-6 text-center transition-all duration-300 ease-out hover:-translate-y-1.5 hover:shadow-xl hover:shadow-orange-100/50 hover:border-orange-100"
              >
                <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center mx-auto mb-4 transition-all duration-300 group-hover:scale-110 group-hover:bg-orange-500">
                  {cv.iconNode}
                </div>
                <h3 className="font-bold text-slate-800 mb-2 transition-colors duration-200 group-hover:text-orange-600">{cv.title}</h3>
                <p className="text-xs text-slate-500 leading-relaxed">{cv.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
