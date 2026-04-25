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

    window.addEventListener(AUTH_EXPIRED_EVENT, handleAuthExpired);
    checkAuth();

    return () => {
      cancelled = true;
      window.removeEventListener(AUTH_EXPIRED_EVENT, handleAuthExpired);
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
