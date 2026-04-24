import { useState, useEffect } from 'react';
import { getSettingsSync } from '@/hooks/useSettings';

/**
 * Smart image with graceful fallback.
 * Drop-in replacement for <img> — shows styled placeholder when src is null or fails.
 *
 * Props:
 *   src          — image URL/import (null → shows fallback immediately)
 *   alt          — alt text for the <img>
 *   className    — applied to both img and fallback wrapper
 *   gradient     — Tailwind classes (from-* to-*) for fallback bg (default: slate)
 *   label        — optional caption shown inside fallback
 *   icon         — 'photo' | 'chart' | 'logo' — picks fallback icon style
 */
export default function Image({
  src,
  alt = '',
  className = '',
  gradient = 'from-slate-100 to-slate-200',
  label,
  icon = 'photo',
}) {
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);
  const settings = getSettingsSync();
  const globalPlaceholder = settings?.images?.placeholder || null;

  useEffect(() => {
    setFailed(false);
    setLoaded(false);
  }, [src]);

  const finalSrc = src || globalPlaceholder;

  if (!finalSrc || failed) {
    return (
      <div className={`bg-gradient-to-br ${gradient} flex flex-col items-center justify-center gap-2 overflow-hidden ${className}`}>
        <FallbackIcon type={icon} />
        {label && <span className="text-xs text-slate-400 font-medium">{label}</span>}
      </div>
    );
  }

  return (
    <>
      {!loaded && !failed && (
        <div className={`bg-slate-200 animate-pulse flex flex-col items-center justify-center ${className}`}>
          <FallbackIcon type={icon} />
        </div>
      )}
      <img
        src={finalSrc}
        alt={alt}
        className={`object-cover ${className} ${loaded ? 'block' : 'hidden'}`}
        onLoad={() => setLoaded(true)}
        onError={() => setFailed(true)}
      />
    </>
  );
}

function FallbackIcon({ type }) {
  if (type === 'chart') {
    return (
      <svg className="w-8 h-8 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
          d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" />
      </svg>
    );
  }
  if (type === 'logo') {
    return (
      <svg className="w-7 h-7 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
          d="M2.25 7.125C2.25 6.504 2.754 6 3.375 6h6c.621 0 1.125.504 1.125 1.125v3.75c0 .621-.504 1.125-1.125 1.125h-6a1.125 1.125 0 0 1-1.125-1.125v-3.75ZM14.25 8.625c0-.621.504-1.125 1.125-1.125h5.25c.621 0 1.125.504 1.125 1.125v8.25c0 .621-.504 1.125-1.125 1.125h-5.25a1.125 1.125 0 0 1-1.125-1.125v-8.25ZM3.75 16.125c0-.621.504-1.125 1.125-1.125h5.25c.621 0 1.125.504 1.125 1.125v2.25c0 .621-.504 1.125-1.125 1.125h-5.25a1.125 1.125 0 0 1-1.125-1.125v-2.25Z" />
      </svg>
    );
  }
  // default: photo
  return (
    <svg className="w-8 h-8 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
        d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909M3.75 18h16.5M4.5 4.5h15a.75.75 0 0 1 .75.75v13.5a.75.75 0 0 1-.75.75H4.5a.75.75 0 0 1-.75-.75V5.25A.75.75 0 0 1 4.5 4.5Zm8.25 6a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Z" />
    </svg>
  );
}
