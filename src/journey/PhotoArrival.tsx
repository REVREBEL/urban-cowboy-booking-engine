/**
 * Photo-first arrival screen, ported from visual-booking-flow/src/routes/journey.tsx.
 * Only the editorial UI is imported; stay criteria use the canonical BookingProvider.
 */
import { useCallback, useEffect, useState } from "react";
import { useBooking } from "../state/booking";
import { ROOM_IMAGE_ASSETS } from "../data/roomImagePlaceholders";
import { resetPhotoJourney } from "./photoSession";
import { Button } from "../components/ui/button";
import { SearchBarExpanded, type ActiveDropdownSection } from "../components/booking/search/SearchBarExpanded";
import { SearchBarGuestDropdown } from "../components/booking/search/SearchBarGuestsDropdown";
import { SearchBarLocationDropdown } from "../components/booking/search/SearchBarLocationDropdown";
import { SearchBarPromoDropdown } from "../components/booking/search/SearchBarPromoDropdown";
import type { DailyRate } from "../components/booking/search/InlineDateRangePicker";
import { api } from "../lib/api";

const HERO = ROOM_IMAGE_ASSETS.ALPINE_BATHING_SUITE;
const label = "font-label text-[11px] uppercase tracking-[0.22em]";
const PILLARS = [
  {
    title: "Disappear for a While",
    text: "Trade pavement for mountain air and the kind of quiet that makes you forget what day it is.",
    icon: "/assets/icons/icons-simple/hammock.svg",
  },
  {
    title: "Soak It All In",
    text: "Sauna, outdoor hangs, long baths and plenty of ways to slow the whole operation down.",
    icon: "/assets/icons/icons-simple/estonian_sauna.svg",
  },
  {
    title: "Better Together",
    text: "Dinner, drinks, fireside nights and whatever happens next. Cowboy is made for gathering.",
    icon: "/assets/icons/icons-simple/campfire.svg",
  },
] as const;

const displayDate = (value: string | null) => {
  if (!value) return "Add dates";
  return new Date(`${value}T12:00:00`).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const formatSelectedRange = (checkIn: string, checkOut: string) => {
  const start = new Date(`${checkIn}T00:00:00Z`);
  const end = new Date(`${checkOut}T00:00:00Z`);
  const sameYear = start.getUTCFullYear() === end.getUTCFullYear();
  const sameMonth = sameYear && start.getUTCMonth() === end.getUTCMonth();
  const monthDay = new Intl.DateTimeFormat("en-US", { month: "long", day: "numeric", timeZone: "UTC" });
  const fullDate = new Intl.DateTimeFormat("en-US", { month: "long", day: "numeric", year: "numeric", timeZone: "UTC" });

  if (sameMonth) {
    return `${monthDay.format(start)}–${end.getUTCDate()}, ${end.getUTCFullYear()}`;
  }
  if (sameYear) {
    return `${monthDay.format(start)} – ${fullDate.format(end)}`;
  }
  return `${fullDate.format(start)} – ${fullDate.format(end)}`;
};

export function PhotoArrival() {
  const booking = useBooking();
  const [checkIn, setCheckIn] = useState<string | null>(booking.checkIn || null);
  const [checkOut, setCheckOut] = useState<string | null>(booking.checkOut || null);
  const [adults, setAdults] = useState(booking.adults);
  const [children, setChildren] = useState(booking.children);
  const [infants, setInfants] = useState(booking.infants);
  const [accessible, setAccessible] = useState(false);
  const [location, setLocation] = useState("CATSKILLS");
  const [promoCode, setPromoCode] = useState(booking.voucherCode);
  const [activeSection, setActiveSection] = useState<ActiveDropdownSection>(null);
  const [dailyRates, setDailyRates] = useState<Record<string, DailyRate>>({});
  const nights = checkIn && checkOut ? Math.max(0, Math.round((Date.parse(checkOut) - Date.parse(checkIn)) / 86400000)) : 0;

  const loadCalendar = useCallback(async (startDate: string, endDate: string) => {
    try {
      const response = await api.calendar({ startDate, endDate, property: "hotel", currencyCode: "USD" });
      setDailyRates((current) => ({ ...current, ...response.dates }));
    } catch {
      // Calendar guidance is supplemental; live availability is still verified by Search.
    }
  }, []);

  const proceed = (path: "journal" | "rooms") => {
    if (!checkIn || !checkOut || nights <= 0) return;
    // The journey flag is presentation state and is kept in the Studio URL or
    // production Photo journey; it never overrides pricing or eligibility.
    const url = new URL(window.location.href);
    resetPhotoJourney();
    url.searchParams.set("photoPath", path);
    window.history.replaceState({}, "", url);
    booking.setSearch({
      checkIn, checkOut, adults, children, infants, voucherCode: promoCode, properties: ["hotel"],
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
        infants={infants}
        setInfants={setInfants}
        accessible={accessible}
        setAccessible={setAccessible}
        location={location}
        setLocation={setLocation}
        promoCode={promoCode}
        setPromoCode={setPromoCode}
        activeSection={activeSection}
        setActiveSection={setActiveSection}
        dailyRates={dailyRates}
        loadCalendar={loadCalendar}
        onMatch={() => proceed("journal")}
        onBrowse={() => proceed("rooms")}
        nights={nights}
      />
    </div>
  );
}

function FullFrame({ src, alt, priority, children }: { src: string; alt: string; priority?: boolean; children?: React.ReactNode }) {
  return (
    <figure className="relative h-0 min-h-[clamp(300px,32vw,420px)] w-full flex-1 basis-0 overflow-hidden">
      <img
        src={src}
        alt={alt}
        className="block h-full w-full object-cover"
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
  infants: number;
  setAdults: (n: number) => void;
  setChildren: (n: number) => void;
  setInfants: (n: number) => void;
  accessible: boolean;
  setAccessible: (value: boolean) => void;
  location: string;
  setLocation: (value: string) => void;
  promoCode: string;
  setPromoCode: (value: string) => void;
  activeSection: ActiveDropdownSection;
  setActiveSection: (section: ActiveDropdownSection) => void;
  dailyRates: Record<string, DailyRate>;
  loadCalendar: (startDate: string, endDate: string) => Promise<void>;
  onMatch: () => void;
  onBrowse: () => void;
  nights: number;
}) {
  const ready = props.nights > 0;
  const childCount = props.children + props.infants;
  const guestLabel = `${props.adults} adult${props.adults === 1 ? "" : "s"}${
    childCount ? ` · ${childCount} child${childCount === 1 ? "" : "ren"}` : ""
  }`;

  return (
    <section className="flex min-h-dvh flex-col">
      <FullFrame src={HERO} alt="Alpine Bathing Suite: clawfoot tub before a forest picture window" priority>
        <div className="absolute inset-0 bg-linear-to-t from-smoke via-smoke/30 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 mx-auto max-w-[1600px] px-5 pb-8 sm:px-8 lg:pb-14">
          <p className={`${label} text-paper/80`}>Big Indian, New York · Urban Cowboy Lodge & Resort</p>
          <h1 className="mt-3 w-full text-balance font-heading text-lg leading-[0.95] sm:text-4xl lg:text-6xl">
            Come for the soak. Stay for the woods.
          </h1>
        </div>
      </FullFrame>

      <div className="mx-auto w-full max-w-[1600px] shrink-0 px-5 py-8 sm:px-8">
        <div className="mx-auto max-w-5xl">
          <p className={`${label} text-alpine-linen`}>01 — When are you coming?</p>

          <div className="relative z-20 mt-4">
            <SearchBarExpanded
              variant="circle"
              showSearchButton={false}
              values={{
                property: props.location,
                checkInDate: displayDate(props.checkIn),
                checkOutDate: displayDate(props.checkOut),
                guests: guestLabel,
                promoCode: props.promoCode || "Add promo",
              }}
              activeSection={props.activeSection}
              onSectionClick={props.setActiveSection}
              dropdownPlacement={props.activeSection === "dates" ? "above" : "below"}
              className="max-w-none!"
              dropdownSlot={
                <>
                  {props.activeSection === "property" && (
                    <SearchBarLocationDropdown
                      value={props.location}
                      onChange={props.setLocation}
                      onClose={() => props.setActiveSection(null)}
                      className="max-w-full"
                    />
                  )}
                  {props.activeSection === "dates" && (
                    <div className="rounded-3xl border-2 border-input-border bg-input-bg p-4 text-foreground shadow-2xl sm:p-6">
                      <div className="mb-4 flex items-center justify-between border-b border-input-border/20 pb-3">
                        <span className={`${label} text-foreground`}>Select dates of stay</span>
                        <Button type="button" aria-label="Close date picker" variant="transparent" colorScheme="smoke" size="xsmall" className="size-8 rounded-full p-0!" onClick={() => props.setActiveSection(null)}>×</Button>
                      </div>
                      <RangeCalendar
                        checkIn={props.checkIn}
                        checkOut={props.checkOut}
                        onChange={props.setRange}
                        dailyRates={props.dailyRates}
                        onVisibleRangeChange={props.loadCalendar}
                      />
                    </div>
                  )}
                  {props.activeSection === "guests" && (
                    <div className="flex justify-end">
                      <SearchBarGuestDropdown
                        counts={{ adults: props.adults, children: props.children, infants: props.infants, accessible: props.accessible }}
                        onChange={(counts) => {
                          props.setAdults(counts.adults);
                          props.setChildren(counts.children);
                          props.setInfants(counts.infants);
                          props.setAccessible(counts.accessible);
                        }}
                        onClose={() => props.setActiveSection(null)}
                      />
                    </div>
                  )}
                  {props.activeSection === "promo" && (
                    <div className="flex justify-end">
                      <SearchBarPromoDropdown
                        value={props.promoCode}
                        onChange={props.setPromoCode}
                        onApply={(value) => {
                          props.setPromoCode(value);
                          props.setActiveSection(null);
                        }}
                        onClose={() => props.setActiveSection(null)}
                      />
                    </div>
                  )}
                </>
              }
            />
          </div>

          <div className="mt-6 grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_auto] lg:gap-10">
            <div>
              <p className="max-w-[48ch] text-paper/80">
                Find the room that feels right for your stay, or wander through every available room.
              </p>
              {!ready && <p id="dates-hint" className="mt-3 text-sm text-paper/75">Pick your arrival and departure dates to continue.</p>}
            </div>
            <div className="flex flex-wrap gap-3 lg:justify-end">
              <Button
                type="button"
                variant="filled"
                colorScheme="alpine-linen"
                size="small"
                hasIcon
                icon={<span aria-hidden="true" className="inline-block size-4 shrink-0 bg-current" style={{ WebkitMask: 'url("/assets/icons/ui/arrow-right.svg") center / contain no-repeat', mask: 'url("/assets/icons/ui/arrow-right.svg") center / contain no-repeat' }} />}
                className="rounded-full uppercase tracking-[0.2em]"
                style={{ opacity: 1 }}
                disabled={!ready}
                aria-describedby="dates-hint"
                onClick={() => ready && props.onMatch()}
              >
                Match me with a room
              </Button>
              <Button type="button" variant="outline" colorScheme="alpine-linen" size="small" className="rounded-full uppercase tracking-[0.2em]" style={{ opacity: 1 }} disabled={!ready} aria-describedby="dates-hint" onClick={() => ready && props.onBrowse()}>
                Browse every room
              </Button>
            </div>
          </div>

          <div className="mt-8 grid gap-6 md:grid-cols-3 md:gap-10">
            {PILLARS.map((pillar) => (
              <article key={pillar.title} className="text-paper">
                <span
                  aria-hidden="true"
                  className="mb-3 block size-11 bg-current"
                  style={{
                    WebkitMask: `url("${pillar.icon}") center / contain no-repeat`,
                    mask: `url("${pillar.icon}") center / contain no-repeat`,
                  }}
                />
                <h2 className={`${label} font-bold text-paper`}>{pillar.title}</h2>
                <p className="mt-2 text-sm leading-relaxed text-paper/75">{pillar.text}</p>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

const iso = (y: number, m: number, d: number) => `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;

function RangeCalendar({ checkIn, checkOut, onChange, dailyRates, onVisibleRangeChange }: {
  checkIn: string | null;
  checkOut: string | null;
  onChange: (a: string | null, b: string | null) => void;
  dailyRates: Record<string, DailyRate>;
  onVisibleRangeChange: (startDate: string, endDate: string) => Promise<void>;
}) {
  const [today, setToday] = useState<string | null>(null);
  const [view, setView] = useState<{ y: number; m: number } | null>(null);
  useEffect(() => {
    const d = new Date();
    setToday(iso(d.getFullYear(), d.getMonth(), d.getDate()));
    setView({ y: d.getFullYear(), m: d.getMonth() });
  }, []);
  if (!view || !today) return <div className="h-80" aria-hidden />;

  useEffect(() => {
    const startDate = iso(view.y, view.m, 1);
    const afterVisibleMonths = new Date(Date.UTC(view.y, view.m + 2, 1));
    void onVisibleRangeChange(
      startDate,
      iso(afterVisibleMonths.getUTCFullYear(), afterVisibleMonths.getUTCMonth(), 1),
    );
  }, [onVisibleRangeChange, view.m, view.y]);

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
        <Button type="button" onClick={() => shift(-1)} aria-label="Previous month" variant="transparent" colorScheme="lake-forest" size="xsmall" className="size-8 rounded-full" style={{ padding: 0 }}>
          <span aria-hidden="true" className="inline-block size-4 shrink-0 bg-current" style={{ WebkitMask: 'url("/assets/icons/ui/arrow-left.svg") center / contain no-repeat', mask: 'url("/assets/icons/ui/arrow-left.svg") center / contain no-repeat' }} />
        </Button>
        <p className={`${label} text-foreground/70`}>
          {checkIn ? (checkOut ? formatSelectedRange(checkIn, checkOut) : "Now choose departure") : "Choose arrival"}
        </p>
        <Button type="button" onClick={() => shift(1)} aria-label="Next month" variant="transparent" colorScheme="lake-forest" size="xsmall" className="size-8 rounded-full" style={{ padding: 0 }}>
          <span aria-hidden="true" className="inline-block size-4 shrink-0 bg-current" style={{ WebkitMask: 'url("/assets/icons/ui/arrow-right.svg") center / contain no-repeat', mask: 'url("/assets/icons/ui/arrow-right.svg") center / contain no-repeat' }} />
        </Button>
      </div>
      <div className="mt-4 grid gap-8 sm:grid-cols-2">
        {months.map(({ y, m }, idx) => {
          const first = new Date(y, m, 1).getDay();
          const days = new Date(y, m + 1, 0).getDate();
          return (
            <div key={`${y}-${m}`} className={idx === 1 ? "hidden sm:block" : ""}>
              <p className={`${label} mb-3 text-foreground`}>
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
                  const rate = dailyRates[d];
                  const unavailable = rate?.available === false && !rate.minNights;
                  const edge = d === checkIn || d === checkOut;
                  const inRange = checkIn && checkOut && d > checkIn && d < checkOut;
                  const rateLabel = unavailable
                    ? "Sold"
                    : rate?.minNights
                      ? `Min ${rate.minNights}nt`
                      : rate
                        ? new Intl.NumberFormat("en-US", { style: "currency", currency: rate.currency || "USD", maximumFractionDigits: 0 }).format(rate.amount)
                        : null;
                  return (
                    <Button
                      key={d}
                      type="button"
                      disabled={past || unavailable}
                      onClick={() => pick(d)}
                      aria-pressed={edge}
                      aria-label={`${d}${rateLabel ? `, ${rateLabel}` : ""}`}
                      variant={edge ? "filled" : inRange ? "filled" : "transparent"}
                      colorScheme={edge ? "lake-forest" : inRange ? "alpine-linen" : "lake-forest"}
                      size="xsmall"
                      style={{ padding: 0, borderRadius: edge ? "999px" : "0", flexDirection: "column" }}
                      className="h-14 w-full gap-0.5 tabular-nums disabled:opacity-30"
                    >
                      <span>{i + 1}</span>
                      {rateLabel && (
                        <span className="font-number text-[9px] font-bold normal-case leading-none opacity-70">
                          {rateLabel}
                        </span>
                      )}
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
