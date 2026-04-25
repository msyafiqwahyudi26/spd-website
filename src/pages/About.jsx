import { Link } from 'react-router-dom';
import Hero from '../components/sections/Hero';
import AboutSubNav from './about/SubNav';
import StatsBanner from '../components/sections/StatsBanner';
import { STATS } from '../data/about';

// The "Tentang Kami" overview is a map, not a mega-page. Each subpage owns
// its own content; this page introduces SPD in one paragraph, shows the
// institutional stats, and routes visitors to the right detail page.
const SUBPAGES = [
  {
    id: 'profil',
    label: 'Profil',
    desc: 'Sejarah, identitas organisasi, dan perjalanan SPD sejak 2016.',
    href: '/tentang-kami/profil',
  },
  {
    id: 'visi-misi',
    label: 'Visi & Misi',
    desc: 'Arah strategis dan nilai-nilai dasar (core values) yang memandu kerja SPD.',
    href: '/tentang-kami/visi-misi',
  },
  {
    id: 'struktur',
    label: 'Struktur',
    desc: 'Tim yang menjalankan riset, advokasi, dan program SPD.',
    href: '/tentang-kami/struktur',
  },
  {
    id: 'mitra',
    label: 'Mitra',
    desc: 'Jaringan kemitraan strategis SPD di ekosistem kepemiluan.',
    href: '/tentang-kami/mitra',
  },
  {
    id: 'laporan',
    label: 'Laporan Tahunan',
    desc: 'Laporan kegiatan dan transparansi keuangan per tahun.',
    href: '/tentang-kami/laporan-tahunan',
  },
];

function Intro() {
  return (
    <section className="py-16 px-4 bg-white">
      <div className="max-w-3xl mx-auto text-center">
        <h2 className="text-3xl font-bold text-slate-800 mb-6">Siapa Kami, Singkatnya</h2>
        <p className="text-slate-600 leading-relaxed">
          Sindikasi Pemilu dan Demokrasi (SPD) adalah organisasi masyarakat sipil yang
          didirikan pada 2016. Kami hadir sebagai pusat kerja kolaboratif multihak untuk
          mempelajari, mendampingi, dan memperkuat isu-isu pemilu dan demokrasi di
          Indonesia — melalui riset, advokasi kebijakan, dan kerja bersama organisasi
          sipil, akademisi, komunitas kreatif, dan lembaga penyelenggara pemilu.
        </p>
      </div>
    </section>
  );
}

function SubpageMap() {
  return (
    <section className="py-16 px-4 bg-slate-50 border-t border-slate-100">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-10">
          <h2 className="text-2xl font-bold text-slate-800">Jelajahi Tentang Kami</h2>
          <p className="mt-2 text-sm text-slate-500">
            Setiap topik memiliki halaman tersendiri — pilih yang ingin Anda dalami.
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
  return (
    <>
      <Hero
        title="Tentang Kami"
        subtitle="Mengenal lebih dalam Sindikasi Pemilu dan Demokrasi — pusat kolaborasi multihak dalam penguatan demokrasi dan reformasi kepemiluan Indonesia."
      />
      <AboutSubNav />

      <Intro />
      <StatsBanner fallback={STATS} />
      <SubpageMap />
    </>
  );
}
