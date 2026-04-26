import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Hero from '../components/sections/Hero';
import LineChart, { DEFAULT_DATA, DEFAULT_SERIES } from '../components/charts/LineChart';
import { api } from '@/lib/api';
import { resolveMediaUrl } from '@/lib/media';

/* ── Helpers ────────────────────────────────────────────────────────────── */
const fmt = (n) =>
  n == null ? '—' : Number(n).toLocaleString('id-ID');

const fmtPct = (part, whole) => {
  if (!part || !whole) return '—';
  return ((part / whole) * 100).toFixed(2) + '%';
};

/* ── Filter options ─────────────────────────────────────────────────────── */
const FILTER_OPTIONS = {
  pemilu:  ['Pemilu 2024', 'Pemilu 2019', 'Pemilu 2014', 'Pemilu 2009'],
  wilayah: ['Nasional', 'DKI Jakarta', 'Jawa Barat', 'Jawa Tengah', 'Jawa Timur'],
  jenis:   ['Pemilu Presiden', 'Pemilu DPR', 'Pemilu DPD', 'Pemilu DPRD'],
};

const SIDEBAR_FILTERS = [
  { id: 'pemilih', label: 'Pemilih',    options: ['Pemilu Presiden', 'Pemilu DPR', 'Semua'] },
  { id: 'jenis',   label: 'Jenis Data', options: ['Partisipasi Pemilih', 'Suara Tidak Sah'] },
  { id: 'skala',   label: 'Skala',      options: ['Nasional', 'Provinsi', 'Kabupaten/Kota'] },
];

/* ── Fallback (ilustrasi) data ─────────────────────────────────────────── */
const FALLBACK_STATS = {
  partisipasi: '81,78%',
  dpt:         204807222,
  dp4:         204656053,
  tps:         823220,
  tpsMelapor:  null,
};

/* ── Hooks ──────────────────────────────────────────────────────────────── */
function useKpuPartisipasi() {
  const [data, setData]     = useState(null);
  const [status, setStatus] = useState('loading');
  useEffect(() => {
    let cancelled = false;
    api('/kpu/partisipasi')
      .then((d) => { if (!cancelled) { setData(d); setStatus('ok'); } })
      .catch(() => { if (!cancelled) setStatus('error'); });
    return () => { cancelled = true; };
  }, []);
  return { data, status };
}

function useKpuPemilih() {
  const [data, setData]     = useState(null);
  const [status, setStatus] = useState('loading');
  useEffect(() => {
    let cancelled = false;
    api('/kpu/pemilih')
      .then((d) => { if (!cancelled) { setData(d); setStatus('ok'); } })
      .catch(() => { if (!cancelled) setStatus('error'); });
    return () => { cancelled = true; };
  }, []);
  return { data, status };
}

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

/* ── 1. Status Banner ───────────────────────────────────────────────────── */
function StatusBanner({ partisipasiStatus, pemilihStatus, updatedAt }) {
  const allOk  = partisipasiStatus === 'ok' && pemilihStatus === 'ok';
  const anyOk  = partisipasiStatus === 'ok' || pemilihStatus === 'ok';
  const loading = partisipasiStatus === 'loading' || pemilihStatus === 'loading';

  if (loading) return null;

  const ts = updatedAt
    ? new Date(updatedAt).toLocaleString('id-ID', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })
    : null;

  if (allOk) {
    return (
      <div className="bg-emerald-50 border-b border-emerald-200" role="note">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-start gap-3">
          <svg className="w-5 h-5 text-emerald-600 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div className="text-xs sm:text-sm text-emerald-900 leading-relaxed">
            <strong className="font-semibold">Data langsung dari KPU.</strong>{' '}
            Semua angka diperbarui otomatis dari Sirekap & Satu Peta Data KPU.
            {ts && <span className="ml-2 text-emerald-700 opacity-75">Terakhir diperbarui: {ts}</span>}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-amber-50 border-b border-amber-200" role="note">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-start gap-3">
        <svg className="w-5 h-5 text-amber-600 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
        </svg>
        <div className="text-xs sm:text-sm text-amber-900 leading-relaxed">
          <strong className="font-semibold">Data ilustrasi.</strong>{' '}
          Koneksi ke server KPU tidak tersedia — angka adalah contoh historis.
          {anyOk && <span className="ml-1">(sebagian data berhasil dimuat)</span>}
        </div>
      </div>
    </div>
  );
}

/* ── 2. Filter Bar ──────────────────────────────────────────────────────── */
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

/* ── 3. Stat Cards ──────────────────────────────────────────────────────── */
const trendStyle = {
  up:      'text-emerald-600',
  down:    'text-red-500',
  neutral: 'text-slate-400',
};

function StatCard({ value, label, change, trend, large, live }) {
  return (
    <div className={`rounded-xl p-5 bg-white border shadow-sm relative ${large ? 'text-center' : ''} ${live ? 'border-orange-200' : 'border-slate-200'}`}>
      {live && (
        <span className="absolute top-3 right-3 flex items-center gap-1 text-[9px] font-bold text-emerald-600 uppercase tracking-wider">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          Live
        </span>
      )}
      <p className={`font-extrabold text-slate-800 leading-none ${large ? 'text-3xl' : 'text-2xl'}`}>
        {value}
      </p>
      <p className="text-xs text-slate-500 mt-2">{label}</p>
      <p className={`text-xs mt-1 font-medium ${trendStyle[trend] || 'text-slate-400'}`}>{change}</p>
    </div>
  );
}

function StatCards({ partisipasiData, pemilihData, partisipasiStatus, pemilihStatus }) {
  const isLivePart  = partisipasiStatus === 'ok';
  const isLivePemil = pemilihStatus === 'ok';

  const partisipasiVal = isLivePart && partisipasiData?.persenPartisipasi != null
    ? `${parseFloat(partisipasiData.persenPartisipasi).toFixed(2).replace('.', ',')}%`
    : FALLBACK_STATS.partisipasi;

  const dptVal  = isLivePemil ? pemilihData?.nasional?.dpt  : FALLBACK_STATS.dpt;
  const dp4Val  = isLivePemil ? pemilihData?.nasional?.dp4  : FALLBACK_STATS.dp4;
  const tpsVal  = isLivePart  ? partisipasiData?.totalTps   : FALLBACK_STATS.tps;

  const small = [
    {
      id: 'partisipasi',
      value: partisipasiVal,
      label: 'Tingkat Partisipasi (%)',
      change: isLivePart ? 'Sumber: Sirekap KPU' : '-0,15% dari 2019',
      trend: 'down',
      live: isLivePart,
    },
    {
      id: 'tidak-sah',
      value: '2,49%',
      label: 'Suara Tidak Sah (%)',
      change: '-2,34% dari 2019',
      trend: 'down',
      live: false,
    },
    {
      id: 'kabupaten',
      value: '514',
      label: 'Kabupaten/Kota',
      change: '+5 dari 2019',
      trend: 'up',
      live: false,
    },
  ];

  const large = [
    {
      id: 'dpt',
      value: fmt(dptVal),
      label: 'Jumlah Pemilih di DPT',
      change: isLivePemil
        ? `DP4 awal: ${fmt(dp4Val)} · Sumber: Satu Peta Data KPU`
        : '+4.230.000 dari 2019',
      trend: 'up',
      live: isLivePemil,
      large: true,
    },
    {
      id: 'tps',
      value: fmt(tpsVal),
      label: 'Jumlah TPS',
      change: isLivePart && partisipasiData?.tpsMelapor != null
        ? `${fmt(partisipasiData.tpsMelapor)} TPS sudah melapor`
        : 'Rata-rata 248 pemilih/TPS',
      trend: 'neutral',
      live: isLivePart,
      large: true,
    },
  ];

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

/* ── 4. Daftar Pemilih Section (satupetadata) ───────────────────────────── */
const PEMILIH_COLS = [
  { key: 'provinsi', label: 'Provinsi',  align: 'left'  },
  { key: 'dp4',      label: 'DP4',       align: 'right' },
  { key: 'dpt',      label: 'DPT',       align: 'right' },
  { key: 'selisih',  label: 'Selisih',   align: 'right' },
  { key: 'persen',   label: '% DPT/DP4', align: 'right' },
];

function FunnelBar({ label, value, max, color, pct: pctStr }) {
  const pct = max ? Math.min(100, Math.round((value / max) * 100)) : 0;
  return (
    <div className="flex items-center gap-2 text-xs">
      <span className="w-14 font-bold text-slate-600 text-right shrink-0">{label}</span>
      <div className="flex-1 bg-slate-100 rounded-full h-4 overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="w-28 tabular-nums text-slate-500 shrink-0">{fmt(value)}</span>
      <span className="w-10 text-slate-600 font-semibold shrink-0">{pctStr}</span>
    </div>
  );
}

function DaftarPemilihSection({ data, status }) {
  const [search, setSearch]   = useState('');
  const [sortKey, setSortKey] = useState('dpt');
  const [sortDir, setSortDir] = useState('desc');

  if (status === 'loading') {
    return (
      <section className="py-12 px-4 bg-slate-50">
        <div className="max-w-6xl mx-auto space-y-3">
          <div className="h-6 w-48 bg-slate-200 rounded animate-pulse" />
          <div className="h-4 w-80 bg-slate-100 rounded animate-pulse" />
          <div className="mt-6 space-y-2">
            {[...Array(6)].map((_, i) => <div key={i} className="h-9 bg-slate-200 rounded animate-pulse" />)}
          </div>
        </div>
      </section>
    );
  }

  if (status === 'error' || !data) {
    return (
      <section className="py-12 px-4 bg-slate-50">
        <div className="max-w-6xl mx-auto">
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 text-center">
            <p className="text-amber-800 font-semibold text-sm">Data per provinsi tidak tersedia</p>
            <p className="text-amber-600 text-xs mt-1">Koneksi ke Satu Peta Data KPU tidak berhasil. Coba refresh halaman.</p>
          </div>
        </div>
      </section>
    );
  }

  const n   = data.nasional ?? {};
  const dp4 = n.dp4 ?? 1;

  // Enrich rows with computed fields
  const rows = (data.provinsi ?? []).map(r => ({
    ...r,
    selisih: r.dp4 && r.dpt ? r.dp4 - r.dpt : null,
    persen:  r.dp4 && r.dpt ? (r.dpt / r.dp4) * 100 : null,
  }));

  const filtered = rows
    .filter(r => r.provinsi?.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      const av = a[sortKey] ?? 0, bv = b[sortKey] ?? 0;
      if (sortKey === 'provinsi') {
        const c = String(av).localeCompare(String(bv));
        return sortDir === 'asc' ? c : -c;
      }
      return sortDir === 'asc' ? av - bv : bv - av;
    });

  const handleSort = (key) => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir(key === 'provinsi' ? 'asc' : 'desc'); }
  };

  const arrow = (key) =>
    sortKey !== key ? <span className="text-slate-300 ml-0.5">↕</span>
      : <span className="text-orange-500 ml-0.5">{sortDir === 'asc' ? '↑' : '↓'}</span>;

  return (
    <section className="py-16 px-4 bg-slate-50">
      <div className="max-w-6xl mx-auto space-y-10">

        {/* Heading */}
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">Data Daftar Pemilih Pemilu 2024</h2>
            <p className="text-sm text-slate-500 mt-1">
              Sumber:{' '}
              <a href="https://satupetadata.kpu.go.id" target="_blank" rel="noreferrer"
                className="text-orange-500 hover:underline">
                satupetadata.kpu.go.id
              </a>
              {data.updatedAt && (
                <span className="ml-2 text-slate-400">
                  · Diperbarui{' '}
                  {new Date(data.updatedAt).toLocaleString('id-ID', {
                    day: 'numeric', month: 'long', year: 'numeric',
                    hour: '2-digit', minute: '2-digit',
                  })}
                </span>
              )}
            </p>
          </div>
        </div>

        {/* Funnel */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h3 className="text-sm font-bold text-slate-700 mb-4">Funnel Pemutakhiran Daftar Pemilih — Nasional</h3>
          <div className="space-y-2.5">
            {[
              { key: 'dp4',   label: 'DP4',   color: 'bg-blue-500' },
              { key: 'dps',   label: 'DPS',   color: 'bg-indigo-500' },
              { key: 'dpshp', label: 'DPSHP', color: 'bg-violet-500' },
              { key: 'dpt',   label: 'DPT',   color: 'bg-orange-500' },
            ].map(item => (
              <FunnelBar
                key={item.key}
                label={item.label}
                value={n[item.key] ?? 0}
                max={dp4}
                color={item.color}
                pct={fmtPct(n[item.key] ?? 0, dp4)}
              />
            ))}
          </div>
          <p className="mt-4 text-xs text-slate-400">
            Pemilih yang tidak masuk DPT final:{' '}
            <strong className="text-red-500">{fmt((n.dp4 ?? 0) - (n.dpt ?? 0))}</strong>
            {' '}({fmtPct((n.dp4 ?? 0) - (n.dpt ?? 0), dp4)} dari DP4 awal)
          </p>
        </div>

        {/* Province table */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <h3 className="text-sm font-bold text-slate-700">Data Per Provinsi</h3>
            <input
              type="text"
              placeholder="Cari provinsi..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full sm:w-56 px-3 py-1.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400"
            />
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  {PEMILIH_COLS.map(col => (
                    <th
                      key={col.key}
                      onClick={() => handleSort(col.key)}
                      className={`px-4 py-3 text-xs font-bold tracking-wide uppercase cursor-pointer select-none whitespace-nowrap hover:bg-slate-100 transition-colors
                        ${col.align === 'right' ? 'text-right text-slate-500' : 'text-left text-slate-600'}`}
                    >
                      {col.label}{arrow(col.key)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((row, i) => (
                  <tr key={row.kdProv || i}
                    className={`border-b border-slate-100 hover:bg-orange-50/50 transition-colors ${i % 2 === 0 ? 'bg-white' : 'bg-slate-50/40'}`}>
                    <td className="px-4 py-2.5 font-medium text-slate-800">{row.provinsi}</td>
                    <td className="px-4 py-2.5 text-right tabular-nums text-slate-500">{fmt(row.dp4)}</td>
                    <td className="px-4 py-2.5 text-right tabular-nums text-slate-800 font-semibold">{fmt(row.dpt)}</td>
                    <td className="px-4 py-2.5 text-right tabular-nums text-red-500 text-xs">
                      {row.selisih != null ? `-${fmt(row.selisih)}` : '—'}
                    </td>
                    <td className="px-4 py-2.5 text-right tabular-nums">
                      {row.persen != null ? (
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full
                          ${row.persen >= 99 ? 'bg-emerald-50 text-emerald-700' :
                            row.persen >= 97 ? 'bg-blue-50 text-blue-700' :
                              'bg-amber-50 text-amber-700'}`}>
                          {row.persen.toFixed(1)}%
                        </span>
                      ) : '—'}
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-slate-400 text-sm">
                      Provinsi tidak ditemukan
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <p className="mt-2 text-xs text-slate-400">{filtered.length} provinsi</p>
        </div>
      </div>
    </section>
  );
}

/* ── 5. Tren Data Pemilu ────────────────────────────────────────────────── */
function TrendSection({ sidebarFilters, onSidebarChange }) {
  return (
    <section className="py-16 px-4 bg-white">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-2xl font-bold text-slate-800 mb-8">Tren Data Pemilu</h2>
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3 bg-white border border-slate-200 rounded-xl p-6">
            <LineChart data={DEFAULT_DATA} series={DEFAULT_SERIES} />
            <p className="text-xs text-slate-400 mt-4 text-center">
              Sumber: Sindikasi Pemilu dan Demokrasi
            </p>
          </div>
          <div className="flex flex-col gap-4">
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

/* ── 6. Infografis Pemilu ───────────────────────────────────────────────── */
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

  if (!loading && !error && items.length === 0) return null;

  return (
    <section className="py-16 px-4 bg-white">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-2xl font-bold text-slate-800 mb-8">Infografis Pemilu</h2>
        {loading && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[1,2,3,4].map(i => <div key={i} className="rounded-xl h-44 bg-slate-100 animate-pulse" />)}
          </div>
        )}
        {error && <p className="text-sm text-slate-400 text-center py-8">Gagal memuat infografis.</p>}
        {!loading && !error && items.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {items.map((item) => {
              const src = item.imageUrl ? resolveMediaUrl(item.imageUrl) : null;
              return (
                <div key={item.id} className="relative rounded-xl overflow-hidden group bg-slate-100">
                  {src ? (
                    <img src={src} alt={item.title}
                      className="w-full h-44 object-cover transition-transform duration-300 group-hover:scale-105" />
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

/* ── 7. Kolaborasi CTA ──────────────────────────────────────────────────── */
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
          <Link to="/kontak"
            className="px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold rounded-lg text-center transition-all duration-200 hover:scale-[1.02]">
            Ikut Kontribusi
          </Link>
          <Link to="/kontak"
            className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold rounded-lg text-center transition-all duration-200 hover:scale-[1.02]">
            Laporkan Masalah
          </Link>
        </div>
      </div>
    </section>
  );
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

  const { data: partisipasiData, status: partisipasiStatus } = useKpuPartisipasi();
  const { data: pemilihData,     status: pemilihStatus }     = useKpuPemilih();

  const updateFilter  = (key, val) => setFilters((p) => ({ ...p, [key]: val }));
  const updateSidebar = (key, val) => setSidebarFilters((p) => ({ ...p, [key]: val }));

  return (
    <>
      <Hero
        title="Platform Data Pemilu SPD"
        subtitle="Portal data pemilu Indonesia dengan visualisasi interaktif untuk mendukung demokrasi yang berbasis data."
      />

      <StatusBanner
        partisipasiStatus={partisipasiStatus}
        pemilihStatus={pemilihStatus}
        updatedAt={pemilihData?.updatedAt}
      />

      <FilterBar filters={filters} onChange={updateFilter} />

      <StatCards
        partisipasiData={partisipasiData}
        pemilihData={pemilihData}
        partisipasiStatus={partisipasiStatus}
        pemilihStatus={pemilihStatus}
      />

      <DaftarPemilihSection data={pemilihData} status={pemilihStatus} />

      <TrendSection sidebarFilters={sidebarFilters} onSidebarChange={updateSidebar} />

      <InfografisSection />

      <KolaborasiCTA />
    </>
  );
}
