import { CalendarDays, Dog, Users } from "lucide-react";

import { money } from "@/lib/format";
import type { StaySummaryData } from "../types";

function formatDate(value: string) {
  if (!value) return "—";
  return new Date(`${value}T00:00:00Z`).toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
}

function partyLine(stay: StaySummaryData) {
  const parts = [`${stay.adults} adult${stay.adults === 1 ? "" : "s"}`];
  if (stay.children > 0) {
    parts.push(`${stay.children} child${stay.children === 1 ? "" : "ren"}`);
  }
  if (stay.dog) parts.push("1 dog");
  return parts.join(" · ");
}

export function StaySummary({ stay }: { stay: StaySummaryData }) {
  const currency = stay.currency ?? "USD";

  return (
    <aside className="rounded-2xl border border-border bg-card p-6 shadow-sm">
      <p className="font-label text-xs text-muted-foreground">Your stay</p>
      <p className="mt-2 font-brand text-2xl">{stay.roomName || "Not chosen yet"}</p>
      {stay.rateName && <p className="text-sm text-muted-foreground">{stay.rateName}</p>}

      <dl className="mt-6 space-y-4 text-sm">
        <div className="flex gap-3">
          <CalendarDays aria-hidden="true" className="mt-0.5 size-4 text-muted-foreground" />
          <div>
            <dt className="font-label text-xs text-muted-foreground">Dates</dt>
            <dd>
              {formatDate(stay.arrival)} → {formatDate(stay.departure)}
              {stay.nights && stay.nights > 0
                ? ` · ${stay.nights} night${stay.nights === 1 ? "" : "s"}`
                : ""}
            </dd>
          </div>
        </div>
        <div className="flex gap-3">
          <Users aria-hidden="true" className="mt-0.5 size-4 text-muted-foreground" />
          <div>
            <dt className="font-label text-xs text-muted-foreground">Party</dt>
            <dd>{partyLine(stay)}</dd>
          </div>
        </div>
        {stay.dog && (
          <div className="flex gap-3">
            <Dog aria-hidden="true" className="mt-0.5 size-4 text-muted-foreground" />
            <div>
              <dt className="font-label text-xs text-muted-foreground">Dog</dt>
              <dd>Pet-friendly rooms only</dd>
            </div>
          </div>
        )}
      </dl>

      {stay.total != null && (
        <div className="mt-6 border-t border-border pt-4 text-sm">
          {stay.nightlyRate != null && stay.nights && stay.nights > 0 && (
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">
                {money(stay.nightlyRate, currency)} × {stay.nights} night
                {stay.nights === 1 ? "" : "s"}
              </span>
              <span>{money(stay.total, currency)}</span>
            </div>
          )}
          <div className="mt-2 flex items-baseline justify-between">
            <span className="font-label text-xs text-muted-foreground">Stay total</span>
            <span className="text-2xl">{money(stay.total, currency)}</span>
          </div>
        </div>
      )}
    </aside>
  );
}
