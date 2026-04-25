import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

// Read once at module load. Vite injects env at build time; override with
// VITE_IDLE_TIMEOUT_MINUTES in .env.local if a different policy is needed.
// Default is 5 minutes — short enough to protect unattended admin sessions
// on shared machines.
const ENV_MIN = Number.parseFloat(import.meta.env?.VITE_IDLE_TIMEOUT_MINUTES);
const DEFAULT_MIN = Number.isFinite(ENV_MIN) && ENV_MIN > 0 ? ENV_MIN : 5;

const ACTIVITY_EVENTS = [
  'mousedown', 'mousemove', 'keydown', 'scroll', 'touchstart', 'click',
];

/**
 * Logs the user out after `minutes` of inactivity while an authenticated
 * area is mounted. Activity resets the timer; tab visibility changes re-
 * evaluate (background tabs still age toward logout so an unattended
 * session can't live forever). On fire, calls logout() and navigates to
 * /login with a `?reason=idle` so the login page can show a message.
 */
export function useIdleLogout({ enabled, logout, minutes = DEFAULT_MIN } = {}) {
  const navigate = useNavigate();
  const lastActive = useRef(Date.now());
  const timerRef = useRef(null);

  useEffect(() => {
    if (!enabled) return undefined;

    const timeoutMs = Math.max(60_000, minutes * 60_000);

    const fire = () => {
      try { logout?.(); } catch { /* ignore */ }
      navigate('/login?reason=idle', { replace: true });
    };

    const scheduleNext = () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      const elapsed = Date.now() - lastActive.current;
      const remaining = Math.max(1_000, timeoutMs - elapsed);
      timerRef.current = setTimeout(() => {
        if (Date.now() - lastActive.current >= timeoutMs) fire();
        else scheduleNext();
      }, remaining);
    };

    const bump = () => {
      lastActive.current = Date.now();
    };

    const onVisibility = () => {
      if (document.visibilityState === 'visible') scheduleNext();
    };

    for (const evt of ACTIVITY_EVENTS) {
      window.addEventListener(evt, bump, { passive: true });
    }
    document.addEventListener('visibilitychange', onVisibility);
    scheduleNext();

    return () => {
      for (const evt of ACTIVITY_EVENTS) window.removeEventListener(evt, bump);
      document.removeEventListener('visibilitychange', onVisibility);
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [enabled, logout, minutes, navigate]);
}
