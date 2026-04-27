import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Hero from '../components/sections/Hero';
import { api } from '@/lib/api';
import { resolveMediaUrl } from '@/lib/media';
import { useI18n } from '@/i18n';

/* ── Default icon for programs without an image ───────────────────────────── */
const DefaultIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 56 56" fill="none" className="w-12 h-12">
    <rect x="10" y="16" width="36" height="28" rx="6" fill="white" fillOpacity="0.25"/>
    <rect x="18" y="24" width="8" height="6" rx="2" fill="white" fillOpacity="0.7"/>
    <rect x="30" y="24" width="8" height="6" rx="2" fill="white" fillOpacity="0.7"/>
    <rect x="20" y="34" width="16" height="3" rx="1.5" fill="white" fillOpacity="0.5"/>
  </svg>
);

/* ── Program card (grid) ─────────────────────────────────────────────────── */
function ProgramCard({ program }) {
  const { t } = useI18n();
  const href = program.link || `/program/${program.slug}`;
  const isExternal = program.link && program.link.startsWith('http');
  const imgSrc = program.image ? resolveMediaUrl(program.image) : null;

  return (
    <article className="group flex flex-col bg-white rounded-2xl border border-slate-200 overflow-hidden hover:border-orange-200 hover:shadow-lg transition-all duration-300">
      {/* Thumbnail */}
      <Link
        to={isExternal ? undefined : href}
        href={isExternal ? href : undefined}
        target={isExternal ? '_blank' : undefined}
        rel={isExternal ? 'noopener noreferrer' : undefined}
        className="block relative h-44 overflow-hidden bg-gradient-to-br from-orange-400 to-orange-600 shrink-0"
      >
        {imgSrc ? (
          <>
            <img
              src={imgSrc}
              alt=""
              loading="lazy"
              className="absolute inset-0 w-full h-full object-cover opacity-90 transition-transform duration-300 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-br from-orange-500/30 to-transparent" />
          </>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center transition-transform duration-300 group-hover:scale-110">
            <DefaultIcon />
          </div>
        )}
        {program.category && (
          <div className="absolute top-3 left-3">
            <span className="text-[10px] font-bold tracking-widest uppercase bg-white/90 text-orange-600 px-2 py-0.5 rounded-full">
              {program.category}
            </span>
          </div>
        )}
      </Link>

      {/* Body */}
      <div className="flex flex-col flex-1 p-5">
        <h3 className="font-bold text-slate-800 text-base leading-snug mb-2 group-hover:text-orange-600 transition-colors">
          {program.title}
        </h3>
        {program.description && (
          <p className="text-sm text-slate-500 leading-relaxed mb-4 flex-1 line-clamp-3">
            {program.description}
          </p>
        )}
        <Link
          to={isExternal ? undefined : href}
          href={isExternal ? href : undefined}
          target={isExternal ? '_blank' : undefined}
          rel={isExternal ? 'noopener noreferrer' : undefined}
          className="text-sm font-semibold text-orange-500 hover:text-orange-600 transition-colors inline-flex items-center gap-1 self-start mt-auto"
        >
          {t('program.readMore')}
          <span className="inline-block transition-transform duration-200 group-hover:translate-x-1">→</span>
        </Link>
      </div>
    </article>
  );
}

/* ── Featured card (first / pinned program, full width) ──────────────────── */
function FeaturedCard({ program }) {
  const { t } = useI18n();
  const href = program.link || `/program/${program.slug}`;
  const isExternal = program.link && program.link.startsWith('http');
  const imgSrc = program.image ? resolveMediaUrl(program.image) : null;

  return (
    <Link
      to={isExternal ? undefined : href}
      href={isExternal ? href : undefined}
      target={isExternal ? '_blank' : undefined}
      rel={isExternal ? 'noopener noreferrer' : undefined}
      className="group relative flex flex-col sm:flex-row overflow-hidden rounded-2xl border border-orange-200 hover:border-orange-400 hover:shadow-xl transition-all duration-300 bg-white"
    >
      {/* Image */}
      <div className="relative w-full sm:w-96 shrink-0 h-56 sm:h-auto overflow-hidden bg-gradient-to-br from-orange-400 to-orange-600">
        {imgSrc ? (
          <>
            <img
              src={imgSrc}
              alt=""
              className="absolute inset-0 w-full h-full object-cover opacity-90 transition-transform duration-300 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-transparent to-black/10" />
          </>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <DefaultIcon />
          </div>
        )}
        <div className="absolute top-4 left-4">
          <span className="text-[10px] font-bold tracking-widest uppercase bg-orange-500 text-white px-2.5 py-1 rounded-full">
            {t('program.featured')}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-col justify-center p-8 flex-1">
        {program.category && (
          <span className="text-xs font-bold tracking-widest uppercase text-orange-500 mb-2">
            {program.category}
          </span>
        )}
        <h2 className="text-xl sm:text-2xl font-bold text-slate-800 leading-snug mb-3 group-hover:text-orange-600 transition-colors">
          {program.title}
        </h2>
        {program.description && (
          <p className="text-sm text-slate-500 leading-relaxed mb-5 line-clamp-3">
            {program.description}
          </p>
        )}
        <span className="text-sm font-semibold text-orange-500 group-hover:text-orange-600 inline-flex items-center gap-1.5 transition-colors">
          {t('program.viewThis')}
          <span className="transition-transform duration-200 group-hover:translate-x-1">→</span>
        </span>
      </div>
    </Link>
  );
}

/* ── Category tabs ───────────────────────────────────────────────────────── */
function CategoryTabs({ categories, active, onSelect }) {
  const { t } = useI18n();
  const allLabel = t('program.allCategories');
  if (categories.length <= 1) return null;
  return (
    <div className="flex flex-wrap gap-2 mb-8">
      {[allLabel, ...categories].map((cat) => (
        <button
          key={cat}
          onClick={() => onSelect(cat === allLabel ? null : cat)}
          className={`text-xs font-semibold px-4 py-2 rounded-full border transition-all duration-200 ${
            (cat === allLabel && active === null) || cat === active
              ? 'bg-orange-500 border-orange-500 text-white shadow-sm'
              : 'bg-white border-slate-200 text-slate-600 hover:border-orange-300 hover:text-orange-500'
          }`}
        >
          {cat}
        </button>
      ))}
    </div>
  );
}

/* ── Skeleton ────────────────────────────────────────────────────────────── */
function Skeleton() {
  return (
    <div className="animate-pulse grid grid-cols-1 md:grid-cols-3 gap-6">
      {[1,2,3].map(i => (
        <div key={i} className="rounded-2xl bg-white border border-slate-100 overflow-hidden">
          <div className="h-44 bg-slate-200" />
          <div className="p-5 space-y-2">
            <div className="h-3.5 bg-slate-200 rounded w-3/4" />
            <div className="h-2.5 bg-slate-100 rounded w-full" />
            <div className="h-2.5 bg-slate-100 rounded w-2/3" />
          </div>
        </div>
      ))}
    </div>
  );
}

/* ── Page ────────────────────────────────────────────────────────────────── */
export default function Program() {
  const { t } = useI18n();
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState(null);

  useEffect(() => {
    let cancelled = false;
    api('/programs')
      .then((data) => { if (!cancelled) setPrograms(Array.isArray(data) ? data : []); })
      .catch(() => { if (!cancelled) setPrograms([]); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  // Unique categories (non-empty only)
  const categories = [...new Set(programs.map(p => p.category).filter(Boolean))];

  // Filtered list
  const filtered = activeCategory
    ? programs.filter(p => p.category === activeCategory)
    : programs;

  const featured = filtered[0] ?? null;
  const rest = filtered.slice(1);

  return (
    <>
      <Hero
        title={t('program.hero.title')}
        subtitle={t('program.hero.subtitle')}
      />

      <section className="py-16 px-4 bg-slate-50">
        <div className="max-w-6xl mx-auto">

          {/* Category filter */}
          <CategoryTabs
            categories={categories}
            active={activeCategory}
            onSelect={setActiveCategory}
          />

          {loading ? (
            <Skeleton />
          ) : filtered.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-slate-400 text-sm">
                {activeCategory ? t('program.noCategory') : t('program.noPrograms')}
              </p>
            </div>
          ) : (
            <div className="space-y-10">
              {/* Featured (first card) */}
              {featured && <FeaturedCard program={featured} />}

              {/* Grid of remaining */}
              {rest.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {rest.map(p => <ProgramCard key={p.id} program={p} />)}
                </div>
              )}
            </div>
          )}

          {/* CTA */}
          {!loading && filtered.length > 0 && (
            <div className="mt-12 pt-10 border-t border-slate-200 text-center">
              <p className="text-sm text-slate-500 mb-4">
                {t('program.contributeText')}
              </p>
              <Link
                to="/kontak"
                className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-bold px-6 py-3 rounded-lg transition-colors shadow-sm"
              >
                {t('program.contact')}
                <span>→</span>
              </Link>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
