// COW-37 Events panel uses the centralized client and shared loading/error states.
import { useCallback } from "react";
import type { D1Event } from "@/types/content";
import type { DashboardApi } from "./api";
import { EmptyPanel, ErrorPanel, LoadingPanel } from "./states";
import { useDashboardResource } from "./useDashboardResource";

export function D1ContentPanel({ api }: { api: DashboardApi }) {
  const load = useCallback(() => api.getD1Module<D1Event>("events"), [api]);
  const { data, loading, error, reload } = useDashboardResource(load);

  if (loading) return <LoadingPanel label="Loading events" />;
  if (error) return <ErrorPanel message={error} onRetry={reload} />;
  if (!data?.length) return <EmptyPanel message="No published events in D1." />;

  return (
    <ul className="space-y-2">
      {data.map((event) => (
        <li key={event.id} className="card p-3">
          <p className="font-medium text-foreground">{event.title}</p>
          <p className="text-sm text-muted-foreground">{event.startsAt}</p>
        </li>
      ))}
    </ul>
  );
}
