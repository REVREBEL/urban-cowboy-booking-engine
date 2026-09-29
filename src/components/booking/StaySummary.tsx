import { CalendarDays, Dog, Users } from "lucide-react";

export type StaySummaryModel = {
  roomName?: string | null;
  rateName?: string | null;
  checkIn: string;
  checkOut: string;
  nights: number;
  adults: number;
  children?: number;
  dog?: boolean;
  nightly?: number | null;
  total?: number | null;
  currency?: string;
};

function formatDate(value: string) {
  if (!value) return "—";
  return new Date(`${value}T00:00:00Z`).toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
}

function money(value: number, currency: string) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(value);
}

function partyLine(stay: StaySummaryModel) {
  const parts = [`${stay.adults} adult${stay.adults === 1 ? "" : "s"}`];
  const children = stay.children ?? 0;
  if (children > 0) parts.push(`${children} child${children === 1 ? "" : "ren"}`);
  if (stay.dog) parts.push("1 dog");
  return parts.join(" · ");
}

export function StaySummary({ stay }: { stay: StaySummaryModel }) {
  const currency = stay.currency ?? "USD";
  const computedTotal =
    stay.total ??
    (stay.nightly != null && stay.nights > 0 ? stay.nightly * stay.nights : null);

  return (
    <aside className="rounded-2xl border border-border bg-card p-6 shadow-sm">
      <p className="font-label text-xs text-muted-foreground">Your stay</p>
      <p className="mt-2 font-brand text-2xl">{stay.roomName || "Not chosen yet"}</p>
      {stay.rateName && <p className="text-sm text-muted-foreground">{stay.rateName}</p>}

      <dl className="mt-6 space-y-4 text-sm">
        <div className="flex gap-3">
          <CalendarDays className="mt-0.5 size-4 text-muted-foreground" aria-hidden="true" />
          <div>
            <dt className="font-label text-xs text-muted-foreground">Dates</dt>
            <dd>
              {formatDate(stay.checkIn)} → {formatDate(stay.checkOut)}
              {stay.nights > 0 && ` · ${stay.nights} night${stay.nights === 1 ? "" : "s"}`}
            </dd>
          </div>
        </div>
        <div className="flex gap-3">
          <Users className="mt-0.5 size-4 text-muted-foreground" aria-hidden="true" />
          <div>
            <dt className="font-label text-xs text-muted-foreground">Party</dt>
            <dd>{partyLine(stay)}</dd>
          </div>
        </div>
        {stay.dog && (
          <div className="flex gap-3">
            <Dog className="mt-0.5 size-4 text-muted-foreground" aria-hidden="true" />
            <div>
              <dt className="font-label text-xs text-muted-foreground">Dog</dt>
              <dd>Pet-friendly rooms only</dd>
            </div>
          </div>
        )}
      </dl>

      {computedTotal != null && stay.nights > 0 && (
        <div className="mt-6 border-t border-border pt-4 text-sm">
          {stay.nightly != null && (
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">
                {money(stay.nightly, currency)} × {stay.nights} night{stay.nights === 1 ? "" : "s"}
              </span>
              <span>{money(stay.nightly * stay.nights, currency)}</span>
            </div>
          )}
          <div className="mt-2 flex items-baseline justify-between">
            <span className="font-label text-xs text-muted-foreground">Stay total</span>
            <span className="text-2xl">{money(computedTotal, currency)}</span>
          </div>
        </div>
      )}
    </aside>
  );
}
