import type { RecommendationPreferences, MatchInterest } from "@/types/merchandising";
import type { ShapedRoom } from "@/types/mews";
import { buildTopMatchCopy } from "@/lib/topMatch";
import { StudioRoomCard } from "./StudioRoomCard";

type StudioMatchResultsProps = {
  rooms: ShapedRoom[];
  preferences: RecommendationPreferences;
  checkIn: string;
  imageBaseUrl: string;
  totalAvailable: number;
  onBack: () => void;
  onBrowseAll: () => void;
  onSelectRoom: (room: ShapedRoom) => void;
  onOpenRoomDetails: (room: ShapedRoom) => void;
};

const INTEREST_LABELS: Record<MatchInterest, string> = {
  iconTub: "an iconic copper-tub soak",
  outdoorSoak: "bathing outside",
  ownPlace: "a place of your own",
  scenic: "mountain and forest views",
  simpleCozy: "something simple and cozy",
  social: "room to gather",
};

function choices(preferences: RecommendationPreferences) {
  const labels = preferences.interests.filter(Boolean).map((interest) => INTEREST_LABELS[interest as MatchInterest]);
  return labels.length === 2 ? labels[0] + " and " + labels[1] : labels[0];
}

export function StudioMatchResults({
  rooms,
  preferences,
  checkIn,
  imageBaseUrl,
  totalAvailable,
  onBack,
  onBrowseAll,
  onSelectRoom,
  onOpenRoomDetails,
}: StudioMatchResultsProps) {
  if (rooms.length === 0) {
    return (
      <section className="min-h-screen bg-[#EBE8E0] py-12">
        <div className="booking-shell max-w-3xl text-center">
          <button type="button" onClick={onBack} className="mb-8 font-bianco text-xs font-bold uppercase tracking-widest text-[#767470]">← Back</button>
          <h1 className="font-desert text-5xl font-bold uppercase text-[#4E332D]">No exact match this time</h1>
          <p className="mx-auto mt-4 max-w-xl font-editorial text-sm text-[#6B6259]">Your current party and eligibility filters removed the available rooms. Browse all eligible rooms or change your answers.</p>
          <button type="button" onClick={onBrowseAll} className="mt-7 rounded-full bg-[#4E332D] px-7 py-3 font-bianco text-xs font-bold uppercase tracking-widest text-[#EBE8E0]">Browse Available Rooms</button>
        </div>
      </section>
    );
  }

  const top = rooms[0];
  const alternates = rooms.slice(1, 3);
  const copy = buildTopMatchCopy(top.name, preferences, checkIn, top.merchandising);

  return (
    <section className="min-h-screen bg-[#EBE8E0] pb-24 pt-10">
      <div className="booking-shell">
        <button type="button" onClick={onBack} className="mb-8 font-bianco text-xs font-bold uppercase tracking-widest text-[#767470] transition hover:text-[#4E332D]">← Back</button>

        <header className="mb-8">
          <p className="mb-2 font-bianco text-xs font-bold uppercase tracking-[4px] text-[#9A5636]">Matched for You</p>
          <h1 className="font-desert text-5xl font-bold uppercase leading-none text-[#4E332D] md:text-6xl">Your Best Match</h1>
          <p className="mt-4 max-w-3xl font-editorial text-sm text-[#6B6259]">
            You told us you wanted {choices(preferences)}. Here&apos;s where those choices line up best with live availability.
          </p>
        </header>

        <div className="grid items-stretch gap-4 xl:grid-cols-[minmax(0,2.2fr)_minmax(18rem,0.9fr)]">
          <StudioRoomCard room={top} imageBaseUrl={imageBaseUrl} topMatch onSelectRoom={onSelectRoom} onOpenRoomDetails={onOpenRoomDetails} />
          <aside className="flex min-h-[320px] flex-col border-2 border-[#8C2340] bg-[#FAF9F9] p-5 text-[#4E332D]">
            <p className="font-bianco text-[10px] font-bold uppercase tracking-[3px] text-[#8C2340]">Your Top Match</p>
            <h2 className="mt-3 font-brothers text-2xl font-bold uppercase leading-none text-[#8C2340]">{top.name}</h2>
            <p className="mt-4 font-editorial text-xs leading-[1.55]">This room is our top match for {copy.party_summary}. {copy.top_match_reason}.</p>
            <div className="mt-5 border-t border-[#8C2340]/45 pt-5">
              <h3 className="font-brothers text-lg font-bold uppercase leading-none text-[#8C2340]">You&apos;ll Love It Because …</h3>
            </div>
            <div className="mt-5 space-y-5">
              <section>
                <h4 className="font-bianco text-xs font-bold text-[#8C2340]">Your Choices, Reflected</h4>
                <p className="mt-1 font-editorial text-[11px] leading-[1.5]">{copy.benefit_1}</p>
              </section>
              <section>
                <h4 className="font-bianco text-xs font-bold text-[#8C2340]">Your Stay, Considered</h4>
                <p className="mt-1 font-editorial text-[11px] leading-[1.5]">{copy.benefit_2}</p>
              </section>
              <section>
                <h4 className="font-bianco text-xs font-bold text-[#8C2340]">Even Better in {copy.season_label}</h4>
                <p className="mt-1 font-editorial text-[11px] leading-[1.5]">{copy.benefit_3}</p>
              </section>
            </div>
          </aside>
        </div>

        {alternates.length > 0 && (
          <div className="mt-12">
            <h2 className="font-desert text-3xl font-bold uppercase text-[#4E332D]">Other High-Matching Options</h2>
            <div className="mt-5 space-y-5">
              {alternates.map((room, index) => (
                <StudioRoomCard
                  key={room.categoryId}
                  room={room}
                  imageBaseUrl={imageBaseUrl}
                  color={index % 2 === 0 ? "forest" : "smoke"}
                  layout={index % 2 === 0 ? "left" : "right"}
                  onSelectRoom={onSelectRoom}
                  onOpenRoomDetails={onOpenRoomDetails}
                />
              ))}
            </div>
          </div>
        )}

        <div className="mt-10 border-t border-[#CCC7BB] pt-5 text-center">
          <p className="mb-3 font-editorial text-sm text-[#767470]">Not seeing what you&apos;re after?</p>
          <button type="button" onClick={onBrowseAll} className="font-bianco text-xs font-bold uppercase tracking-widest text-[#9A5636] hover:underline">
            Browse All {totalAvailable} Rooms →
          </button>
        </div>
      </div>
    </section>
  );
}
