import { useParams, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { INITIAL_EVENTS } from '../data/events';
import Image from '../components/ui/Image';

const safeFormatDate = (dateStr) => {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  return isNaN(d.getTime()) ? '—' : d.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
};

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
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-slate-500 pb-6 border-b border-slate-100">
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
      </header>

      {/* Hero image */}
      <div className="max-w-4xl mx-auto px-4 mb-10">
        <Image
          src={item.image ?? null}
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
