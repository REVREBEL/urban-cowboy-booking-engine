"use client";

import { useEffect, useState } from "react";
import { Arrive } from "../../src/journey/PhotoArrival";
import type { ActiveDropdownSection } from "../../src/components/booking/search/SearchBarExpanded";
import { defineStory } from "../lib/story";

const imageBaseUrl = process.env.NEXT_PUBLIC_DOCS_BASE_PATH ?? "";

interface ArrivalDemoProps {
  openCalendar: boolean;
  initialCheckIn: string | null;
  initialCheckOut: string | null;
  showEditorial: boolean;
}

/** Docs-only controlled harness; date and guest state stays local, no Mews calls. */
function ArrivalDemo({
  openCalendar,
  initialCheckIn,
  initialCheckOut,
  showEditorial,
}: ArrivalDemoProps) {
  const [checkIn, setCheckIn] = useState<string | null>(initialCheckIn);
  const [checkOut, setCheckOut] = useState<string | null>(initialCheckOut);
  const [activeSection, setActiveSection] = useState<ActiveDropdownSection>(openCalendar ? "dates" : null);
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);
  const [infants, setInfants] = useState(0);
  const [accessible, setAccessible] = useState(false);
  const [location, setLocation] = useState("CATSKILLS");
  const [promoCode, setPromoCode] = useState("");
  const [action, setAction] = useState<string | null>(null);
  useEffect(() => {
    setCheckIn(initialCheckIn);
    setCheckOut(initialCheckOut);
    setActiveSection(openCalendar ? "dates" : null);
  }, [initialCheckIn, initialCheckOut, openCalendar]);
  const nights = checkIn && checkOut
    ? Math.max(0, Math.round((Date.parse(checkOut) - Date.parse(checkIn)) / 86_400_000))
    : 0;
  const stories = showEditorial
    ? [
        { title: "Disappear for a While", text: "Trade pavement for mountain air.", icon: `${imageBaseUrl}/assets/icons/icons-simple/hammock.svg` },
        { title: "Soak It All In", text: "Sauna, outdoor hangs and long baths.", icon: `${imageBaseUrl}/assets/icons/icons-simple/estonian_sauna.svg` },
        { title: "Better Together", text: "Dinner, drinks and fireside nights.", icon: `${imageBaseUrl}/assets/icons/icons-simple/campfire.svg` },
      ]
    : [];

  return (
    <div className="w-full">
      <Arrive
        checkIn={checkIn}
        checkOut={checkOut}
        setRange={(start, end) => { setCheckIn(start); setCheckOut(end); }}
        adults={adults}
        children={children}
        infants={infants}
        setAdults={setAdults}
        setChildren={setChildren}
        setInfants={setInfants}
        accessible={accessible}
        setAccessible={setAccessible}
        location={location}
        setLocation={setLocation}
        promoCode={promoCode}
        setPromoCode={setPromoCode}
        activeSection={activeSection}
        setActiveSection={setActiveSection}
        dailyRates={{}}
        loadCalendar={async () => { /* Deterministic docs demo: no Mews request. */ }}
        onMatch={() => setAction("Match me with a room")}
        onBrowse={() => setAction("Browse every room")}
        nights={nights}
        stories={stories}
        showQuickSelect={false}
        imageBaseUrl={imageBaseUrl}
      />
      <p className="sr-only" role="status">{action ?? "No action taken"}</p>
    </div>
  );
}

export const arrivalStory = defineStory({
  Component: ArrivalDemo,
  args: { initial: { openCalendar: false, initialCheckIn: null, initialCheckOut: null, showEditorial: true } },
});

export const arrivalCalendarStory = defineStory({
  Component: ArrivalDemo,
  args: { initial: { openCalendar: true, initialCheckIn: null, initialCheckOut: null, showEditorial: true } },
});

export const arrivalDatesStory = defineStory({
  Component: ArrivalDemo,
  args: { initial: { openCalendar: false, initialCheckIn: "2026-11-12", initialCheckOut: "2026-11-15", showEditorial: true } },
});

export const arrivalNoEditorialStory = defineStory({
  Component: ArrivalDemo,
  args: { initial: { openCalendar: false, initialCheckIn: null, initialCheckOut: null, showEditorial: false } },
});
