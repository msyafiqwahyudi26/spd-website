import { useState, useEffect, useCallback, useMemo } from 'react';
import { api } from '@/lib/api';
import { Toast, Spinner, ErrorState } from './shared';

const STATUS_META = {
  active:       { label: 'Aktif',     cls: 'bg-emerald-50 text-emerald-700 border-emerald-100' },
  unsubscribed: { label: 'Berhenti',  cls: 'bg-slate-100 text-slate-600 border-slate-200' },
};

function formatDate(d) {
  if (!d) return '—';
  const dt = new Date(d);
  if (Number.isNaN(dt.getTime())) return '—';
  return dt.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function SubscribersManager() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [filter, setFilter] = useState('all');
  const [query, setQuery] = useState('');
  const [toast, setToast] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const data = await api('/subscribers');
      setRows(Array.isArray(data) ? data : []);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const counts = useMemo(() => ({
    all:    rows.length,
    active: rows.filter((r) => r.status === 'active').length,
    unsubscribed: rows.filter((r) => r.status === 'unsubscribed').length,
  }), [rows]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rows
      .filter((r) => filter === 'all' ? true : r.status === filter)
      .filter((r) => q ? r.email.toLowerCase().includes(q) : true);
  }, [rows, filter, query]);

  const copyEmails = () => {
    const list = filtered.map((r) => r.email).join(', ');
    if (!list) return;
    navigator.clipboard?.writeText(list).then(
      () => setToast(`${filtered.length} email tersalin ke clipboard`),
      () => setToast({ message: 'Gagal menyalin email', kind: 'error' }),
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Pelanggan</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Daftar email yang berlangganan update newsletter.
          </p>
        </div>
        <button
          onClick={load}
          className="text-xs font-semibold text-slate-600 hover:text-orange-600 border border-slate-200 hover:border-orange-300 px-3 py-1.5 rounded-md transition-colors"
        >
          Muat ulang
        </button>
      </div>

      {/* Filter + search bar */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-4 flex flex-col sm:flex-row gap-3">
        <div className="flex gap-1 bg-slate-50 rounded-lg p-1">
          {[
            { id: 'all',          label: `Semua (${counts.all})` },
            { id: 'active',       label: `Aktif (${counts.active})` },
            { id: 'unsubscribed', label: `Berhenti (${counts.unsubscribed})` },
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${
                filter === f.id
                  ? 'bg-white text-orange-600 shadow-sm'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Cari email…"
          className="flex-1 min-w-0 px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500"
        />
        <button
          type="button"
          onClick={copyEmails}
          disabled={filtered.length === 0}
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:border-orange-300 hover:text-orange-600 disabled:opacity-50 disabled:cursor-not-allowed px-3 py-2 rounded-lg transition-colors"
        >
          Salin email (yang terlihat)
        </button>
      </div>

      {/* List */}
      {error ? (
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm">
          <ErrorState message="Gagal memuat daftar pelanggan" onRetry={load} />
        </div>
      ) : loading ? (
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm divide-y divide-slate-100">
          {[1,2,3,4].map((i) => (
            <div key={i} className="px-5 py-4 flex items-center gap-3 animate-pulse">
              <div className="flex-1 h-3 bg-slate-100 rounded" />
              <div className="w-20 h-5 bg-slate-100 rounded" />
              <div className="w-24 h-3 bg-slate-100 rounded" />
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white border border-dashed border-slate-300 rounded-xl p-10 text-center">
          <p className="text-sm font-medium text-slate-600">
            {rows.length === 0 ? 'Belum ada pelanggan.' : 'Tidak ada hasil untuk filter ini.'}
          </p>
          {rows.length === 0 && (
            <p className="text-xs text-slate-400 mt-1">Pelanggan akan muncul di sini setelah seseorang mendaftar lewat form di footer.</p>
          )}
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          <div className="divide-y divide-slate-100">
            {filtered.map((row) => {
              const meta = STATUS_META[row.status] || STATUS_META.active;
              return (
                <div key={row.id} className="px-5 py-3.5 flex items-center gap-4">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-800 truncate">{row.email}</p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Terdaftar {formatDate(row.createdAt)}
                      {row.unsubscribedAt && ` · berhenti ${formatDate(row.unsubscribedAt)}`}
                    </p>
                  </div>
                  <span className={`text-[11px] font-semibold px-2 py-0.5 rounded border ${meta.cls}`}>
                    {meta.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {toast && <Toast message={toast} onDone={() => setToast('')} />}
    </div>
  );
}
