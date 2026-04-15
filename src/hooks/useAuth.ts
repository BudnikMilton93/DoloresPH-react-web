import { useState, useCallback, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { login as loginApi, logout as logoutApi } from '../api/auth';

export function useAuth() {
  const [token, setToken] = useState<string | null>(null);

  // Restaurar sesión al recargar la página
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.access_token) setToken(session.access_token);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setToken(session?.access_token ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await loginApi(email, password);
      setToken(response.token);
      return true;
    } catch {
      return false;
    }
  }, []);

  const logout = useCallback(async () => {
    await logoutApi();
    setToken(null);
  }, []);

  return {
    token,
    login,
    logout,
    isAuthenticated: token !== null,
  };
}
