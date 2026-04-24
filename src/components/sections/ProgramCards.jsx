import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '@/lib/api';
import EmptyState from '../ui/EmptyState';
import { SkeletonCard } from '../ui/Skeleton';
import { resolveMedia } from '@/config/media';

const DEFAULT_ICON = (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 56 56" fill="none" className="w-14 h-14">
    <rect x="10" y="16" width="36" height="28" rx="6" fill="#1E293B"/>
    <rect x="18" y="24" width="8" height="6" rx="2" fill="white"/>
    <rect x="30" y="24" width="8" height="6" rx="2" fill="white"/>
    <rect x="20" y="34" width="16" height="3" rx="1.5" fill="white"/>
  </svg>
);

function ProgramCard({ program }) {
  // Programs are long-term initiatives. An admin-provided `link` overrides
  // the default /program route when the program lives elsewhere (e.g. an
  // external campaign page or a dedicated publication).
  const href = program.link ? program.link : '/program';
  const image = resolveMedia('', program.image);

  return (
    <article className="group flex flex-col">
      <div className="relative overflow-hidden bg-gradient-to-br from-orange-500 to-orange-500 rounded-xl h-48 mb-5 transition-all duration-300 ease-out group-hover:-translate-y-2 group-hover:from-orange-500 group-hover:to-orange-600 group-hover:shadow-2xl group-hover:shadow-orange-300/50">
        {image ? (
          <>
            <img
              src={image}
              alt=""
              loading="lazy"
              className="absolute inset-0 w-full h-full object-cover opacity-80 transition-transform duration-300 ease-out group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-br from-orange-500/50 to-orange-600/40" aria-hidden="true" />
          </>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center transition-transform duration-300 ease-out group-hover:scale-110 group-hover:drop-shadow-lg">
            {DEFAULT_ICON}
          </div>
        )}
      </div>

      <h3 className="font-bold text-slate-800 mb-2 text-base leading-snug transition-colors duration-200 group-hover:text-orange-600">
        {program.title}
      </h3>
      <p className="text-sm text-slate-500 leading-relaxed mb-4 flex-1">
        {program.description}
      </p>
      <Link
        to={href}
        className="text-sm font-semibold text-orange-500 hover:text-orange-600 transition-colors duration-200 inline-flex items-center gap-1 self-start"
      >
        Selengkapnya
        <span className="inline-block transition-transform duration-200 group-hover:translate-x-1">→</span>
      </Link>
    </article>
  );
}

/**
 * Program grid.
 *
 * Props:
 *   limit — max number of cards to render (default null = show all).
 *           Landing page passes 3; /program page leaves it unset.
 *   showIntro — show the "Program dan Inisiatif" heading block. Default true;
 *               /program page already has its own hero, so it sets false.
 */
export default function ProgramCards({ limit = null, showIntro = true }) {
  const [programs, setPrograms] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Programs have their own endpoint now (separate from dated events).
    // If the admin hasn't created any, render EmptyState below instead of
    // substituting events — showing events-as-programs was misleading.
    const fetchPrograms = async () => {
      setIsLoading(true);
      try {
        const data = await api('/programs');
        setPrograms(Array.isArray(data) ? data : []);
      } catch {
        setPrograms([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchPrograms();
  }, []);

  const visible = typeof limit === 'number' ? programs.slice(0, limit) : programs;

  return (
    <section className="py-16 px-4 bg-slate-50 fade-in-up">
      <div className="max-w-6xl mx-auto">
        {showIntro && (
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-800">Program dan Inisiatif</h2>
            <p className="mt-4 text-slate-500 max-w-2xl mx-auto leading-relaxed">
              Berbagai inisiatif dan program yang kami jalankan untuk memperkuat ekosistem
              demokrasi dan reformasi kepemiluan di Indonesia.
            </p>
          </div>
        )}

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => <SkeletonCard key={i} />)}
          </div>
        ) : visible.length === 0 ? (
          <EmptyState
            title="Tidak ada program"
            message="Belum ada program atau inisiatif yang dapat ditampilkan saat ini."
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {visible.map((program) => (
              <ProgramCard key={program.id} program={program} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
