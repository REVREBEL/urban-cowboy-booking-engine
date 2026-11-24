"use client";

import { useCallback } from "react";
import type { DashboardApi } from "../../src/dashboard/api.ts";
import { EmptyPanel, ErrorPanel, LoadingPanel } from "../../src/dashboard/states.tsx";
import { useDashboardResource } from "../../src/dashboard/useDashboardResource.ts";

type RecordValue = Record<string, unknown>;

function asRecords(value: unknown): RecordValue[] {
  if (Array.isArray(value)) return value.filter((item): item is RecordValue => !!item && typeof item === "object");
  if (value && typeof value === "object") {
    const items = (value as RecordValue).items;
    if (Array.isArray(items)) return items.filter((item): item is RecordValue => !!item && typeof item === "object");
    return [value as RecordValue];
  }
  return [];
}

function labelFor(item: RecordValue): string {
  for (const key of ["name", "title", "displayName", "headline", "label", "email"]) {
    const value = item[key];
    if (typeof value === "string" && value.trim()) return value;
  }
  return typeof item.id === "string" ? item.id : "Record";
}

/**
 * Read-only D1-backed surface for the remaining dashboard sections. It uses
 * the shared API client and state components; no data is rendered from the
 * admin app's own store and no Webflow token is involved.
 */
export function AdminResourcePanel({
  api,
  path,
  label,
}: {
  api: DashboardApi;
  path: string;
  label: string;
}) {
  const load = useCallback(async () => {
    const value = await api.get<unknown>(path);
    return asRecords(value);
  }, [api, path]);
  const { data, loading, error, reload } = useDashboardResource(load);

  if (loading) return <LoadingPanel label={`Loading ${label}`} />;
  if (error) return <ErrorPanel message={error} onRetry={reload} />;
  if (!data?.length) return <EmptyPanel message={`No ${label} records found.`} />;

  return (
    <ul className="space-y-2">
      {data.map((item, index) => (
        <li key={String(item.id ?? index)} className="card flex flex-wrap items-center justify-between gap-2 p-3">
          <span className="font-medium text-foreground">{labelFor(item)}</span>
          <span className="text-xs text-muted-foreground">
            {typeof item.status === "string" ? item.status : typeof item.id === "string" ? item.id : ""}
          </span>
        </li>
      ))}
    </ul>
  );
}
