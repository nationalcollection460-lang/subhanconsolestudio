import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { api } from './api';

type Admin = { id: number; email: string; name: string; role: string; last_login_at?: string };

type AdminContextValue = {
  admin: Admin | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  setAdmin: (admin: Admin | null) => void;
};

const AdminContext = createContext<AdminContextValue>({
  admin: null,
  loading: true,
  login: async () => {},
  logout: async () => {},
  setAdmin: () => {},
});

export function AdminProvider({ children }: { children: React.ReactNode }) {
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    // Only the admin area needs the session check — public pages skip it.
    if (!window.location.pathname.startsWith('/admin')) {
      setLoading(false);
      return () => {
        alive = false;
      };
    }
    (async () => {
      try {
        const data = await api.get<{ admin: Admin }>('/admin/me');
        if (alive) setAdmin(data.admin);
      } catch {
        if (alive) setAdmin(null);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const data = await api.post<{ admin: Admin }>('/admin/login', { email, password });
    setAdmin(data.admin);
  }, []);

  const logout = useCallback(async () => {
    try {
      await api.post('/admin/logout');
    } catch {
      /* ignore */
    }
    setAdmin(null);
  }, []);

  const value = useMemo(() => ({ admin, loading, login, logout, setAdmin }), [admin, loading, login, logout]);
  return <AdminContext.Provider value={value}>{children}</AdminContext.Provider>;
}

export function useAdmin() {
  return useContext(AdminContext);
}
