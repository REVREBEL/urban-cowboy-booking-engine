/**
 * Photo-first arrival screen, ported from visual-booking-flow/src/routes/journey.tsx.
 * Only the editorial UI is imported; stay criteria use the canonical BookingProvider.
 */
import { useEffect, useState } from "react";
import { useBooking } from "../state/booking";
import { ROOM_IMAGE_ASSETS } from "../data/roomImagePlaceholders";
import { resetPhotoJourney } from "./photoSession";
import { Button } from "../components/ui/button";

const HERO = ROOM_IMAGE_ASSETS.ALPINE_BATHING_SUITE;
const label = "font-label text-[11px] uppercase tracking-[0.22em]";

export function PhotoArrival() {
  const booking = useBooking();
  const [checkIn, setCheckIn] = useState<string | null>(booking.checkIn || null);
  const [checkOut, setCheckOut] = useState<string | null>(booking.checkOut || null);
  const [adults, setAdults] = useState(booking.adults);
  const [children, setChildren] = useState(booking.children);
  const nights = checkIn && checkOut ? Math.max(0, Math.round((Date.parse(checkOut) - Date.parse(checkIn)) / 86400000)) : 0;

  const proceed = (path: "journal" | "rooms") => {
    if (!checkIn || !checkOut || nights <= 0) return;
    // The journey flag is presentation state and is kept in the Studio URL or
    // production Photo journey; it never overrides pricing or eligibility.
    const url = new URL(window.location.href);
    resetPhotoJourney();
    url.searchParams.set("photoPath", path);
    window.history.replaceState({}, "", url);
    booking.setSearch({
      checkIn, checkOut, adults, children, infants: 0, properties: ["hotel"],
    });
    booking.goTo("results");
  };
  return (
    <div className="min-h-dvh bg-smoke font-body text-paper">
      <Arrive
        checkIn={checkIn}
        checkOut={checkOut}
        setRange={(start, end) => { setCheckIn(start); setCheckOut(end); }}
        adults={adults}
        children={children}
        setAdults={setAdults}
        setChildren={setChildren}
        onMatch={() => proceed("journal")}
        onBrowse={() => proceed("rooms")}
        nights={nights}
      />
    </div>
  );
}

function FullFrame({ src, alt, priority, children }: { src: string; alt: string; priority?: boolean; children?: React.ReactNode }) {
  return (
    <figure className="relative w-full">
      <img
        src={src}
        alt={alt}
        className="block h-auto w-full"
        loading={priority ? "eager" : "lazy"}
        fetchPriority={priority ? "high" : "auto"}
      />
      {children}
    </figure>
  );
}

/* ---------------- 01 Arrive ---------------- */

function Arrive(props: {
  checkIn: string | null;
  checkOut: string | null;
  setRange: (a: string | null, b: string | null) => void;
  adults: number;
  children: number;
  setAdults: (n: number) => void;
  setChildren: (n: number) => void;
  onMatch: () => void;
  onBrowse: () => void;
  nights: number;
}) {
  const ready = props.nights > 0;
  return (
    <section>
      <FullFrame src={HERO} alt="Alpine Bathing Suite: clawfoot tub before a forest picture window" priority>
        <div className="absolute inset-0 bg-linear-to-t from-secondary-foreground via-secondary-foreground/30 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 mx-auto max-w-[1600px] px-5 pb-8 sm:px-8 lg:pb-14">
          <p className={`${label} text-paper/80`}>Big Indian, New York · Urban Cowboy Lodge & Resort</p>
          <h1 className="mt-3 max-w-[16ch] font-headline text-2xl leading-[0.95] sm:text-6xl lg:text-8xl text-balance">
            Come for the soak. 
            <br />
            Stay for the woods.
          </h1>
        </div>
      </FullFrame>

      <div className="mx-auto grid max-w-[1600px] gap-10 px-5 py-12 sm:px-8 lg:grid-cols-[1.2fr_1fr] lg:gap-16">
        <div>
          <p className={`${label} text-alpine-linen`}>01 — When are you coming?</p>
          <div className="mt-6 rounded-2xl bg-paper p-4 text-foreground sm:p-6">
            <RangeCalendar checkIn={props.checkIn} checkOut={props.checkOut} onChange={props.setRange} />
          </div>
        </div>
        <div className="flex flex-col justify-between gap-10">
          <div>
            <p className={`${label} text-alpine-linen`}>Who's coming?</p>
            <div className="mt-6 divide-y divide--paper/15 border-y border-paper/15">
              <Counter label="Adults" value={props.adults} min={1} max={6} onChange={props.setAdults} />
              <Counter label="Children" hint="Some buildings are 21+" value={props.children} min={0} max={4} onChange={props.setChildren} />
            </div>
          </div>
          <div className="space-y-4">
            <p className="max-w-[48ch] text-paper/80">
              Find the room that feels right for your stay, or wander through every available room.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button type="button" variant="filled" colorScheme="alpine-linen" size="small" className="rounded-full uppercase tracking-[0.2em]" disabled={!ready} aria-describedby="dates-hint" onClick={() => ready && props.onMatch()}>
                Match me with a room →
              </Button>
              <Button type="button" variant="outline" colorScheme="paper" size="small" className="rounded-full uppercase tracking-[0.2em]" disabled={!ready} aria-describedby="dates-hint" onClick={() => ready && props.onBrowse()}>
                Browse every room
              </Button>
            </div>
            {!ready && <p id="dates-hint" className="text-sm text-paper/75">Pick your arrival and departure dates to continue.</p>}
          </div>
        </div>
      </div>
    </section>
  );
}

function Counter({ label: l, hint, value, min, max, onChange }: { label: string; hint?: string; value: number; min: number; max: number; onChange: (n: number) => void }) {
  return (
    <div className="flex items-center justify-between py-4">
      <div>
        <p className="font-headline text-xl">{l}</p>
        {hint && <p className="text-sm text-paper/75">{hint}</p>}
      </div>
      <div className="flex items-center gap-4">
        <Button type="button" aria-label={`Fewer ${l}`} disabled={value <= min} onClick={() => onChange(value - 1)} variant="outline" colorScheme="paper" size="xsmall" className="size-10 rounded-full" style={{padding: 0, borderWidth: "1px"}}>−</Button>
        <span className="w-6 text-center tabular-nums" aria-live="polite">{value}</span>
        <Button type="button" aria-label={`More ${l}`} disabled={value >= max} onClick={() => onChange(value + 1)} variant="outline" colorScheme="paper" size="xsmall" className="size-10 rounded-full" style={{padding: 0, borderWidth: "1px"}}>+</Button>
      </div>
    </div>
  );
}

const iso = (y: number, m: number, d: number) => `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;

function RangeCalendar({ checkIn, checkOut, onChange }: { checkIn: string | null; checkOut: string | null; onChange: (a: string | null, b: string | null) => void }) {
  const [today, setToday] = useState<string | null>(null);
  const [view, setView] = useState<{ y: number; m: number } | null>(null);
  useEffect(() => {
    const d = new Date();
    setToday(iso(d.getFullYear(), d.getMonth(), d.getDate()));
    setView({ y: d.getFullYear(), m: d.getMonth() });
  }, []);
  if (!view || !today) return <div className="h-80" aria-hidden />;

  const months = [0, 1].map((o) => {
    const dt = new Date(view.y, view.m + o, 1);
    return { y: dt.getFullYear(), m: dt.getMonth() };
  });
  const pick = (d: string) => {
    if (!checkIn || checkOut || d <= checkIn) onChange(d, null);
    else onChange(checkIn, d);
  };
  const shift = (n: number) => {
    const dt = new Date(view.y, view.m + n, 1);
    setView({ y: dt.getFullYear(), m: dt.getMonth() });
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <Button type="button" onClick={() => shift(-1)} aria-label="Previous month" variant="transparent" colorScheme="lake-forest" size="xsmall" className="size-10 rounded-full" style={{padding: 0}}>←</Button>
        <p className={`${label} text-foreground/70`}>
          {checkIn ? (checkOut ? `${checkIn} → ${checkOut}` : "Now choose departure") : "Choose arrival"}
        </p>
        <Button type="button" onClick={() => shift(1)} aria-label="Next month" variant="transparent" colorScheme="lake-forest" size="xsmall" className="size-10 rounded-full" style={{padding: 0}}>→</Button>
      </div>
      <div className="mt-4 grid gap-8 sm:grid-cols-2">
        {months.map(({ y, m }, idx) => {
          const first = new Date(y, m, 1).getDay();
          const days = new Date(y, m + 1, 0).getDate();
          return (
            <div key={`${y}-${m}`} className={idx === 1 ? "hidden sm:block" : ""}>
              <p className="mb-3 font-headline text-xl">
                {new Date(y, m, 1).toLocaleString("en-US", { month: "long", year: "numeric" })}
              </p>
              <div className="grid grid-cols-7 text-center text-xs text-foreground/75">
                {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => <span key={i} className="py-1">{d}</span>)}
              </div>
              <div className="grid grid-cols-7 gap-y-1">
                {Array.from({ length: first }).map((_, i) => <span key={`e${i}`} />)}
                {Array.from({ length: days }).map((_, i) => {
                  const d = iso(y, m, i + 1);
                  const past = d < today;
                  const edge = d === checkIn || d === checkOut;
                  const inRange = checkIn && checkOut && d > checkIn && d < checkOut;
                  return (
                    <Button
                      key={d}
                      type="button"
                      disabled={past}
                      onClick={() => pick(d)}
                      aria-pressed={edge}
                      aria-label={d}
                      variant={edge ? "filled" : inRange ? "filled" : "transparent"}
                      colorScheme={edge ? "lake-forest" : inRange ? "ash" : "lake-forest"}
                      size="xsmall"
                      style={{ padding: 0, borderRadius: edge ? "999px" : "0" }}
                      className="h-10 w-full tabular-nums disabled:opacity-30"
                    >
                      {i + 1}
                    </Button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

