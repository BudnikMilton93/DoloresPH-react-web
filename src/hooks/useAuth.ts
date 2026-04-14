import { useState, useCallback } from 'react';
import { login as loginApi } from '../api/auth';

export function useAuth() {
  const [token, setToken] = useState<string | null>(null);

  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await loginApi(email, password);
      setToken(response.token);
      return true;
    } catch {
      return false;
    }
  }, []);

  const logout = useCallback(() => {
    setToken(null);
  }, []);

  return {
    token,
    login,
    logout,
    isAuthenticated: token !== null,
  };
}
