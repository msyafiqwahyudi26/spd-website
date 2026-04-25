import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { useCountUp, parseNumericPrefix } from '@/hooks/useCountUp';

function AnimatedValue({ rawValue }) {
  // "100+" → animate 100, keep the suffix static.
  const numeric = parseNumericPrefix(rawValue);
  const suffix = numeric !== null && typeof rawValue === 'string'
    ? rawValue.slice(String(numeric).length)
    : '';
  const animated = useCountUp(numeric ?? 0, { enabled: numeric !== null });

  if (numeric === null) return <>{rawValue ?? '—'}</>;
  return <>{animated.toLocaleString('id-ID')}{suffix}</>;
}

/**
 * Public stats banner. Pulls from /api/stats. If the API is empty or
 * unreachable, falls back to the caller-provided list so About pages
 * always render something.
 */
export default function StatsBanner({ fallback = [] }) {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    let cancelled = false;
    api('/stats')
      .then((rows) => { if (!cancelled) setStats(Array.isArray(rows) ? rows : []); })
      .catch(()   => { if (!cancelled) setStats([]); });
    return () => { cancelled = true; };
  }, []);

  const list = stats === null
    ? fallback
    : (stats.length > 0 ? stats : fallback);

  if (!list || list.length === 0) return null;

  return (
    <section className="bg-orange-500 py-14 px-4">
      <div className="max-w-6xl mx-auto grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-8">
        {list.map((s) => (
          <div key={s.id} className="text-center">
            <p className="text-3xl font-extrabold text-white mb-1">
              <AnimatedValue rawValue={s.value} />
            </p>
            <p className="text-xs text-white/80 tracking-wide">{s.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
