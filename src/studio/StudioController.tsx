import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useBooking, type Step } from "../state/booking";
import { buildRooms } from "../lib/shaping";
import { studioAvailability, studioHotel } from "./demoData";
import { getDemoScenario, setDemoScenario, type DemoScenario } from "./runtime";
import { currentStudioLayout, type RoomResultsLayout } from "./roomLayout";
import { resetPhotoJourney } from "../journey/photoSession";
import { Button } from "../components/ui/button";

const steps: { id: Step; label: string }[] = [
  { id: "dates", label: "Search" }, { id: "results", label: "Rooms / Find Your Stay" },
  { id: "rates", label: "Rates" }, { id: "guest", label: "Guest" },
  { id: "extras", label: "Extras" }, { id: "payment", label: "Checkout" },
];
const scenarios: { id: DemoScenario; label: string }[] = [
  { id: "standard", label: "Standard availability" }, { id: "soldout", label: "Sold out" },
  { id: "family", label: "Family with children" }, { id: "dog", label: "Traveling with dog" },
  { id: "member", label: "Member rate" }, { id: "nonrefundable", label: "Non-refundable" },
  { id: "error", label: "Availability error" },
];

export function StudioController() {
  const booking = useBooking();
  const [open, setOpen] = useState(false);
  const [roomLayout, setRoomLayout] = useState(() => currentStudioLayout());
  useEffect(() => {
    const sync = () => setRoomLayout(currentStudioLayout());
    window.addEventListener("studio-room-layout-change", sync);
    return () => window.removeEventListener("studio-room-layout-change", sync);
  }, []);
  const changeRoomLayout = (value: string) => {
    if (value !== "card" && value !== "photo") return;
    const layout: RoomResultsLayout = value;
    setRoomLayout(layout);
    const url = new URL(window.location.href);
    url.searchParams.set("roomLayout", layout);
    // Each engine has its own opening screen. A layout switch is a fresh
    // journey, not a jump into whichever Card step happened to be active.
    resetPhotoJourney();
    url.searchParams.delete("photoPath");
    url.searchParams.delete("step");
    window.history.replaceState({}, "", url);
    booking.resetAll();
    window.dispatchEvent(new Event("studio-room-layout-change"));
  };
  const [scenario, chooseScenario] = useState<DemoScenario>(getDemoScenario);
  const input = "w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900";
  const apply = (target: Step, nextScenario: DemoScenario) => {
    setDemoScenario(nextScenario);
    const start = new Date();
    start.setUTCDate(start.getUTCDate() + 21);
    const end = new Date(start);
    end.setUTCDate(end.getUTCDate() + 3);
    const checkIn = start.toISOString().slice(0, 10);
    const checkOut = end.toISOString().slice(0, 10);
    booking.resetAll();
    booking.setSearch({ checkIn, checkOut, adults: 2, children: nextScenario === "family" ? 1 : 0, properties: ["hotel"] });
    // Let setSearch invalidate the previous booking selection before seeding a
    // new demo room/rate. Otherwise React's batched updater clears the fixture.
    window.setTimeout(() => {
      if (target !== "dates" && target !== "results" && nextScenario !== "soldout" && nextScenario !== "error") {
        const room = buildRooms(studioAvailability(), studioHotel).find((item) => item.rates.length);
        if (room && room.rates[0]) booking.selectRoomRate(room, room.rates[0]);
      }
      booking.goTo(target);
    }, 0);
    setOpen(false);
  };
  return createPortal(
    <div className="fixed right-5 top-1/4 z-9999 flex -translate-y-1/2 items-center gap-3 font-sans" data-booking-studio>
      {open && (
        <section role="dialog" aria-label="Booking Studio controls"
          className="w-[min(350px,calc(100vw-110px))] max-h-[min(70vh,550px)] overflow-y-auto rounded-2xl border border-gray-300 bg-white p-5 text-gray-900 shadow-2xl">
          <div className="mb-4 flex items-center justify-between">
            <strong className="text-sm uppercase tracking-wide">Booking Studio</strong>
            <button type="button" className="rounded-md px-2 py-1 text-sm" aria-label="Minimize Studio" onClick={() => setOpen(false)}>Minimize</button>
          </div>
          <p className="mb-4 rounded-lg bg-amber-50 p-2 text-xs text-amber-900">Demo only. Live reservations, payments and tracking are disabled.</p>
          <label className="mb-3 block text-xs font-semibold">Scenario
            <select className={input + " mt-1"} value={scenario} onChange={(e) => { const next = e.target.value as DemoScenario; chooseScenario(next); apply("results", next); }}>
              {scenarios.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
            </select>
          </label>
          <label className="mb-3 block text-xs font-semibold">Jump to screen
            <select className={input + " mt-1"} value={booking.step} onChange={(e) => apply(e.target.value as Step, scenario)}>
              {steps.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
            </select>
          </label>
          <label className="mb-3 block text-xs font-semibold">Room results layout
            <select className={input + " mt-1"} value={roomLayout} onChange={(event) => changeRoomLayout(event.target.value)}>
              <option value="card">Card Layout</option>
              <option value="photo">Photo Layout</option>
            </select>
          </label>
          <p className="mb-2 rounded-lg bg-gray-100 p-2 text-xs text-gray-700" data-studio-fixture-count>
            Mock Mews catalog: {studioHotel.RoomCategories.length} room types, including Opa's Cabin. Scenario: {scenario}. CMS photos and amenities remain live Webflow editorial content.
          </p>
          <p className="text-xs text-gray-600">The booking engine retains its full width behind these controls.</p>
        </section>
      )}
      <Button type="button" aria-expanded={open} aria-label="Toggle Booking Studio"
        variant="filled" colorScheme="smoke" size="small" className="ml-auto rounded-full shadow-xl"
        onClick={() => setOpen((value) => !value)}>
        {open ? "Close Studio" : "Studio · DEMO"}
      </Button>
    </div>,
    document.body,
  );
}
