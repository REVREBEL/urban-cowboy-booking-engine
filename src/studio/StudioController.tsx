import { useState } from "react";
import { createPortal } from "react-dom";
import { useBooking, type Step } from "@/state/booking";
import { api } from "@/lib/api";
import { buildRooms } from "@/lib/shaping";
import { isoDay } from "@/lib/format";
import { currentStudioScenario, type StudioScenario } from "./demoApi";

const stepLabels: { label: string; value: Step }[] = [
  { label: "Search", value: "dates" },
  { label: "Rooms", value: "results" },
  { label: "Rates", value: "rates" },
  { label: "Guest details", value: "guest" },
  { label: "Extras", value: "extras" },
  { label: "Checkout", value: "payment" },
  { label: "Confirmation", value: "confirmation" },
];
const scenarioLabels: { label: string; value: StudioScenario }[] = [
  { label: "Standard availability", value: "standard" },
  { label: "Sold-out dates", value: "sold-out" },
  { label: "Family with children", value: "family" },
  { label: "Traveling with dog", value: "dog" },
  { label: "Member rate", value: "member" },
  { label: "Payment error", value: "payment-error" },
];

/** Floating UI only. Does not change booking engine width or layout. */
export function StudioController() {
  const booking = useBooking();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const scenario = currentStudioScenario();
  const [layout, setLayout] = useState(() => new URLSearchParams(window.location.search).get("studioLayout") || "vertical");

  const changeScenario = (value: StudioScenario) => {
    const url = new URL(window.location.href);
    url.search = "";
    url.searchParams.set("scenario", value);
    window.location.assign(url.toString());
  };

  const changeLayout = (value: string) => {
    setLayout(value);
    const url = new URL(window.location.href);
    url.searchParams.set("studioLayout", value);
    window.history.replaceState(null, "", url);
    window.dispatchEvent(new Event("studio-layout-change"));
  };

  async function selectStep(target: Step) {
    if (busy) return;
    setBusy(true);
    setMessage("");
    try {
      if (target === "dates") { booking.goTo(target); return; }
      const checkIn = booking.checkIn || isoDay(14);
      const checkOut = booking.checkOut || isoDay(17);
      const children = scenario === "family" ? 2 : 0;
      if (!booking.checkIn || !booking.checkOut) {
        booking.setSearch({ checkIn, checkOut, adults: 2, children, properties: ["hotel"] });
      }
      const hotel = booking.hotel ?? await api.hotel();
      const response = await api.availability({
        checkIn, checkOut, adults: 2, children, infants: 0,
        currencyCode: hotel.DefaultCurrencyCode,
      });
      const rooms = buildRooms(response, hotel);
      booking.setAvailableRooms(rooms);
      if (target === "results") { booking.goTo(target); return; }
      const first = rooms.find((room) => room.rates.length > 0);
      if (!first) {
        setMessage("No simulated rooms available for this scenario. Choose another scenario.");
        booking.goTo("results");
        return;
      }
      booking.selectRoomRate(first, first.rates[0]);
      if (target === "confirmation") {
        // Synthetic receipt only. The API fixture never talks to Mews.
        booking.setCreated({
          id: "STUDIO-DEMO-RESERVATION", customerId: "STUDIO-GUEST",
          paymentRequestId: null, paymentUrl: null, creditCardAvailable: false,
          totalAmount: { currency: "USD", gross: 1275, net: 1159.09, taxTotal: 115.91, taxes: [] },
          reservations: [{
            id: "STUDIO-DEMO-ROOM", number: "DEMO-ONLY",
            roomCategoryId: first.roomTypeId, rateId: first.rates[0].rateId,
            startUtc: "", endUtc: "", adultCount: 2, childCount: 0,
            amount: { currency: "USD", gross: 1275, net: 1159.09, taxTotal: 115.91, taxes: [] },
          }],
        });
      }
      booking.goTo(target);
    } catch {
      setMessage("This preview state could not be loaded.");
    } finally {
      setBusy(false);
    }
  }

  return createPortal(
    <aside className="fixed bottom-5 right-5 z-[9999] flex flex-col items-end gap-2 font-body" aria-label="Demo Studio">
      {open && (
        <section role="dialog" aria-label="Studio controls"
          className="w-[min(350px,calc(100vw-40px))] max-h-[75dvh] overflow-auto rounded-2xl bg-paper text-cowboy-umber border border-current/20 shadow-2xl p-5">
          <div className="flex justify-between items-center mb-4">
            <strong className="font-heading uppercase">Studio controls</strong>
            <button type="button" onClick={() => setOpen(false)} aria-label="Minimize Studio">✕</button>
          </div>
          <label className="block text-xs font-label uppercase mb-3">Booking screen
            <select className="mt-1 block w-full border p-2 rounded-lg bg-white" value={booking.step}
              disabled={busy} onChange={(e) => void selectStep(e.target.value as Step)}>
              {stepLabels.map((x) => <option value={x.value} key={x.value}>{x.label}</option>)}
            </select>
          </label>
          <label className="block text-xs font-label uppercase mb-3">Demo scenario
            <select className="mt-1 block w-full border p-2 rounded-lg bg-white" value={scenario}
              onChange={(e) => changeScenario(e.target.value as StudioScenario)}>
              {scenarioLabels.map((x) => <option value={x.value} key={x.value}>{x.label}</option>)}
            </select>
          </label>
          <label className="block text-xs font-label uppercase mb-3">Rate presentation
            <select className="mt-1 block w-full border p-2 rounded-lg bg-white" value={layout}
              onChange={(e) => changeLayout(e.target.value)}>
              <option value="vertical">Vertical</option>
              <option value="horizontal">Horizontal</option>
              <option value="compact">Compact</option>
            </select>
          </label>
          {message && <p role="alert" className="mb-3 text-xs">{message}</p>}
          <p className="text-xs opacity-70">Simulated rates and payments · never creates a real reservation</p>
        </section>
      )}
      <button type="button" onClick={() => setOpen((old) => !old)} aria-expanded={open}
        className="rounded-full bg-cowboy-umber text-paper shadow-lg px-5 py-3 font-label">
        {open ? "Minimize" : "Studio"}
      </button>
    </aside>,
    document.body,
  );
}
