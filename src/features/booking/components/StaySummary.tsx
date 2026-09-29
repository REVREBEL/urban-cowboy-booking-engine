import { CalendarDays, Dog, Users } from "lucide-react";
import type { StaySummaryData } from "../types";

function formatDate(value: string) {
  if (!value) return "—";
  return new Date(`${value}T00:00:00`).toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function nights(arrival: string, departure: string) {
  if (!arrival || !departure) return 0;
  const start = new Date(`${arrival}T00:00:00Z`);
  const end = new Date(`${departure}T00:00:00Z`);
  return Math.max(0, Math.round((end.getTime() - start.getTime()) / 86_400_000));
}

function partyLine(data: StaySummaryData) {
  const parts = [`${data.adults} adult${data.adults === 1 ? "" : "s"}`];
  if (data.children > 0) parts.push(`${data.children} child${data.children === 1 ? "" : "ren"}`);
  if (data.pets) parts.push("1 dog");
  return parts.join(" · ");
}

function money(value: number, currency: string) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency, maximumFractionDigits: 2 }).format(value);
}

export function StaySummary({ data }: { data: StaySummaryData }) {
  const stayNights = nights(data.arrival, data.departure);
  const currency = data.currency ?? "USD";

  return (
    <aside className="rounded-2xl border border-border bg-card p-6 shadow-sm">
      <p className="font-label text-xs text-muted-foreground">Your stay</p>
      <p className="mt-2 font-brand text-2xl">{data.roomName || "Not chosen yet"}</p>
      {data.rateName && <p className="text-sm text-muted-foreground">{data.rateName}</p>}

      <dl className="mt-6 space-y-4 text-sm">
        <div className="flex gap-3">
          <CalendarDays aria-hidden="true" className="mt-0.5 size-4 text-muted-foreground" />
          <div>
            <dt className="font-label text-xs text-muted-foreground">Dates</dt>
            <dd>
              {formatDate(data.arrival)} → {formatDate(data.departure)}
              {stayNights > 0 && ` · ${stayNights} night${stayNights === 1 ? "" : "s"}`}
            </dd>
          </div>
        </div>
        <div className="flex gap-3">
          <Users aria-hidden="true" className="mt-0.5 size-4 text-muted-foreground" />
          <div>
            <dt className="font-label text-xs text-muted-foreground">Party</dt>
            <dd>{partyLine(data)}</dd>
          </div>
        </div>
        {data.pets && (
          <div className="flex gap-3">
            <Dog aria-hidden="true" className="mt-0.5 size-4 text-muted-foreground" />
            <div>
              <dt className="font-label text-xs text-muted-foreground">Dog</dt>
              <dd>Pet-friendly rooms only</dd>
            </div>
          </div>
        )}
      </dl>

      {data.totalAmount != null && (
        <div className="mt-6 border-t border-border pt-4 text-sm">
          {data.nightlyAmount != null && stayNights > 0 && (
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">{money(data.nightlyAmount, currency)} × {stayNights} night{stayNights === 1 ? "" : "s"}</span>
              <span>{money(data.totalAmount, currency)}</span>
            </div>
          )}
          <div className="mt-2 flex items-baseline justify-between">
            <span className="font-label text-xs text-muted-foreground">Stay total</span>
            <span className="text-2xl">{money(data.totalAmount, currency)}</span>
          </div>
        </div>
      )}
    </aside>
  );
}
