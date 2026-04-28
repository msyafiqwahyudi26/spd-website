import { useParams, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { INITIAL_EVENTS } from '../data/events';
import Image from '../components/ui/Image';
import { resolveMediaUrl } from '@/lib/media';

const safeFormatDate = (dateStr) => {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  return isNaN(d.getTime()) ? '—' : d.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
};

function ShareBar({ title, url }) {
  const [copied, setCopied] = useState(false);
  const encoded = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title || '');

  const copyLink = () => {
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider mr-1">Bagikan:</span>
      <a
        href={`https://wa.me/?text=${encodedTitle}%20${encoded}`}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-green-50 text-green-700 hover:bg-green-100 transition-colors"
        aria-label="Bagikan ke WhatsApp"
      >
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
        WhatsApp
      </a>
      <a
        href={`https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encoded}`}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-slate-50 text-slate-700 hover:bg-slate-100 transition-colors"
        aria-label="Bagikan ke X / Twitter"
      >
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
        X
      </a>
      <a
        href={`https://www.facebook.com/sharer/sharer.php?u=${encoded}`}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors"
        aria-label="Bagikan ke Facebook"
      >
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
        Facebook
      </a>
      <button
        type="button"
        onClick={copyLink}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-slate-50 text-slate-600 hover:bg-slate-100 transition-colors"
        aria-label="Salin tautan"
      >
        {copied ? (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="w-3.5 h-3.5 text-green-500"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5"/></svg>
        ) : (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-3.5 h-3.5"><path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244"/></svg>
        )}
        {copied ? 'Tersalin!' : 'Salin tautan'}
      </button>
    </div>
  );
}

export default function EventDetail() {
  const { slug } = useParams();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const data = await api(`/events/${slug}`);
        setItem({
          ...data,
          date: safeFormatDate(data.date)
        });
      } catch (err) {
        console.warn('API fetch failed, using fallback data for Event Detail');
        const fallback = INITIAL_EVENTS.find(e => (e.slug || String(e.id)) === slug);
        if (fallback) {
          setItem({
            ...fallback,
            date: safeFormatDate(fallback.date)
          });
        }
      } finally {
        setLoading(false);
      }
    };
    if (slug) fetchDetail();
  }, [slug]);

  if (loading) {
    return <div className="min-h-[60vh] flex items-center justify-center">Loading...</div>;
  }

  if (!item) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center px-4 text-center">
        <p className="text-4xl font-bold text-slate-200 mb-4">404</p>
        <p className="text-slate-500 text-sm mb-6">Event tidak ditemukan.</p>
        <Link
          to="/event"
          className="text-sm font-semibold text-orange-500 hover:text-orange-600 transition-colors inline-flex items-center gap-1"
        >
          <span>←</span> Kembali ke Event
        </Link>
      </div>
    );
  }

  return (
    <article className="bg-white">

      {/* Back nav */}
      <div className="max-w-4xl mx-auto px-4 pt-8 pb-2">
        <Link
          to="/event"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-orange-500 transition-colors duration-200 group"
        >
          <span className="transition-transform duration-200 group-hover:-translate-x-0.5">←</span>
          Kembali ke Event
        </Link>
      </div>

      {/* Header */}
      <header className="max-w-4xl mx-auto px-4 pt-6 pb-10">
        <div className="mb-4">
          <span className="text-xs font-bold tracking-widest uppercase text-orange-500">EVENT</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 leading-tight mb-6">
          {item.title ?? ''}
        </h1>
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-slate-500 pb-5 border-b border-slate-100">
          {item.date && (
            <span className="flex items-center gap-1.5">
              <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
              </svg>
              {item.date}
            </span>
          )}
          {item.location && (
            <span className="flex items-center gap-1.5">
              <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
              </svg>
              {item.location}
            </span>
          )}
        </div>
        <div className="pt-4 pb-2">
          <ShareBar
            title={item.title}
            url={`https://spdindonesia.org/event/${item.slug}`}
          />
        </div>
      </header>

      {/* Hero image */}
      <div className="max-w-4xl mx-auto px-4 mb-10">
        <Image
          src={item.image ? resolveMediaUrl(item.image) : null}
          alt={item.title ?? ''}
          className="w-full h-64 sm:h-80 rounded-2xl"
          gradient="from-orange-50 to-slate-100"
          icon="photo"
        />
      </div>

      {/* Body */}
      <div className="max-w-3xl mx-auto px-4 pb-16">
        <p className="text-base text-slate-600 leading-relaxed">
          {item.description ?? ''}
        </p>

        {/* Footer nav */}
        <div className="mt-14 pt-8 border-t border-slate-100 flex items-center justify-between">
          <Link
            to="/event"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-orange-500 transition-colors duration-200 group"
          >
            <span className="transition-transform duration-200 group-hover:-translate-x-0.5">←</span>
            Kembali ke Event
          </Link>
          <span className="text-xs font-bold tracking-widest uppercase text-orange-500">EVENT</span>
        </div>
      </div>

    </article>
  );
}
