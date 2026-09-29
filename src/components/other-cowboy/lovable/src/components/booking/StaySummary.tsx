import { CalendarDays, Dog, Users } from "lucide-react";

import { nights, type StayCriteria } from "@/lib/booking/matching";
import { RATES, ROOMS, rateNightly } from "@/lib/booking/rooms";
import type { BookingState } from "@/lib/booking/store";

function formatDate(value: string) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function partyLine(stay: StayCriteria) {
  const parts = [`${stay.adults} adult${stay.adults === 1 ? "" : "s"}`];
  if (stay.children > 0) parts.push(`${stay.children} child${stay.children === 1 ? "" : "ren"}`);
  if (stay.pets) parts.push("1 dog");
  return parts.join(" · ");
}

export function StaySummary({ booking }: { booking: BookingState }) {
  const stayNights = nights(booking.stay);
  const room = ROOMS.find((item) => item.id === booking.roomId) ?? null;
  const rate = RATES.find((item) => item.id === booking.rateId) ?? null;
  const nightly = room && rate ? rateNightly(room, rate) : null;

  return (
    <aside className="rounded-2xl border border-border bg-card p-6 shadow-sm">
      <p className="font-label text-xs text-muted-foreground">Your stay</p>
      <p className="mt-2 font-brand text-2xl">{room ? room.name : "Not chosen yet"}</p>
      {rate && <p className="text-sm text-muted-foreground">{rate.name}</p>}

      <dl className="mt-6 space-y-4 text-sm">
        <div className="flex gap-3">
          <CalendarDays className="mt-0.5 size-4 text-muted-foreground" />
          <div>
            <dt className="font-label text-xs text-muted-foreground">Dates</dt>
            <dd>
              {formatDate(booking.stay.arrival)} → {formatDate(booking.stay.departure)}
              {stayNights > 0 && ` · ${stayNights} night${stayNights === 1 ? "" : "s"}`}
            </dd>
          </div>
        </div>
        <div className="flex gap-3">
          <Users className="mt-0.5 size-4 text-muted-foreground" />
          <div>
            <dt className="font-label text-xs text-muted-foreground">Party</dt>
            <dd>{partyLine(booking.stay)}</dd>
          </div>
        </div>
        {booking.stay.pets && (
          <div className="flex gap-3">
            <Dog className="mt-0.5 size-4 text-muted-foreground" />
            <div>
              <dt className="font-label text-xs text-muted-foreground">Dog</dt>
              <dd>Pet-friendly rooms only</dd>
            </div>
          </div>
        )}
      </dl>

      {nightly && stayNights > 0 && (
        <div className="mt-6 border-t border-border pt-4 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">
              ${nightly} × {stayNights} night{stayNights === 1 ? "" : "s"}
            </span>
            <span>${nightly * stayNights}</span>
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="font-label text-xs text-muted-foreground">
              Total before tax
            </span>
            <span className="text-2xl">${nightly * stayNights}</span>
          </div>
        </div>
      )}
    </aside>
  );
}
