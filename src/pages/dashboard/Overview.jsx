import { useState, useEffect, useCallback } from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import { api } from '@/lib/api';
import { ErrorState } from './shared';
import { useCountUp } from '@/hooks/useCountUp';

const safeFormatDate = (dateStr) => {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  return isNaN(d.getTime()) ? '—' : d.toLocaleDateString('id-ID');
};

const ICON_PATHS = {
  doc:      'M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z',
  calendar: 'M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5',
  views:    'M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z M15 12a3 3 0 11-6 0 3 3 0 016 0z',
  chat:     'M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75',
};

function StatCard({ title, value, path, accent = false }) {
  const numeric = typeof value === 'number' && Number.isFinite(value) ? value : null;
  const animated = useCountUp(numeric ?? 0, { enabled: numeric !== null });
  const display = numeric !== null ? animated.toLocaleString('id-ID') : value;

  return (
    <div className={`bg-white border rounded-xl p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md flex items-center justify-between ${accent ? 'border-orange-200 bg-orange-50/30' : 'border-slate-200'}`}>
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">{title}</p>
        <p className={`text-3xl font-bold ${accent ? 'text-orange-500' : 'text-slate-800'}`}>{display}</p>
      </div>
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${accent ? 'bg-orange-100' : 'bg-slate-100'}`}>
        <svg className={`w-5 h-5 ${accent ? 'text-orange-500' : 'text-slate-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d={path} />
        </svg>
      </div>
    </div>
  );
}

function EmailConfigWarning({ status }) {
  const [sending, setSending] = useState(false);
  const [result, setResult]   = useState(null);

  const sendTest = async () => {
    setSending(true);
    setResult(null);
    try {
      const r = await api('/system/email-test', { method: 'POST' });
      setResult({ ok: true, msg: `Terkirim ke ${r.target}` });
    } catch (err) {
      setResult({ ok: false, msg: err?.message || 'Gagal mengirim' });
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="bg-amber-50 border border-amber-200 rounded-xl p-5">
      <div className="flex items-start gap-4">
        <svg className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
        </svg>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-bold text-amber-900">Email belum dikonfigurasi</h3>
          <p className="text-xs text-amber-900/80 mt-1 leading-relaxed">
            Backend tidak dapat mengirim email. Notifikasi pelanggan baru, pesan kontak, dan balasan admin
            akan gagal sampai kredensial SMTP disetel di <code className="text-[11px] bg-white/60 px-1 py-0.5 rounded">backend/.env</code>.
          </p>
          <p className="text-xs text-amber-900/80 mt-2">
            Diperlukan: <code className="text-[11px] bg-white/60 px-1 py-0.5 rounded">{status.missingKeys.join(', ') || 'EMAIL_HOST, EMAIL_USER, EMAIL_PASS'}</code>
          </p>
          <div className="mt-3 flex items-center gap-3">
            <button
              type="button"
              onClick={sendTest}
              disabled={sending}
              className="text-xs font-semibold text-amber-900 bg-white border border-amber-300 hover:border-amber-400 px-3 py-1.5 rounded-md disabled:opacity-60"
            >
              {sending ? 'Mengirim…' : 'Coba kirim email uji'}
            </button>
            {result && (
              <span className={`text-xs ${result.ok ? 'text-emerald-700' : 'text-red-600'}`}>
                {result.msg}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function RowSkeleton() {
  return (
    <div className="px-5 py-3.5 flex items-center gap-3 animate-pulse">
      <div className="flex-1 space-y-1.5">
        <div className="h-3 bg-slate-100 rounded w-3/4" />
        <div className="h-2.5 bg-slate-100 rounded w-1/3" />
      </div>
    </div>
  );
}

export default function Overview() {
  const ctx = useOutletContext();
  const isAdmin = ctx?.user?.role === 'admin';

  const [publications, setPublications] = useState([]);
  const [events,       setEvents]       = useState([]);
  const [unread,       setUnread]       = useState(0);
  const [totalViews,   setTotalViews]   = useState(0);
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState(false);
  const [emailStatus,  setEmailStatus]  = useState(null);  // admin-only

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(false);
    // allSettled so a publisher's 403 on /contacts/stats doesn't break the page.
    const tasks = [api('/publications'), api('/events')];
    if (isAdmin) tasks.push(api('/contacts/stats'));

    const results = await Promise.allSettled(tasks);
    const [pubsRes, evtsRes, statsRes] = results;

    // Treat content failures as a real error so the user sees a retry affordance.
    if (pubsRes.status === 'rejected' && evtsRes.status === 'rejected') {
      setError(true);
      setLoading(false);
      return;
    }

    const safePubs = Array.isArray(pubsRes.value) ? pubsRes.value : [];
    const safeEvts = Array.isArray(evtsRes.value) ? evtsRes.value : [];
    setPublications(safePubs);
    setEvents(safeEvts);
    setTotalViews(safePubs.reduce((acc, p) => acc + (p.views || 0), 0));
    setUnread(statsRes?.status === 'fulfilled' ? (statsRes.value?.unread ?? 0) : 0);
    setLoading(false);
  }, [isAdmin]);

  useEffect(() => { loadData(); }, [loadData]);

  // Email config is system state the admin needs to see. Silent logs don't
  // count as telling anyone. Render a banner if unconfigured.
  useEffect(() => {
    if (!isAdmin) return;
    api('/system/email-status')
      .then((s) => setEmailStatus(s))
      .catch(() => setEmailStatus(null));
  }, [isAdmin]);

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Overview</h1>
          <p className="text-sm text-slate-400 mt-0.5">Ringkasan konten dan aktivitas terkini</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm">
          <ErrorState message="Gagal memuat data overview" onRetry={loadData} />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">

      <div>
        <h1 className="text-2xl font-bold text-slate-800">Overview</h1>
        <p className="text-sm text-slate-400 mt-0.5">Ringkasan konten dan aktivitas terkini</p>
      </div>

      {/* Email configuration warning — shown only when the admin hasn't
          set SMTP credentials. Subscribe + contact + reply all depend on
          this. Silent failure is the worst failure mode; surface it. */}
      {isAdmin && emailStatus && !emailStatus.configured && (
        <EmailConfigWarning status={emailStatus} />
      )}

      <div className={`grid grid-cols-2 ${isAdmin ? 'lg:grid-cols-4' : 'lg:grid-cols-3'} gap-4`}>
        <StatCard title="Publikasi"    value={loading ? '…' : publications.length}  path={ICON_PATHS.doc}      />
        <StatCard title="Event"        value={loading ? '…' : events.length}         path={ICON_PATHS.calendar} />
        <StatCard title="Total Views"  value={loading ? '…' : totalViews}            path={ICON_PATHS.views}    />
        {isAdmin && (
          <StatCard title="Pesan Baru"   value={loading ? '…' : unread}               path={ICON_PATHS.chat}     accent={unread > 0} />
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-800">Publikasi Terbaru</h2>
            <Link to="/dashboard/publikasi" className="text-xs font-semibold text-orange-500 hover:text-orange-600 transition-colors">
              Kelola →
            </Link>
          </div>
          {loading ? (
            <div className="divide-y divide-slate-50">{[1,2,3].map(i => <RowSkeleton key={i} />)}</div>
          ) : publications.length === 0 ? (
            <p className="py-10 text-center text-sm text-slate-400">Belum ada publikasi.</p>
          ) : (
            <div className="divide-y divide-slate-100">
              {publications.slice(0, 5).map(pub => (
                <Link key={pub.id} to={`/publikasi/${pub.slug}`} className="px-5 py-3.5 flex items-center gap-4 hover:bg-slate-50 transition-colors group">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-700 truncate group-hover:text-orange-600 transition-colors">{pub.title || '—'}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{safeFormatDate(pub.createdAt || pub.date)}</p>
                  </div>
                  {pub.views > 0 && (
                    <span className="text-xs text-slate-400 shrink-0">{pub.views} views</span>
                  )}
                </Link>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-800">Event Terbaru</h2>
            <Link to="/dashboard/event" className="text-xs font-semibold text-orange-500 hover:text-orange-600 transition-colors">
              Kelola →
            </Link>
          </div>
          {loading ? (
            <div className="divide-y divide-slate-50">{[1,2,3].map(i => <RowSkeleton key={i} />)}</div>
          ) : events.length === 0 ? (
            <p className="py-10 text-center text-sm text-slate-400">Belum ada event.</p>
          ) : (
            <div className="divide-y divide-slate-100">
              {events.slice(0, 5).map(evt => (
                <Link key={evt.id} to={`/event/${evt.slug}`} className="px-5 py-3.5 block hover:bg-slate-50 transition-colors group">
                  <p className="text-sm font-medium text-slate-700 truncate group-hover:text-orange-600 transition-colors">{evt.title || '—'}</p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {[safeFormatDate(evt.date), evt.location].filter(Boolean).join(' · ') || '—'}
                  </p>
                </Link>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
