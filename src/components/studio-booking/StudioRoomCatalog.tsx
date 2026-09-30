import { useMemo, useState } from "react";
import type { ShapedRoom } from "@/types/mews";
import { StudioRoomCard, type StudioRoomCardColor } from "./StudioRoomCard";

type FeatureFilter = "all" | "dog" | "outdoorSoak" | "fireplace";

type StudioRoomCatalogProps = {
  rooms: ShapedRoom[];
  imageBaseUrl: string;
  checkIn: string;
  checkOut: string;
  adults: number;
  onBackToSearch: () => void;
  onHelpMeChoose: () => void;
  onSelectRoom: (room: ShapedRoom) => void;
  onOpenRoomDetails: (room: ShapedRoom) => void;
};

function familyFor(room: ShapedRoom) {
  return room.merchandising?.family || room.property || "Other";
}

export function StudioRoomCatalog({
  rooms,
  imageBaseUrl,
  checkIn,
  checkOut,
  adults,
  onBackToSearch,
  onHelpMeChoose,
  onSelectRoom,
  onOpenRoomDetails,
}: StudioRoomCatalogProps) {
  const [family, setFamily] = useState("all");
  const [feature, setFeature] = useState<FeatureFilter>("all");

  const families = useMemo(
    () => Array.from(new Set(rooms.map(familyFor))).sort((a, b) => a.localeCompare(b)),
    [rooms],
  );

  const filtered = useMemo(
    () =>
      rooms.filter((room) => {
        if (family !== "all" && familyFor(room) !== family) return false;
        const merchandising = room.merchandising;
        if (feature === "dog" && merchandising?.dogPolicy !== "allowed") return false;
        if (feature === "outdoorSoak" && !merchandising?.features.outdoorSoak) return false;
        if (feature === "fireplace" && !merchandising?.features.fireplace) return false;
        return true;
      }),
    [rooms, family, feature],
  );

  const palette: StudioRoomCardColor[] = ["paper", "forest", "smoke", "copper"];

  return (
    <section className="texture-linen min-h-screen w-full pb-24">
      <div className="booking-shell border-b border-[#4E332D]/15 pb-6 pt-8">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div>
            <button type="button" onClick={onBackToSearch} className="mb-3 inline-flex items-center gap-2 font-woodblock text-[11px] uppercase tracking-widest text-[#73716D] transition-colors hover:text-[#4E332D]">
              ← Back to Dates
            </button>
            <h1 className="font-display text-3xl font-extrabold uppercase tracking-tight text-[#221C18] sm:text-4xl lg:text-5xl">Find Your Stay</h1>
            <p className="mt-2 max-w-2xl font-editorial text-sm text-[#4E332D]/80 sm:text-base">
              {rooms.length} live room experience{rooms.length === 1 ? "" : "s"} available for these dates. Each one has its own way of doing Cowboy.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button type="button" onClick={onHelpMeChoose} className="flex items-center gap-2 rounded-full border border-[#4E332D]/30 bg-[#FAF9F9] px-5 py-2.5 font-woodblock text-xs uppercase tracking-wider text-[#4E332D] shadow-sm transition hover:border-[#4E332D] hover:bg-white">
              ✦ Help Me Choose
            </button>
            <div className="rounded-full border border-[#4E332D]/20 bg-[#FAF9F9] px-4 py-2 font-woodblock text-xs uppercase tracking-wider text-[#4E332D]">
              {checkIn} — {checkOut} · {adults} Adult{adults === 1 ? "" : "s"}
            </div>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-[#4E332D]/10 pt-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="mr-2 font-woodblock text-[11px] uppercase tracking-wider text-[#73716D]">Filter by experience:</span>
            <button type="button" onClick={() => setFamily("all")} className={"rounded-full px-3.5 py-1 font-woodblock text-xs uppercase tracking-wider " + (family === "all" ? "bg-[#4E332D] text-[#EBE8E0]" : "border border-[#4E332D]/20 bg-[#FAF9F9] text-[#4E332D]")}>All</button>
            {families.map((item) => (
              <button key={item} type="button" onClick={() => setFamily(item)} className={"rounded-full px-3.5 py-1 font-woodblock text-xs uppercase tracking-wider " + (family === item ? "bg-[#4E332D] text-[#EBE8E0]" : "border border-[#4E332D]/20 bg-[#FAF9F9] text-[#4E332D]")}>
                {item}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {([
              ["all", "All Features"],
              ["dog", "Dogs Welcome"],
              ["outdoorSoak", "Outdoor Soak"],
              ["fireplace", "Fireplace"],
            ] as Array<[FeatureFilter, string]>).map(([key, label]) => (
              <button key={key} type="button" onClick={() => setFeature(key)} className={"rounded-full px-3 py-1 font-bianco text-[10px] font-bold uppercase tracking-wider " + (feature === key ? "bg-[#9A5636] text-white" : "border border-[#9A5636]/40 bg-transparent text-[#9A5636]")}>
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="booking-shell mt-8 space-y-6">
        {filtered.map((room, index) => (
          <StudioRoomCard
            key={room.categoryId}
            room={room}
            imageBaseUrl={imageBaseUrl}
            color={palette[index % palette.length]}
            layout={index % 2 === 0 ? "left" : "right"}
            onSelectRoom={onSelectRoom}
            onOpenRoomDetails={onOpenRoomDetails}
          />
        ))}
        {filtered.length === 0 && (
          <div className="rounded-2xl border-2 border-[#4E332D] bg-[#FAF9F9] p-10 text-center">
            <h2 className="font-desert text-3xl font-bold uppercase text-[#4E332D]">No rooms in that filter</h2>
            <p className="mt-3 font-editorial text-sm text-[#6B6259]">Try another experience or clear the feature filter.</p>
          </div>
        )}
      </div>
    </section>
  );
}
