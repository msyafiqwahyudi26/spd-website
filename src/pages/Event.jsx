import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Hero from '../components/sections/Hero';
import Image from '../components/ui/Image';
import { INITIAL_EVENTS } from '../data/events';
import { api } from '@/lib/api';
import EmptyState from '../components/ui/EmptyState';
import { SkeletonCard } from '../components/ui/Skeleton';

function EventCard({ item }) {
  return (
    <article className="group bg-white border border-slate-100 rounded-xl overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:border-orange-100">
      <div className="h-44">
        <Image
          src={item.image ?? null}
          alt={item.title ?? ''}
          className="w-full h-full"
          gradient="from-orange-50 to-slate-100"
          icon="photo"
        />
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
          Lihat Detail
          <span className="transition-transform duration-200 group-hover:translate-x-1">→</span>
        </Link>
      </div>
    </article>
  );
}

function loadEventsFromStorage() {
  try {
    const stored = localStorage.getItem('spd_events');
    return stored ? JSON.parse(stored).filter(Boolean) : INITIAL_EVENTS;
  } catch {
    return INITIAL_EVENTS;
  }
}

export default function Event() {
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    api('/events')
      .then(data => setEvents(Array.isArray(data) ? data : INITIAL_EVENTS))
      .catch(() => setEvents(loadEventsFromStorage()))
      .finally(() => setIsLoading(false));

    const handleUpdate = () => setEvents(loadEventsFromStorage());
    window.addEventListener('events_updated', handleUpdate);
    const handleStorage = (e) => {
      if (e.key === 'spd_events' && e.newValue) {
        try { setEvents(JSON.parse(e.newValue).filter(Boolean)); } catch (_) {}
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => {
      window.removeEventListener('events_updated', handleUpdate);
      window.removeEventListener('storage', handleStorage);
    };
  }, []);

  return (
    <main className="min-h-screen bg-slate-50 fade-in-up">
      <Hero
        title="Event & Kegiatan"
        subtitle="Ikuti berbagai diskusi, webinar, dan kegiatan publik yang kami selenggarakan."
      />

      <section className="py-16">
        <div className="max-w-6xl mx-auto px-4">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map(i => <SkeletonCard key={i} />)}
            </div>
          ) : events.length === 0 ? (
            <div className="py-12">
              <EmptyState 
                title="Tidak ada event" 
                message="Belum ada event atau kegiatan yang dijadwalkan." 
              />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {events.map((item) => (
                <EventCard key={item.id} item={item} />
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
