import { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { api } from '@/lib/api';
import { resolveMediaUrl } from '@/lib/media';

/* ── Helpers ──────────────────────────────────────────────────────────────── */
function ChevronLeft() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}
      strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
      <polyline points="15 18 9 12 15 6" />
    </svg>
  );
}
function ChevronRight() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}
      strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
      <polyline points="9 18 15 12 9 6" />
    </svg>
  );
}
function ArrowBack() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}
      strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
      <path d="M19 12H5M12 5l-7 7 7 7" />
    </svg>
  );
}

/* ── Lightbox ─────────────────────────────────────────────────────────────── */
function Lightbox({ src, alt, onClose, onPrev, onNext, index, total }) {
  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') onPrev();
      if (e.key === 'ArrowRight') onNext();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose, onPrev, onNext]);

  return (
    <div
      className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
      onClick={onClose}
    >
      {/* Close */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-white/70 hover:text-white p-2 rounded-full hover:bg-white/10 transition-colors"
        aria-label="Tutup"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-6 h-6">
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      {/* Prev */}
      {total > 1 && (
        <button
          onClick={(e) => { e.stopPropagation(); onPrev(); }}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-white/70 hover:text-white p-3 rounded-full hover:bg-white/10 transition-colors"
          aria-label="Sebelumnya"
        >
          <ChevronLeft />
        </button>
      )}

      {/* Image */}
      <img
        src={src}
        alt={alt}
        className="max-h-[85vh] max-w-full object-contain rounded-lg shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      />

      {/* Next */}
      {total > 1 && (
        <button
          onClick={(e) => { e.stopPropagation(); onNext(); }}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-white/70 hover:text-white p-3 rounded-full hover:bg-white/10 transition-colors"
          aria-label="Berikutnya"
        >
          <ChevronRight />
        </button>
      )}

      {/* Counter */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/60 text-sm tabular-nums">
        {index + 1} / {total}
      </div>
    </div>
  );
}

/* ── Slide Card ───────────────────────────────────────────────────────────── */
function SlideCard({ slide, index, onOpen }) {
  const src = slide.imageUrl ? resolveMediaUrl(slide.imageUrl) : null;
  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow group">
      <button
        className="w-full text-left"
        onClick={() => onOpen(index)}
        aria-label={`Buka slide ${index + 1}`}
      >
        {src ? (
          <div className="relative overflow-hidden bg-slate-100">
            <img
              src={src}
              alt={slide.caption || `Slide ${index + 1}`}
              className="w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
              style={{ aspectRatio: '4/3' }}
            />
            {/* Zoom indicator */}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
              <span className="opacity-0 group-hover:opacity-100 transition-opacity bg-black/60 text-white text-xs font-semibold px-3 py-1.5 rounded-full flex items-center gap-1.5">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-3.5 h-3.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                </svg>
                Perbesar
              </span>
            </div>
          </div>
        ) : (
          <div className="bg-slate-100 flex items-center justify-center" style={{ aspectRatio: '4/3' }}>
            <svg className="w-12 h-12 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M2.25 6A2.25 2.25 0 014.5 3.75h15A2.25 2.25 0 0121.75 6v12a2.25 2.25 0 01-2.25 2.25h-15A2.25 2.25 0 012.25 18V6z" />
            </svg>
          </div>
        )}
      </button>
      {slide.caption && (
        <div className="px-4 py-3">
          <p className="text-xs text-slate-600 leading-relaxed">{slide.caption}</p>
        </div>
      )}
      <div className="px-4 pb-3">
        <span className="text-[10px] font-semibold text-slate-300 uppercase tracking-widest">
          Slide {index + 1}
        </span>
      </div>
    </div>
  );
}

/* ── Main ─────────────────────────────────────────────────────────────────── */
export default function InfografisDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();

  const [item,    setItem]    = useState(null);
  const [status,  setStatus]  = useState('loading'); // loading | ok | error
  const [lightbox, setLightbox] = useState(null); // null | index

  useEffect(() => {
    let cancelled = false;
    setStatus('loading');
    api(`/infografis/${slug}`)
      .then((d) => { if (!cancelled) { setItem(d); setStatus('ok'); } })
      .catch(() => { if (!cancelled) setStatus('error'); });
    return () => { cancelled = true; };
  }, [slug]);

  // Flatten cover + slides into one list for lightbox
  const allImages = item
    ? [
        { imageUrl: item.imageUrl, caption: item.caption || item.title },
        ...(item.slides || []).filter(s => s.imageUrl),
      ]
    : [];

  const openLightbox = useCallback((i) => setLightbox(i), []);
  const closeLightbox = useCallback(() => setLightbox(null), []);
  const prevSlide = useCallback(() => setLightbox(i => (i > 0 ? i - 1 : allImages.length - 1)), [allImages.length]);
  const nextSlide = useCallback(() => setLightbox(i => (i < allImages.length - 1 ? i + 1 : 0)), [allImages.length]);

  /* ── Loading ── */
  if (status === 'loading') {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <svg className="w-8 h-8 animate-spin text-orange-500" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <span className="text-sm text-slate-400">Memuat data...</span>
        </div>
      </div>
    );
  }

  /* ── Error ── */
  if (status === 'error' || !item) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <div className="text-center max-w-sm">
          <p className="text-lg font-semibold text-slate-700 mb-2">Infografis tidak ditemukan</p>
          <p className="text-sm text-slate-400 mb-6">Halaman yang kamu cari tidak ada atau sudah dihapus.</p>
          <Link to="/data-pemilu" className="inline-flex items-center gap-2 text-sm font-semibold text-orange-500 hover:text-orange-600 transition-colors">
            <ArrowBack /> Kembali ke Data Pemilu
          </Link>
        </div>
      </div>
    );
  }

  const coverSrc = item.imageUrl ? resolveMediaUrl(item.imageUrl) : null;
  const slides   = item.slides || [];
  const totalSlides = slides.filter(s => s.imageUrl).length;

  return (
    <>
      {/* Lightbox */}
      {lightbox !== null && allImages[lightbox] && (
        <Lightbox
          src={resolveMediaUrl(allImages[lightbox].imageUrl)}
          alt={allImages[lightbox].caption || item.title}
          onClose={closeLightbox}
          onPrev={prevSlide}
          onNext={nextSlide}
          index={lightbox}
          total={allImages.length}
        />
      )}

      {/* ── Header ── */}
      <div className="bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-xs text-slate-400 mb-5">
            <Link to="/data-pemilu" className="hover:text-orange-400 transition-colors">Data Pemilu</Link>
            <span>/</span>
            <span className="text-slate-300">Infografis</span>
          </nav>

          {/* Back button */}
          <Link
            to="/data-pemilu"
            className="inline-flex items-center gap-2 text-sm text-slate-300 hover:text-white mb-5 transition-colors"
          >
            <ArrowBack />
            Kembali
          </Link>

          <div className="flex flex-col md:flex-row gap-8 items-start">
            {/* Cover image */}
            {coverSrc && (
              <div className="w-full md:w-72 shrink-0">
                <button
                  className="w-full rounded-xl overflow-hidden group relative"
                  onClick={() => openLightbox(0)}
                  aria-label="Buka gambar cover"
                >
                  <img
                    src={coverSrc}
                    alt={item.title}
                    className="w-full object-cover rounded-xl transition-transform duration-300 group-hover:scale-[1.02]"
                    style={{ aspectRatio: '4/3' }}
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 rounded-xl transition-colors flex items-center justify-center">
                    <span className="opacity-0 group-hover:opacity-100 transition-opacity bg-black/60 text-white text-xs font-semibold px-3 py-1.5 rounded-full">
                      Perbesar
                    </span>
                  </div>
                </button>
              </div>
            )}

            {/* Meta */}
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-3">
                <span className="bg-orange-500 text-white text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full">
                  Infografis Data
                </span>
                {totalSlides > 0 && (
                  <span className="bg-slate-700 text-slate-300 text-[10px] font-semibold px-2.5 py-1 rounded-full">
                    {totalSlides} slide
                  </span>
                )}
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white leading-tight mb-3">
                {item.title}
              </h1>
              {item.caption && (
                <p className="text-sm text-orange-300 font-medium mb-3">{item.caption}</p>
              )}
              {item.description && (
                <p className="text-sm text-slate-300 leading-relaxed max-w-2xl">
                  {item.description}
                </p>
              )}
              <p className="text-xs text-slate-500 mt-4">
                {new Date(item.createdAt).toLocaleDateString('id-ID', {
                  day: 'numeric', month: 'long', year: 'numeric',
                })}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Slides ── */}
      <div className="bg-slate-50 py-12 px-4">
        <div className="max-w-7xl mx-auto">
          {totalSlides === 0 ? (
            /* No slides — just show cover enlarged */
            <div className="text-center py-8">
              {coverSrc && (
                <div className="max-w-2xl mx-auto">
                  <button
                    onClick={() => openLightbox(0)}
                    className="w-full rounded-2xl overflow-hidden group relative shadow-lg"
                    aria-label="Buka gambar"
                  >
                    <img
                      src={coverSrc}
                      alt={item.title}
                      className="w-full object-cover transition-transform duration-300 group-hover:scale-[1.01]"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/15 transition-colors flex items-center justify-center rounded-2xl">
                      <span className="opacity-0 group-hover:opacity-100 transition-opacity bg-black/60 text-white text-sm font-semibold px-4 py-2 rounded-full">
                        Klik untuk perbesar
                      </span>
                    </div>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-slate-800">
                  Data &amp; Visualisasi
                  <span className="ml-2 text-sm font-normal text-slate-400">({totalSlides} slide)</span>
                </h2>
                <span className="text-xs text-slate-400">Klik gambar untuk perbesar</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {slides
                  .filter(s => s.imageUrl)
                  .map((slide, i) => (
                    <SlideCard
                      key={i}
                      slide={slide}
                      index={i}
                      onOpen={(idx) => openLightbox(idx + 1)} // +1 because cover is index 0
                    />
                  ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* ── Back CTA ── */}
      <div className="bg-white border-t border-slate-100 py-8 px-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-slate-700">Eksplorasi data pemilu lainnya</p>
            <p className="text-xs text-slate-400 mt-0.5">Kembali ke halaman Data Pemilu untuk melihat statistik lengkap</p>
          </div>
          <Link
            to="/data-pemilu"
            className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold px-5 py-2.5 rounded-lg transition-colors shrink-0"
          >
            <ArrowBack />
            Data Pemilu
          </Link>
        </div>
      </div>
    </>
  );
}
