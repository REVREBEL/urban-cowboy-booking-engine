/**
 * Photo-first arrival screen, ported from visual-booking-flow/src/routes/journey.tsx.
 * Only the editorial UI is imported; stay criteria use the canonical BookingProvider.
 */
import { useCallback, useEffect, useState } from "react";
import { useBooking } from "../state/booking";
import { ROOM_IMAGE_ASSETS } from "../data/roomImagePlaceholders";
import { resetPhotoJourney } from "./photoSession";
import { Button } from "../components/ui/Button";
import { SearchBarExpanded, type ActiveDropdownSection } from "../components/booking/search/SearchBarExpanded";
import { SearchBarGuestDropdown } from "../components/booking/search/SearchBarGuestsDropdown";
import { SearchBarLocationDropdown } from "../components/booking/search/SearchBarLocationDropdown";
import { SearchBarPromoDropdown } from "../components/booking/search/SearchBarPromoDropdown";
import { DateSearchDropdown } from "../components/booking/search/DateSearchDropdown";
import type { DailyRate } from "../components/booking/search/InlineDateRangePicker";
import { api } from "../lib/api";

const HERO = ROOM_IMAGE_ASSETS.ALPINE_BATHING_SUITE;
const label = "font-label text-[11px] uppercase tracking-[0.22em]";
type ArrivalStory = {
  title: string;
  text: string;
  icon: string | null;
};

const FALLBACK_PILLARS: readonly ArrivalStory[] = [
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
];

const displayDate = (value: string | null) => {
  if (!value) return "Add dates";
  return new Date(`${value}T12:00:00`).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
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
  const [stories, setStories] = useState<readonly ArrivalStory[] | null>(null);
  const nights = checkIn && checkOut ? Math.max(0, Math.round((Date.parse(checkOut) - Date.parse(checkIn)) / 86400000)) : 0;

  useEffect(() => {
    let active = true;
    void api.locations().then((locations) => {
      if (!active) return;
      const locationContent = locations.hotel;
      if (!locationContent) {
        setStories(FALLBACK_PILLARS);
        return;
      }
      if (!locationContent.featureSectionEnabled) {
        setStories([]);
        return;
      }
      const cmsStories = locationContent.features
        .filter((feature) => feature.headline || feature.paragraph)
        .map((feature) => ({
          title: feature.headline,
          text: feature.paragraph,
          icon: feature.iconUrl,
        }));
      setStories(cmsStories.length ? cmsStories : FALLBACK_PILLARS);
    }).catch(() => {
      if (active) setStories(FALLBACK_PILLARS);
    });
    return () => { active = false; };
  }, []);

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
        stories={stories}
      />
    </div>
  );
}

function FullFrame({ src, alt, priority }: { src: string; alt: string; priority?: boolean }) {
  return (
    <figure className="pointer-events-none absolute inset-0 z-0 m-0 h-full w-full overflow-hidden" aria-hidden="true">
      <img
        src={src}
        alt={alt}
        className="absolute inset-0 h-full w-full object-cover object-center"
        loading={priority ? "eager" : "lazy"}
        fetchPriority={priority ? "high" : "auto"}
      />
      {/* The entire arrival viewport, not only the former short image, gets the gradient. */}
      <div className="absolute inset-0 bg-linear-to-t from-smoke via-smoke/65 to-transparent" />
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
  stories: readonly ArrivalStory[] | null;
}) {
  const ready = props.nights > 0;
  const childCount = props.children + props.infants;
  const guestLabel = `${props.adults} adult${props.adults === 1 ? "" : "s"}${
    childCount ? ` · ${childCount} child${childCount === 1 ? "" : "ren"}` : ""
  }`;

  return (
    <section className="relative isolate flex min-h-dvh flex-col justify-end bg-smoke">
      <FullFrame src={HERO} alt="Alpine Bathing Suite: clawfoot tub before a forest picture window" priority />

      <div className="relative z-10 mx-auto w-full max-w-[1600px] px-5 pb-6 pt-28 sm:px-8 lg:pb-10">
        <div className="mx-auto max-w-5xl">
          <div className="mb-8 lg:mb-10">
            <p className={`${label} text-paper/80`}>Big Indian, New York · Urban Cowboy Lodge & Resort</p>
            <h1 className="mt-3 max-w-[23ch] text-balance font-heading text-4xl leading-none sm:text-5xl lg:text-6xl">
              Come for the soak. Stay for the woods.
            </h1>
          </div>
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
              dropdownPlacement="above"
              constrainAboveToViewport
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
                    <DateSearchDropdown
                      variant="external-actions"
                      checkIn={props.checkIn || ""}
                      checkOut={props.checkOut || ""}
                      dailyRates={props.dailyRates}
                      onChange={(checkIn, checkOut) => props.setRange(checkIn || null, checkOut || null)}
                      onClose={() => props.setActiveSection(null)}
                      onVisibleRangeChange={props.loadCalendar}
                    />
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
              <p id="dates-hint" className={`mt-3 text-sm text-paper/75 ${ready ? "invisible" : ""}`} aria-hidden={ready}>
                Pick your arrival and departure dates to continue.
              </p>
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

          {props.stories && props.stories.length > 0 && (
            <div className="mt-8 grid gap-6 md:grid-cols-3 md:gap-10">
              {props.stories.map((story, index) => (
                <article key={`${story.title}-${index}`} className="text-paper">
                  {story.icon && (
                    <span
                      aria-hidden="true"
                      className="mb-3 block size-11 bg-current"
                      style={{
                        WebkitMask: `url("${story.icon}") center / contain no-repeat`,
                        mask: `url("${story.icon}") center / contain no-repeat`,
                      }}
                    />
                  )}
                  {story.title && <h2 className={`${label} font-bold leading-none text-paper`}>{story.title}</h2>}
                  {story.text && <p className="mt-2 text-sm leading-relaxed text-paper/75">{story.text}</p>}
                </article>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
