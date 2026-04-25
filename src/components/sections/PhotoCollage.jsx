import { useEffect, useRef, useState } from 'react';
import { loadMediaByKey } from '@/lib/media';

// ── Motion params ────────────────────────────────────────────────────────
// Slow enough that the featured tile "breathes" without pulling the eye
// away from the rest of the page. Matches research-org tone, not news.
const FEATURE_INTERVAL_MS = 12_000;
const FEATURE_FADE_MS     = 1_000;

// Key layout:
//   collage.1..3 → featured pool (cycled)
//   collage.4..8 → static supporting tiles
// Total visible tiles: 6 (1 featured + 5 static).
const FEATURE_KEYS  = ['collage.1', 'collage.2', 'collage.3'];
const SUPPORT_KEYS  = ['collage.4', 'collage.5', 'collage.6', 'collage.7', 'collage.8'];
const TOTAL_VISIBLE = 1 + SUPPORT_KEYS.length;

// ── Motion preference hook ───────────────────────────────────────────────
function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handle = () => setReduced(mq.matches);
    handle();
    mq.addEventListener?.('change', handle);
    return () => mq.removeEventListener?.('change', handle);
  }, []);
  return reduced;
}

// ── Featured tile (cross-fades through N images) ─────────────────────────
function FeaturedTile({ slides, reduced }) {
  const [active, setActive] = useState(0);
  const timerRef = useRef(null);

  useEffect(() => {
    if (reduced || !slides || slides.length < 2) return undefined;
    timerRef.current = setInterval(() => {
      setActive((i) => (i + 1) % slides.length);
    }, FEATURE_INTERVAL_MS);
    return () => clearInterval(timerRef.current);
  }, [slides, reduced]);

  if (!slides || slides.length === 0) return null;
  const current = slides[active] || slides[0];

  return (
    <figure className="group bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm transition-all duration-300 ease-out hover:-translate-y-0.5 hover:shadow-md">
      <div className="aspect-[4/3] bg-slate-100 relative overflow-hidden">
        {slides.map((s, i) => (
          <img
            key={`${s.src}-${i}`}
            src={s.src}
            alt={s.caption || ''}
            loading={i === 0 ? 'eager' : 'lazy'}
            className="absolute inset-0 w-full h-full object-cover"
            style={{
              transition: reduced ? 'none' : `opacity ${FEATURE_FADE_MS}ms ease-in-out`,
              opacity: i === active ? 1 : 0,
            }}
          />
        ))}
      </div>
      {current.caption && (
        <figcaption className="px-4 py-3 text-xs text-slate-500 leading-snug border-t border-slate-100">
          {current.caption}
        </figcaption>
      )}
    </figure>
  );
}

// ── Static supporting tile ───────────────────────────────────────────────
function Tile({ slot }) {
  return (
    <figure className="group bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm transition-all duration-300 ease-out hover:-translate-y-0.5 hover:shadow-md">
      <div className="aspect-[4/3] bg-slate-100 overflow-hidden">
        <img
          src={slot.src}
          alt={slot.caption || ''}
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
        />
      </div>
      {slot.caption && (
        <figcaption className="px-4 py-3 text-xs text-slate-500 leading-snug border-t border-slate-100">
          {slot.caption}
        </figcaption>
      )}
    </figure>
  );
}

// ── Resolve a list of media keys (with optional fallback per-slot) ───────
async function resolveKeys(keys, fallbacks, offset = 0) {
  const resolved = await Promise.all(keys.map((k) => loadMediaByKey(k)));
  return resolved
    .map((row, i) => {
      if (row && row.url) {
        return { src: row.url, caption: row.filename || fallbacks[offset + i]?.caption || '' };
      }
      return fallbacks[offset + i] || null;
    })
    .filter(Boolean);
}

/**
 * Hybrid collage: structured 3×2 grid. Top-left tile slowly cross-fades
 * through up to 3 images (FEATURE_KEYS), other 5 tiles are static
 * (SUPPORT_KEYS). Reduced-motion users see the featured tile as a
 * single static image. Empty slots fall back to the caller-provided
 * `fallback` array (positional — featured uses fallbacks[0..2], tiles
 * use fallbacks[3..7]).
 *
 * Rationale:
 *   - Uniform aspect ratios preserve the institutional "curated photobook"
 *     feel; layout doesn't shuffle as images change.
 *   - Only one tile has motion — the eye learns where it is and the rest
 *     of the grid holds composition.
 *   - 12s interval is slow enough that casual readers on the page for
 *     15–20s notice only ambience, not rotation.
 */
export default function PhotoCollage({
  fallback = [],
  title = 'Momen Kegiatan',
  subtitle,
}) {
  const reduced = usePrefersReducedMotion();
  const [featureSlides, setFeatureSlides] = useState(() => fallback.slice(0, FEATURE_KEYS.length));
  const [supporting,    setSupporting]    = useState(() => fallback.slice(FEATURE_KEYS.length, TOTAL_VISIBLE + 2));

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      resolveKeys(FEATURE_KEYS, fallback, 0),
      resolveKeys(SUPPORT_KEYS, fallback, FEATURE_KEYS.length),
    ]).then(([feat, supp]) => {
      if (cancelled) return;
      if (feat.length > 0) setFeatureSlides(feat);
      if (supp.length > 0) setSupporting(supp);
    });
    return () => { cancelled = true; };
  }, [fallback]);

  if (!featureSlides || featureSlides.length === 0) {
    if (!supporting || supporting.length === 0) return null;
  }

  return (
    <section className="py-16 px-4 bg-slate-50 fade-in-up">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-slate-800">{title}</h2>
          {subtitle && (
            <p className="mt-3 text-slate-500 max-w-2xl mx-auto leading-relaxed">{subtitle}</p>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {featureSlides.length > 0 && (
            <FeaturedTile slides={featureSlides} reduced={reduced} />
          )}
          {supporting.map((slot, i) => (
            <Tile key={slot.src + i} slot={slot} />
          ))}
        </div>
      </div>
    </section>
  );
}
