import { useEffect, useState } from 'react';
import Hero from '../../components/sections/Hero';
import AboutSubNav from './SubNav';
import { api } from '@/lib/api';
import { useSettings } from '../../hooks/useSettings';
import { MISI_ITEMS, CORE_VALUES } from '../../data/about';

const DEFAULT_VISION =
  'Menjadi pusat kerja kolaboratif multihak dalam mempromosikan penguatan demokrasi dan reformasi kepemiluan.';

export default function VisiMisi() {
  const { settings } = useSettings();
  const [missions, setMissions] = useState(null);

  useEffect(() => {
    let cancelled = false;
    api('/missions')
      .then(rows => { if (!cancelled) setMissions(Array.isArray(rows) ? rows : []); })
      .catch(()    => { if (!cancelled) setMissions([]); });
    return () => { cancelled = true; };
  }, []);

  // Vision: use saved setting if non-empty, else fall back to DEFAULT text.
  const visionText = (settings.content?.vision || '').trim() || DEFAULT_VISION;
  // Missions: API list if non-empty, else static fallback (with uniform shape).
  const missionList = missions && missions.length > 0
    ? missions
    : MISI_ITEMS.map(m => ({ id: m.id, text: m.text }));

  return (
    <>
      <Hero
        title="Visi & Misi"
        subtitle="Tujuan dan arah strategis Sindikasi Pemilu dan Demokrasi."
        bgImage={null}
      />
      <AboutSubNav />

      <section className="py-16 px-4 bg-white">
        <div className="max-w-4xl mx-auto">

          {/* Visi */}
          <div className="mb-14">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-full bg-orange-500 flex items-center justify-center shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" className="w-5 h-5">
                  <path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" />
                  <path fillRule="evenodd" d="M1.323 11.447C2.811 6.976 7.028 3.75 12.001 3.75c4.97 0 9.185 3.223 10.675 7.69.12.362.12.752 0 1.113-1.487 4.471-5.705 7.697-10.677 7.697-4.97 0-9.186-3.223-10.675-7.69a1.762 1.762 0 0 1 0-1.113ZM17.25 12a5.25 5.25 0 1 1-10.5 0 5.25 5.25 0 0 1 10.5 0Z" clipRule="evenodd" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-slate-800">Visi</h2>
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
              <h2 className="text-2xl font-bold text-slate-800">Misi</h2>
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

      {/* Core Values — part of institutional ethos; belongs with Visi & Misi. */}
      <section className="py-16 px-4 bg-slate-50 border-t border-slate-100">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold text-slate-800">Core Value</h2>
            <p className="mt-2 text-sm text-slate-500">
              Prinsip-prinsip yang mendasari setiap aksi kolaboratif SPD.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {CORE_VALUES.map((cv) => (
              <div
                key={cv.id}
                className="group bg-white border border-slate-100 rounded-xl p-6 text-center transition-all duration-300 ease-out hover:-translate-y-1.5 hover:shadow-xl hover:shadow-orange-100/50 hover:border-orange-100"
              >
                <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center mx-auto mb-4 transition-all duration-300 group-hover:scale-110 group-hover:bg-orange-500">
                  {cv.icon}
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
