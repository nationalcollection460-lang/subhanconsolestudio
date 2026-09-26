import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { api } from './api';

export type SiteData = {
  settings: Record<string, any>;
  ads: any[];
  categories: { all: any[]; course: string[]; job: string[]; service: string[] };
  counts: Record<string, number>;
  links: { whatsapp: string; maps: string; call: string; email: string };
};

type SiteContextValue = {
  site: SiteData | null;
  settings: Record<string, any>;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
};

const SiteContext = createContext<SiteContextValue>({
  site: null,
  settings: {},
  loading: true,
  error: null,
  refresh: async () => {},
});

export function SiteProvider({ children }: { children: React.ReactNode }) {
  const [site, setSite] = useState<SiteData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const data = await api.get<SiteData>('/site');
      setSite(data);
      setError(null);
    } catch (err: any) {
      setError(err?.message || 'Could not load the website.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const value = useMemo(
    () => ({ site, settings: site?.settings || {}, loading, error, refresh: load }),
    [site, loading, error, load],
  );

  return <SiteContext.Provider value={value}>{children}</SiteContext.Provider>;
}

export function useSite() {
  return useContext(SiteContext);
}

/** Fetch a list endpoint (courses, jobs, services, students, ads). */
export function useList<T = any>(path: string, deps: any[] = []) {
  const [items, setItems] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.get<any>(path);
      const key = Object.keys(data).find((k) => Array.isArray(data[k]));
      setItems((key ? data[key] : []) as T[]);
      setError(null);
    } catch (err: any) {
      setError(err?.message || 'Could not load this section.');
    } finally {
      setLoading(false);
    }
  }, [path]);

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [load, ...deps]);

  return { items, loading, error, reload: load };
}
