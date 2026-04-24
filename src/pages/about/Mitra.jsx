import Hero from '../../components/sections/Hero';
import AboutSubNav from './SubNav';
import PartnersGrid from '../../components/sections/PartnersGrid';
import { MITRA } from '../../data/about';

// Provide the old static MITRA list as a fallback so the page isn't blank
// until the admin populates the dynamic list from the dashboard.
const FALLBACK = MITRA.map((m) => ({ id: m.id, name: m.name.replace(/\n/g, ' ') }));

export default function Mitra() {
  return (
    <>
      <Hero
        title="Mitra Kolaborasi"
        subtitle="Jaringan kemitraan strategis SPD dalam ekosistem kepemiluan Indonesia."
        bgImage={null}
      />
      <AboutSubNav />

      <section className="py-16 px-4 bg-white">
        <div className="max-w-4xl mx-auto">
          <div className="mb-10">
            <h2 className="text-2xl font-bold text-slate-800 mb-3">Mitra Kami</h2>
            <p className="text-sm text-slate-500 leading-relaxed max-w-2xl">
              SPD berkolaborasi dengan berbagai institusi — penyelenggara pemilu, lembaga pengawas,
              perguruan tinggi, dan organisasi sipil — untuk mendorong reformasi kepemiluan yang
              komprehensif dan berbasis bukti.
            </p>
          </div>

          <PartnersGrid fallback={FALLBACK} />
        </div>
      </section>
    </>
  );
}
