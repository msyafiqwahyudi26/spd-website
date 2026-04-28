import { useParams, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { INITIAL_PUBLIKASI } from '../data/publikasi';
import Image from '../components/ui/Image';
import { resolveMediaUrl } from '@/lib/media';

/** Share buttons: WhatsApp, X, Facebook, copy link */
function ShareBar({ title, url }) {
  const [copied, setCopied] = useState(false);
  const enc   = encodeURIComponent;
  const waUrl = `https://wa.me/?text=${enc(title + '\n' + url)}`;
  const xUrl  = `https://x.com/intent/tweet?text=${enc(title)}&url=${enc(url)}`;
  const fbUrl = `https://www.facebook.com/sharer/sharer.php?u=${enc(url)}`;

  const copyLink = () => {
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest mr-1">Bagikan</span>

      {/* WhatsApp */}
      <a href={waUrl} target="_blank" rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-green-50 text-green-700 hover:bg-green-100 transition-colors border border-green-200"
        aria-label="Bagikan ke WhatsApp">
        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347"/>
        </svg>
        WhatsApp
      </a>

      {/* X / Twitter */}
      <a href={xUrl} target="_blank" rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-900 text-white hover:bg-slate-700 transition-colors"
        aria-label="Bagikan ke X (Twitter)">
        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
        </svg>
        X
      </a>

      {/* Facebook */}
      <a href={fbUrl} target="_blank" rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-600 text-white hover:bg-blue-700 transition-colors"
        aria-label="Bagikan ke Facebook">
        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
          <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
        </svg>
        Facebook
      </a>

      {/* Copy link */}
      <button onClick={copyLink}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors border border-slate-200"
        aria-label="Salin tautan">
        {copied ? (
          <>
            <svg className="w-3.5 h-3.5 text-green-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
              <polyline points="20 6 9 17 4 12"/>
            </svg>
            <span className="text-green-600">Tersalin!</span>
          </>
        ) : (
          <>
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
            </svg>
            Salin tautan
          </>
        )}
      </button>
    </div>
  );
}

const TYPE_LABEL = { article: 'Artikel', research: 'Riset', book: 'Buku' };

/**
 * Book detail layout — 2-column product-page shape.
 *
 * Left: cover image (prominent, 3:4 portrait). Right: category badge,
 * title, author, date, description, big download CTA. If the admin
 * added fullContent it renders below as a normal body; otherwise the
 * page ends at the CTA — books rarely need a full article body.
 */
function BookLayout({ item, heroSrc, gradient, hasContent }) {
  return (
    <article className="bg-white">
      <div className="max-w-4xl mx-auto px-4 pt-8 pb-2">
        <Link
          to="/publikasi"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-orange-500 transition-colors duration-200 group"
        >
          <span className="transition-transform duration-200 group-hover:-translate-x-0.5">←</span>
          Kembali ke Publikasi
        </Link>
      </div>

      <div className="max-w-5xl mx-auto px-4 pt-6 pb-16">
        <div className="grid grid-cols-1 md:grid-cols-[280px_1fr] gap-10 items-start">
          {/* Cover */}
          <div className="mx-auto md:mx-0 w-full max-w-[280px]">
            <div className="aspect-[3/4] rounded-xl overflow-hidden shadow-lg border border-slate-200">
              <Image
                src={heroSrc}
                alt={item.title}
                className="w-full h-full"
                gradient={gradient}
                icon="logo"
              />
            </div>
          </div>

          {/* Metadata + CTA */}
          <div>
            <div className="mb-4 flex items-center gap-2 flex-wrap">
              <span className={`text-xs font-bold tracking-widest uppercase ${item.categoryColor ?? 'text-slate-400'}`}>
                {item.category}
              </span>
              <span className="text-[10px] font-bold tracking-widest uppercase px-2 py-0.5 rounded bg-orange-100 text-orange-700 border border-orange-200">
                BUKU
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 leading-tight mb-4">
              {item.title}
            </h1>

            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-slate-500 mb-6">
              {item.author && <span>Oleh <span className="text-slate-700 font-medium">{item.author}</span></span>}
              <span>{item.date}</span>
            </div>

            {item.description && (
              <p className="text-base text-slate-600 leading-relaxed mb-8">{item.description}</p>
            )}

            {item.pdfUrl ? (
              <a
                href={resolveMediaUrl(item.pdfUrl)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-bold px-6 py-3 rounded-lg transition-colors shadow-sm"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4-4 4m0 0-4-4m4 4V4" />
                </svg>
                Unduh Buku (PDF)
              </a>
            ) : (
              <span className="inline-flex items-center gap-2 text-sm text-slate-400 bg-slate-50 border border-slate-200 px-4 py-3 rounded-lg">
                File PDF belum tersedia.
              </span>
            )}
          </div>
        </div>

        {/* Optional body — only if admin provided fullContent blocks. */}
        {hasContent && (
          <div className="mt-16 border-t border-slate-100 pt-10 max-w-3xl mx-auto">
            {item.fullContent.map((block, i) => (
              <ContentBlock key={i} block={block} />
            ))}
          </div>
        )}
      </div>
    </article>
  );
}
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
    return (
      <div className="bg-white min-h-screen">
        <div className="max-w-4xl mx-auto px-4 pt-8 pb-2">
          <div className="h-4 w-36 bg-slate-100 rounded animate-pulse" />
        </div>
        <div className="max-w-4xl mx-auto px-4 pt-6 pb-10">
          <div className="h-3 w-24 bg-slate-100 rounded animate-pulse mb-4" />
          <div className="h-8 w-3/4 bg-slate-100 rounded animate-pulse mb-3" />
          <div className="h-8 w-1/2 bg-slate-100 rounded animate-pulse mb-6" />
          <div className="flex gap-4 pb-6 border-b border-slate-100">
            <div className="h-3 w-28 bg-slate-100 rounded animate-pulse" />
            <div className="h-3 w-20 bg-slate-100 rounded animate-pulse" />
          </div>
        </div>
        <div className="max-w-4xl mx-auto px-4 mb-10">
          <div className="w-full h-64 sm:h-80 rounded-2xl bg-slate-100 animate-pulse" />
        </div>
        <div className="max-w-3xl mx-auto px-4 pb-16 space-y-4">
          {[100, 90, 95, 85, 70].map((w, i) => (
            <div key={i} className={`h-4 bg-slate-100 rounded animate-pulse`} style={{ width: `${w}%` }} />
          ))}
        </div>
      </div>
    );
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

  const heroSrc = item.image ? resolveMediaUrl(item.image) : null;
  const gradient   = GRADIENT_BY_CATEGORY[item.category] ?? 'from-slate-100 to-slate-200';
  const hasContent = Array.isArray(item.fullContent) && item.fullContent.length > 0;
  const gallery    = Array.isArray(item.gallery) && item.gallery.length > 0 ? item.gallery : null;
  const isBook     = item.contentType === 'book';
  const isResearch = item.contentType === 'research';

  // Books get a "product page" shape: cover on the left, metadata + download
  // stacked on the right. Skips the full-width hero image and the body-text
  // block unless the admin explicitly added fullContent.
  if (isBook) {
    return <BookLayout item={item} heroSrc={heroSrc} gradient={gradient} hasContent={hasContent} />;
  }

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
        <div className="mb-4 flex items-center gap-2 flex-wrap">
          <span className={`text-xs font-bold tracking-widest uppercase ${item.categoryColor ?? 'text-slate-400'}`}>
            {item.category}
          </span>
          {item.contentType && item.contentType !== 'article' && (
            <span className="text-[10px] font-bold tracking-widest uppercase px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
              {TYPE_LABEL[item.contentType] || item.contentType}
            </span>
          )}
        </div>

        <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 leading-tight mb-6">
          {item.title}
        </h1>

        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-slate-500 pb-5 border-b border-slate-100">
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

        {/* Share bar — right below meta */}
        <div className="pt-4 pb-2">
          <ShareBar
            title={item.title}
            url={`https://spdindonesia.org/publikasi/${item.slug}`}
          />
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

      {/* ── PDF attachment — prominent for books, inline for research ── */}
      {item.pdfUrl && (
        <div className="max-w-3xl mx-auto px-4 mb-10">
          <a
            href={resolveMediaUrl(item.pdfUrl)}
            target="_blank"
            rel="noopener noreferrer"
            className={`group flex items-center gap-4 rounded-xl border transition-all ${
              item.contentType === 'book'
                ? 'bg-orange-50 border-orange-200 hover:border-orange-400 p-5'
                : 'bg-slate-50 border-slate-200 hover:border-orange-300 p-4'
            }`}
          >
            <div className={`shrink-0 w-12 h-12 rounded-lg flex items-center justify-center ${
              item.contentType === 'book' ? 'bg-orange-500 text-white' : 'bg-white border border-slate-200 text-slate-500'
            }`}>
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5.586a1 1 0 0 1 .707.293l5.414 5.414a1 1 0 0 1 .293.707V19a2 2 0 0 1-2 2z" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-slate-800 group-hover:text-orange-600 transition-colors">
                {item.contentType === 'book' ? 'Unduh Buku (PDF)' : 'Unduh Laporan (PDF)'}
              </p>
              <p className="text-xs text-slate-500 mt-0.5">
                Klik untuk membuka file PDF di tab baru. Mungkin butuh beberapa detik untuk memuat.
              </p>
            </div>
            <svg className="shrink-0 w-5 h-5 text-slate-400 group-hover:text-orange-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3v-1m-4-4-4 4m0 0-4-4m4 4V4" />
            </svg>
          </a>
        </div>
      )}

      {/* ── Body ── */}
      <div className="max-w-3xl mx-auto px-4 pb-16">
        {hasContent ? (
          item.fullContent.map((block, i) => (
            <ContentBlock key={i} block={block} />
          ))
        ) : item.description ? (
          <p className="text-base text-slate-600 leading-relaxed">
            {item.description}
          </p>
        ) : (
          <div className="py-12 text-center border border-dashed border-slate-200 rounded-xl bg-slate-50">
            <svg className="mx-auto w-10 h-10 text-slate-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
            </svg>
            <p className="text-sm text-slate-400 font-medium">Konten belum tersedia</p>
            <p className="text-xs text-slate-400 mt-1">Artikel ini sedang dalam proses penulisan.</p>
          </div>
        )}

        {/* ── Gallery ── */}
        {gallery && (
          <div className="mt-12">
            <h2 className="text-base font-semibold text-slate-700 mb-4">Galeri</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {gallery.map((url, i) => (
                <a
                  key={i}
                  href={resolveMediaUrl(url)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block rounded-xl overflow-hidden aspect-video bg-slate-100 group"
                >
                  <img
                    src={resolveMediaUrl(url)}
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
