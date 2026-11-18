// COW-68 admin Settings panel for the five published property controls.
// Draft saves never reach guests; only publish updates the published revision.
import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import type { SiteSettings } from "@/types/site-settings";
import type { DashboardApi } from "./api";
import { hasUnsavedChanges, SITE_SETTING_FIELDS as FIELDS } from "./siteSettingsForm";
import { EmptyPanel, ErrorPanel, LoadingPanel } from "./states";
import { useDashboardResource } from "./useDashboardResource";

interface RevisionSummary {
  id: string; revision: number; publishedAt: string | null; createdBy: string | null; createdAt: string;
}

interface AdminSettingsResponse {
  itemId: string;
  source: string;
  published: SiteSettings | null;
  working: SiteSettings | null;
  workingRevisionId: string;
  revisions: RevisionSummary[];
}

const EMPTY_FORM: SiteSettings = {
  productionLayout: "card",
  demoLayout: "card",
  enableDemoEngine: false,
  enableEventDatesQuickSelection: false,
  enableFeatureSection: false,
};

export function SiteSettingsPanel({ api }: { api: DashboardApi }) {
  const load = useCallback(() => api.get<AdminSettingsResponse>("/api/admin/site-settings"), [api]);
  const { data, loading, error, reload } = useDashboardResource(load);
  const [form, setForm] = useState<SiteSettings>(EMPTY_FORM);
  const [actionError, setActionError] = useState<string | null>(null);
  const [rollbackRevision, setRollbackRevision] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (data?.working) setForm(data.working);
  }, [data?.working, data?.workingRevisionId]);

  const act = async (run: () => Promise<unknown>) => {
    setBusy(true);
    setActionError(null);
    try {
      await run();
      reload();
    } catch (cause) {
      setActionError(cause instanceof Error ? cause.message : String(cause));
    } finally {
      setBusy(false);
    }
  };

  if (loading) return <LoadingPanel label="Loading property settings" />;
  if (error) return <ErrorPanel message={error} onRetry={reload} />;
  if (!data) return <EmptyPanel message="No property settings found." />;

  const changed = FIELDS.filter(({ key }) => data.published && form[key] !== data.published[key]);
  const dirty = hasUnsavedChanges(form, data.working);

  return (
    <section className="space-y-5">
      <div>
        <h2 className="font-heading text-xl text-foreground">Property settings</h2>
        <p className="text-sm text-muted-foreground">
          Source: {data.source} · published revision: {data.published ? "available" : "missing"} · drafts are private until published.
        </p>
      </div>

      <div className="card space-y-4 p-4">
        <div className="grid gap-4 sm:grid-cols-2">
          {(["productionLayout", "demoLayout"] as const).map((key) => (
            <fieldset key={key} className="grid gap-2">
              <legend className="text-sm text-muted-foreground">
                {key === "productionLayout" ? "Guest booking layout" : "Studio default layout"}
              </legend>
              <div className="oc-segmented">
                {(["card", "photo"] as const).map((value) => (
                  <button
                    key={value}
                    type="button"
                    aria-pressed={form[key] === value}
                    onClick={() => setForm((current) => ({ ...current, [key]: value }))}
                  >
                    {value === "photo" ? "Photo Journey" : "Card"}
                  </button>
                ))}
              </div>
            </fieldset>
          ))}
        </div>
        {(["enableDemoEngine", "enableEventDatesQuickSelection", "enableFeatureSection"] as const).map((key) => (
          <label key={key} className="oc-field">
            <span>{FIELDS.find((field) => field.key === key)?.label}</span>
            <input
              className="oc-switch"
              type="checkbox"
              checked={form[key]}
              onChange={(event) => setForm((current) => ({ ...current, [key]: event.target.checked }))}
            />
          </label>
        ))}
      </div>

      <div className="card p-4" role="status">
        <h3 className="font-heading text-lg text-foreground">Draft vs published</h3>
        {changed.length === 0 ? (
          <p className="text-sm text-muted-foreground">No unpublished changes.</p>
        ) : (
          <ul className="mt-2 space-y-1 text-sm text-foreground">
            {changed.map(({ key, label }) => (
              <li key={key}>{label}: {String(data.published?.[key])} → {String(form[key])}</li>
            ))}
          </ul>
        )}
      </div>

      <div className="flex flex-wrap gap-3">
        <Button
          variant="filled"
          colorScheme="light"
          size="small"
          textCase="title"
          disabled={busy}
          onClick={() => void act(() => api.patch(`/api/content/editor/items/${data.itemId}`, {
            payload: form, expectedRevisionId: data.workingRevisionId,
          }))}
        >
          Save draft
        </Button>
        <Button
          variant="filled"
          colorScheme="light"
          size="small"
          textCase="title"
          disabled={busy || dirty}
          onClick={() => void act(() => api.post(`/api/content/editor/items/${data.itemId}/publish`, {
            revisionId: data.workingRevisionId,
          }))}
        >
          Publish
        </Button>
      </div>
      {dirty && (
        <p className="text-sm text-muted-foreground" role="status">
          You have unsaved changes. Save draft before publishing so the edits are included.
        </p>
      )}
      {actionError && <ErrorPanel message={actionError} />}

      <div className="card p-4">
        <h3 className="font-heading text-lg text-foreground">Revision history</h3>
        <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
          {data.revisions.map((revision) => (
            <li key={revision.id}>
              r{revision.revision} · {revision.createdBy ?? "unknown"} · {revision.createdAt}
              {revision.publishedAt ? " · published" : ""}
            </li>
          ))}
        </ul>
        <label className="oc-field mt-3">
          <span>Roll back to revision</span>
          <select
            className="oc-input"
            value={rollbackRevision}
            onChange={(event) => setRollbackRevision(event.target.value)}
          >
            <option value="">Select a revision</option>
            {data.revisions.map((revision) => (
              <option key={revision.id} value={revision.id}>r{revision.revision}</option>
            ))}
          </select>
        </label>
        <div className="mt-3 flex justify-start">
          <Button
            variant="outline"
            colorScheme="light"
            size="small"
            textCase="title"
            disabled={busy || !rollbackRevision}
            onClick={() => void act(() => api.post(`/api/content/editor/items/${data.itemId}/rollback`, {
              revisionId: rollbackRevision,
            }))}
          >
            Roll back
          </Button>
        </div>
      </div>
    </section>
  );
}
