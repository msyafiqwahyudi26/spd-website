import { useEffect, useState } from 'react';
import Hero from '../../components/sections/Hero';
import AboutSubNav from './SubNav';
import { api } from '@/lib/api';
import { resolveMediaUrl } from '@/lib/media';

// Static fallback kept so the page isn't blank before the admin populates
// the list. Replaced the moment the API returns any row.
const LAPORAN_FALLBACK = [
  { id: 'f-2023', year: 2023, title: 'Laporan Tahunan SPD 2023', summary: 'Ringkasan program, riset, dan capaian SPD sepanjang tahun 2023.', fileUrl: null },
  { id: 'f-2022', year: 2022, title: 'Laporan Tahunan SPD 2022', summary: 'Dokumentasi kegiatan advokasi, riset kepemiluan, dan pengembangan kapasitas selama 2022.', fileUrl: null },
  { id: 'f-2021', year: 2021, title: 'Laporan Tahunan SPD 2021', summary: 'Laporan konsolidasi program dan inisiatif SPD di tengah tantangan pandemi.', fileUrl: null },
  { id: 'f-2020', year: 2020, title: 'Laporan Tahunan SPD 2020', summary: 'Capaian program Youth Hub, riset Pilkada serentak, dan advokasi kebijakan selama 2020.', fileUrl: null },
];

export default function LaporanTahunan() {
  const [rows, setRows] = useState(null);

  useEffect(() => {
    let cancelled = false;
    api('/annual-reports')
      .then((list) => { if (!cancelled) setRows(Array.isArray(list) ? list : []); })
      .catch(()    => { if (!cancelled) setRows([]); });
    return () => { cancelled = true; };
  }, []);

  const list = rows === null || rows.length === 0 ? LAPORAN_FALLBACK : rows;

  return (
    <>
      <Hero
        title="Laporan Tahunan"
        subtitle="Transparansi dan akuntabilitas kerja-kerja SPD setiap tahunnya."
        bgImage={null}
      />
      <AboutSubNav />

      <section className="py-16 px-4 bg-white">
        <div className="max-w-4xl mx-auto">
          <div className="mb-10">
            <h2 className="text-2xl font-bold text-slate-800 mb-3">Laporan Kegiatan</h2>
            <p className="text-sm text-slate-500 leading-relaxed">
              SPD berkomitmen pada transparansi dengan menerbitkan laporan tahunan yang mendokumentasikan
              program, riset, dan dampak kerja organisasi.
            </p>
          </div>

          <div className="space-y-4">
            {list.map((lap) => {
              const href = lap.fileUrl ? resolveMediaUrl(lap.fileUrl) : null;
              return (
                <div
                  key={lap.id}
                  className="flex items-start gap-5 bg-slate-50 border border-slate-100 rounded-xl p-5 transition-all duration-200 hover:border-orange-100 hover:bg-orange-50/30"
                >
                  <div className="shrink-0 w-16 h-16 bg-orange-500 rounded-xl flex items-center justify-center">
                    <span className="text-white text-xs font-bold">{lap.year}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-slate-800 text-sm mb-1">{lap.title}</h3>
                    {lap.summary && (
                      <p className="text-xs text-slate-500 leading-relaxed mb-3">{lap.summary}</p>
                    )}
                    {href ? (
                      <a
                        href={href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-orange-500 hover:text-orange-600 transition-colors"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3v-1m-4-4-4 4m0 0-4-4m4 4V4" />
                        </svg>
                        Unduh PDF
                      </a>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 text-xs text-slate-400">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                        </svg>
                        Segera tersedia
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </>
  );
}
