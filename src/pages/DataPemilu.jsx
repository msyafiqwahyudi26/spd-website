import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import Hero from '../components/sections/Hero';
import LineChart, { DEFAULT_SERIES } from '../components/charts/LineChart';
import { api } from '@/lib/api';
import { resolveMediaUrl } from '@/lib/media';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';
import { useI18n } from '@/i18n';

/* ── Helpers ────────────────────────────────────────────────────────────── */
const fmt    = (n) => n == null ? '—' : Number(n).toLocaleString('id-ID');
const fmtPct = (n) => n == null ? '—' : `${Number(n).toFixed(2).replace('.', ',')}%`;

// ratio helper for funnel
const fmtRatio = (part, whole) => {
  if (!part || !whole) return '—';
  return ((part / whole) * 100).toFixed(2) + '%';
};

/* ── Filter options ─────────────────────────────────────────────────────── */
const TAHUN_OPTIONS = [
  { label: 'Pemilu 2024', tahun: 2024 },
  { label: 'Pemilu 2019', tahun: 2019 },
  { label: 'Pemilu 2014', tahun: 2014 },
  { label: 'Pemilu 2009', tahun: 2009 },
  { label: 'Pemilu 2004', tahun: 2004 },
  { label: 'Pemilu 1999', tahun: 1999 },
];

const JENIS_OPTIONS = [
  { label: 'Pemilu Presiden',       jenis: 'Presiden'       },
  { label: 'Pemilu DPR',            jenis: 'DPR'            },
  { label: 'Pemilu DPD',            jenis: 'DPD'            },
  { label: 'Pemilu DPRD Provinsi',  jenis: 'DPRD Provinsi'  },
];

const SIDEBAR_FILTERS = [
  { id: 'jenis', label: 'Jenis Pemilu',  options: JENIS_OPTIONS.map(o => o.label) },
  { id: 'skala', label: 'Skala',         options: ['Nasional', 'Provinsi']         },
];

/* ── Hooks ──────────────────────────────────────────────────────────────── */
function useElectionData() {
  const [items,  setItems]  = useState([]);
  const [status, setStatus] = useState('loading');
  useEffect(() => {
    let cancelled = false;
    api('/election-data')
      .then((d) => { if (!cancelled) { setItems(Array.isArray(d) ? d : []); setStatus('ok'); } })
      .catch(() => { if (!cancelled) { setItems([]); setStatus('error'); } });
    return () => { cancelled = true; };
  }, []);
  return { items, status };
}

function useKpuPartisipasi() {
  const [data,   setData]   = useState(null);
  const [status, setStatus] = useState('loading');
  useEffect(() => {
    let cancelled = false;
    api('/kpu/partisipasi')
      .then((d) => { if (!cancelled) { setData(d);  setStatus('ok');    } })
      .catch(() => { if (!cancelled) { setStatus('error'); } });
    return () => { cancelled = true; };
  }, []);
  return { data, status };
}

function useKpuPemilih() {
  const [data,   setData]   = useState(null);
  const [status, setStatus] = useState('loading');
  useEffect(() => {
    let cancelled = false;
    api('/kpu/pemilih')
      .then((d) => { if (!cancelled) { setData(d);  setStatus('ok');    } })
      .catch(() => { if (!cancelled) { setStatus('error'); } });
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
function StatusBanner({ electionStatus, pemilihStatus, updatedAt }) {
  const loading = electionStatus === 'loading' || pemilihStatus === 'loading';
  if (loading) return null;

  const kpuOk = pemilihStatus === 'ok';
  const dbOk  = electionStatus === 'ok';

  const ts = updatedAt
    ? new Date(updatedAt).toLocaleString('id-ID', {
        day: 'numeric', month: 'long', year: 'numeric',
        hour: '2-digit', minute: '2-digit',
      })
    : null;

  if (dbOk && kpuOk) {
    return (
      <div className="bg-emerald-50 border-b border-emerald-200" role="note">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-start gap-3">
          <svg className="w-5 h-5 text-emerald-600 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div className="text-xs sm:text-sm text-emerald-900 leading-relaxed">
            <strong className="font-semibold">Data tersedia.</strong>{' '}
            Statistik pemilu dari database SPD · Data pemilih per-provinsi diperbarui otomatis dari Satu Peta Data KPU.
            {ts && <span className="ml-2 text-emerald-700 opacity-75">KPU: {ts}</span>}
          </div>
        </div>
      </div>
    );
  }

  if (dbOk && !kpuOk) {
    return (
      <div className="bg-blue-50 border-b border-blue-200" role="note">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-start gap-3">
          <svg className="w-5 h-5 text-blue-500 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
          </svg>
          <div className="text-xs sm:text-sm text-blue-900 leading-relaxed">
            <strong className="font-semibold">Statistik dari database SPD.</strong>{' '}
            Data per-provinsi dari KPU tidak tersedia saat ini.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-amber-50 border-b border-amber-200" role="note">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-start gap-3">
        <svg className="w-5 h-5 text-amber-600 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
        </svg>
        <div className="text-xs sm:text-sm text-amber-900 leading-relaxed">
          <strong className="font-semibold">Data ilustrasi.</strong>{' '}
          Koneksi ke server KPU tidak tersedia — angka adalah contoh historis.
        </div>
      </div>
    </div>
  );
}

/* ── 2. Filter Bar ──────────────────────────────────────────────────────── */
function FilterBar({ selectedTahun, selectedJenis, onTahunChange, onJenisChange }) {
  return (
    <section className="py-6 px-4 bg-white border-b border-slate-100">
      <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-xl">
        <Select
          options={TAHUN_OPTIONS.map(o => o.label)}
          value={TAHUN_OPTIONS.find(o => o.tahun === selectedTahun)?.label || 'Pemilu 2024'}
          onChange={(v) => {
            const found = TAHUN_OPTIONS.find(o => o.label === v);
            if (found) onTahunChange(found.tahun);
          }}
        />
        <Select
          options={JENIS_OPTIONS.map(o => o.label)}
          value={JENIS_OPTIONS.find(o => o.jenis === selectedJenis)?.label || 'Pemilu Presiden'}
          onChange={(v) => {
            const found = JENIS_OPTIONS.find(o => o.label === v);
            if (found) onJenisChange(found.jenis);
          }}
        />
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

function StatCards({
  dbRow, prevRow,
  partisipasiData, partisipasiStatus,
  pemilihData,     pemilihStatus,
  tahun,
}) {
  const [animRef, visible] = useScrollAnimation();
  const isLivePart  = partisipasiStatus === 'ok';
  const isLivePemil = pemilihStatus     === 'ok' && tahun === 2024;
  const hasDb       = !!dbRow;

  // ── Partisipasi
  const partisipasiVal = hasDb && dbRow.partisipasi != null
    ? fmtPct(dbRow.partisipasi)
    : (isLivePart && partisipasiData?.persenPartisipasi != null
        ? `${parseFloat(partisipasiData.persenPartisipasi).toFixed(2).replace('.', ',')}%`
        : '—');
  const partisipasiDiff = hasDb && prevRow?.partisipasi != null && dbRow.partisipasi != null
    ? (dbRow.partisipasi - prevRow.partisipasi).toFixed(2)
    : null;

  // ── Suara tidak sah
  const tidakSahVal  = hasDb && dbRow.suaraTidakSah != null ? fmtPct(dbRow.suaraTidakSah) : '—';
  const tidakSahDiff = hasDb && prevRow?.suaraTidakSah != null && dbRow.suaraTidakSah != null
    ? (dbRow.suaraTidakSah - prevRow.suaraTidakSah).toFixed(2)
    : null;

  // ── Kabupaten/kota
  const kabKotaVal  = hasDb && dbRow.jumlahKabKota  != null ? fmt(dbRow.jumlahKabKota)  : '514';
  const kabKotaDiff = hasDb && prevRow?.jumlahKabKota != null && dbRow.jumlahKabKota != null
    ? dbRow.jumlahKabKota - prevRow.jumlahKabKota
    : null;

  // ── DPT (prefer DB, supplement with KPU live for 2024)
  const dptVal = isLivePemil && pemilihData?.nasional?.dpt != null
    ? pemilihData.nasional.dpt
    : (hasDb && dbRow.jumlahDPT != null ? dbRow.jumlahDPT : null);
  const dptChange = isLivePemil
    ? `DP4 awal: ${fmt(pemilihData?.nasional?.dp4)} · Sumber: Satu Peta Data KPU`
    : (hasDb && prevRow?.jumlahDPT != null && dbRow?.jumlahDPT != null
        ? `${dptVal > prevRow.jumlahDPT ? '+' : ''}${fmt(dptVal - prevRow.jumlahDPT)} dari ${prevRow.tahun}`
        : hasDb && dbRow?.catatan ? `Sumber: ${dbRow.catatan}` : 'Data resmi KPU');

  // ── TPS
  const tpsVal = isLivePart && partisipasiData?.totalTps != null
    ? partisipasiData.totalTps
    : (hasDb && dbRow.jumlahTPS != null ? dbRow.jumlahTPS : null);
  const avgPemilih = dptVal && tpsVal ? Math.round(dptVal / tpsVal) : null;
  const tpsChange  = isLivePart && partisipasiData?.tpsMelapor != null
    ? `${fmt(partisipasiData.tpsMelapor)} TPS sudah melapor`
    : avgPemilih ? `Rata-rata ${fmt(avgPemilih)} pemilih/TPS` : 'Data resmi KPU';

  const prevYear = prevRow?.tahun;

  const small = [
    {
      id: 'partisipasi',
      value: partisipasiVal,
      label: 'Tingkat Partisipasi (%)',
      change: partisipasiDiff != null
        ? `${partisipasiDiff > 0 ? '+' : ''}${partisipasiDiff}% dari ${prevYear}`
        : isLivePart ? 'Sumber: Sirekap KPU' : `Pemilu ${tahun}`,
      trend: partisipasiDiff != null ? (parseFloat(partisipasiDiff) >= 0 ? 'up' : 'down') : 'neutral',
      live: isLivePart && !hasDb,
    },
    {
      id: 'tidak-sah',
      value: tidakSahVal,
      label: 'Suara Tidak Sah (%)',
      change: tidakSahDiff != null
        ? `${tidakSahDiff > 0 ? '+' : ''}${tidakSahDiff}% dari ${prevYear}`
        : `Pemilu ${tahun}`,
      trend: tidakSahDiff != null ? (parseFloat(tidakSahDiff) <= 0 ? 'up' : 'down') : 'neutral',
      live: false,
    },
    {
      id: 'kabupaten',
      value: kabKotaVal,
      label: 'Kabupaten/Kota',
      change: kabKotaDiff != null
        ? `${kabKotaDiff >= 0 ? '+' : ''}${kabKotaDiff} dari ${prevYear}`
        : `Pemilu ${tahun}`,
      trend: kabKotaDiff != null ? (kabKotaDiff >= 0 ? 'up' : 'down') : 'neutral',
      live: false,
    },
  ];

  const large = [
    {
      id: 'dpt',
      value: fmt(dptVal),
      label: 'Jumlah Pemilih di DPT',
      change: dptChange,
      trend: 'up',
      live: isLivePemil,
      large: true,
    },
    {
      id: 'tps',
      value: fmt(tpsVal),
      label: 'Jumlah TPS',
      change: tpsChange,
      trend: 'neutral',
      live: isLivePart,
      large: true,
    },
  ];

  return (
    <section
      ref={animRef}
      className={`py-8 px-4 bg-white ${visible ? 'animate-fade-up' : 'opacity-0'}`}
    >
      <div className="max-w-7xl mx-auto space-y-3">
        {!hasDb && (
          <div className="text-xs text-slate-400 bg-slate-50 rounded-lg px-4 py-2 border border-slate-200">
            Tidak ada data tersimpan untuk Pemilu {tahun} jenis ini.{' '}
            <Link to="/dashboard/data-pemilu" className="text-orange-500 hover:underline">Tambah via dashboard →</Link>
          </div>
        )}
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

/* ── 4. Daftar Pemilih Section (satupetadata KPU live) ──────────────────── */
const PEMILIH_COLS = [
  { key: 'provinsi', label: 'Provinsi',  align: 'left'  },
  { key: 'dp4',      label: 'DP4',       align: 'right' },
  { key: 'dpt',      label: 'DPT',       align: 'right' },
  { key: 'selisih',  label: 'Selisih',   align: 'right' },
  { key: 'persen',   label: '% DPT/DP4', align: 'right' },
];

function FunnelBar({ label, value, max, color, pct }) {
  const w = max ? Math.min(100, Math.round((value / max) * 100)) : 0;
  return (
    <div className="flex items-center gap-2 text-xs">
      <span className="w-14 font-bold text-slate-600 text-right shrink-0">{label}</span>
      <div className="flex-1 bg-slate-100 rounded-full h-4 overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${w}%` }} />
      </div>
      <span className="w-28 tabular-nums text-slate-500 shrink-0">{fmt(value)}</span>
      <span className="w-10 text-slate-600 font-semibold shrink-0">{pct}</span>
    </div>
  );
}

function DaftarPemilihSection({ data, status }) {
  const [animRef, visible] = useScrollAnimation();
  const [search, setSearch]   = useState('');
  const [sortKey, setSortKey] = useState('dpt');
  const [sortDir, setSortDir] = useState('desc');

  if (status === 'loading') {
    return (
      <section className="py-12 px-4 bg-slate-50">
        <div className="max-w-7xl mx-auto space-y-3">
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
        <div className="max-w-7xl mx-auto">
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
    sortKey !== key
      ? <span className="text-slate-300 ml-0.5">↕</span>
      : <span className="text-orange-500 ml-0.5">{sortDir === 'asc' ? '↑' : '↓'}</span>;

  return (
    <section
      ref={animRef}
      className={`py-16 px-4 bg-slate-50 ${visible ? 'animate-fade-up' : 'opacity-0'}`}
    >
      <div className="max-w-7xl mx-auto space-y-10">

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
              { key: 'dp4',   label: 'DP4',   color: 'bg-blue-500'   },
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
                pct={fmtRatio(n[item.key] ?? 0, dp4)}
              />
            ))}
          </div>
          <p className="mt-4 text-xs text-slate-400">
            Pemilih yang tidak masuk DPT final:{' '}
            <strong className="text-red-500">{fmt((n.dp4 ?? 0) - (n.dpt ?? 0))}</strong>
            {' '}({fmtRatio((n.dp4 ?? 0) - (n.dpt ?? 0), dp4)} dari DP4 awal)
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

/* ── 5. Tren Data Pemilu (from DB) ──────────────────────────────────────── */
function TrendSection({ items, selectedJenis, onJenisChange }) {
  const [animRef, visible] = useScrollAnimation();
  // Build chart data from DB for selected jenis
  const jenisLabel = JENIS_OPTIONS.find(o => o.jenis === selectedJenis)?.label || 'Pemilu Presiden';

  const sorted = useMemo(() =>
    [...items]
      .filter(r => r.jenisPemilu === selectedJenis && r.partisipasi != null)
      .sort((a, b) => a.tahun - b.tahun),
    [items, selectedJenis]
  );

  const hasChartData = sorted.length >= 2;

  // Convert DB rows → LineChart format: [{year, participation, invalidVotes}]
  const chartData = useMemo(() =>
    sorted.map(r => ({
      year:         r.tahun,
      participation: r.partisipasi     ?? 0,
      invalidVotes:  r.suaraTidakSah   ?? 0,
    })),
    [sorted]
  );

  return (
    <section
      ref={animRef}
      className={`py-16 px-4 bg-white ${visible ? 'animate-fade-up' : 'opacity-0'}`}
    >
      <div className="max-w-7xl mx-auto">
        <h2 className="text-2xl font-bold text-slate-800 mb-8">Tren Data Pemilu</h2>
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3 bg-white border border-slate-200 rounded-xl p-6">
            {hasChartData ? (
              <LineChart data={chartData} series={DEFAULT_SERIES} />
            ) : (
              <div className="h-64 flex flex-col items-center justify-center text-slate-400 gap-2">
                <svg className="w-10 h-10 text-slate-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                    d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
                </svg>
                <p className="text-sm">Data tren belum tersedia untuk {jenisLabel}</p>
                <p className="text-xs">Tambah data multi-tahun dari dashboard untuk menampilkan grafik</p>
              </div>
            )}
            <p className="text-xs text-slate-400 mt-4 text-center">
              Sumber: Database SPD · Data resmi KPU RI
            </p>
          </div>
          <div className="flex flex-col gap-4">
            <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-4">
              {SIDEBAR_FILTERS.map((f) => (
                <Select
                  key={f.id}
                  label={f.label}
                  options={f.options}
                  value={f.id === 'jenis' ? jenisLabel : 'Nasional'}
                  onChange={f.id === 'jenis' ? (v) => {
                    const found = JENIS_OPTIONS.find(o => o.label === v);
                    if (found) onJenisChange(found.jenis);
                  } : () => {}}
                />
              ))}
            </div>
            {/* Mini stats from sorted data */}
            {hasChartData && (
              <div className="bg-white border border-slate-200 rounded-xl p-4">
                <p className="text-xs font-semibold text-slate-700 mb-3">Rekap Partisipasi</p>
                <div className="space-y-1.5">
                  {sorted.slice().reverse().map(r => (
                    <div key={r.tahun} className="flex justify-between text-xs">
                      <span className="text-slate-500">{r.tahun}</span>
                      <span className={`font-semibold ${r.partisipasi >= 80 ? 'text-emerald-600' : r.partisipasi >= 70 ? 'text-orange-500' : 'text-red-500'}`}>
                        {fmtPct(r.partisipasi)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <div className="bg-white border border-slate-200 rounded-xl p-4">
              <p className="text-xs font-semibold text-slate-700 mb-2">Tentang Data</p>
              <p className="text-xs text-slate-500 leading-relaxed">
                Data dari laporan resmi KPU RI pasca-rekapitulasi final.
                Dikelola oleh tim riset SPD untuk memastikan akurasi.
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
  const [animRef, visible] = useScrollAnimation();
  const [items, setItems]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,  setError]    = useState(false);

  useEffect(() => {
    let cancelled = false;
    api('/infografis')
      .then((rows) => { if (!cancelled) { setItems(Array.isArray(rows) ? rows : []); setLoading(false); } })
      .catch(() => { if (!cancelled) { setError(true); setLoading(false); } });
    return () => { cancelled = true; };
  }, []);

  if (!loading && !error && items.length === 0) return null;

  return (
    <section
      ref={animRef}
      className={`py-16 px-4 bg-white ${visible ? 'animate-fade-up' : 'opacity-0'}`}
    >
      <div className="max-w-7xl mx-auto">
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
  const [animRef, visible] = useScrollAnimation();

  return (
    <section
      ref={animRef}
      className={`py-16 px-4 bg-slate-50 ${visible ? 'animate-fade-up' : 'opacity-0'}`}
    >
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start justify-between gap-8">
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
  const { t } = useI18n();
  const [selectedTahun, setSelectedTahun] = useState(2024);
  const [selectedJenis, setSelectedJenis] = useState('Presiden');

  const { items: electionItems, status: electionStatus } = useElectionData();
  const { data: partisipasiData, status: partisipasiStatus }  = useKpuPartisipasi();
  const { data: pemilihData,     status: pemilihStatus }      = useKpuPemilih();

  // Find the DB row matching current filter
  const dbRow = useMemo(() =>
    electionItems.find(r => r.tahun === selectedTahun && r.jenisPemilu === selectedJenis) ?? null,
    [electionItems, selectedTahun, selectedJenis]
  );

  // Find previous election year row (same jenis) for delta comparisons
  const prevRow = useMemo(() => {
    const prev = electionItems
      .filter(r => r.jenisPemilu === selectedJenis && r.tahun < selectedTahun)
      .sort((a, b) => b.tahun - a.tahun)[0];
    return prev ?? null;
  }, [electionItems, selectedTahun, selectedJenis]);

  return (
    <>
      <Hero
        title={t('data.title')}
        subtitle={t('data.subtitle')}
      />

      <StatusBanner
        electionStatus={electionStatus}
        pemilihStatus={pemilihStatus}
        updatedAt={pemilihData?.updatedAt}
      />

      <FilterBar
        selectedTahun={selectedTahun}
        selectedJenis={selectedJenis}
        onTahunChange={setSelectedTahun}
        onJenisChange={setSelectedJenis}
      />

      <StatCards
        dbRow={dbRow}
        prevRow={prevRow}
        partisipasiData={partisipasiData}
        partisipasiStatus={partisipasiStatus}
        pemilihData={pemilihData}
        pemilihStatus={pemilihStatus}
        tahun={selectedTahun}
      />

      {/* Daftar pemilih per provinsi hanya tersedia untuk 2024 (KPU live) */}
      {selectedTahun === 2024 && (
        <DaftarPemilihSection data={pemilihData} status={pemilihStatus} />
      )}

      <TrendSection
        items={electionItems}
        selectedJenis={selectedJenis}
        onJenisChange={setSelectedJenis}
      />

      <InfografisSection />

      <KolaborasiCTA />
    </>
  );
}
