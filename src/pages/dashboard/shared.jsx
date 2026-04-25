import { useEffect } from 'react';

/* ── Constants ───────────────────────────────────────────────────────────── */

import { getCategoriesSync } from '@/hooks/useSettings';

export const inputCls = 'w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500 transition-colors bg-white disabled:opacity-50';

/* ── Slug helpers ────────────────────────────────────────────────────────── */

export function toSlug(title) {
  return (title || '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim() || 'item';
}

export function makeUniqueSlug(base, existingList, excludeId = null) {
  const taken = new Set(
    existingList
      .filter(p => p.id !== excludeId)
      .map(p => p.slug)
      .filter(Boolean)
  );
  if (!taken.has(base)) return base;
  let i = 2;
  while (taken.has(`${base}-${i}`)) i++;
  return `${base}-${i}`;
}

/* ── UI atoms ────────────────────────────────────────────────────────────── */

export function Toast({ message, onDone }) {
  useEffect(() => {
    const t = setTimeout(onDone, 3000);
    return () => clearTimeout(t);
  }, [onDone]);
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2.5 bg-slate-800 text-white text-sm font-medium px-5 py-3 rounded-xl shadow-xl pointer-events-none">
      <svg className="w-4 h-4 text-emerald-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
      </svg>
      {message}
    </div>
  );
}

export function Spinner({ small }) {
  const sz = small ? 'w-3.5 h-3.5' : 'w-5 h-5';
  return (
    <svg className={`${sz} animate-spin`} fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );
}

export function Field({ label, hint, error, children }) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-1">{label}</label>
      {children}
      {hint  && !error && <p className="mt-1 text-xs text-slate-400">{hint}</p>}
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
}

export function CategoryBadge({ category }) {
  const CATEGORIES = getCategoriesSync();
  const meta = CATEGORIES.find(c => c.value === category);
  return (
    <span className={`inline-block px-2 py-0.5 rounded text-xs font-bold tracking-wide ${meta?.bg ?? 'bg-slate-100'} ${meta?.color ?? 'text-slate-500'}`}>
      {category ?? '—'}
    </span>
  );
}

export function ErrorState({ message = 'Gagal memuat data', onRetry }) {
  return (
    <div className="py-16 text-center">
      <svg className="w-10 h-10 mx-auto mb-3 text-red-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
          d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
      </svg>
      <p className="text-sm font-medium text-slate-700">{message}</p>
      <p className="text-xs text-slate-400 mt-1">Periksa koneksi atau coba muat ulang.</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-4 text-xs font-semibold text-orange-500 hover:text-orange-600 border border-orange-200 hover:border-orange-400 px-4 py-1.5 rounded-lg transition-colors"
        >
          Coba Lagi
        </button>
      )}
    </div>
  );
}

export function SkeletonRows({ count = 3 }) {
  return (
    <div className="divide-y divide-slate-100">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="px-6 py-4 flex items-center gap-4 animate-pulse">
          <div className="flex-1 space-y-2">
            <div className="h-3.5 bg-slate-100 rounded w-2/3" />
            <div className="h-2.5 bg-slate-100 rounded w-1/4" />
          </div>
          <div className="h-5 w-20 bg-slate-100 rounded" />
          <div className="h-3 w-24 bg-slate-100 rounded" />
          <div className="flex gap-2">
            <div className="h-7 w-12 bg-slate-100 rounded-lg" />
            <div className="h-7 w-14 bg-slate-100 rounded-lg" />
          </div>
        </div>
      ))}
    </div>
  );
}
