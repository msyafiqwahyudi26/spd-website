import { useState, useEffect } from 'react';
import { api, AUTH_EXPIRED_EVENT } from '@/lib/api';

export function useAuth() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const checkAuth = async () => {
      let token = null;
      try { token = localStorage.getItem('spd_token'); } catch {}

      if (!token) {
        if (!cancelled) setIsLoading(false);
        return;
      }

      try {
        const data = await api('/auth/me');
        if (!cancelled) setUser(data);
      } catch {
        try { localStorage.removeItem('spd_token'); } catch {}
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
      try { localStorage.setItem('spd_token', data.token); } catch {}
      setUser(data.user);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message || 'Login gagal' };
    }
  };

  const logout = () => {
    try { localStorage.removeItem('spd_token'); } catch {}
    setUser(null);
  };

  return { user, login, logout, isLoading };
}
