import { CalendarDays, Dog, Users } from "lucide-react";

import { money } from "../../../lib/format";
import type { StaySelection } from "../types";

function formatDate(value: string) {
  if (!value) return "—";
  return new Date(`${value}T00:00:00Z`).toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
}

function nights(checkIn: string, checkOut: string) {
  if (!checkIn || !checkOut) return 0;
  const start = Date.parse(`${checkIn}T00:00:00Z`);
  const end = Date.parse(`${checkOut}T00:00:00Z`);
  return Math.max(0, Math.round((end - start) / 86_400_000));
}

function partyLine(stay: StaySelection) {
  const parts = [`${stay.adults} adult${stay.adults === 1 ? "" : "s"}`];
  if (stay.children > 0) parts.push(`${stay.children} child${stay.children === 1 ? "" : "ren"}`);
  if ((stay.infants ?? 0) > 0) parts.push(`${stay.infants} infant${stay.infants === 1 ? "" : "s"}`);
  if (stay.dog) parts.push("1 dog");
  return parts.join(" · ");
}

export function StaySummary({
  stay,
  roomName,
  rateName,
  nightlyAmount,
  totalAmount,
  currency = "USD",
}: {
  stay: StaySelection;
  roomName?: string | null;
  rateName?: string | null;
  nightlyAmount?: number | null;
  totalAmount?: number | null;
  currency?: string;
}) {
  const stayNights = nights(stay.checkIn, stay.checkOut);
  const calculatedTotal =
    totalAmount ?? (nightlyAmount != null && stayNights > 0 ? nightlyAmount * stayNights : null);

  return (
    <aside className="rounded-2xl border border-border bg-card p-6 shadow-sm">
      <p className="text-xs text-muted-foreground">Your stay</p>
      <p className="mt-2 font-display text-2xl">{roomName || "Not chosen yet"}</p>
      {rateName && <p className="text-sm text-muted-foreground">{rateName}</p>}

      <dl className="mt-6 space-y-4 text-sm">
        <div className="flex gap-3">
          <CalendarDays className="mt-0.5 size-4 text-muted-foreground" aria-hidden="true" />
          <div>
            <dt className="text-xs text-muted-foreground">Dates</dt>
            <dd>
              {formatDate(stay.checkIn)} → {formatDate(stay.checkOut)}
              {stayNights > 0 && ` · ${stayNights} night${stayNights === 1 ? "" : "s"}`}
            </dd>
          </div>
        </div>
        <div className="flex gap-3">
          <Users className="mt-0.5 size-4 text-muted-foreground" aria-hidden="true" />
          <div>
            <dt className="text-xs text-muted-foreground">Party</dt>
            <dd>{partyLine(stay)}</dd>
          </div>
        </div>
        {stay.dog && (
          <div className="flex gap-3">
            <Dog className="mt-0.5 size-4 text-muted-foreground" aria-hidden="true" />
            <div>
              <dt className="text-xs text-muted-foreground">Dog</dt>
              <dd>Pet-friendly rooms only</dd>
            </div>
          </div>
        )}
      </dl>

      {calculatedTotal != null && stayNights > 0 && (
        <div className="mt-6 border-t border-border pt-4 text-sm">
          {nightlyAmount != null && (
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">
                {money(nightlyAmount, currency)} × {stayNights} night{stayNights === 1 ? "" : "s"}
              </span>
              <span>{money(nightlyAmount * stayNights, currency)}</span>
            </div>
          )}
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-xs text-muted-foreground">Stay total</span>
            <span className="text-2xl">{money(calculatedTotal, currency)}</span>
          </div>
        </div>
      )}
    </aside>
  );
}
