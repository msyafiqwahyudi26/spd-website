import { useEffect, useRef, useState } from 'react';

// Easing function — quadratic ease-out for a natural deceleration.
function easeOut(t) {
  return 1 - (1 - t) * (1 - t);
}

// Extracts a leading non-negative integer from a string like "100+" → 100.
// Returns null when the input has no leading integer (e.g. "N/A") so the
// caller can fall back to rendering the raw value.
export function parseNumericPrefix(raw) {
  if (typeof raw === 'number' && Number.isFinite(raw)) return raw;
  if (typeof raw !== 'string') return null;
  const m = raw.match(/^(\d+)/);
  return m ? Number(m[1]) : null;
}

/**
 * Animate a numeric value from 0 to `target` over `duration` ms.
 * Uses requestAnimationFrame so it stays smooth and cheap.
 *
 * Respects `prefers-reduced-motion: reduce` — returns the target immediately.
 */
export function useCountUp(target, { duration = 900, enabled = true } = {}) {
  const [display, setDisplay] = useState(0);
  const rafRef = useRef(0);
  const startRef = useRef(0);

  useEffect(() => {
    if (!enabled || !Number.isFinite(target)) {
      setDisplay(Number.isFinite(target) ? target : 0);
      return;
    }
    if (typeof window !== 'undefined' &&
        window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
      setDisplay(target);
      return;
    }

    const step = (now) => {
      if (!startRef.current) startRef.current = now;
      const elapsed = now - startRef.current;
      const t = Math.min(1, elapsed / duration);
      setDisplay(Math.round(target * easeOut(t)));
      if (t < 1) rafRef.current = requestAnimationFrame(step);
    };

    startRef.current = 0;
    setDisplay(0);
    rafRef.current = requestAnimationFrame(step);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [target, duration, enabled]);

  return display;
}
