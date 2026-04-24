import { useEffect, useState } from 'react';
import Hero from '../../components/sections/Hero';
import Image from '../../components/ui/Image';
import AboutSubNav from './SubNav';
import { api } from '@/lib/api';
import { useSettings } from '../../hooks/useSettings';
import { SIAPA_KAMI_IMAGES, PERJALANAN } from '../../data/about';

const DEFAULT_INTRO = `Sindikasi Pemilu dan Demokrasi (SPD) adalah organisasi masyarakat sipil yang didirikan pada tahun 2016 dengan komitmen untuk mempelajari dan memperkuat isu-isu pemilu dan demokrasi di Indonesia secara konsisten.

Sebagai organisasi yang berfokus pada kolaborasi multihak, SPD bertujuan untuk memperkuat ekosistem pemilu melalui inisiatif kerja kolaboratif antara organisasi masyarakat sipil (CSO), komunitas kreatif, civic-tech, komunitas bisnis, dan stakeholder lainnya.

SPD berkomitmen menjadi pusat kerja kolaboratif yang mendorong transparansi, akuntabilitas, dan inovasi dalam penyelenggaraan demokrasi dan kepemiluan Indonesia.`;

export default function Profil() {
  const { settings } = useSettings();
  const [milestones, setMilestones] = useState(null);

  useEffect(() => {
    let cancelled = false;
    api('/milestones')
      .then(rows => { if (!cancelled) setMilestones(Array.isArray(rows) ? rows : []); })
      .catch(() => { if (!cancelled) setMilestones([]); });
    return () => { cancelled = true; };
  }, []);

  // Show static PERJALANAN until API responds or when admin hasn't added any.
  const timeline = milestones === null || milestones.length === 0 ? PERJALANAN : milestones;
  const introText = (settings.content?.aboutIntro || '').trim() || DEFAULT_INTRO;

  return (
    <>
      <Hero
        title="Profil Organisasi"
        subtitle="Mengenal lebih dalam Sindikasi Pemilu dan Demokrasi."
        bgImage={null}
      />
      <AboutSubNav />

      {/* Sekilas SPD */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-slate-800 mb-6">Siapa Kami</h2>
          <div className="space-y-4 text-slate-600 leading-relaxed text-sm mb-10">
            {introText.split(/\n\n+/).map((para, i) => (
              <p key={i}>{para}</p>
            ))}
          </div>
          <div className="grid grid-cols-3 gap-4">
            {SIAPA_KAMI_IMAGES.map((img) => (
              <Image key={img.id} src={img.src} className="h-48 rounded-lg" gradient="from-slate-100 to-slate-200" />
            ))}
          </div>
        </div>
      </section>

      {/* Perjalanan */}
      <section className="py-16 px-4 bg-slate-50">
        <div className="max-w-4xl mx-auto">
          <div className="mb-10">
            <h2 className="text-2xl font-bold text-slate-800 mb-3">Perjalanan SPD</h2>
            <p className="text-sm text-slate-500 leading-relaxed">
              Sejak tahun 2016 hingga kini, SPD terus berkontribusi sebagai pusat kolaboratif
              dalam ekosistem kepemiluan Indonesia.
            </p>
          </div>
          <div className="space-y-4">
            {timeline.map((item) => (
              <div key={item.id} className="bg-white rounded-xl border border-slate-100 p-5 flex gap-5">
                <div className="shrink-0 w-20 text-right">
                  <span className="text-xs font-bold text-orange-500">{item.year}</span>
                </div>
                <div className="border-l border-slate-200 pl-5 pb-2">
                  {item.tag && (
                    <span className="text-[10px] font-bold text-orange-500 tracking-widest uppercase block mb-1">{item.tag}</span>
                  )}
                  <h3 className="font-semibold text-slate-800 text-sm mb-1">{item.title}</h3>
                  {item.description && <p className="text-xs text-slate-500 leading-relaxed">{item.description}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

    </>
  );
}
