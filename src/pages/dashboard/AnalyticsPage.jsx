import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { Spinner } from './shared';

function StatCard({ title, value, sub, color = 'text-slate-800' }) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">{title}</p>
      <p className={`text-3xl font-bold ${color}`}>{value ?? '—'}</p>
      {sub && <p className="text-xs text-slate-400 mt-1">{sub}</p>}
    </div>
  );
}

function ViewBar({ title, views, max }) {
  const pct = max > 0 ? Math.max(4, Math.round((views / max) * 100)) : 4;
  return (
    <div className="flex items-center gap-4">
      <p className="w-48 text-sm text-slate-700 truncate shrink-0">{title}</p>
      <div className="flex-1 bg-slate-100 rounded-full h-2">
        <div
          className="bg-orange-500 h-2 rounded-full transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="w-10 text-right text-xs font-semibold text-slate-500">{views}</span>
    </div>
  );
}

function DailyChart({ buckets }) {
  const max = Math.max(1, ...buckets.map(b => b.contacts + b.publications + b.events));
  const fmt = (iso) => {
    const d = new Date(iso + 'T00:00:00');
    return d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short' });
  };

  return (
    <div className="flex items-end gap-2 h-40">
      {buckets.map(b => {
        const total = b.contacts + b.publications + b.events;
        const pct = Math.round((total / max) * 100);
        return (
          <div key={b.date} className="flex-1 flex flex-col items-center gap-1">
            <div className="w-full flex flex-col justify-end h-32 bg-slate-50 rounded overflow-hidden" title={`${fmt(b.date)} • pesan: ${b.contacts}, publikasi: ${b.publications}, event: ${b.events}, login: ${b.logins}`}>
              {total > 0 && (
                <div className="w-full bg-orange-500" style={{ height: `${pct}%` }} />
              )}
            </div>
            <span className="text-[10px] text-slate-400">{fmt(b.date)}</span>
            <span className="text-xs font-semibold text-slate-600">{total}</span>
          </div>
        );
      })}
    </div>
  );
}

export default function AnalyticsPage() {
  const [data, setData]       = useState(null);
  const [daily, setDaily]     = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api('/analytics').catch(() => null),
      api('/analytics/daily?days=7').catch(() => null),
    ])
      .then(([summary, d]) => {
        setData(summary);
        setDaily(d);
      })
      .finally(() => setLoading(false));
  }, []);

  const maxViews = data?.topPublications?.length
    ? Math.max(...data.topPublications.map(p => p.views))
    : 1;

  const dailyTotals = daily?.buckets?.reduce(
    (acc, b) => ({
      contacts: acc.contacts + b.contacts,
      publications: acc.publications + b.publications,
      events: acc.events + b.events,
      logins: acc.logins + b.logins,
    }),
    { contacts: 0, publications: 0, events: 0, logins: 0 }
  );

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Analitik</h1>
        <p className="text-sm text-slate-500 mt-0.5">Ringkasan konten dan aktivitas sistem</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20 gap-2 text-slate-400">
          <Spinner /> <span className="text-sm">Memuat data...</span>
        </div>
      ) : !data ? (
        <div className="py-20 text-center text-sm text-slate-400">Gagal memuat data analitik.</div>
      ) : (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard title="Publikasi"   value={data.publications}  sub="total artikel" />
            <StatCard title="Event"       value={data.events}        sub="total kegiatan" />
            <StatCard title="Pesan"       value={data.contacts}      sub={`${data.repliedContacts ?? 0} sudah dibalas`} />
            <StatCard
              title="Belum Dibaca"
              value={data.unreadContacts}
              sub="pesan baru"
              color={data.unreadContacts > 0 ? 'text-orange-500' : 'text-slate-800'}
            />
          </div>

          {daily && daily.buckets && (
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between flex-wrap gap-2">
                <div>
                  <h2 className="text-sm font-semibold text-slate-800">Aktivitas 7 Hari Terakhir</h2>
                  <p className="text-xs text-slate-400 mt-0.5">Total pesan, publikasi, event dan login per hari</p>
                </div>
                {dailyTotals && (
                  <div className="flex items-center gap-4 text-xs text-slate-500">
                    <span><strong className="text-slate-800">{dailyTotals.contacts}</strong> pesan</span>
                    <span><strong className="text-slate-800">{dailyTotals.publications}</strong> publikasi</span>
                    <span><strong className="text-slate-800">{dailyTotals.events}</strong> event</span>
                    <span><strong className="text-slate-800">{dailyTotals.logins}</strong> login</span>
                  </div>
                )}
              </div>
              <div className="p-6">
                <DailyChart buckets={daily.buckets} />
              </div>
            </div>
          )}

          <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100">
              <h2 className="text-sm font-semibold text-slate-800">Top Publikasi (Views)</h2>
              <p className="text-xs text-slate-400 mt-0.5">5 artikel paling banyak dibaca</p>
            </div>
            <div className="p-6 space-y-4">
              {data.topPublications.length === 0 ? (
                <p className="text-sm text-slate-400 text-center py-6">
                  Belum ada data views. Views tercatat saat pengunjung membuka halaman artikel.
                </p>
              ) : (
                data.topPublications.map(pub => (
                  <ViewBar key={pub.id} title={pub.title} views={pub.views} max={maxViews} />
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
