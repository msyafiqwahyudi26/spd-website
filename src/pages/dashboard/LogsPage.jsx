import { useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api';
import { Spinner } from './shared';

const PAGE_SIZE = 50;

const ACTION_META = {
  login:               { label: 'Login',           cls: 'bg-blue-50 text-blue-700' },
  create_publication:  { label: 'Buat Publikasi',  cls: 'bg-emerald-50 text-emerald-700' },
  update_publication:  { label: 'Edit Publikasi',  cls: 'bg-amber-50 text-amber-700' },
  delete_publication:  { label: 'Hapus Publikasi', cls: 'bg-red-50 text-red-600' },
  create_event:        { label: 'Buat Event',      cls: 'bg-emerald-50 text-emerald-700' },
  update_event:        { label: 'Edit Event',      cls: 'bg-amber-50 text-amber-700' },
  delete_event:        { label: 'Hapus Event',     cls: 'bg-red-50 text-red-600' },
  new_contact:         { label: 'Pesan Masuk',     cls: 'bg-violet-50 text-violet-700' },
  contact_reply:       { label: 'Balas Pesan',     cls: 'bg-sky-50 text-sky-700' },
  create_user:         { label: 'Tambah User',     cls: 'bg-emerald-50 text-emerald-700' },
  delete_user:         { label: 'Hapus User',      cls: 'bg-red-50 text-red-600' },
};

function ActionBadge({ action }) {
  const m = ACTION_META[action] || { label: action, cls: 'bg-slate-100 text-slate-600' };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold ${m.cls}`}>
      {m.label}
    </span>
  );
}

const formatDate = (d) => {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('id-ID', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
};

export default function LogsPage() {
  const [logs, setLogs]             = useState([]);
  const [total, setTotal]           = useState(0);
  const [hasMore, setHasMore]       = useState(false);
  const [loading, setLoading]       = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const loadPage = useCallback(async (offset) => {
    const data = await api(`/logs?limit=${PAGE_SIZE}&offset=${offset}`);
    return data && typeof data === 'object'
      ? {
          items: Array.isArray(data.items) ? data.items : [],
          total: Number(data.total || 0),
          hasMore: Boolean(data.hasMore),
        }
      : { items: [], total: 0, hasMore: false };
  }, []);

  useEffect(() => {
    loadPage(0)
      .then(({ items, total: t, hasMore: more }) => {
        setLogs(items);
        setTotal(t);
        setHasMore(more);
      })
      .catch(() => {
        setLogs([]);
        setTotal(0);
        setHasMore(false);
      })
      .finally(() => setLoading(false));
  }, [loadPage]);

  const handleLoadMore = async () => {
    setLoadingMore(true);
    try {
      const { items, total: t, hasMore: more } = await loadPage(logs.length);
      setLogs(prev => [...prev, ...items]);
      setTotal(t);
      setHasMore(more);
    } finally {
      setLoadingMore(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Log Sistem</h1>
        <p className="text-sm text-slate-500 mt-0.5">
          {total > 0
            ? `Menampilkan ${logs.length} dari ${total} aktivitas`
            : 'Aktivitas sistem tercatat di sini'}
        </p>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16 gap-2 text-slate-400">
            <Spinner /> <span className="text-sm">Memuat log...</span>
          </div>
        ) : logs.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-sm text-slate-400">Belum ada aktivitas tercatat.</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 border-b border-slate-100">
                  <tr>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Aktivitas</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider hidden sm:table-cell">Detail</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider hidden md:table-cell">Pengguna</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Waktu</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {logs.map(entry => (
                    <tr key={entry.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-3">
                        <ActionBadge action={entry.action} />
                      </td>
                      <td className="px-6 py-3 text-slate-600 max-w-xs truncate hidden sm:table-cell">
                        {entry.details || '—'}
                      </td>
                      <td className="px-6 py-3 text-slate-500 hidden md:table-cell">
                        {entry.userName || <span className="text-slate-300">—</span>}
                      </td>
                      <td className="px-6 py-3 text-slate-400 whitespace-nowrap text-xs">
                        {formatDate(entry.createdAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {hasMore && (
              <div className="border-t border-slate-100 p-3 text-center">
                <button
                  onClick={handleLoadMore}
                  disabled={loadingMore}
                  className="text-xs font-semibold text-orange-500 hover:text-orange-600 disabled:opacity-60 px-4 py-1.5"
                >
                  {loadingMore ? 'Memuat...' : 'Muat Lebih Banyak'}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
