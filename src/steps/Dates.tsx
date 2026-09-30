import { useState } from "react";
import { useBooking, DEFAULT_PROPERTIES } from "../state/booking";
import { nights } from "../lib/format";
import { SearchBarExpanded, type ActiveDropdownSection } from "@/features/find-your-stay/components/search/SearchBarExpanded";
import { SearchButton } from "@/features/find-your-stay/components/search/SearchButton";
import { SearchBarPromoDropdown } from "@/features/find-your-stay/components/search/SearchBarPromoDropdown";
import { InlineDateRangePicker } from "@/features/find-your-stay/components/search/InlineDateRangePicker";
import { PillarFeatures } from "@/components/PillarFeatures";

type SearchForm = {
  checkIn: string;
  checkOut: string;
  adults: number;
  children: number;
  infants: number;
  voucherCode: string;
  properties: string[];
  accessible: boolean;
};

function formatDateDisplay(value: string) {
  if (!value) return "Add date";
  const [year, month, day] = value.split("-").map(Number);
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(year, month - 1, day));
}

export function Dates() {
  const {
    checkIn,
    checkOut,
    adults,
    children,
    infants,
    voucherCode,
    properties,
    setSearch,
    goTo,
  } = useBooking();

  const [form, setForm] = useState<SearchForm>({
    checkIn: checkIn || "",
    checkOut: checkOut || "",
    adults: adults || 2,
    children: children || 0,
    infants: infants || 0,
    voucherCode: voucherCode || "",
    properties: properties?.length ? properties : DEFAULT_PROPERTIES,
    accessible: false,
  });
  const [activeSection, setActiveSection] = useState<ActiveDropdownSection>(null);
  const [promoInput, setPromoInput] = useState(form.voucherCode);
  const [error, setError] = useState("");

  const nightCount = nights(form.checkIn, form.checkOut);

  function updateDates(nextCheckIn: string, nextCheckOut: string) {
    setForm((current) => ({ ...current, checkIn: nextCheckIn, checkOut: nextCheckOut }));
    if (nextCheckIn && nextCheckOut) setActiveSection(null);
  }

  function applyPromo(value = promoInput) {
    const voucherCode = value.trim().toUpperCase();
    setPromoInput(voucherCode);
    setForm((current) => ({ ...current, voucherCode }));
    setActiveSection(null);
  }

  function submit() {
    if (!form.checkIn || !form.checkOut) {
      setError("Choose your arrival and departure dates.");
      return;
    }
    if (form.checkOut <= form.checkIn) {
      setError("Check-out must be after check-in.");
      return;
    }

    setError("");
    setSearch({
      checkIn: form.checkIn,
      checkOut: form.checkOut,
      adults: form.adults,
      children: form.children,
      infants: form.infants,
      voucherCode: form.voucherCode,
      properties: form.properties,
    });
    goTo("results");
  }

  const dropdownSlot = (
    <>
      {activeSection === "dates" && (
        <div className="absolute left-0 right-0 top-full z-50 mt-3 rounded-3xl border-2 border-[#4E332D] bg-[#FAF9F9] p-4 shadow-2xl sm:p-6">
          <div className="mb-4 flex items-center justify-between border-b border-[#D1C9BE] pb-3">
            <h3 className="font-brothers text-base uppercase tracking-[1.2px] text-[#4E332D]">Select dates of stay</h3>
            <button type="button" onClick={() => setActiveSection(null)} aria-label="Close date picker" className="grid h-8 w-8 place-items-center rounded-full text-[#4E332D] hover:bg-[#EBE8E0]">×</button>
          </div>
          <InlineDateRangePicker checkIn={form.checkIn} checkOut={form.checkOut} onChange={updateDates} />
        </div>
      )}

      {activeSection === "guests" && (
        <div className="absolute right-[12%] top-full z-50 mt-3 w-[360px] max-w-[calc(100vw-2rem)] border-2 border-[#343833] bg-[#FAF9F9] p-6 shadow-xl">
          <GuestStepper label="Adults" sub="Age 13+" value={form.adults} min={1} onChange={(adults) => setForm((current) => ({ ...current, adults }))} />
          <div className="h-px bg-[#E1E0E0]" />
          <GuestStepper label="Children" sub="Age 4–12" value={form.children} min={0} onChange={(children) => setForm((current) => ({ ...current, children }))} />
          <div className="h-px bg-[#E1E0E0]" />
          <GuestStepper label="Babies" sub="Age 0–3" value={form.infants} min={0} onChange={(infants) => setForm((current) => ({ ...current, infants }))} />
          <div className="h-px bg-[#E1E0E0]" />
          <button
            type="button"
            role="switch"
            aria-checked={form.accessible}
            onClick={() => setForm((current) => ({ ...current, accessible: !current.accessible }))}
            className="flex w-full items-center justify-between py-4 text-left"
          >
            <span>
              <span className="block font-brothers text-sm uppercase text-[#343833]">Accessible</span>
              <span className="block font-uchen text-[12px] text-[#8D8A87]">ADA room preference · wiring preserved for later</span>
            </span>
            <span className={"relative h-7 w-12 rounded-full transition-colors " + (form.accessible ? "bg-[#343833]" : "bg-[#E1E0E0]")}>
              <span className={"absolute top-0.5 h-6 w-6 rounded-full bg-[#FAF9F9] shadow-sm transition-transform " + (form.accessible ? "translate-x-[22px]" : "translate-x-0.5")} />
            </span>
          </button>
          <button type="button" onClick={() => setActiveSection(null)} className="mt-2 w-full rounded-full bg-[#4E332D] py-2.5 font-brothers text-xs font-bold uppercase tracking-wider text-[#FAF9F9]">Done</button>
        </div>
      )}

      {activeSection === "promo" && (
        <SearchBarPromoDropdown
          value={promoInput}
          onChange={setPromoInput}
          onApply={applyPromo}
          onClose={() => setActiveSection(null)}
          className="absolute right-0 top-full z-50 mt-3"
        />
      )}
    </>
  );

  return (
    <section className="w-full bg-[#EBE8E0] py-12 md:py-16">
      <div className="booking-shell mb-10 text-center">
        <span className="mb-2 block font-bianco text-xs font-bold uppercase tracking-widest text-[#9A5636]">
          Catskills · Big Indian, NY
        </span>
        <h1 className="mb-3 font-desert text-[55px] font-bold uppercase leading-none tracking-[2px] text-[#4E332D]">
          Book Your Stay
        </h1>
        <p className="font-editorial text-lg text-[#4E332D]/80 sm:text-xl">
          Arrive as Strangers. Leave as Friends.
        </p>
      </div>

      <div className="booking-shell">
        <SearchBarExpanded
          values={{
            property: "CATSKILLS",
            checkInDate: formatDateDisplay(form.checkIn),
            checkOutDate: formatDateDisplay(form.checkOut),
            guests: form.adults + form.children,
            promoCode: form.voucherCode,
          }}
          activeSection={activeSection}
          onSectionClick={(section) => setActiveSection(section === "property" ? null : section)}
          onSearch={submit}
          buttonSlot={
            <>
              <SearchButton variant="full-circle" onClick={submit} className="hidden md:flex" />
              <SearchButton variant="icon-circle" onClick={submit} className="flex md:hidden" />
            </>
          }
          dropdownSlot={dropdownSlot}
        />
        <div className="mt-3 flex flex-wrap items-center justify-between gap-3 px-3">
          <p className="font-editorial text-xs text-[#6B6259]">
            {nightCount > 0
              ? nightCount + " night" + (nightCount === 1 ? "" : "s") + " · " + (form.adults + form.children) + " guest" + (form.adults + form.children === 1 ? "" : "s") + (form.infants > 0 ? " · " + form.infants + " baby" + (form.infants === 1 ? "" : "ies") : "")
              : "Choose your dates to begin."}
          </p>
          {form.accessible && <span className="font-bianco text-[10px] font-bold uppercase tracking-wider text-[#9A5636]">Accessible preference selected</span>}
        </div>
        {error && <p className="mt-3 px-3 font-editorial text-sm font-semibold text-[#8C2340]">{error}</p>}
      </div>

      <PillarFeatures />
    </section>
  );
}

function GuestStepper({
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
