import { useParams, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { INITIAL_PUBLIKASI } from '../data/publikasi';
import Image from '../components/ui/Image';
const safeFormatDate = (dateStr) => {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  return isNaN(d.getTime()) ? '—' : d.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
};

const GRADIENT_BY_CATEGORY = {
  'RISET SINGKAT': 'from-orange-50 to-orange-100',
  'RISET':         'from-teal-50 to-teal-100',
  'OPINI':         'from-slate-100 to-slate-200',
  'ANALISIS':      'from-blue-50 to-blue-100',
};

function ContentBlock({ block }) {
  if (!block || typeof block !== 'object') return null;
  const text = block.text ?? '';
  if (!text) return null;

  if (block.type === 'heading') {
    return (
      <h2 className="text-xl font-bold text-slate-800 mt-10 mb-4 leading-snug">
        {text}
      </h2>
    );
  }
  if (block.type === 'subheading') {
    return (
      <h3 className="text-base font-semibold text-slate-700 mt-7 mb-3">
        {text}
      </h3>
    );
  }
  if (block.type === 'lead') {
    return (
      <p className="text-lg text-slate-700 leading-relaxed mb-6 font-medium">
        {text}
      </p>
    );
  }
  return (
    <p className="text-base text-slate-600 leading-relaxed mb-5">
      {text}
    </p>
  );
}

export default function PublikasiDetail() {
  const { slug } = useParams();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const data = await api(`/publications/${slug}`);
        setItem({
          ...data,
          date: safeFormatDate(data.createdAt || data.date),
          fullContent: typeof data.fullContent === 'string' ? JSON.parse(data.fullContent) : (data.fullContent || []),
          gallery: typeof data.gallery === 'string' ? JSON.parse(data.gallery) : (data.gallery || [])
        });
        api(`/publications/${slug}/view`, { method: 'POST' }).catch(() => {});
      } catch (err) {
        console.warn('API fetch failed, using fallback data for Publikasi Detail');
        const fallback = INITIAL_PUBLIKASI.find(p => (p.slug || String(p.id)) === slug);
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
        <p className="text-slate-500 text-sm mb-6">Artikel tidak ditemukan.</p>
        <Link
          to="/publikasi"
          className="text-sm font-semibold text-orange-500 hover:text-orange-600 transition-colors inline-flex items-center gap-1"
        >
          <span>←</span> Kembali ke Publikasi
        </Link>
      </div>
    );
  }

  const heroSrc = item.image || null;
  const gradient   = GRADIENT_BY_CATEGORY[item.category] ?? 'from-slate-100 to-slate-200';
  const hasContent = Array.isArray(item.fullContent) && item.fullContent.length > 0;
  const gallery    = Array.isArray(item.gallery) && item.gallery.length > 0 ? item.gallery : null;

  return (
    <article className="bg-white">

      {/* ── Back nav ── */}
      <div className="max-w-4xl mx-auto px-4 pt-8 pb-2">
        <Link
          to="/publikasi"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-orange-500 transition-colors duration-200 group"
        >
          <span className="transition-transform duration-200 group-hover:-translate-x-0.5">←</span>
          Kembali ke Publikasi
        </Link>
      </div>

      {/* ── Header ── */}
      <header className="max-w-4xl mx-auto px-4 pt-6 pb-10">
        <div className="mb-4">
          <span className={`text-xs font-bold tracking-widest uppercase ${item.categoryColor ?? 'text-slate-400'}`}>
            {item.category}
          </span>
        </div>

        <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 leading-tight mb-6">
          {item.title}
        </h1>

        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-slate-500 pb-6 border-b border-slate-100">
          {item.author && (
            <span className="flex items-center gap-1.5">
              <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
              </svg>
              {item.author}
            </span>
          )}
          <span className="flex items-center gap-1.5">
            <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
            </svg>
            {item.date}
          </span>
          {item.readTime && (
            <span className="flex items-center gap-1.5">
              <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
              </svg>
              {item.readTime}
            </span>
          )}
        </div>
      </header>

      {/* ── Hero image ── */}
      <div className="max-w-4xl mx-auto px-4 mb-10">
        <Image
          src={heroSrc}
          alt={item.title}
          className="w-full h-64 sm:h-80 rounded-2xl"
          gradient={gradient}
          icon="photo"
        />
      </div>

      {/* ── Body ── */}
      <div className="max-w-3xl mx-auto px-4 pb-16">
        {hasContent ? (
          item.fullContent.map((block, i) => (
            <ContentBlock key={i} block={block} />
          ))
        ) : (
          <p className="text-base text-slate-600 leading-relaxed">
            {item.description}
          </p>
        )}

        {/* ── Gallery ── */}
        {gallery && (
          <div className="mt-12">
            <h2 className="text-base font-semibold text-slate-700 mb-4">Galeri</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {gallery.map((url, i) => (
                <a
                  key={i}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block rounded-xl overflow-hidden aspect-video bg-slate-100 group"
                >
                  <img
                    src={url}
                    alt={`Galeri ${i + 1}`}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    onError={e => { e.currentTarget.parentElement.style.display = 'none'; }}
                  />
                </a>
              ))}
            </div>
          </div>
        )}

        {/* ── Footer nav ── */}
        <div className="mt-14 pt-8 border-t border-slate-100 flex items-center justify-between">
          <Link
            to="/publikasi"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-orange-500 transition-colors duration-200 group"
          >
            <span className="transition-transform duration-200 group-hover:-translate-x-0.5">←</span>
            Kembali ke Publikasi
          </Link>
          <span className={`text-xs font-bold tracking-widest uppercase ${item.categoryColor ?? 'text-slate-400'}`}>
            {item.category}
          </span>
        </div>
      </div>

    </article>
  );
}
