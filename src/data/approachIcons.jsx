/**
 * Shared icon registry for Approach and Core Value sections.
 * Used in both the public frontend (FeatureCards, VisiMisi) and the
 * admin dashboard icon picker (SettingsManager).
 *
 * Each key is a function component so className (size + color) can
 * be controlled at the call site via Tailwind.
 */

export const ICON_KEYS = [
  'collaboration', 'data', 'youth', 'policy',
  'megaphone', 'eye', 'vote', 'lightbulb',
  'book', 'globe', 'shield', 'users',
];

export const ICON_LABELS = {
  collaboration: 'Kolaborasi',
  data:          'Data',
  youth:         'Komunitas',
  policy:        'Kebijakan',
  megaphone:     'Advokasi',
  eye:           'Transparansi',
  vote:          'Pemilu',
  lightbulb:     'Inovasi',
  book:          'Riset',
  globe:         'Jaringan',
  shield:        'Integritas',
  users:         'Inklusif',
};

/* ── Original 4 icons ──────────────────────────────────────────────────── */

export function IconCollaboration({ className = 'w-10 h-10' }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" fill="none" className={className} aria-hidden="true">
      <circle cx="16" cy="16" r="6" fill="currentColor" opacity="0.2" />
      <circle cx="32" cy="16" r="6" fill="currentColor" opacity="0.2" />
      <circle cx="24" cy="30" r="6" fill="currentColor" opacity="0.2" />
      <circle cx="16" cy="16" r="4" fill="currentColor" />
      <circle cx="32" cy="16" r="4" fill="currentColor" />
      <circle cx="24" cy="30" r="4" fill="currentColor" />
      <line x1="16" y1="16" x2="32" y2="16" stroke="currentColor" strokeWidth="2" />
      <line x1="16" y1="16" x2="24" y2="30" stroke="currentColor" strokeWidth="2" />
      <line x1="32" y1="16" x2="24" y2="30" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}

export function IconData({ className = 'w-10 h-10' }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" fill="none" className={className} aria-hidden="true">
      <rect x="6" y="30" width="8" height="12" rx="2" fill="currentColor" />
      <rect x="20" y="20" width="8" height="22" rx="2" fill="currentColor" opacity="0.7" />
      <rect x="34" y="12" width="8" height="30" rx="2" fill="currentColor" opacity="0.4" />
      <polyline points="10,28 24,18 38,10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="10" cy="28" r="2" fill="currentColor" />
      <circle cx="24" cy="18" r="2" fill="currentColor" />
      <circle cx="38" cy="10" r="2" fill="currentColor" />
    </svg>
  );
}

export function IconYouth({ className = 'w-10 h-10' }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" fill="none" className={className} aria-hidden="true">
      <circle cx="24" cy="14" r="5" fill="currentColor" />
      <circle cx="10" cy="18" r="4" fill="currentColor" opacity="0.6" />
      <circle cx="38" cy="18" r="4" fill="currentColor" opacity="0.6" />
      <path d="M14 38c0-5.523 4.477-10 10-10s10 4.477 10 10" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" fill="none" />
      <path d="M4 40c0-4 2.686-7.371 6.381-8.508" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.6" />
      <path d="M44 40c0-4-2.686-7.371-6.381-8.508" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.6" />
    </svg>
  );
}

export function IconPolicy({ className = 'w-10 h-10' }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" fill="none" className={className} aria-hidden="true">
      <path d="M12 6h18l6 6v30H12z" fill="currentColor" opacity="0.15" />
      <path d="M12 6h18l6 6v30H12z" stroke="currentColor" strokeWidth="2" fill="none" />
      <line x1="18" y1="20" x2="30" y2="20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <line x1="18" y1="26" x2="30" y2="26" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <line x1="18" y1="32" x2="26" y2="32" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

/* ── New icons ─────────────────────────────────────────────────────────── */

export function IconMegaphone({ className = 'w-10 h-10' }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" fill="none" className={className} aria-hidden="true">
      <path d="M8 18v12h6l14 8V10L14 18H8z" fill="currentColor" opacity="0.2" />
      <path d="M8 18v12h6l14 8V10L14 18H8z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      <path d="M36 16c2.5 2 4 5 4 8s-1.5 6-4 8" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" fill="none" />
      <path d="M36 20c1.2 1 2 2.9 2 4s-.8 3-2 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.6" />
      <line x1="12" y1="30" x2="10" y2="40" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <line x1="18" y1="30" x2="16" y2="40" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export function IconEye({ className = 'w-10 h-10' }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" fill="none" className={className} aria-hidden="true">
      <path d="M6 24C6 24 12 10 24 10s18 14 18 14-6 14-18 14S6 24 6 24z" fill="currentColor" opacity="0.15" />
      <path d="M6 24C6 24 12 10 24 10s18 14 18 14-6 14-18 14S6 24 6 24z" stroke="currentColor" strokeWidth="2" fill="none" />
      <circle cx="24" cy="24" r="6" fill="currentColor" opacity="0.3" />
      <circle cx="24" cy="24" r="4" fill="currentColor" />
      <circle cx="26" cy="22" r="1.5" fill="white" opacity="0.8" />
    </svg>
  );
}

export function IconVote({ className = 'w-10 h-10' }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" fill="none" className={className} aria-hidden="true">
      <rect x="8" y="28" width="32" height="14" rx="3" fill="currentColor" opacity="0.2" />
      <rect x="8" y="28" width="32" height="14" rx="3" stroke="currentColor" strokeWidth="2" />
      <path d="M20 28V18H14l10-12 10 12h-6v10" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" fill="none" />
      <line x1="16" y1="34" x2="32" y2="34" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.6" />
      <line x1="16" y1="38" x2="26" y2="38" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.4" />
    </svg>
  );
}

export function IconLightbulb({ className = 'w-10 h-10' }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" fill="none" className={className} aria-hidden="true">
      <path d="M24 8a12 12 0 0 1 8 20.5c-1.5 1.5-2 3-2 4.5H18c0-1.5-.5-3-2-4.5A12 12 0 0 1 24 8z" fill="currentColor" opacity="0.2" />
      <path d="M24 8a12 12 0 0 1 8 20.5c-1.5 1.5-2 3-2 4.5H18c0-1.5-.5-3-2-4.5A12 12 0 0 1 24 8z" stroke="currentColor" strokeWidth="2" />
      <line x1="18" y1="37" x2="30" y2="37" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <line x1="20" y1="41" x2="28" y2="41" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <line x1="24" y1="4" x2="24" y2="6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <line x1="34" y1="8" x2="32.6" y2="9.4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <line x1="14" y1="8" x2="15.4" y2="9.4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <line x1="38" y1="18" x2="36" y2="18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <line x1="10" y1="18" x2="12" y2="18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export function IconBook({ className = 'w-10 h-10' }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" fill="none" className={className} aria-hidden="true">
      <path d="M10 8h14v32H10z" fill="currentColor" opacity="0.2" />
      <path d="M10 8h14v32H10z" stroke="currentColor" strokeWidth="2" />
      <path d="M24 8h14v32H24z" fill="currentColor" opacity="0.1" />
      <path d="M24 8h14v32H24z" stroke="currentColor" strokeWidth="2" />
      <line x1="24" y1="8" x2="24" y2="40" stroke="currentColor" strokeWidth="2" />
      <line x1="14" y1="16" x2="20" y2="16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.7" />
      <line x1="14" y1="21" x2="20" y2="21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.7" />
      <line x1="14" y1="26" x2="20" y2="26" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.7" />
      <line x1="28" y1="16" x2="34" y2="16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.5" />
      <line x1="28" y1="21" x2="34" y2="21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.5" />
    </svg>
  );
}

export function IconGlobe({ className = 'w-10 h-10' }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" fill="none" className={className} aria-hidden="true">
      <circle cx="24" cy="24" r="16" fill="currentColor" opacity="0.1" />
      <circle cx="24" cy="24" r="16" stroke="currentColor" strokeWidth="2" />
      <ellipse cx="24" cy="24" rx="7" ry="16" stroke="currentColor" strokeWidth="2" />
      <line x1="8" y1="24" x2="40" y2="24" stroke="currentColor" strokeWidth="2" />
      <path d="M10 16h28M10 32h28" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
    </svg>
  );
}

export function IconShield({ className = 'w-10 h-10' }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" fill="none" className={className} aria-hidden="true">
      <path d="M24 6L8 12v12c0 9 7 16.5 16 18 9-1.5 16-9 16-18V12L24 6z" fill="currentColor" opacity="0.15" />
      <path d="M24 6L8 12v12c0 9 7 16.5 16 18 9-1.5 16-9 16-18V12L24 6z" stroke="currentColor" strokeWidth="2" />
      <polyline points="17,24 22,29 31,19" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function IconUsers({ className = 'w-10 h-10' }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" fill="none" className={className} aria-hidden="true">
      <circle cx="24" cy="14" r="5" fill="currentColor" />
      <circle cx="12" cy="17" r="4" fill="currentColor" opacity="0.7" />
      <circle cx="36" cy="17" r="4" fill="currentColor" opacity="0.7" />
      <circle cx="6" cy="20" r="3" fill="currentColor" opacity="0.4" />
      <circle cx="42" cy="20" r="3" fill="currentColor" opacity="0.4" />
      <path d="M15 38c0-4.97 4.03-9 9-9s9 4.03 9 9" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" fill="none" />
      <path d="M4 40c0-3.5 2.24-6.5 5.36-7.62" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.7" />
      <path d="M44 40c0-3.5-2.24-6.5-5.36-7.62" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.7" />
      <path d="M9 38c0-3.5 1.5-6.5 4-8.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.4" />
      <path d="M39 38c0-3.5-1.5-6.5-4-8.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.4" />
    </svg>
  );
}

/** Map of key → component function */
export const ICON_COMPONENTS = {
  collaboration: IconCollaboration,
  data:          IconData,
  youth:         IconYouth,
  policy:        IconPolicy,
  megaphone:     IconMegaphone,
  eye:           IconEye,
  vote:          IconVote,
  lightbulb:     IconLightbulb,
  book:          IconBook,
  globe:         IconGlobe,
  shield:        IconShield,
  users:         IconUsers,
};

/**
 * Render either a preset icon (by key) or a custom uploaded icon (by URL).
 * Usage: <ApproachIcon iconKey="data" iconUrl="" className="w-12 h-12 text-orange-500" />
 */
export function ApproachIcon({ iconKey, iconUrl, className = 'w-12 h-12 text-orange-500' }) {
  if (iconUrl) {
    return <img src={iconUrl} alt="" className={className.replace(/text-\S+/g, '')} style={{ objectFit: 'contain' }} />;
  }
  const Comp = ICON_COMPONENTS[iconKey] || IconCollaboration;
  return <Comp className={className} />;
}
