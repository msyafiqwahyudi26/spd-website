import { useRef, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Button from '../ui/Button';

import { api } from '@/lib/api';
import { INITIAL_PUBLIKASI } from '../../data/publikasi';
import EmptyState from '../ui/EmptyState';
import { SkeletonCard } from '../ui/Skeleton';
import { getCategoriesSync } from '@/hooks/useSettings';
import { resolveMediaUrl } from '@/lib/media';
import { useI18n } from '@/i18n';

const parseDate = (dateStr) => {
  if (!dateStr) return 0;
  const months = {
    'Januari': 0, 'Februari': 1, 'Maret': 2, 'April': 3, 'Mei': 4, 'Juni': 5,
    'Juli': 6, 'Agustus': 7, 'September': 8, 'Oktober': 9, 'November': 10, 'Desember': 11
  };
  const parts = dateStr.split(' ');
  if (parts.length === 3) {
    const day = parseInt(parts[0], 10);
    const month = months[parts[1]];
    const year = parseInt(parts[2], 10);
    return new Date(year, month, day).getTime();
  }
  return new Date(dateStr).getTime() || 0;
};

const safeFormatDate = (dateStr) => {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  return isNaN(d.getTime()) ? '—' : d.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
};

function getDetailPath(item) {
  const slug = item.slug || item.href?.split('/').pop() || String(item.id);
  return `/publikasi/${slug}`;
}

function PublikasiCard({ item, isDragging }) {
  const { category, categoryColor, title, description, date, image } = item;
  const imgSrc = image ? resolveMediaUrl(image) : null;

  return (
    <article className="group h-full bg-white border border-slate-200 rounded-2xl overflow-hidden flex flex-col shadow-sm transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-lg hover:border-orange-200">
      {imgSrc ? (
        <div className="relative h-44 overflow-hidden bg-slate-100 shrink-0">
          <img
            src={imgSrc}
            alt={title}
            loading="lazy"
            className="w-full h-full object-cover transition-transform duration-300 ease-out group-hover:scale-105"
          />
        </div>
      ) : (
        <div className="h-44 bg-gradient-to-br from-orange-50 to-amber-50 shrink-0 flex items-center justify-center">
          <svg className="w-10 h-10 text-orange-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
      )}
      <div className="p-5 flex flex-col flex-1">
        <span className={`text-xs font-bold tracking-widest uppercase mb-2 ${categoryColor}`}>
          {category}
        </span>
        <h3 className="font-bold text-slate-800 text-sm leading-snug mb-3 shrink-0 line-clamp-2">
          {title}
        </h3>
        <p className="text-xs text-slate-500 leading-relaxed mb-4 flex-1 line-clamp-3">
          {description}
        </p>
        <div className="flex items-center justify-between pt-3 border-t border-slate-100 shrink-0">
          <span className="text-xs text-slate-400">{date}</span>
          <Link
            to={getDetailPath(item)}
            onClick={(e) => isDragging && e.preventDefault()}
            className="text-xs font-bold text-orange-500 hover:text-orange-600 transition-colors duration-200 inline-flex items-center gap-1"
          >
            Baca
            <span className="transition-transform duration-200 group-hover:translate-x-0.5">→</span>
          </Link>
        </div>
      </div>
    </article>
  );
}

function ArrowButton({ direction, onClick, disabled }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-label={direction === 'left' ? 'Sebelumnya' : 'Berikutnya'}
      className="w-10 h-10 rounded-full border border-slate-200 bg-white flex items-center justify-center text-slate-500 transition-all duration-200 hover:border-orange-500 hover:text-orange-500 hover:bg-orange-50 active:scale-90 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:border-slate-200 disabled:hover:text-slate-500 disabled:hover:bg-white"
    >
      {direction === 'left' ? (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      ) : (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      )}
    </button>
  );
}

export default function PublikasiSection({ isPage = false, contentTypeFilter = null }) {
  const { t } = useI18n();
  const trackRef = useRef(null);
  const drag = useRef({ active: false, startX: 0, scrollLeft: 0, moved: false, vel: 0, lastX: 0, lastT: 0, raf: null });
  const [grabbing, setGrabbing] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Semua');
  const [sortOrder, setSortOrder] = useState('newest');

  const [publikasiList, setPublikasiList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchPublikasi = async () => {
    setIsLoading(true);
    try {
      const data = await api('/publications');
      const safeData = Array.isArray(data) ? data : (data?.data || []);
      const categories = getCategoriesSync();
      const formatted = safeData.map(item => {
        const catObj = categories.find(c => c.value === item.category);
        return {
          ...item,
          date: item.date || safeFormatDate(item.createdAt),
          categoryColor: catObj?.color || 'text-orange-500'
        };
      });
      setPublikasiList(formatted);
    } catch (e) {
      console.warn('API fetch failed, using fallback data for Publikasi');
      setPublikasiList(INITIAL_PUBLIKASI);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPublikasi();
    const handleUpdate = () => fetchPublikasi();
    window.addEventListener('publikasi_updated', handleUpdate);
    return () => window.removeEventListener('publikasi_updated', handleUpdate);
  }, []);

  const baseList = contentTypeFilter
    ? publikasiList.filter(p => p.contentType === contentTypeFilter)
    : publikasiList;

  const categories = ['Semua', ...Array.from(new Set(baseList.map((p) => p.category)))];

  const filteredAndSorted = baseList.filter((item) => {
    if (!item) return false;
    const title = (item.title ?? '').toLowerCase();
    const description = (item.description ?? '').toLowerCase();
    const query = searchQuery.toLowerCase();
    const matchesSearch = title.includes(query) || description.includes(query);
    const matchesCategory = selectedCategory === 'Semua' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  }).sort((a, b) => {
    const timeA = parseDate(a.date);
    const timeB = parseDate(b.date);
    return sortOrder === 'newest' ? timeB - timeA : timeA - timeB;
  });

  const onMouseDown = (e) => {
    if (isPage) return;
    if (drag.current.raf) cancelAnimationFrame(drag.current.raf);
    const track = trackRef.current;
    track.style.scrollSnapType = 'none'; // freeze snap while dragging
    drag.current = { active: true, startX: e.pageX, scrollLeft: track.scrollLeft, moved: false, vel: 0, lastX: e.pageX, lastT: Date.now(), raf: null };
    setGrabbing(true);
  };

  const onMouseMove = (e) => {
    if (isPage || !drag.current.active) return;
    const dx = e.pageX - drag.current.startX;
    if (Math.abs(dx) > 4) drag.current.moved = true;
    const now = Date.now();
    const dt = now - drag.current.lastT;
    if (dt > 0) drag.current.vel = (drag.current.lastX - e.pageX) / dt;
    drag.current.lastX = e.pageX;
    drag.current.lastT = now;
    trackRef.current.scrollLeft = drag.current.scrollLeft - dx;
  };

  const onMouseUp = () => {
    if (isPage) return;
    drag.current.active = false;
    setGrabbing(false);
    const track = trackRef.current;
    if (!track) return;
    // Momentum coast
    let vel = drag.current.vel * 120;
    const coast = () => {
      if (Math.abs(vel) < 0.5) {
        track.style.scrollSnapType = ''; // re-enable snap when settled
        return;
      }
      track.scrollLeft += vel;
      vel *= 0.88;
      drag.current.raf = requestAnimationFrame(coast);
    };
    drag.current.raf = requestAnimationFrame(coast);
  };

  const scrollBy = (direction) => {
    const track = trackRef.current;
    if (!track) return;
    const cardWidth = track.querySelector('[data-card]')?.offsetWidth ?? 280;
    track.scrollBy({ left: direction * (cardWidth + 16), behavior: 'smooth' });
    // Ensure snap stays active during button-triggered scrolls
    track.style.scrollSnapType = '';
  };

  return (
    <section className="py-16 bg-white fade-in-up overflow-hidden">
      <div className="max-w-7xl mx-auto px-4">

        {/* Header and Controls */}
        <div className="flex flex-col gap-6 mb-10">

          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4">
            <div>
              {!isPage && <h2 className="text-3xl font-bold text-slate-800">{t('pub.title')}</h2>}
              {!isPage && (
                <p className="mt-3 text-slate-500 max-w-xl leading-relaxed">
                  {t('pub.desc')}
                </p>
              )}
            </div>
            {!isPage && (
              <div className="flex gap-2 shrink-0 self-end">
                <ArrowButton direction="left" onClick={() => scrollBy(-1)} />
                <ArrowButton direction="right" onClick={() => scrollBy(1)} />
              </div>
            )}
          </div>

          {/* Interactivity Bar */}
          <div className="flex flex-col md:flex-row gap-4 items-center bg-slate-50 p-4 rounded-xl border border-slate-100">
            {/* Search */}
            <div className="w-full md:flex-1 relative">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder={t('pub.search')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 text-sm transition-colors"
              />
            </div>

            {/* Category Filter */}
            <div className="w-full md:w-48 shrink-0 relative">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full appearance-none pl-4 pr-9 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 text-sm bg-white cursor-pointer transition-colors"
              >
                {categories.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
              <svg className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>

            {/* Sort */}
            <div className="w-full md:w-40 shrink-0 relative">
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
                className="w-full appearance-none pl-4 pr-9 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 text-sm bg-white cursor-pointer transition-colors"
              >
                <option value="newest">{t('pub.sortNewest')}</option>
                <option value="oldest">{t('pub.sortOldest')}</option>
              </select>
              <svg className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>

      </div>

      {isLoading ? (
        <div className={`max-w-7xl mx-auto px-4 grid grid-cols-1 ${isPage ? 'sm:grid-cols-2 lg:grid-cols-3' : 'md:grid-cols-3'} gap-6`}>
          {[1, 2, 3].map((i) => <SkeletonCard key={i} />)}
        </div>
      ) : filteredAndSorted.length === 0 ? (
        <EmptyState
          title={t('pub.emptyTitle')}
          message={t('pub.empty')}
          actionText={searchQuery || selectedCategory !== 'Semua' ? "Hapus Filter" : null}
          onAction={() => {
            setSearchQuery('');
            setSelectedCategory('Semua');
          }}
        />
      ) : isPage ? (
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAndSorted.map((item) => (
              <PublikasiCard key={item.id} item={item} isDragging={false} />
            ))}
          </div>
        </div>
      ) : (
        <div className="relative">
          {/* Carousel track — full-bleed, cards reach both edges */}
          <div
            ref={trackRef}
            className={`flex gap-4 overflow-x-auto scrollbar-hide snap-x snap-mandatory pb-3 ${grabbing ? 'cursor-grabbing' : 'cursor-grab'}`}
            style={{ userSelect: 'none', scrollPaddingLeft: '1rem' }}
            onMouseDown={onMouseDown}
            onMouseMove={onMouseMove}
            onMouseUp={onMouseUp}
            onMouseLeave={onMouseUp}
          >
            {/* Left spacer so first card starts with a breath of space from edge */}
            <div className="shrink-0 w-4 sm:w-6" aria-hidden="true" />
            {filteredAndSorted.map((item) => (
              <div
                key={item.id}
                data-card
                className="snap-start shrink-0 w-[calc(100vw-5rem)] sm:w-64 md:w-72 lg:w-[280px]"
              >
                <PublikasiCard item={item} isDragging={drag.current.moved} />
              </div>
            ))}
            {/* Right spacer so last card doesn't butt against the fade */}
            <div className="shrink-0 w-12 sm:w-24" aria-hidden="true" />
          </div>
          {/* Right-side fade gradient */}
          <div className="absolute right-0 top-0 bottom-3 w-24 bg-gradient-to-l from-white via-white/70 to-transparent pointer-events-none" aria-hidden="true" />
        </div>
      )}

      {!isPage && (
        <div className="max-w-7xl mx-auto px-4 mt-10 flex justify-center">
          <Button href="/publikasi" variant="primary">
            {t('pub.viewAll')}
          </Button>
        </div>
      )}
    </section>
  );
}
