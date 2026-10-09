import { CalendarDays, Dog, Users } from "lucide-react";
import { money, nights } from "@/lib/format";

export type StaySummaryProps = {
  roomName?: string | null;
  rateName?: string | null;
  checkIn: string;
  checkOut: string;
  adults: number;
  children?: number;
  dog?: boolean;
  nightlyRate?: number | null;
  total?: number | null;
  currency?: string;
};

function formatDate(value: string) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${value}T00:00:00Z`));
}

function partyLine(adults: number, children = 0, dog = false) {
  const parts = [`${adults} adult${adults === 1 ? "" : "s"}`];
  if (children > 0) parts.push(`${children} child${children === 1 ? "" : "ren"}`);
  if (dog) parts.push("1 dog");
  return parts.join(" · ");
}

export function StaySummary({
  roomName,
  rateName,
  checkIn,
  checkOut,
  adults,
  children = 0,
  dog = false,
  nightlyRate = null,
  total = null,
  currency = "USD",
}: StaySummaryProps) {
  const stayNights = checkIn && checkOut ? nights(checkIn, checkOut) : 0;
  const calculatedTotal =
    total ?? (nightlyRate != null && stayNights > 0 ? nightlyRate * stayNights : null);

  return (
    <aside className="rounded-2xl border border-border bg-card p-6 shadow-sm">
      <p className="font-label text-xs text-muted-foreground">Your stay</p>
      <p className="mt-2 font-heading text-2xl">{roomName || "Not chosen yet"}</p>
      {rateName && <p className="text-sm text-muted-foreground">{rateName}</p>}

      <dl className="mt-6 space-y-4 text-sm">
        <div className="flex gap-3">
          <CalendarDays aria-hidden="true" className="mt-0.5 size-4 text-muted-foreground" />
          <div>
            <dt className="font-label text-xs text-muted-foreground">Dates</dt>
            <dd className="font-number">
              {formatDate(checkIn)} → {formatDate(checkOut)}
              {stayNights > 0 && ` · ${stayNights} night${stayNights === 1 ? "" : "s"}`}
            </dd>
          </div>
        </div>
        <div className="flex gap-3">
          <Users aria-hidden="true" className="mt-0.5 size-4 text-muted-foreground" />
          <div>
            <dt className="font-label text-xs text-muted-foreground">Party</dt>
            <dd className="font-number">{partyLine(adults, children, dog)}</dd>
          </div>
        </div>
        {dog && (
          <div className="flex gap-3">
            <Dog aria-hidden="true" className="mt-0.5 size-4 text-muted-foreground" />
            <div>
              <dt className="font-label text-xs text-muted-foreground">Dog</dt>
              <dd>Dog-friendly rooms only</dd>
            </div>
          </div>
        )}
      </dl>

      {calculatedTotal != null && (
        <div className="mt-6 border-t border-border pt-4 font-number text-sm">
          {nightlyRate != null && stayNights > 0 && (
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">
                {money(nightlyRate, currency)} × {stayNights} night{stayNights === 1 ? "" : "s"}
              </span>
              <span>{money(nightlyRate * stayNights, currency)}</span>
            </div>
          )}
          <div className="mt-2 flex items-baseline justify-between">
            <span className="font-label text-xs text-muted-foreground">Stay total</span>
            <span className="font-number text-2xl">{money(calculatedTotal, currency)}</span>
          </div>
        </div>
      )}
    </aside>
  );
}
