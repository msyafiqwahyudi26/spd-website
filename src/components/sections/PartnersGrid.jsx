import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { resolveMediaUrl } from '@/lib/media';

// Monogram fallback for partners without a logoUrl — deterministic color per
// name so the grid still feels ordered instead of grey.
const FALLBACK_BGS = [
  'bg-slate-700',  'bg-blue-700',   'bg-teal-700',
  'bg-emerald-700','bg-orange-600', 'bg-red-600',
  'bg-indigo-700', 'bg-amber-600',  'bg-rose-700',
];

function fallbackClass(name) {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0;
  return FALLBACK_BGS[h % FALLBACK_BGS.length];
}

function initials(name) {
  return name
    .replace(/\s+/g, ' ')
    .trim()
    .split(' ')
    .slice(0, 2)
    .map((w) => w.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 3) || '·';
}

function Tile({ partner }) {
  const logo = partner.logoUrl ? resolveMediaUrl(partner.logoUrl) : null;
  const content = logo ? (
    <img
      src={logo}
      alt={partner.name}
      className="max-w-full max-h-full object-contain"
      loading="lazy"
    />
  ) : (
    <span className={`w-full h-full flex items-center justify-center text-white text-sm font-bold ${fallbackClass(partner.name)}`}>
      {initials(partner.name)}
    </span>
  );

  const tile = (
    <div
      className={`w-full h-20 rounded-lg overflow-hidden border border-slate-100 flex items-center justify-center transition-all duration-200 hover:scale-105 hover:shadow-md ${
        logo ? 'bg-white p-2' : ''
      }`}
      title={partner.name}
    >
      {content}
    </div>
  );

  if (partner.websiteUrl) {
    return (
      <a
        href={partner.websiteUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="block focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 rounded-lg"
        aria-label={partner.name}
      >
        {tile}
      </a>
    );
  }
  return tile;
}

export default function PartnersGrid({ fallback = [] }) {
  const [partners, setPartners] = useState(null);

  useEffect(() => {
    let cancelled = false;
    api('/partners')
      .then((rows) => {
        if (!cancelled) setPartners(Array.isArray(rows) ? rows : []);
      })
      .catch(() => {
        if (!cancelled) setPartners([]);
      });
    return () => { cancelled = true; };
  }, []);

  // While loading, use the caller's fallback list so the page isn't blank.
  const list = partners === null ? fallback : (partners.length > 0 ? partners : fallback);

  if (!list || list.length === 0) return null;

  return (
    <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-5 items-center">
      {list.map((p) => (
        <Tile key={p.id} partner={p} />
      ))}
    </div>
  );
}
