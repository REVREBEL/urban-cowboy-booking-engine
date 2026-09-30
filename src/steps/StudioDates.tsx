import { useState } from "react";
import { useBooking } from "@/state/booking";
import { StudioSearchBar, type StudioSearchValue } from "@/components/studio-booking/StudioSearchBar";
import { PillarFeatures } from "@/components/studio-booking/PillarFeatures";

export function StudioDates() {
  const { checkIn, checkOut, adults, children, infants, voucherCode, properties, setSearch, goTo } = useBooking();
  const [form, setForm] = useState<StudioSearchValue>({
    checkIn,
    checkOut,
    adults: adults || 2,
    children: children || 0,
    infants: infants || 0,
    voucherCode,
  });
  const [error, setError] = useState("");

  function search() {
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
      properties,
    });
    goTo("results");
  }

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

      <div className="mb-10">
        <StudioSearchBar value={form} onChange={setForm} onSearch={search} error={error} />
      </div>

      <PillarFeatures />
    </section>
  );
}
