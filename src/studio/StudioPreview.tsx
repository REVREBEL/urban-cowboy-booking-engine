import { useState } from "react";
import { createPortal } from "react-dom";

const screens = ["Search", "Find Your Stay", "Rooms", "Rates", "Extras", "Checkout", "Confirmation"] as const;
const scenarios = ["Standard availability", "Sold out", "Family with children", "Traveling with dog", "Member rate", "Payment declined"] as const;
type Screen = typeof screens[number];
type Scenario = typeof scenarios[number];

/** Non-transactional presentation shell. No live booking APIs are mounted here. */
export function StudioPreview({ property }: { property: string }) {
  const [screen, setScreen] = useState<Screen>("Search");
  const [scenario, setScenario] = useState<Scenario>("Standard availability");
  const [layout, setLayout] = useState("Vertical");
  const [open, setOpen] = useState(false);
  return (
    <div className="min-h-dvh bg-paper text-cowboy-umber">
      <header className="border-b border-current/20 px-6 py-5 flex justify-between items-center">
        <strong className="font-heading uppercase tracking-widest">Urban Cowboy · Booking Engine</strong>
        <span className="text-xs font-label uppercase tracking-widest">Demo · No reservations</span>
      </header>
      <main className="mx-auto w-full max-w-6xl px-4 sm:px-8 py-10">
        <h1 className="font-heading text-4xl uppercase">{screen}</h1>
        <p className="font-body mt-3">Scenario: {scenario} · {property}</p>
        <div className="mt-8 rounded-2xl border border-current/20 p-8 min-h-72">
          <p className="font-body text-sm uppercase tracking-wide mb-5">{layout} presentation · safe preview</p>
          {screen === "Search" ? <div className="flex flex-wrap gap-4"><span>Check-in</span><span>Check-out</span><span>2 Guests</span></div>
            : screen === "Rooms" || screen === "Find Your Stay" ? <p className="font-heading text-2xl">ALPINE · WALDEN · FOREST HOUSE</p>
            : screen === "Rates" ? <p className="font-heading text-2xl">{scenario === "Member rate" ? "MEMBER RATE" : "KEEP YOUR OPTIONS OPEN"}</p>
            : screen === "Checkout" ? <p className="font-body">Demo checkout. Real payment and reservation services are not available.</p>
            : screen === "Confirmation" ? <p className="font-body">Example confirmation only. No reservation has been created.</p>
            : <p className="font-body">Sample {screen.toLowerCase()} presentation.</p>}
          {scenario === "Sold out" && <p className="mt-5 text-sm">No availability for the selected demo dates.</p>}
          {scenario === "Payment declined" && screen === "Checkout" && <p className="mt-5 text-sm" role="alert">Simulated payment error.</p>}
        </div>
      </main>
      {createPortal(
        <div className="fixed z-[9999] bottom-5 right-5 flex flex-col items-end gap-2 font-body">
          {open && <section role="dialog" aria-label="Studio controls" className="w-[min(350px,calc(100vw-40px))] max-h-[75dvh] overflow-auto rounded-2xl bg-paper text-cowboy-umber border border-current/20 shadow-2xl p-5">
            <div className="flex justify-between items-center mb-5"><strong>Studio Controls</strong><button onClick={() => setOpen(false)} aria-label="Minimize Studio">✕</button></div>
            <label className="block text-sm mb-3">Booking screen<select className="mt-1 block w-full border p-2 rounded-lg bg-white" value={screen} onChange={(e) => setScreen(e.target.value as Screen)}>{screens.map(x => <option key={x}>{x}</option>)}</select></label>
            <label className="block text-sm mb-3">Demo scenario<select className="mt-1 block w-full border p-2 rounded-lg bg-white" value={scenario} onChange={(e) => setScenario(e.target.value as Scenario)}>{scenarios.map(x => <option key={x}>{x}</option>)}</select></label>
            <label className="block text-sm mb-3">Layout<select className="mt-1 block w-full border p-2 rounded-lg bg-white" value={layout} onChange={(e) => setLayout(e.target.value)}><option>Vertical</option><option>Horizontal</option><option>Compact</option></select></label>
            <p className="text-xs opacity-70">Preview-only controls; no Mews or payment requests.</p>
          </section>}
          <button className="rounded-full bg-cowboy-umber text-paper shadow-lg px-5 py-3 font-label" aria-expanded={open} onClick={() => setOpen(x => !x)}>{open ? "Minimize" : "Studio"}</button>
        </div>, document.body)}
    </div>
  );
}
