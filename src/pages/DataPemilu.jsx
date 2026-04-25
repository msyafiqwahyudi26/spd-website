import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Hero from '../components/sections/Hero';
import LineChart, { DEFAULT_DATA, DEFAULT_SERIES } from '../components/charts/LineChart';
import Image from '../components/ui/Image';
import MEDIA from '../config/media';
import { api } from '@/lib/api';
import { resolveMediaUrl } from '@/lib/media';

/* ── Filter options ─────────────────────────────────────────────────────── */
const FILTER_OPTIONS = {
  pemilu:  ['Pemilu 2024', 'Pemilu 2019', 'Pemilu 2014', 'Pemilu 2009'],
  wilayah: ['Nasional', 'DKI Jakarta', 'Jawa Barat', 'Jawa Tengah', 'Jawa Timur'],
  jenis:   ['Pemilu Presiden', 'Pemilu DPR', 'Pemilu DPD', 'Pemilu DPRD'],
};

/* ── Stat card data ─────────────────────────────────────────────────────── */
const STATS = [
  { id: 'stat-partisipasi', value: '81,78%', label: 'Tingkat Partisipasi (%)', change: '-0,15% dari 2019', trend: 'down', large: false },
  { id: 'stat-tidak-sah',   value: '2,49%',  label: 'Suara Tidak Sah (%)',     change: '-2,34% dari 2019', trend: 'down', large: false },
  { id: 'stat-kabupaten',   value: '514',    label: 'Kabupaten/Kota',           change: '+5 dari 2019',     trend: 'up',   large: false },
  { id: 'stat-dpt',         value: '204.807.222', label: 'Jumlah Pemilih di DPT', change: '+4.230.000 dari 2019', trend: 'up', large: true },
  { id: 'stat-tps',         value: '823.220',     label: 'Jumlah TPS', change: 'Rata-rata 248 pemilih/TPS', trend: 'neutral', large: true },
];

/* ── Trend sidebar options ──────────────────────────────────────────────── */
const SIDEBAR_FILTERS = [
  { id: 'pemilih', label: 'Pemilih',    options: ['Pemilu Presiden', 'Pemilu DPR', 'Semua'] },
  { id: 'jenis',   label: 'Jenis Data', options: ['Partisipasi Pemilih', 'Suara Tidak Sah'] },
  { id: 'skala',   label: 'Skala',      options: ['Nasional', 'Provinsi', 'Kabupaten/Kota'] },
];

/* ── Shared Select ──────────────────────────────────────────────────────── */
function Select({ label, options, value, onChange }) {
  return (
    <div>
      {label && (
        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
          {label}
        </label>
      )}
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full appearance-none bg-white border border-slate-200 rounded-lg px-4 py-2.5 text-sm text-slate-700 pr-9 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-colors duration-200 cursor-pointer"
        >
          {options.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
        </select>
        <svg className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400"
          fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    </div>
  );
}

/* ── 1. Filter Bar ──────────────────────────────────────────────────────── */
function FilterBar({ filters, onChange }) {
  return (
    <section className="py-6 px-4 bg-white border-b border-slate-100">
      <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Select options={FILTER_OPTIONS.pemilu}  value={filters.pemilu}  onChange={(v) => onChange('pemilu', v)} />
        <Select options={FILTER_OPTIONS.wilayah} value={filters.wilayah} onChange={(v) => onChange('wilayah', v)} />
        <Select options={FILTER_OPTIONS.jenis}   value={filters.jenis}   onChange={(v) => onChange('jenis', v)} />
      </div>
    </section>
  );
}

/* ── 2. Stat Cards ──────────────────────────────────────────────────────── */
const trendStyle = {
  up:      'text-emerald-600',
  down:    'text-red-500',
  neutral: 'text-slate-400',
};

function StatCard({ value, label, change, trend, large }) {
  return (
    <div className={`rounded-xl p-5 bg-white border border-orange-200 shadow-sm ${large ? 'text-center' : ''}`}>
      <p className={`font-extrabold text-slate-800 leading-none ${large ? 'text-3xl' : 'text-2xl'}`}>
        {value}
      </p>
      <p className="text-xs text-slate-500 mt-2">{label}</p>
      <p className={`text-xs mt-1 font-medium ${trendStyle[trend]}`}>{change}</p>
    </div>
  );
}

function StatCards({ stats }) {
  const small = stats.filter((s) => !s.large);
  const large = stats.filter((s) => s.large);
  return (
    <section className="py-8 px-4 bg-white">
      <div className="max-w-6xl mx-auto space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {small.map((s) => <StatCard key={s.id} {...s} />)}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {large.map((s) => <StatCard key={s.id} {...s} />)}
        </div>
      </div>
    </section>
  );
}

/* ── 3. Tren Data Pemilu ────────────────────────────────────────────────── */
function TrendSection({ sidebarFilters, onSidebarChange }) {
  return (
    <section className="py-16 px-4 bg-slate-50">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-2xl font-bold text-slate-800 mb-8">Tren Data Pemilu</h2>
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">

          {/* Chart */}
          <div className="lg:col-span-3 bg-white border border-slate-200 rounded-xl p-6">
            <LineChart data={DEFAULT_DATA} series={DEFAULT_SERIES} />
            <p className="text-xs text-slate-400 mt-4 text-center">
              Sumber: Sindikasi Pemilu dan Demokrasi
            </p>
          </div>

          {/* Sidebar */}
          <div className="flex flex-col gap-4">
            {/* Filter group */}
            <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-4">
              {SIDEBAR_FILTERS.map((f) => (
                <Select
                  key={f.id}
                  label={f.label}
                  options={f.options}
                  value={sidebarFilters[f.id]}
                  onChange={(v) => onSidebarChange(f.id, v)}
                />
              ))}
            </div>

            {/* Tentang Data */}
            <div className="bg-white border border-slate-200 rounded-xl p-4">
              <p className="text-xs font-semibold text-slate-700 mb-2">Tentang Data</p>
              <p className="text-xs text-slate-500 leading-relaxed">
                Data partisipasi pemilih dan suara tidak sah diolah dari hasil rekapitulasi resmi
                KPU, dilengkapi verifikasi lapangan oleh tim riset SPD.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ── 4. Infografis Pemilu ───────────────────────────────────────────────── */
function InfografisSection() {
  const [items, setItems]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(false);

  useEffect(() => {
    let cancelled = false;
    api('/infografis')
      .then((rows) => { if (!cancelled) { setItems(Array.isArray(rows) ? rows : []); setLoading(false); } })
      .catch(() => { if (!cancelled) { setError(true); setLoading(false); } });
    return () => { cancelled = true; };
  }, []);

  // Don't render the section at all if no items and not loading
  if (!loading && !error && items.length === 0) return null;

  return (
    <section className="py-16 px-4 bg-white">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-2xl font-bold text-slate-800 mb-8">Infografis Pemilu</h2>

        {loading && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[1,2,3,4].map(i => (
              <div key={i} className="rounded-xl h-44 bg-slate-100 animate-pulse" />
            ))}
          </div>
        )}

        {error && (
          <p className="text-sm text-slate-400 text-center py-8">Gagal memuat infografis.</p>
        )}

        {!loading && !error && items.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {items.map((item) => {
              const src = item.imageUrl ? resolveMediaUrl(item.imageUrl) : null;
              return (
                <div key={item.id} className="relative rounded-xl overflow-hidden group bg-slate-100">
                  {src ? (
                    <img
                      src={src}
                      alt={item.title}
                      className="w-full h-44 object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-44 flex items-center justify-center bg-slate-200">
                      <svg className="w-10 h-10 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                          d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M2.25 6A2.25 2.25 0 014.5 3.75h15A2.25 2.25 0 0121.75 6v12a2.25 2.25 0 01-2.25 2.25h-15A2.25 2.25 0 012.25 18V6z" />
                      </svg>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/10 to-transparent pointer-events-none" />
                  <div className="absolute bottom-0 left-0 right-0 p-3">
                    <span className="block text-xs font-semibold text-white leading-snug">{item.title}</span>
                    {item.caption && (
                      <span className="block text-[10px] text-slate-300 mt-0.5 leading-tight">{item.caption}</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}

/* ── 5. Kolaborasi CTA ──────────────────────────────────────────────────── */
const CTA_BUTTONS = [
  { id: 'cta-kontribusi', label: 'Ikut Kontribusi', href: '/kontak', bgClass: 'bg-orange-500 hover:bg-orange-600' },
  { id: 'cta-lapor',      label: 'Laporkan Masalah', href: '/kontak', bgClass: 'bg-red-600 hover:bg-red-700' },
];

function KolaborasiCTA() {
  return (
    <section className="py-16 px-4 bg-slate-50">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-start justify-between gap-8">
        <div className="max-w-lg">
          <h2 className="text-2xl font-bold text-slate-800 mb-3">Kolaborasi Data Terbuka</h2>
          <p className="text-sm text-slate-500 leading-relaxed">
            Setiap dataset yang Anda bagikan, setiap anomali yang Anda laporkan, dan setiap
            insight yang Anda berikan akan membantu para stakeholder membuat kebijakan berbasis
            data yang akurat, bukan asumsi.
          </p>
        </div>
        <div className="flex flex-col gap-3 shrink-0 w-full md:w-52">
          {CTA_BUTTONS.map((cta) => (
            <Link
              key={cta.id}
              to={cta.href}
              className={`px-6 py-3 ${cta.bgClass} text-white text-sm font-semibold rounded-lg text-center transition-all duration-200 hover:scale-[1.02]`}
            >
              {cta.label}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── KPU live partisipasi hook ──────────────────────────────────────────── */
function useKpuPartisipasi() {
  const [data, setData]   = useState(null);
  const [status, setStatus] = useState('loading'); // loading | ok | error

  useEffect(() => {
    let cancelled = false;
    api('/kpu/partisipasi')
      .then((d) => { if (!cancelled) { setData(d); setStatus('ok'); } })
      .catch(() => { if (!cancelled) setStatus('error'); });
    return () => { cancelled = true; };
  }, []);

  return { data, status };
}

/* ── Page ───────────────────────────────────────────────────────────────── */
export default function DataPemilu() {
  const [filters, setFilters] = useState({
    pemilu:  'Pemilu 2024',
    wilayah: 'Nasional',
    jenis:   'Pemilu Presiden',
  });

  const [sidebarFilters, setSidebarFilters] = useState({
    pemilih: 'Pemilu Presiden',
    jenis:   'Partisipasi Pemilih',
    skala:   'Nasional',
  });

  const updateFilter  = (key, val) => setFilters((p) => ({ ...p, [key]: val }));
  const updateSidebar = (key, val) => setSidebarFilters((p) => ({ ...p, [key]: val }));

  const { data: kpuData, status: kpuStatus } = useKpuPartisipasi();

  /* Merge live KPU data into STATS where available */
  const liveStats = STATS.map((s) => {
    if (s.id === 'stat-partisipasi' && kpuStatus === 'ok' && kpuData?.persenPartisipasi != null) {
      const pct = parseFloat(kpuData.persenPartisipasi).toFixed(2).replace('.', ',');
      return { ...s, value: `${pct}%`, change: 'Sumber: Sirekap KPU' };
    }
    if (s.id === 'stat-tps' && kpuStatus === 'ok' && kpuData?.totalTps != null) {
      return {
        ...s,
        value: Number(kpuData.totalTps).toLocaleString('id-ID'),
        change: `${Number(kpuData.tpsMelapor ?? 0).toLocaleString('id-ID')} TPS sudah melapor`,
      };
    }
    return s;
  });

  const isLive = kpuStatus === 'ok';

  return (
    <>
      <Hero
        title="Platform Data Pemilu SPD"
        subtitle="Portal data pemilu Indonesia dengan visualisasi interaktif untuk mendukung demokrasi yang berbasis data."
      />

      {/* Status banner */}
      {kpuStatus !== 'loading' && (
        isLive ? (
          <div className="bg-emerald-50 border-b border-emerald-200" role="note">
            <div className="max-w-6xl mx-auto px-4 py-3 flex items-start gap-3">
              <svg className="w-5 h-5 text-emerald-600 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="text-xs sm:text-sm text-emerald-900 leading-relaxed">
                <strong className="font-semibold">Data langsung dari KPU.</strong>{' '}
                Beberapa angka diperbarui otomatis dari Sirekap KPU RI.
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-amber-50 border-b border-amber-200" role="note">
            <div className="max-w-6xl mx-auto px-4 py-3 flex items-start gap-3">
              <svg className="w-5 h-5 text-amber-600 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
              </svg>
              <div className="text-xs sm:text-sm text-amber-900 leading-relaxed">
                <strong className="font-semibold">Data ilustrasi.</strong>{' '}
                Koneksi ke server KPU tidak tersedia — angka adalah contoh historis.
              </div>
            </div>
          </div>
        )
      )}

      <FilterBar filters={filters} onChange={updateFilter} />
      <StatCards stats={liveStats} />
      <TrendSection sidebarFilters={sidebarFilters} onSidebarChange={updateSidebar} />
      <InfografisSection />
      <KolaborasiCTA />
    </>
  );
}
