import { useParams, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { resolveMediaUrl } from '@/lib/media';

/* ── Content block renderer (same contract as PublikasiDetail) ─────────────── */
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

/* ── Gallery grid ────────────────────────────────────────────────────────── */
function Gallery({ images }) {
  const [lightbox, setLightbox] = useState(null);
  if (!images || images.length === 0) return null;
  return (
    <section className="mt-12">
      <h2 className="text-lg font-bold text-slate-800 mb-5">Dokumentasi Foto</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {images.map((url, i) => {
          const src = resolveMediaUrl(url);
          return (
            <button
              key={i}
              onClick={() => setLightbox(src)}
              className="relative aspect-video overflow-hidden rounded-xl bg-slate-100 group focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500"
            >
              <img
                src={src}
                alt={`Foto ${i + 1}`}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-200 flex items-center justify-center">
                <svg className="w-7 h-7 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200 drop-shadow" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                </svg>
              </div>
            </button>
          );
        })}
      </div>

      {/* Lightbox */}
      {lightbox && (
        <div
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
          onClick={() => setLightbox(null)}
        >
          <img
            src={lightbox}
            alt="Foto program"
            className="max-w-full max-h-[90vh] rounded-xl shadow-2xl object-contain"
            onClick={(e) => e.stopPropagation()}
          />
          <button
            onClick={() => setLightbox(null)}
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
            aria-label="Tutup"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}
    </section>
  );
}

/* ── Share bar ────────────────────────────────────────────────────────────── */
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

/* ── Skeleton loader ──────────────────────────────────────────────────────── */
function Skeleton() {
  return (
    <div className="animate-pulse">
      <div className="h-64 sm:h-80 bg-slate-200 w-full" />
      <div className="max-w-3xl mx-auto px-4 pt-10 pb-16 space-y-4">
        <div className="h-3 bg-slate-200 rounded w-24" />
        <div className="h-8 bg-slate-200 rounded w-3/4" />
        <div className="h-4 bg-slate-200 rounded w-1/2" />
        <div className="space-y-2 pt-4">
          {[1,2,3,4].map(i => <div key={i} className="h-3 bg-slate-100 rounded w-full" />)}
        </div>
      </div>
    </div>
  );
}

/* ── Main page ────────────────────────────────────────────────────────────── */
export default function ProgramDetail() {
  const { slug } = useParams();
  const [program, setProgram] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    api(`/programs/${slug}`)
      .then((data) => {
        if (cancelled) return;
        setProgram({
          ...data,
          fullContent: Array.isArray(data.fullContent)
            ? data.fullContent
            : (typeof data.fullContent === 'string' ? (() => { try { return JSON.parse(data.fullContent); } catch { return []; } })() : []),
          gallery: Array.isArray(data.gallery)
            ? data.gallery
            : (typeof data.gallery === 'string' ? (() => { try { return JSON.parse(data.gallery); } catch { return []; } })() : []),
        });
      })
      .catch(() => { if (!cancelled) setNotFound(true); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [slug]);

  if (loading) return <Skeleton />;

  if (notFound || !program) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
        <p className="text-slate-400 text-lg mb-4">Program tidak ditemukan.</p>
        <Link to="/program" className="text-sm font-semibold text-orange-500 hover:text-orange-600">
          ← Kembali ke Program
        </Link>
      </div>
    );
  }

  const heroSrc = program.image ? resolveMediaUrl(program.image) : null;
  const hasContent = Array.isArray(program.fullContent) && program.fullContent.length > 0;
  const hasGallery = Array.isArray(program.gallery) && program.gallery.length > 0;

  return (
    <article className="bg-white">
      {/* ── Hero banner ───────────────────────────────────────────────── */}
      <div className="relative h-64 sm:h-80 md:h-96 w-full overflow-hidden bg-gradient-to-br from-orange-500 to-orange-700">
        {heroSrc && (
          <>
            <img
              src={heroSrc}
              alt={program.title}
              className="absolute inset-0 w-full h-full object-cover opacity-70"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/70 via-slate-900/20 to-transparent" />
          </>
        )}
        {!heroSrc && (
          <div className="absolute inset-0 bg-gradient-to-br from-orange-500 to-orange-700 flex items-center justify-center">
            <svg className="w-20 h-20 text-white/30" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
        )}

        {/* Text overlay */}
        <div className="absolute bottom-0 left-0 right-0 px-4 pb-8 pt-12 bg-gradient-to-t from-black/60 to-transparent">
          <div className="max-w-3xl mx-auto">
            {program.category && (
              <span className="inline-block text-xs font-bold tracking-widest uppercase text-orange-300 mb-2">
                {program.category}
              </span>
            )}
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white leading-tight">
              {program.title}
            </h1>
          </div>
        </div>
      </div>

      {/* ── Back nav ─────────────────────────────────────────────────── */}
      <div className="max-w-3xl mx-auto px-4 pt-6 flex flex-wrap items-center justify-between gap-4">
        <Link
          to="/program"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-orange-500 transition-colors duration-200 group"
        >
          <span className="transition-transform duration-200 group-hover:-translate-x-0.5">←</span>
          Semua Program
        </Link>
        <ShareBar
          title={program.title}
          url={`https://spdindonesia.org/program/${program.slug}`}
        />
      </div>

      {/* ── Body ─────────────────────────────────────────────────────── */}
      <div className="max-w-3xl mx-auto px-4 pt-6 pb-20">

        {/* Description lead */}
        {program.description && (
          <p className="text-lg text-slate-600 leading-relaxed mb-8 border-b border-slate-100 pb-8">
            {program.description}
          </p>
        )}

        {/* Rich content blocks */}
        {hasContent && (
          <div className="mb-10">
            {program.fullContent.map((block, i) => (
              <ContentBlock key={i} block={block} />
            ))}
          </div>
        )}

        {/* Gallery */}
        {hasGallery && <Gallery images={program.gallery} />}

        {/* External link CTA */}
        {program.link && (
          <div className="mt-12 border-t border-slate-100 pt-8">
            <a
              href={program.link}
              target={program.link.startsWith('http') ? '_blank' : undefined}
              rel={program.link.startsWith('http') ? 'noopener noreferrer' : undefined}
              className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-bold px-6 py-3 rounded-lg transition-colors shadow-sm"
            >
              Kunjungi Halaman Program
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          </div>
        )}

        {/* Bottom back link */}
        <div className="mt-16 pt-8 border-t border-slate-100">
          <Link
            to="/program"
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-orange-500 transition-colors group"
          >
            <span className="transition-transform duration-200 group-hover:-translate-x-1">←</span>
            Kembali ke semua program
          </Link>
        </div>
      </div>
    </article>
  );
}
