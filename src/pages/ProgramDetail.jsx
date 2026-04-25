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
      <div className="max-w-3xl mx-auto px-4 pt-6">
        <Link
          to="/program"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-orange-500 transition-colors duration-200 group"
        >
          <span className="transition-transform duration-200 group-hover:-translate-x-0.5">←</span>
          Semua Program
        </Link>
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
