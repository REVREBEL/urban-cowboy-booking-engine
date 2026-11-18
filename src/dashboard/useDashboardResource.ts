// COW-37 shared loading/error state for dashboard panels.
import { useCallback, useEffect, useState } from "react";

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

  const reload = useCallback(() => {
    let alive = true;
    setLoading(true);
    setError(null);
    load()
      .then((result) => {
        if (alive) setData(result);
      })
      .catch((cause: unknown) => {
        if (alive) setError(cause instanceof Error ? cause.message : String(cause));
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, [load]);

  useEffect(() => reload(), [reload]);

  return { data, loading, error, reload };
}
