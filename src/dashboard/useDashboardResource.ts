// COW-37 shared loading/error state for dashboard panels.
import { useCallback, useEffect, useRef, useState } from "react";

export interface DashboardResource<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  reload: () => void;
}

export function useDashboardResource<T>(load: () => Promise<T>): DashboardResource<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // Stale responses are ignored: only the newest request may update state.
  const requestId = useRef(0);

  const reload = useCallback(() => {
    const id = ++requestId.current;
    setLoading(true);
    setError(null);
    load()
      .then((result) => {
        if (id === requestId.current) setData(result);
      })
      .catch((cause: unknown) => {
        if (id === requestId.current) setError(cause instanceof Error ? cause.message : String(cause));
      })
      .finally(() => {
        if (id === requestId.current) setLoading(false);
      });
  }, [load]);

  useEffect(() => {
    reload();
    return () => {
      requestId.current += 1;
    };
  }, [reload]);

  return { data, loading, error, reload };
}
