import { useState } from "react";
import { InlineDateRangePicker } from "./InlineDateRangePicker";

export type StudioSearchValue = {
  checkIn: string;
  checkOut: string;
  adults: number;
  children: number;
  infants: number;
  voucherCode: string;
};

type ActiveSection = "dates" | "guests" | "promo" | null;

type StudioSearchBarProps = {
  value: StudioSearchValue;
  onChange: (value: StudioSearchValue) => void;
  onSearch: () => void;
  error?: string;
};

function displayDate(value: string) {
  if (!value) return "Add date";
  const parts = value.split("-").map(Number);
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(
    new Date(parts[0], parts[1] - 1, parts[2]),
  );
}

function Stepper({
  label,
  sub,
  value,
  min,
  onChange,
}: {
  label: string;
  sub: string;
  value: number;
  min: number;
  onChange: (value: number) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-5 py-3">
      <div>
        <p className="font-brothers text-sm uppercase text-[#343833]">{label}</p>
        <p className="font-uchen text-[12px] text-[#8D8A87]">{sub}</p>
      </div>
      <div className="flex items-center gap-3">
        <button type="button" disabled={value <= min} onClick={() => onChange(Math.max(min, value - 1))} className="grid h-8 w-8 place-items-center rounded-full border border-[#343833] text-lg leading-none text-[#343833] disabled:border-[#D7D3CF] disabled:text-[#C8C6C4]">−</button>
        <span className="w-5 text-center font-uchen text-sm text-[#343833]">{value}</span>
        <button type="button" onClick={() => onChange(value + 1)} className="grid h-8 w-8 place-items-center rounded-full border border-[#343833] text-lg leading-none text-[#343833]">+</button>
      </div>
    </div>
  );
}

export function StudioSearchBar({ value, onChange, onSearch, error }: StudioSearchBarProps) {
  const [active, setActive] = useState<ActiveSection>(null);
  const [promo, setPromo] = useState(value.voucherCode);

  function toggle(section: ActiveSection) {
    setActive((current) => (current === section ? null : section));
  }

  function updateDates(checkIn: string, checkOut: string) {
    onChange({ ...value, checkIn, checkOut });
    if (checkIn && checkOut) setActive(null);
  }

  function applyPromo() {
    onChange({ ...value, voucherCode: promo.trim().toUpperCase() });
    setActive(null);
  }

  const guestCount = value.adults + value.children;
  const guestLabel =
    guestCount +
    " guest" +
    (guestCount === 1 ? "" : "s") +
    (value.infants > 0 ? " · " + value.infants + " baby" + (value.infants === 1 ? "" : "ies") : "");

  return (
    <div className="booking-shell">
      <div className="relative">
        <div role="search" aria-label="Book your stay" className="grid w-full grid-cols-1 gap-1 rounded-[28px] border-2 border-[#4E332D] bg-[#FAF9F9] p-2 shadow-[0_4px_12px_rgba(0,0,0,0.08)] md:grid-cols-[1.05fr_1.7fr_.85fr_.75fr_auto] md:items-center md:gap-0 md:rounded-full">
          <div className="min-w-0 border-b border-[#EBE8E0] px-4 py-3 md:border-b-0 md:border-r">
            <span className="block font-brothers text-[10px] uppercase leading-4 tracking-[1.4px] text-[#4E332D]/70">Property</span>
            <span className="block truncate font-desert text-sm font-bold uppercase tracking-[2px] text-[#4E332D]">Catskills</span>
          </div>

          <button type="button" onClick={() => toggle("dates")} className="group relative min-w-0 border-b border-[#EBE8E0] bg-transparent px-4 py-3 text-left md:border-b-0 md:border-r">
            <span className="block font-brothers text-[10px] uppercase leading-4 tracking-[1.4px] text-[#4E332D]/70 group-hover:text-[#9A5636]">When</span>
            <span className="block truncate font-uchen text-sm text-[#4E332D]">{displayDate(value.checkIn)} — {displayDate(value.checkOut)}</span>
            <span className={"absolute bottom-1 left-4 right-4 h-[3px] rounded-full bg-[#9A5636] transition-transform " + (active === "dates" ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100")} />
          </button>

          <button type="button" onClick={() => toggle("guests")} className="group relative min-w-0 border-b border-[#EBE8E0] bg-transparent px-4 py-3 text-left md:border-b-0 md:border-r">
            <span className="block font-brothers text-[10px] uppercase leading-4 tracking-[1.4px] text-[#4E332D]/70 group-hover:text-[#9A5636]">Guests</span>
            <span className="block truncate font-uchen text-sm text-[#4E332D]">{guestLabel}</span>
            <span className={"absolute bottom-1 left-4 right-4 h-[3px] rounded-full bg-[#9A5636] transition-transform " + (active === "guests" ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100")} />
          </button>

          <button type="button" onClick={() => toggle("promo")} className="group relative min-w-0 bg-transparent px-4 py-3 text-left">
            <span className="block font-brothers text-[10px] uppercase leading-4 tracking-[1.4px] text-[#4E332D]/70 group-hover:text-[#9A5636]">Promo</span>
            <span className="block truncate font-uchen text-sm text-[#4E332D]">{value.voucherCode || "Add promo"}</span>
            <span className={"absolute bottom-1 left-4 right-4 h-[3px] rounded-full bg-[#9A5636] transition-transform " + (active === "promo" ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100")} />
          </button>

          <div className="p-1">
            <button type="button" onClick={onSearch} className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-[#4E332D] px-6 font-brothers text-sm font-bold uppercase tracking-[1.6px] text-[#FAF9F9] shadow-md transition hover:bg-[#343833] md:w-auto">
              Search <span aria-hidden="true">→</span>
            </button>
          </div>
        </div>

        {active === "dates" && (
          <div className="absolute left-0 right-0 top-full z-50 mt-3 rounded-3xl border-2 border-[#4E332D] bg-[#FAF9F9] p-4 shadow-2xl sm:p-6">
            <div className="mb-4 flex items-center justify-between border-b border-[#D1C9BE] pb-3">
              <h3 className="font-brothers text-base uppercase tracking-[1.2px] text-[#4E332D]">Select dates of stay</h3>
              <button type="button" onClick={() => setActive(null)} aria-label="Close date picker" className="grid h-8 w-8 place-items-center rounded-full text-[#4E332D] hover:bg-[#EBE8E0]">×</button>
            </div>
            <InlineDateRangePicker checkIn={value.checkIn} checkOut={value.checkOut} onChange={updateDates} />
          </div>
        )}

        {active === "guests" && (
          <div className="absolute right-0 top-full z-50 mt-3 w-[360px] max-w-[calc(100vw-2rem)] border-2 border-[#343833] bg-[#FAF9F9] p-6 shadow-xl">
            <Stepper label="Adults" sub="Age 13+" value={value.adults} min={1} onChange={(adults) => onChange({ ...value, adults })} />
            <div className="h-px bg-[#E1E0E0]" />
            <Stepper label="Children" sub="Age 4–12" value={value.children} min={0} onChange={(children) => onChange({ ...value, children })} />
            <div className="h-px bg-[#E1E0E0]" />
            <Stepper label="Babies" sub="Age 0–3" value={value.infants} min={0} onChange={(infants) => onChange({ ...value, infants })} />
            <button type="button" onClick={() => setActive(null)} className="mt-4 w-full rounded-full bg-[#4E332D] py-2.5 font-brothers text-xs font-bold uppercase tracking-wider text-[#FAF9F9]">Done</button>
          </div>
        )}

        {active === "promo" && (
          <div className="absolute right-0 top-full z-50 mt-3 w-[290px] max-w-[calc(100vw-2rem)] border-2 border-[#343833] bg-[#FAF9F9] p-6 shadow-xl">
            <label className="block font-brothers text-sm uppercase tracking-wider text-[#343833]">Promo / Group Code</label>
            <div className="mt-2 flex items-center border-b border-[#4E332D]">
              <input
                value={promo}
                onChange={(event) => setPromo(event.target.value)}
                onKeyDown={(event) => event.key === "Enter" && applyPromo()}
                placeholder="Enter code"
                className="h-11 min-w-0 flex-1 bg-transparent font-uchen text-base uppercase text-[#4E332D] outline-none placeholder:normal-case"
              />
              <button type="button" onClick={applyPromo} className="font-brothers text-xs font-bold uppercase text-[#4E332D]">Apply</button>
            </div>
          </div>
        )}
      </div>
      {error && <p className="mt-3 px-3 font-editorial text-sm font-semibold text-[#8C2340]">{error}</p>}
    </div>
  );
}
