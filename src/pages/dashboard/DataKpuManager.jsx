/**
 * DataKpuManager.jsx
 * ------------------
 * Dashboard page: Data Pemilih dari satupetadata.kpu.go.id
 *
 * Menampilkan data pemilih Pemilu 2024 (DP4 → DPS → DPSHP → DPT) yang
 * diambil melalui proxy backend SPD dari Satu Peta Data KPU.
 *
 * Fitur:
 * - 5 stat cards (nasional): DP4, DPS, DPSHP, DPT, DPLK
 * - Tabel 38 provinsi dengan semua tipe data + sortable columns
 * - Funnel visualisation (DP4 → DPT, berapa yang gugur tiap tahap)
 * - Tombol refresh cache (admin)
 * - Status koneksi (live / cache / error)
 */

import { useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api';

/* ── Helpers ───────────────────────────────────────────────────────────── */
const fmt = (n) =>
  n == null ? '—' : Number(n).toLocaleString('id-ID');

const fmtPct = (part, whole) => {
  if (!part || !whole) return '—';
  return ((part / whole) * 100).toFixed(2) + '%';
};

const fmtDiff = (current, base) => {
  if (current == null || base == null) return null;
  const diff = current - base;
  return diff === 0 ? null : diff;
};

/* ── Stat Card ─────────────────────────────────────────────────────────── */
function StatCard({ label, desc, value, base, accent }) {
  const diff = base != null ? fmtDiff(value, base) : null;
  const pct  = base != null ? fmtPct(value, base) : null;

  const colors = {
    blue:   { bg: 'bg-blue-50',   border: 'border-blue-200',   text: 'text-blue-700',   val: 'text-blue-900'   },
    indigo: { bg: 'bg-indigo-50', border: 'border-indigo-200', text: 'text-indigo-700', val: 'text-indigo-900' },
    violet: { bg: 'bg-violet-50', border: 'border-violet-200', text: 'text-violet-700', val: 'text-violet-900' },
    orange: { bg: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-700', val: 'text-orange-900' },
    slate:  { bg: 'bg-slate-50',  border: 'border-slate-200',  text: 'text-slate-600',  val: 'text-slate-800'  },
  };
  const c = colors[accent] || colors.slate;

  return (
    <div className={`rounded-xl border ${c.bg} ${c.border} p-5 flex flex-col gap-2`}>
      <div className="flex items-start justify-between">
        <div>
          <p className={`text-xs font-bold tracking-widest uppercase ${c.text}`}>{label}</p>
          <p className="text-[11px] text-slate-400 mt-0.5">{desc}</p>
        </div>
        {pct && (
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${c.bg} ${c.text} border ${c.border}`}>
            {pct}
          </span>
        )}
      </div>
      <p className={`text-2xl font-bold ${c.val} tabular-nums`}>{fmt(value)}</p>
      {diff != null && (
        <p className="text-xs text-slate-400">
          {diff < 0
            ? <span className="text-red-500">{fmt(diff)}</span>
            : <span className="text-emerald-600">+{fmt(diff)}</span>
          } dari DP4
        </p>
      )}
    </div>
  );
}

/* ── Funnel bar ─────────────────────────────────────────────────────────── */
function FunnelBar({ label, value, max, color }) {
  const pct = max ? Math.round((value / max) * 100) : 0;
  return (
    <div className="flex items-center gap-3">
      <div className="w-20 text-xs font-semibold text-slate-600 text-right shrink-0">{label}</div>
      <div className="flex-1 bg-slate-100 rounded-full h-5 relative overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-700 ${color}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="w-36 text-xs text-slate-500 tabular-nums shrink-0">{fmt(value)}</div>
      <div className="w-12 text-xs font-semibold text-slate-700 shrink-0">{pct}%</div>
    </div>
  );
}

/* ── Province table ─────────────────────────────────────────────────────── */
const COLS = [
  { key: 'provinsi', label: 'Provinsi',  numeric: false },
  { key: 'dp4',      label: 'DP4',       numeric: true  },
  { key: 'dps',      label: 'DPS',       numeric: true  },
  { key: 'dpshp',    label: 'DPSHP',     numeric: true  },
  { key: 'dpt',      label: 'DPT',       numeric: true  },
  { key: 'dplk',     label: 'DPLK',      numeric: true  },
];

function ProvinsiTable({ rows, loading }) {
  const [sortKey, setSortKey]   = useState('provinsi');
  const [sortDir, setSortDir]   = useState('asc');
  const [search,  setSearch]    = useState('');

  const handleSort = (key) => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir(key === 'provinsi' ? 'asc' : 'desc'); }
  };

  const filtered = rows
    .filter(r => r.provinsi?.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      const av = a[sortKey], bv = b[sortKey];
      if (sortKey === 'provinsi') {
        const c = String(av ?? '').localeCompare(String(bv ?? ''));
        return sortDir === 'asc' ? c : -c;
      }
      const c = (av ?? 0) - (bv ?? 0);
      return sortDir === 'asc' ? c : -c;
    });

  const arrow = (key) => {
    if (sortKey !== key) return <span className="text-slate-300 ml-0.5">↕</span>;
    return <span className="text-orange-500 ml-0.5">{sortDir === 'asc' ? '↑' : '↓'}</span>;
  };

  if (loading) return (
    <div className="space-y-2 py-4">
      {[...Array(8)].map((_, i) => (
        <div key={i} className="h-8 bg-slate-100 rounded animate-pulse" />
      ))}
    </div>
  );

  return (
    <div>
      <div className="mb-3">
        <input
          type="text"
          placeholder="Cari provinsi..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full sm:w-64 px-3 py-1.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400"
        />
      </div>
      <div className="overflow-x-auto rounded-lg border border-slate-200">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              {COLS.map(col => (
                <th
                  key={col.key}
                  onClick={() => handleSort(col.key)}
                  className={`px-4 py-3 text-xs font-bold tracking-wide uppercase cursor-pointer select-none whitespace-nowrap hover:bg-slate-100 transition-colors
                    ${col.numeric ? 'text-right text-slate-500' : 'text-left text-slate-600'}`}
                >
                  {col.label}{arrow(col.key)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((row, i) => (
              <tr key={row.kdProv || i} className={`border-b border-slate-100 hover:bg-orange-50/40 transition-colors ${i % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}`}>
                <td className="px-4 py-2.5 font-medium text-slate-800">{row.provinsi}</td>
                <td className="px-4 py-2.5 text-right tabular-nums text-slate-600">{fmt(row.dp4)}</td>
                <td className="px-4 py-2.5 text-right tabular-nums text-slate-600">{fmt(row.dps)}</td>
                <td className="px-4 py-2.5 text-right tabular-nums text-slate-600">{fmt(row.dpshp)}</td>
                <td className="px-4 py-2.5 text-right tabular-nums text-slate-700 font-semibold">{fmt(row.dpt)}</td>
                <td className="px-4 py-2.5 text-right tabular-nums text-slate-500">{fmt(row.dplk)}</td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-slate-400 text-sm">
                  Provinsi tidak ditemukan
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <p className="mt-2 text-xs text-slate-400">
        {filtered.length} provinsi{search ? ` (difilter dari ${rows.length})` : ''}
      </p>
    </div>
  );
}

/* ── Main Component ─────────────────────────────────────────────────────── */
export default function DataKpuManager() {
  const [data,    setData]    = useState(null);
  const [status,  setStatus]  = useState('loading'); // loading | ok | error
  const [clearing, setClearing] = useState(false);

  const load = useCallback(async () => {
    setStatus('loading');
    try {
      const d = await api('/kpu/pemilih');
      setData(d);
      setStatus('ok');
    } catch {
      setStatus('error');
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleClearCache = async () => {
    setClearing(true);
    try {
      await api('/kpu/cache/clear', { method: 'POST' });
      await load();
    } catch {
      // ignore
    } finally {
      setClearing(false);
    }
  };

  const n   = data?.nasional ?? {};
  const dp4 = n.dp4 ?? null;

  const STAT_CARDS = [
    { key: 'dp4',   label: 'DP4',   desc: 'Daftar Penduduk Potensial',  accent: 'blue',   base: null  },
    { key: 'dps',   label: 'DPS',   desc: 'Daftar Pemilih Sementara',   accent: 'indigo', base: dp4   },
    { key: 'dpshp', label: 'DPSHP', desc: 'DPS Hasil Perbaikan',        accent: 'violet', base: dp4   },
    { key: 'dpt',   label: 'DPT',   desc: 'Daftar Pemilih Tetap',       accent: 'orange', base: dp4   },
    { key: 'dplk',  label: 'DPLK',  desc: 'TPS Lokasi Khusus',          accent: 'slate',  base: null  },
  ];

  const FUNNEL_COLORS = ['bg-blue-500', 'bg-indigo-500', 'bg-violet-500', 'bg-orange-500'];

  return (
    <div className="space-y-8">

      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Data Pemilih KPU</h1>
          <p className="text-sm text-slate-500 mt-1">
            Sumber: <a href="https://satupetadata.kpu.go.id" target="_blank" rel="noreferrer" className="text-orange-500 hover:underline">satupetadata.kpu.go.id</a>
            {' · '}Pemilu 2024 · Data diperbarui setiap 24 jam
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* Status badge */}
          <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full
            ${status === 'ok'      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
              status === 'loading' ? 'bg-slate-50 text-slate-500 border border-slate-200' :
                                     'bg-red-50 text-red-600 border border-red-200'}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${status === 'ok' ? 'bg-emerald-500' : status === 'loading' ? 'bg-slate-400 animate-pulse' : 'bg-red-500'}`} />
            {status === 'ok' ? 'Terkoneksi' : status === 'loading' ? 'Memuat...' : 'Gagal'}
          </span>

          {/* Refresh button */}
          <button
            onClick={handleClearCache}
            disabled={clearing || status === 'loading'}
            className="text-sm px-3 py-1.5 rounded-lg border border-slate-300 text-slate-600 hover:bg-slate-50 disabled:opacity-50 transition-colors"
          >
            {clearing ? 'Memperbarui...' : '↻ Refresh'}
          </button>
        </div>
      </div>

      {/* Error state */}
      {status === 'error' && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-5 text-center">
          <p className="text-red-700 font-semibold">Gagal mengambil data dari KPU</p>
          <p className="text-sm text-red-500 mt-1">Periksa koneksi server atau coba lagi nanti</p>
          <button onClick={load} className="mt-3 text-sm text-red-600 underline hover:no-underline">Coba lagi</button>
        </div>
      )}

      {/* Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {STAT_CARDS.map(card => (
          <StatCard
            key={card.key}
            label={card.label}
            desc={card.desc}
            value={status === 'loading' ? null : n[card.key] ?? null}
            base={card.base}
            accent={card.accent}
          />
        ))}
      </div>

      {/* Funnel */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h2 className="text-base font-bold text-slate-700 mb-1">Funnel Pemilih — Nasional</h2>
        <p className="text-xs text-slate-400 mb-5">Proses pemutakhiran daftar pemilih dari DP4 hingga DPT final</p>
        <div className="space-y-3">
          {['dp4', 'dps', 'dpshp', 'dpt'].map((key, i) => (
            <FunnelBar
              key={key}
              label={key.toUpperCase()}
              value={n[key] ?? 0}
              max={dp4 ?? 1}
              color={FUNNEL_COLORS[i]}
            />
          ))}
        </div>
        {dp4 && n.dpt && (
          <p className="mt-4 text-xs text-slate-500">
            Total pemilih yang tidak masuk DPT:{' '}
            <span className="font-semibold text-red-600">{fmt(dp4 - (n.dpt ?? 0))}</span>
            {' '}({fmtPct(dp4 - (n.dpt ?? 0), dp4)} dari DP4)
          </p>
        )}
      </div>

      {/* Province table */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h2 className="text-base font-bold text-slate-700 mb-1">Data Per Provinsi</h2>
        <p className="text-xs text-slate-400 mb-4">
          38 provinsi · klik header kolom untuk mengurutkan
        </p>
        <ProvinsiTable
          rows={data?.provinsi ?? []}
          loading={status === 'loading'}
        />
      </div>

      {/* Metadata */}
      {data?.updatedAt && (
        <p className="text-xs text-slate-400 text-center">
          Cache diperbarui: {new Date(data.updatedAt).toLocaleString('id-ID')}
          {' · '}Data dari satupetadata.kpu.go.id (Pemilu 2024, final)
        </p>
      )}
    </div>
  );
}
