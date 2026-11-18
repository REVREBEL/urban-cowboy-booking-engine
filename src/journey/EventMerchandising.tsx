// COW-40 optional event merchandising for the room journey.
//
// Reads stay dates from the booking state and shows events during the stay.
// It never renders availability, price or a booking claim — Mews remains the
// source of truth for those. Mounting is controlled by VITE_EVENTS_MERCHANDISING.
import { useEffect, useState } from "react";
import type { EventOccurrence } from "@/types/event-contracts";
import { useBooking } from "@/state/booking";
import { eventsMerchandisingEnabled } from "./eventMerchandisingFlag";

interface OccurrencesResponse {
  duringStay: EventOccurrence[];
}

export function EventMerchandising() {
  const { checkIn, checkOut } = useBooking();
  const [events, setEvents] = useState<EventOccurrence[]>([]);

  useEffect(() => {
    if (!checkIn || !checkOut || checkOut <= checkIn) {
      setEvents([]);
      return;
    }
    let active = true;
    const params = new URLSearchParams({
      from: checkIn,
      to: checkOut,
      checkIn,
      checkOut,
    });
    fetch(`/api/content/events/occurrences?${params.toString()}`, {
      headers: { accept: "application/json" },
      cache: "no-store",
    })
      .then((response) => response.ok ? response.json() as Promise<OccurrencesResponse> : null)
      .then((body) => { if (active) setEvents(body?.duringStay ?? []); })
      .catch(() => { if (active) setEvents([]); });
    return () => { active = false; };
  }, [checkIn, checkOut]);

  if (!events.length) return null;

  return (
    <aside aria-label="Events during your stay" className="card mx-auto mt-6 max-w-5xl p-4">
      <h2 className="font-heading text-lg text-foreground">Happening during your stay</h2>
      <ul className="mt-2 space-y-1">
        {events.map((event) => (
          <li key={`${event.eventId}-${event.localDate}`} className="text-sm text-muted-foreground">
            {event.localDate} · {event.title}{event.venue ? ` · ${event.venue}` : ""}
          </li>
        ))}
      </ul>
      <p className="mt-2 text-xs text-muted-foreground">
        Schedule information only. Availability and pricing are confirmed during booking.
      </p>
    </aside>
  );
}

export const EVENTS_MERCHANDISING_ENABLED = eventsMerchandisingEnabled(import.meta.env.VITE_EVENTS_MERCHANDISING);
