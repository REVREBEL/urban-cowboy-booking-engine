// COW-40 calendar editor: published event schedule, occurrence calendar and
// a draft schedule preview. No draft edit publishes anything — the preview
// endpoint expands a payload without writing to D1.
import { useCallback, useMemo, useState } from "react";
import type { D1Event } from "@/types/content";
import type { EventOccurrence, WebflowEventFields } from "@/types/event-contracts";
import { Button } from "@/components/ui/Button";
import type { DashboardApi } from "./api";
import { EmptyPanel, ErrorPanel, LoadingPanel } from "./states";
import { useDashboardResource } from "./useDashboardResource";

const RECURRENCE_OPTIONS = [
  { label: "One time", id: "de874223b039df253956066a7d1b04d9" },
  { label: "Daily", id: "1ca8e904af0708d46f5e480d678256ca" },
  { label: "Weekly", id: "d0ad84472f081450b147999db968f686" },
  { label: "Monthly", id: "25f888fcdf13745275d035a6eacfe18c" },
] as const;

const WEEKDAYS = [
  { label: "Sunday", id: "98af54dd9ea9b5f335099c095aca1136" },
  { label: "Monday", id: "7cc86e6537ed9a5131cdac1d17619c69" },
  { label: "Tuesday", id: "1921d71fca00d00f7cbcc5550b19ab23" },
  { label: "Wednesday", id: "29bbbd6b12272d329bd745713ac0b2ed" },
  { label: "Thursday", id: "cee5257a2f496e62195f2ab361114c66" },
  { label: "Friday", id: "eed4571c21a505739557d7c0c2d56aeb" },
  { label: "Saturday", id: "fae03cbec436d68c927f322815f34da9" },
] as const;

interface VenuesResponse {
  onsite: Array<{ id: string; name: string }>;
  outlets: Array<{ id: string; name: string }>;
}

interface PreviewResponse {
  occurrences: EventOccurrence[];
  note: string;
}

interface OccurrencesResponse {
  occurrences: EventOccurrence[];
}

const monthWindow = () => {
  const now = new Date();
  const from = `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, "0")}-01`;
  const end = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 2, 0));
  const to = `${end.getUTCFullYear()}-${String(end.getUTCMonth() + 1).padStart(2, "0")}-${String(end.getUTCDate()).padStart(2, "0")}`;
  return { from, to };
};

export function EventsCalendarPanel({ api }: { api: DashboardApi }) {
  const window = useMemo(monthWindow, []);
  const loadEvents = useCallback(
    () => Promise.all([
      api.getD1Module<D1Event>("events"),
      api.get<OccurrencesResponse>("/api/content/events/occurrences", window),
      api.get<VenuesResponse>("/api/content/events/venues"),
    ]),
    [api, window.from, window.to],
  );
  const { data, loading, error, reload } = useDashboardResource(loadEvents);

  const [name, setName] = useState("");
  const [start, setStart] = useState("");
  const [until, setUntil] = useState("");
  const [recurrence, setRecurrence] = useState<string>(RECURRENCE_OPTIONS[0].id);
  const [weekday, setWeekday] = useState<string>(WEEKDAYS[0].id);
  const [venue, setVenue] = useState("");
  const [preview, setPreview] = useState<PreviewResponse | null>(null);
  const [previewError, setPreviewError] = useState<string | null>(null);

  const showPreview = async () => {
    setPreviewError(null);
    if (!start) {
      setPreviewError("Choose a start date to preview the schedule.");
      return;
    }
    const fields: WebflowEventFields = {
      name: name || "Untitled event",
      "recurrence-type": recurrence,
      "recurring-start": `${start}T13:00:00.000Z`,
      "recurring-end": until ? `${until}T13:00:00.000Z` : undefined,
      ...(recurrence === RECURRENCE_OPTIONS[2].id ? { "repeat-on": weekday, "repeat-every": "1" } : {}),
      ...(venue ? { "onsite-event-location": venue } : {}),
    };
    try {
      setPreview(await api.post<PreviewResponse>("/api/content/events/preview", { fields, from: window.from, to: window.to }));
    } catch (cause) {
      setPreviewError(cause instanceof Error ? cause.message : String(cause));
    }
  };

  if (loading) return <LoadingPanel label="Loading event schedule" />;
  if (error) return <ErrorPanel message={error} onRetry={reload} />;

  const [events, occurrences, venues] = data ?? [[], { occurrences: [] }, { onsite: [], outlets: [] }];

  return (
    <section className="space-y-6">
      <div>
        <h2 className="font-heading text-xl text-foreground">Event calendar</h2>
        <p className="text-sm text-muted-foreground">
          {window.from} – {window.to} · {events.length} published events · schedule only, no availability or price
        </p>
        <ul className="mt-3 space-y-2">
          {occurrences.occurrences.length === 0 && <EmptyPanel message="No event occurrences in this window." />}
          {occurrences.occurrences.map((occurrence) => (
            <li key={`${occurrence.eventId}-${occurrence.localDate}`} className="card flex flex-wrap items-baseline justify-between gap-2 p-3">
              <span className="font-medium text-foreground">{occurrence.title}</span>
              <span className="text-sm text-muted-foreground">
                {occurrence.localDate} · {occurrence.startsAt} {occurrence.venue ? `· ${occurrence.venue}` : ""}
              </span>
            </li>
          ))}
        </ul>
      </div>

      <div className="card space-y-3 p-4">
        <h3 className="font-heading text-lg text-foreground">Schedule preview</h3>
        <p className="text-sm text-muted-foreground">
          Expands a draft recurrence without publishing. Saving and publishing remain separate editor actions.
        </p>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="grid gap-1 text-sm">
            <span className="text-muted-foreground">Name</span>
            <input className="oc-input" value={name} onChange={(event) => setName(event.target.value)} />
          </label>
          <label className="grid gap-1 text-sm">
            <span className="text-muted-foreground">Start (local date)</span>
            <input className="oc-input" type="date" value={start} onChange={(event) => setStart(event.target.value)} />
          </label>
          <label className="grid gap-1 text-sm">
            <span className="text-muted-foreground">Recurrence</span>
            <select className="oc-input" value={recurrence} onChange={(event) => setRecurrence(event.target.value)}>
              {RECURRENCE_OPTIONS.map((option) => <option key={option.id} value={option.id}>{option.label}</option>)}
            </select>
          </label>
          <label className="grid gap-1 text-sm">
            <span className="text-muted-foreground">Repeat on</span>
            <select
              className="oc-input"
              value={weekday}
              disabled={recurrence !== RECURRENCE_OPTIONS[2].id}
              onChange={(event) => setWeekday(event.target.value)}
            >
              {WEEKDAYS.map((day) => <option key={day.id} value={day.id}>{day.label}</option>)}
            </select>
          </label>
          <label className="grid gap-1 text-sm">
            <span className="text-muted-foreground">Until (optional)</span>
            <input className="oc-input" type="date" value={until} onChange={(event) => setUntil(event.target.value)} />
          </label>
          <label className="grid gap-1 text-sm">
            <span className="text-muted-foreground">Venue</span>
            <select className="oc-input" value={venue} onChange={(event) => setVenue(event.target.value)}>
              <option value="">No venue reference</option>
              <optgroup label="Onsite">
                {venues.onsite.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
              </optgroup>
              <optgroup label="Outlets">
                {venues.outlets.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
              </optgroup>
            </select>
          </label>
        </div>
        <div className="flex justify-start">
          <Button variant="filled" colorScheme="light" size="small" textCase="title" onClick={() => void showPreview()}>
            Preview dates
          </Button>
        </div>
        {previewError && <ErrorPanel message={previewError} />}
        {preview && (
          <div role="status">
            <p className="text-sm text-muted-foreground">
              {preview.occurrences.length} occurrence(s) · {preview.note}
            </p>
            <ul className="mt-2 flex flex-wrap gap-2">
              {preview.occurrences.map((occurrence) => (
                <li key={`${occurrence.eventId}-${occurrence.localDate}`} className="rounded-md bg-muted px-2 py-1 text-xs text-foreground">
                  {occurrence.localDate}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </section>
  );
}
