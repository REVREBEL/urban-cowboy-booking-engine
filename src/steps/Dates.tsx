import { useState } from "react";
import { SearchBarExpanded, type ActiveDropdownSection } from "@/components/booking/search/SearchBarExpanded";
import { InlineDateRangePicker } from "@/components/booking/search/InlineDateRangePicker";
import { SearchBarGuestDropdown } from "@/components/booking/search/SearchBarGuestsDropdown";
import { SearchBarLocationDropdown } from "@/components/booking/search/SearchBarLocationDropdown";
import { SearchBarPromoDropdown } from "@/components/booking/search/SearchBarPromoDropdown";
import { useBooking, DEFAULT_PROPERTIES } from "@/state/booking";
import { fmtDate, nights } from "@/lib/format";

const PILLARS = [
  {
    title: "Disappear for a While",
    text: "Trade pavement for mountain air and the kind of quiet that makes you forget what day it is.",
    icon: "/assets/hammock.svg",
  },
  {
    title: "Soak It All In",
    text: "Sauna, outdoor hangs, long baths and plenty of ways to slow the whole operation down.",
    icon: "/assets/icons/amenities/simple/estonian_sauna.svg",
    useMask: true,
  },
  {
    title: "Better Together",
    text: "Dinner, drinks, fireside nights and whatever happens next. Cowboy is made for gathering.",
    icon: "/assets/campfire.svg",
  },
] as const;

function displayDate(value: string) {
  return value ? fmtDate(value) : "Add dates";
}


export function Dates() {
  const booking = useBooking();
  const [form, setForm] = useState({
    checkIn: booking.checkIn || "",
    checkOut: booking.checkOut || "",
    adults: booking.adults || 2,
    children: booking.children || 0,
    infants: booking.infants || 0,
    voucherCode: booking.voucherCode || "",
    properties: booking.properties?.length ? booking.properties : DEFAULT_PROPERTIES,
  });
  const [location, setLocation] = useState("CATSKILLS");
  const [accessible, setAccessible] = useState(false);
  const [activeSection, setActiveSection] = useState<ActiveDropdownSection>(null);
  const [error, setError] = useState("");

  const displayedChildCount = form.children + form.infants;
  const guestCount = form.adults + displayedChildCount;
  const nightCount = nights(form.checkIn, form.checkOut);
  const guestLabel = `${form.adults} adult${form.adults === 1 ? "" : "s"}${
    displayedChildCount ? ` · ${displayedChildCount} child${displayedChildCount === 1 ? "" : "ren"}` : ""
  }`;

  function setDates(checkIn: string, checkOut: string, close = false) {
    setForm((current) => ({ ...current, checkIn, checkOut }));
    setError("");
    if (close) setActiveSection(null);
  }

  function submit() {
    if (!form.checkIn || !form.checkOut) {
      setError("Choose your check-in and check-out dates.");
      setActiveSection("dates");
      return;
    }
    if (form.checkOut <= form.checkIn) {
      setError("Check-out must be after check-in.");
      setActiveSection("dates");
      return;
    }
    setError("");
    booking.setSearch(form);
    booking.goTo("results");
  }

  return (
    <section className="min-h-[calc(100vh-4rem)] bg-[#EBE8E0] pb-20 pt-12 text-[#4E332D] md:pt-16">
      <div className="booking-shell text-center">
        <p className="mb-2 font-bianco text-xs font-bold uppercase tracking-[2px] text-[#9A5636]">Catskills · Big Indian, NY</p>
        <h1 className="font-desert text-[44px] font-bold uppercase leading-none tracking-[2px] sm:text-[55px]">Book Your Stay</h1>
        <p className="mt-4 font-editorial text-lg text-[#4E332D]/80 sm:text-xl">Arrive as Strangers. Leave as Friends.</p>
      </div>

      <div className="booking-shell relative z-20 mt-10">
        <div className="mx-auto w-full max-w-[1057px]">
          <SearchBarExpanded
            variant="circle"
            values={{ property: location, checkInDate: displayDate(form.checkIn), checkOutDate: displayDate(form.checkOut), guests: guestLabel, promoCode: form.voucherCode || "Add promo" }}
            activeSection={activeSection}
            onSectionClick={setActiveSection}
            onSearch={submit}
            className="!w-full"
            dropdownSlot={
              <>
                {activeSection === "property" && (
                  <SearchBarLocationDropdown
                    value={location}
                    onChange={setLocation}
                    onClose={() => setActiveSection(null)}
                    className="max-w-full"
                  />
                )}

                {activeSection === "dates" && (
                  <div className="w-full rounded-3xl border-2 border-[#4E332D] bg-[#FAF9F9] p-4 shadow-2xl sm:p-6">
                    <div className="mb-4 flex items-center justify-between border-b border-[#4E332D]/20 pb-3 text-left">
                      <span className="font-bianco text-sm font-bold uppercase tracking-[2px] text-[#4E332D]">Select dates of stay</span>
                      <button type="button" onClick={() => setActiveSection(null)} aria-label="Close date picker" className="grid h-8 w-8 place-items-center rounded-full text-xl text-[#4E332D] hover:bg-[#EBE8E0]">×</button>
                    </div>
                    <InlineDateRangePicker checkIn={form.checkIn} checkOut={form.checkOut} onChange={(checkIn, checkOut) => setDates(checkIn, checkOut)} />
                    <div className="mt-4 flex flex-col gap-4 border-t border-[#4E332D]/10 pt-4 text-left sm:flex-row sm:items-end sm:justify-between">
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                        <span className="font-bianco text-[10px] font-bold uppercase tracking-[1.5px] text-[#4E332D]/60">Quick Select</span>
                        <div className="flex flex-wrap gap-2">
                          {[
                            ["Fall Foliage (Oct 14–17)", "2026-10-14", "2026-10-17"],
                            ["Summer Solstice (Jun 2–5)", "2027-06-02", "2027-06-05"],
                            ["Cozy Fireside Weekend (Nov 5–8)", "2026-11-05", "2026-11-08"],
                          ].map(([label, checkIn, checkOut]) => (
                            <button
                              key={label}
                              type="button"
                              onClick={() => setDates(checkIn, checkOut)}
                              className="rounded-full border border-[#4E332D] bg-transparent px-3 pb-1 pt-1.5 font-uchen text-xs leading-none text-[#4E332D] transition-colors hover:bg-[#4E332D] hover:text-[#FAF9F9] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#9A5636]"
                            >
                              {label}
                            </button>
                          ))}
                        </div>
                      </div>

                      <button
                        type="button"
                        disabled={!form.checkIn || !form.checkOut || form.checkOut <= form.checkIn}
                        onClick={() => setActiveSection(null)}
                        className="self-end rounded-full bg-[#4E332D] px-6 pb-2.5 pt-3 font-bianco text-xs font-bold uppercase tracking-[1.5px] text-[#FAF9F9] transition-colors hover:bg-[#9A5636] disabled:cursor-not-allowed disabled:opacity-35 sm:shrink-0"
                      >
                        Confirm dates
                      </button>
                    </div>
                  </div>
                )}

                {activeSection === "guests" && (
                  <div className="flex justify-end">
                    <SearchBarGuestDropdown
                      counts={{ adults: form.adults, children: form.children, infants: form.infants, accessible }}
                      onChange={(values) => {
                        setAccessible(values.accessible);
                        setForm((current) => ({
                          ...current,
                          adults: values.adults,
                          children: values.children,
                          infants: values.infants,
                        }));
                      }}
                      onClose={() => setActiveSection(null)}
                      className="max-w-full"
                    />
                  </div>
                )}

                {activeSection === "promo" && (
                  <div className="flex justify-end">
                    <SearchBarPromoDropdown
                      value={form.voucherCode}
                      onChange={(voucherCode) => setForm((current) => ({ ...current, voucherCode }))}
                      onApply={(voucherCode) => {
                        setForm((current) => ({ ...current, voucherCode }));
                        setActiveSection(null);
                      }}
                      onClose={() => setActiveSection(null)}
                    />
                  </div>
                )}
              </>
            }
          />

          {error && <p role="alert" className="mt-3 text-left font-editorial text-sm font-semibold text-[#8C2340]">{error}</p>}
          {!error && nightCount > 0 && (
            <p className="mt-3 text-left font-editorial text-xs text-[#4E332D]/65">
              {nightCount} night{nightCount === 1 ? "" : "s"} · {guestCount} guest{guestCount === 1 ? "" : "s"}
            </p>
          )}
        </div>
      </div>

      <div className="booking-shell mt-16">
        <div className="mx-auto grid max-w-5xl gap-12 md:grid-cols-3">
          {PILLARS.map((pillar) => (
            <article key={pillar.title} className="text-center md:text-left">
              {"useMask" in pillar ? (
                <span
                  aria-hidden="true"
                  className="mx-auto mb-4 block h-14 w-14 bg-current md:mx-0"
                  style={{
                    WebkitMask: `url("${pillar.icon}") center / contain no-repeat`,
                    mask: `url("${pillar.icon}") center / contain no-repeat`,
                  }}
                />
              ) : (
                <img src={pillar.icon} alt="" aria-hidden="true" className="mx-auto mb-4 h-14 w-14 object-contain md:mx-0" />
              )}
              <h2 className="font-brothers text-base font-bold uppercase tracking-[1px]">{pillar.title}</h2>
              <p className="mt-2 font-editorial text-sm leading-relaxed text-[#4E332D]/75">{pillar.text}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
