import { useState, useEffect } from 'react';
import { api, AUTH_EXPIRED_EVENT } from '@/lib/api';

export function useAuth() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const checkAuth = async () => {
      // No localStorage check needed — the httpOnly cookie is sent
      // automatically by the browser if it exists.
      try {
        const data = await api('/auth/me');
        if (!cancelled) setUser(data);
      } catch {
        if (!cancelled) setUser(null);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    const handleAuthExpired = () => {
      if (!cancelled) setUser(null);
    };

    /**
     * Back-Forward Cache (bfcache) defence.
     *
     * Modern browsers (Chrome, Firefox, Safari) snapshot entire page state
     * into bfcache for instant back/forward navigation. When a page is
     * restored from bfcache, JavaScript is NOT re-executed from scratch —
     * the React component tree is restored as-is, meaning auth state from
     * before logout can reappear.
     *
     * `pageshow` fires on both normal loads (persisted=false) and bfcache
     * restores (persisted=true). We re-verify with the server on restore so
     * a logged-out session is immediately detected and redirected.
     */
    const handlePageShow = (e) => {
      if (e.persisted && !cancelled) {
        checkAuth();
      }
    };

    /**
     * Re-verify auth when the tab becomes visible again after being hidden.
     * Covers the case where a session expires (or is terminated elsewhere)
     * while the tab is in the background — the user sees the correct state
     * as soon as they return to the tab.
     */
    const handleVisibility = () => {
      if (document.visibilityState === 'visible' && !cancelled) {
        checkAuth();
      }
    };

    window.addEventListener(AUTH_EXPIRED_EVENT, handleAuthExpired);
    window.addEventListener('pageshow', handlePageShow);
    document.addEventListener('visibilitychange', handleVisibility);
    checkAuth();

    return () => {
      cancelled = true;
      window.removeEventListener(AUTH_EXPIRED_EVENT, handleAuthExpired);
      window.removeEventListener('pageshow', handlePageShow);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, []);

  const login = async (email, password) => {
    try {
      const data = await api('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      // The server sets the httpOnly cookie — no need to store anything here.
      setUser(data.user);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message || 'Login gagal' };
    }
  };

  const logout = async () => {
    try {
      // Ask the server to clear the httpOnly cookie.
      await api('/auth/logout', { method: 'POST' });
    } catch {
      // Silently ignore — we still clear the local state.
    }
    setUser(null);
  };

  return { user, login, logout, isLoading };
}
