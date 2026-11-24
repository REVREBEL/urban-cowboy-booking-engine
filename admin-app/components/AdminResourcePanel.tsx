"use client";

import { useCallback } from "react";
import type { DashboardApi } from "../../src/dashboard/api.ts";
import { EmptyPanel, ErrorPanel, LoadingPanel } from "../../src/dashboard/states.tsx";
import { useDashboardResource } from "../../src/dashboard/useDashboardResource.ts";
import {
  RESOURCE_SECTIONS,
  displayFields,
  recordLabel,
  recordsFromResponse,
  type ResourceSectionConfig,
} from "../lib/resource-fields.ts";

const FALLBACK: ResourceSectionConfig = {
  path: "",
  label: "records",
  fields: [{ key: "id", label: "ID" }],
};

/**
 * Read-only D1-backed surface for the remaining dashboard sections. Field
 * mapping lives in resource-fields.ts so representative worker responses are
 * covered by tests without rendering React.
 */
export function AdminResourcePanel({
  api,
  section,
}: {
  api: DashboardApi;
  section: string;
}) {
  const config = RESOURCE_SECTIONS[section] ?? FALLBACK;
  const load = useCallback(async () => {
    const value = await api.get<unknown>(config.path);
    return recordsFromResponse(value, config);
  }, [api, config]);
  const { data, loading, error, reload } = useDashboardResource(load);

  if (loading) return <LoadingPanel label={`Loading ${config.label}`} />;
  if (error) return <ErrorPanel message={error} onRetry={reload} />;
  if (!data?.length) return <EmptyPanel message={`No ${config.label} records found.`} />;

  return (
    <ul className="space-y-2">
      {data.map((record, index) => {
        const fields = displayFields(record, config);
        return (
          <li key={String(record.id ?? index)} className="card space-y-1 p-3">
            <p className="font-medium text-foreground">{recordLabel(record, config)}</p>
            <dl className="grid gap-1 text-xs text-muted-foreground sm:grid-cols-2">
              {fields.slice(1).map((field, index) => (
                <div key={`${field.label}-${index}`} className="flex min-w-0 gap-2">
                  <dt className="shrink-0 font-medium">{field.label}:</dt>
                  <dd className="min-w-0 break-all">{field.value}</dd>
                </div>
              ))}
            </dl>
          </li>
        );
      })}
    </ul>
  );
}
