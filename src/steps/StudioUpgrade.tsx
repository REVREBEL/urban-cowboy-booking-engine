import { useEffect, useMemo, useState } from "react";
import { useBooking } from "@/state/booking";
import { upgradeRooms } from "@/lib/shaping";\nimport type { ShapedRoom } from "@/types/mews";
import { StudioRoomCard } from "@/components/studio-booking/StudioRoomCard";
import { CreoleUpsellStories } from "@/components/booking/extras/creole-upsell-stories";

export function StudioUpgrade() {
  const {
    availableRooms,
    selectedRoom,
    selectedRate,
    selectRoomRate,
    imageBaseUrl,
    goTo,
  } = useBooking();

  useEffect(() => {
    if (!selectedRoom || !selectedRate) goTo("results");
  }, [selectedRoom, selectedRate, goTo]);

  const [base] = useState(() => ({
    room: selectedRoom,
    total: selectedRate?.totalGross ?? selectedRoom?.fromGross ?? 0,
  }));

  const upgrades = useMemo(
    () => upgradeRooms(availableRooms, base.room, base.total),
    [availableRooms, base],
  );

  if (!selectedRoom || !selectedRate || !base.room) return null;

  function choose(room: ShapedRoom) {
    const rate = room.rates[0];
    if (rate) selectRoomRate(room, rate);
  }

  return (
    <section className="texture-linen min-h-screen pb-24 pt-10">
      <div className="booking-shell">
        <button type="button" onClick={() => goTo("guest")} className="mb-7 font-woodblock text-xs uppercase tracking-widest text-[#73716D] hover:text-[#4E332D]">
          ← Back to Your Details
        </button>

        <header className="mb-8 max-w-4xl">
          <p className="font-bianco text-xs font-bold uppercase tracking-[5px] text-[#9A5636]">One Last Look</p>
          <h1 className="mt-3 font-desert text-5xl font-bold uppercase leading-none text-[#4E332D] md:text-6xl">Room to Trade Up?</h1>
          <p className="mt-4 font-editorial text-sm text-[#6B6259]">
            If something roomier or more indulgent is available, this is the moment to make the switch. Your current selection stays put unless you choose another room.
          </p>
        </header>

        <div className="mb-8 rounded-2xl border-2 border-[#4E332D] bg-[#FAF9F9] p-5">
          <p className="font-bianco text-[10px] font-bold uppercase tracking-[3px] text-[#9A5636]">Current Choice</p>
          <div className="mt-2 flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 className="font-brothers text-2xl font-bold uppercase text-[#4E332D]">{selectedRoom.name}</h2>
              <p className="mt-1 font-editorial text-xs text-[#6B6259]">{selectedRate.name}</p>
            </div>
            <strong className="font-brothers text-2xl text-[#4E332D]">
              {selectedRate.totalGross !== null
                ? new Intl.NumberFormat("en-US", { style: "currency", currency: selectedRate.currency, maximumFractionDigits: 0 }).format(selectedRate.totalGross)
                : "Live quote"}
            </strong>
          </div>
        </div>

        <CreoleUpsellStories />

        {upgrades.length > 0 ? (
          <div className="mt-8 space-y-6">
            {upgrades.map((room, index) => (
              <StudioRoomCard
                key={room.categoryId}
                room={room}
                imageBaseUrl={imageBaseUrl}
                color={index % 2 === 0 ? "forest" : "copper"}
                layout={index % 2 === 0 ? "left" : "right"}
                onSelectRoom={choose}
              />
            ))}
          </div>
        ) : (
          <div className="mt-8 rounded-[24px] border-2 border-[#0E301A] bg-[#0E301A] p-8 text-center text-[#FAF9F9]">
            <p className="font-bianco text-xs font-bold uppercase tracking-[3px] text-[#F2AAA9]">Already There</p>
            <h2 className="mt-3 font-desert text-3xl font-bold uppercase">You&apos;ve Got the Best Available Fit</h2>
            <p className="mx-auto mt-3 max-w-lg font-editorial text-sm text-[#FAF9F9]/70">No higher-priced room upgrade is available for these dates.</p>
          </div>
        )}

        <div className="sticky bottom-0 z-20 mt-10 flex flex-wrap items-center justify-between gap-3 border-t border-[#4E332D]/20 bg-[#EBE8E0]/95 py-4 backdrop-blur">
          <p className="font-editorial text-xs text-[#6B6259]">Current room: <strong className="text-[#4E332D]">{selectedRoom.name}</strong></p>
          <button type="button" onClick={() => goTo("extras")} className="rounded-full bg-[#9A5636] px-8 py-3 font-bianco text-xs font-bold uppercase tracking-[2px] text-[#EBE8E0] hover:bg-[#783224]">
            Continue to Extras →
          </button>
        </div>
      </div>
    </section>
  );
}
