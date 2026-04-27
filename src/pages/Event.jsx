import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import Hero from '../components/sections/Hero';
import Image from '../components/ui/Image';
import { INITIAL_EVENTS } from '../data/events';
import { api } from '@/lib/api';
import EmptyState from '../components/ui/EmptyState';
import { SkeletonCard } from '../components/ui/Skeleton';
import { useI18n } from '@/i18n';

const now = new Date();

function isPast(item) {
  if (item.startsAt) return new Date(item.startsAt) < now;
  const d = new Date(item.date);
  return !isNaN(d) ? d < now : false;
}

function EventCard({ item, index }) {
  const { t } = useI18n();
  const past = isPast(item);

  return (
    <article
      className="group bg-white border border-slate-100 rounded-xl overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:border-orange-100 animate-fade-up"
      style={{ animationDelay: `${Math.min(index * 80, 400)}ms` }}
    >
      <div className="h-44 relative">
        <Image
          src={item.image ?? null}
          alt={item.title ?? ''}
          className="w-full h-full"
          gradient="from-orange-50 to-slate-100"
          icon="photo"
        />
        {past && (
          <span className="absolute top-3 left-3 px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wide bg-slate-800/70 text-white backdrop-blur-sm">
            SUDAH LEWAT
          </span>
        )}
      </div>
      <div className="p-5 flex flex-col">
        <span className="text-xs font-bold tracking-widest uppercase text-orange-500 mb-2">EVENT</span>
        <h3 className="font-bold text-slate-800 text-base leading-snug mb-3">{item.title ?? ''}</h3>
        <div className="flex flex-col gap-1.5 mb-4 text-xs text-slate-500">
          {item.date && (
            <span className="flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5 shrink-0 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
              </svg>
              {item.date}
            </span>
          )}
          {item.location && (
            <span className="flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5 shrink-0 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
              </svg>
              {item.location}
            </span>
          )}
        </div>
        <p className="text-sm text-slate-500 leading-relaxed flex-1 line-clamp-3 mb-4">
          {item.description ?? ''}
        </p>
        <Link
          to={`/event/${item.slug || String(item.id)}`}
          className="text-sm font-semibold text-orange-500 hover:text-orange-600 transition-colors duration-200 inline-flex items-center gap-1 self-start"
        >
          {t('common.viewDetail')}
          <span className="transition-transform duration-200 group-hover:translate-x-1">→</span>
        </Link>
      </div>
    </article>
  );
}

export default function Event() {
  const { t } = useI18n();
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('semua');

  const FILTERS = [
    { id: 'semua',    label: t('event.filterAll') },
    { id: 'upcoming', label: t('event.filterUpcoming') },
    { id: 'past',     label: t('event.filterPast') },
  ];

  useEffect(() => {
    api('/events')
      .then(data => setEvents(Array.isArray(data) ? data : INITIAL_EVENTS))
      .catch(() => {
        try {
          const stored = localStorage.getItem('spd_events');
          setEvents(stored ? JSON.parse(stored).filter(Boolean) : INITIAL_EVENTS);
        } catch {
          setEvents(INITIAL_EVENTS);
        }
      })
      .finally(() => setIsLoading(false));
  }, []);

  const filtered = useMemo(() => {
    let result = [...events];

    if (filter === 'upcoming') {
      result = result.filter(e => !isPast(e));
    } else if (filter === 'past') {
      result = result.filter(e => isPast(e));
    }

    if (search.trim()) {
      const q = search.trim().toLowerCase();
      result = result.filter(e =>
        (e.title || '').toLowerCase().includes(q) ||
        (e.location || '').toLowerCase().includes(q) ||
        (e.description || '').toLowerCase().includes(q)
      );
    }

    return result;
  }, [events, filter, search]);

  return (
    <div className="min-h-screen bg-slate-50 fade-in-up">
      <Hero
        title={t('event.title')}
        subtitle={t('event.subtitle')}
      />

      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4">

          {/* Search + Filter Bar */}
          <div className="flex flex-col sm:flex-row gap-3 mb-8">
            <div className="relative flex-1">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="m21 21-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0Z" />
              </svg>
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder={t('event.search')}
                className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-colors bg-white"
              />
            </div>
            <div className="flex gap-2 shrink-0">
              {FILTERS.map(f => (
                <button
                  key={f.id}
                  onClick={() => setFilter(f.id)}
                  className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 border ${
                    filter === f.id
                      ? 'bg-orange-500 text-white border-orange-500 shadow-sm'
                      : 'bg-white text-slate-600 border-slate-200 hover:border-orange-300 hover:text-orange-600'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map(i => <SkeletonCard key={i} />)}
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-12">
              <EmptyState
                title={
                  search
                    ? 'Event tidak ditemukan'
                    : filter === 'upcoming'
                    ? 'Tidak ada event mendatang'
                    : filter === 'past'
                    ? 'Tidak ada event yang sudah lewat'
                    : t('event.empty')
                }
                message={
                  search
                    ? `Tidak ada event yang cocok dengan "${search}".`
                    : filter === 'upcoming'
                    ? 'Semua event sudah berlalu. Cek tab "Sudah Berlalu" atau "Semua".'
                    : t('event.empty')
                }
                actionText={filter !== 'semua' || search ? 'Tampilkan Semua Event' : null}
                onAction={() => { setFilter('semua'); setSearch(''); }}
              />
            </div>
          ) : (
            <>
              <p className="text-sm text-slate-400 mb-4">
                {filtered.length} {t('event.found')}
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filtered.map((item, i) => (
                  <EventCard key={item.id} item={item} index={i} />
                ))}
              </div>
            </>
          )}
        </div>
      </section>
    </div>
  );
}
