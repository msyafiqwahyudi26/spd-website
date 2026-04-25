import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '@/lib/api';
import { useI18n } from '@/i18n';

/* ── Shared tile primitive ──────────────────────────────────────────────── */

function TileShell({ label, headline, meta, href, icon, children }) {
  const content = (
    <>
      <div className="flex items-start justify-between gap-3 mb-2">
        <span className="text-[10px] font-bold tracking-widest uppercase text-orange-500">{label}</span>
        <span className="text-slate-300 group-hover:text-orange-500 transition-colors" aria-hidden>{icon}</span>
      </div>
      <p className="text-sm font-semibold text-slate-800 leading-snug mb-1 line-clamp-2 group-hover:text-orange-600 transition-colors">
        {headline}
      </p>
      {meta && <p className="text-xs text-slate-400 leading-snug">{meta}</p>}
      {children}
    </>
  );

  if (href) {
    return (
      <Link
        to={href}
        className="group bg-white border border-slate-200 rounded-xl p-4 flex flex-col min-h-[120px] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md hover:border-orange-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500"
      >
        {content}
      </Link>
    );
  }
  return (
    <div className="group bg-white border border-slate-200 rounded-xl p-4 flex flex-col min-h-[120px]">
      {content}
    </div>
  );
}

/* ── Icons ──────────────────────────────────────────────────────────────── */

const ICON_DOC = (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
  </svg>
);
const ICON_CAL = ICON_DOC;
const ICON_CHART = ICON_DOC;

/* ── Inline subscribe form used in the subscribe tile ───────────────────── */

function InlineSubscribe() {
  const { t } = useI18n();
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState({ kind: 'idle', msg: '' });

  useEffect(() => {
    if (status.kind !== 'success') return undefined;
    const t = setTimeout(() => setStatus({ kind: 'idle', msg: '' }), 4000);
    return () => clearTimeout(t);
  }, [status.kind]);

  const submit = async (e) => {
    e.preventDefault();
    if (status.kind === 'loading') return;
    const v = email.trim();
    if (!v) { setStatus({ kind: 'error', msg: 'Masukkan email Anda.' }); return; }
    setStatus({ kind: 'loading', msg: '' });
    try {
      await api('/subscribers', { method: 'POST', body: JSON.stringify({ email: v }) });
      setStatus({ kind: 'success', msg: 'Terima kasih, kami akan kirim update.' });
      setEmail('');
    } catch (err) {
      setStatus({ kind: 'error', msg: err?.message || 'Gagal berlangganan.' });
    }
  };

  if (status.kind === 'success') {
    return (
      <div
        role="status"
        aria-live="polite"
        className="mt-3 bg-emerald-50 border border-emerald-100 rounded-md px-2.5 py-2 flex items-start gap-2"
      >
        <svg className="w-3.5 h-3.5 text-emerald-500 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
        </svg>
        <p className="text-[11px] text-emerald-700 leading-snug">{status.msg}</p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="mt-3" noValidate>
      <div className="flex">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={status.kind === 'loading'}
          placeholder={t('quick.emailPlaceholder')}
          className="flex-1 min-w-0 bg-slate-50 border border-slate-200 text-slate-800 text-xs px-2.5 py-2 rounded-l-md placeholder:text-slate-400 focus:outline-none focus:border-orange-400 transition-colors"
        />
        <button
          type="submit"
          disabled={status.kind === 'loading'}
          className="bg-orange-500 hover:bg-orange-600 active:bg-orange-700 text-white text-xs font-semibold px-3 rounded-r-md transition-colors disabled:opacity-70"
        >
          {status.kind === 'loading' ? '…' : t('quick.subscribeBtn')}
        </button>
      </div>
      {status.msg && (
        <p className={`text-[11px] mt-1.5 ${
          status.kind === 'error'   ? 'text-red-500' : 'text-slate-400'
        }`} role="status" aria-live="polite">
          {status.msg}
        </p>
      )}
    </form>
  );
}

/* ── Main QuickEntry section ────────────────────────────────────────────── */

function formatDate(d) {
  if (!d) return '';
  const dt = new Date(d);
  if (Number.isNaN(dt.getTime())) return '';
  return dt.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function QuickEntry() {
  const { t } = useI18n();
  const [pub,  setPub]  = useState(undefined); // undefined = loading, null = empty, object = loaded
  const [evt,  setEvt]  = useState(undefined);

  useEffect(() => {
    let cancelled = false;
    // allSettled so one endpoint failing doesn't nuke the whole section.
    Promise.allSettled([api('/publications'), api('/events')]).then(([pRes, eRes]) => {
      if (cancelled) return;
      const pubs = pRes.status === 'fulfilled' && Array.isArray(pRes.value) ? pRes.value : [];
      const evts = eRes.status === 'fulfilled' && Array.isArray(eRes.value) ? eRes.value : [];
      setPub(pubs.length ? pubs[0] : null);
      // Event.date is a free-form string, so "upcoming" detection is best-
      // effort. We show the most-recently-created event instead and label
      // the tile "Event Terbaru" to match what we can actually promise.
      setEvt(evts.length ? evts[0] : null);
    });
    return () => { cancelled = true; };
  }, []);

  return (
    <section className="py-10 px-4 bg-slate-50 border-b border-slate-100">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-end justify-between mb-5">
          <p className="text-xs font-semibold tracking-widest text-slate-400 uppercase">{t('quick.section')}</p>
          <Link to="/publikasi" className="text-xs font-semibold text-slate-500 hover:text-orange-600 transition-colors">
            {t('quick.allPublikasi')} →
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

          <TileShell
            label={t('quick.publikasi')}
            headline={
              pub === undefined ? t('quick.loading') :
              pub === null      ? t('quick.empty.pub') :
              pub.title
            }
            meta={pub && pub !== null ? [pub.category, formatDate(pub.createdAt || pub.date)].filter(Boolean).join(' · ') : null}
            href={pub && pub !== null ? `/publikasi/${pub.slug}` : '/publikasi'}
            icon={ICON_DOC}
          />

          <TileShell
            label={t('quick.event')}
            headline={
              evt === undefined ? t('quick.loading') :
              evt === null      ? t('quick.empty.evt') :
              evt.title
            }
            meta={evt && evt !== null ? [evt.date, evt.location].filter(Boolean).join(' · ') : null}
            href={evt && evt !== null ? `/event/${evt.slug}` : '/event'}
            icon={ICON_CAL}
          />

          <TileShell
            label={t('quick.dataPemilu')}
            headline={t('quick.dashboardTitle')}
            meta={null}
            href="/data-pemilu"
            icon={ICON_CHART}
          />

          <TileShell
            label={t('quick.subscribe')}
            headline={t('quick.subscribeHead')}
            meta={t('quick.subscribeHelp')}
          >
            <InlineSubscribe />
          </TileShell>
        </div>
      </div>
    </section>
  );
}
