import { useState, type ReactNode } from "react";
import type { ShapedRoom } from "@/types/mews";
import type { MatchInterest, RecommendationPreferences } from "@/types/merchandising";
import { buildTopMatchCopy } from "@/lib/topMatch";

export type MatchResultsProps = {
  rooms: ShapedRoom[];
  preferences: RecommendationPreferences;
  checkIn: string;
  totalAvailable: number;
  onBack: () => void;
  onBrowseAll: () => void;
  renderRoom: (room: ShapedRoom, options: { top: boolean; index: number }) => ReactNode;
  afterTop?: ReactNode;
};

const INTEREST_LABELS: Record<MatchInterest, string> = {
  iconTub: "an iconic copper-tub soak",
  outdoorSoak: "bathing outside",
  ownPlace: "a place of your own",
  scenic: "mountain and forest views",
  simpleCozy: "something simple and cozy",
  social: "room to gather",
};

function listChoices(interests: [MatchInterest, MatchInterest?]) {
  const labels = interests.filter(Boolean).map((interest) => INTEREST_LABELS[interest as MatchInterest]);
  return labels.length === 2 ? labels[0] + " and " + labels[1] : labels[0];
}

function MatchReasonCard({
  room,
  checkIn,
  preferences,
}: {
  room: ShapedRoom;
  checkIn: string;
  preferences: RecommendationPreferences;
}) {
  const [saved, setSaved] = useState(false);
  const copy = buildTopMatchCopy(room.name, preferences, checkIn, room.merchandising);
  const choices = listChoices(preferences.interests);

  async function share() {
    const data = { title: room.name, text: copy.top_match_reason, url: window.location.href };
    if (navigator.share) {
      await navigator.share(data).catch(() => undefined);
      return;
    }
    await navigator.clipboard?.writeText(window.location.href).catch(() => undefined);
  }

  return (
    <aside className="flex h-full min-h-[320px] flex-col border border-[#8C2340] bg-[#FAF9F9] p-4 text-[#4E332D] sm:p-5">
      <img src="/assets/labels/top_match.svg" alt="Top Match" className="h-auto w-28 object-contain" />

      <p className="mx-auto mt-4 max-w-[18rem] font-editorial text-xs leading-[1.45]">
        This room feels made for {copy.party_summary}, with {choices} shaping the match.
      </p>

      <div className="mt-4 border-t border-[#8C2340]/45 pt-4">
        <h2 className="font-brothers text-lg font-bold uppercase leading-none text-[#8C2340]">
          You&apos;ll Love It Because …
        </h2>
      </div>

      <div className="mt-4 space-y-4">
        <section>
          <h3 className="font-bianco text-xs font-bold text-[#8C2340]">Your Choices, Reflected</h3>
          <p className="mt-1 font-editorial text-[11px] leading-[1.45]">{copy.benefit_1}</p>
        </section>
        <section>
          <h3 className="font-bianco text-xs font-bold text-[#8C2340]">Your Stay, Considered</h3>
          <p className="mt-1 font-editorial text-[11px] leading-[1.45]">{copy.benefit_2}</p>
        </section>
        <section>
          <h3 className="font-bianco text-xs font-bold text-[#8C2340]">
            Even Better in {copy.season_label.charAt(0).toUpperCase() + copy.season_label.slice(1)}
          </h3>
          <p className="mt-1 font-editorial text-[11px] leading-[1.45]">{copy.benefit_3}</p>
        </section>
      </div>

      <div className="mt-auto flex justify-end gap-2 pt-5">
        <button type="button" onClick={share} className="rounded-full border border-[#4E332D] px-4 pb-1.5 pt-2 font-bianco text-[10px] font-bold uppercase tracking-[1px] hover:bg-[#4E332D] hover:text-[#FAF9F9]">
          Share
        </button>
        <button type="button" aria-pressed={saved} onClick={() => setSaved((value) => !value)} className="rounded-full bg-[#8C2340] px-4 pb-1.5 pt-2 font-bianco text-[10px] font-bold uppercase tracking-[1px] text-[#FAF9F9] hover:bg-[#6E1B32]">
          {saved ? "Saved" : "Save"}
        </button>
      </div>
    </aside>
  );
}

export default function MatchResults({
  rooms,
  preferences,
  checkIn,
  totalAvailable,
  onBack,
  onBrowseAll,
  renderRoom,
  afterTop,
}: MatchResultsProps) {
  const [top, ...alternates] = rooms;

  return (
    <section className="min-h-screen bg-[#EBE8E0] pb-24 pt-10">
      <div className="booking-shell !max-w-[1800px]">
        <button type="button" onClick={onBack} className="mb-10 font-bianco text-xs font-bold uppercase tracking-[2px] text-[#6B6259] hover:text-[#4E332D]">
          ← Adjust Preferences
        </button>

        <header className="mb-8">
          <div className="mb-5 flex items-center gap-3 text-[#9A5636]" aria-hidden="true">
            <span className="size-2.5 rounded-full bg-current" />
            <span className="h-px w-8 bg-current" />
            <span className="size-2.5 rounded-full bg-current" />
            <span className="h-px w-8 bg-current" />
            <span className="size-2.5 rounded-full bg-current" />
          </div>
          <p className="mb-4 font-bianco text-xs font-bold uppercase tracking-[5px] text-[#9A5636]">Step 1 of 3</p>
          <h1 className="font-desert text-5xl font-bold uppercase leading-none text-[#4E332D] md:text-6xl">Your Matches</h1>
        </header>

        {top ? (
          <>
            <div className="grid w-full items-stretch gap-6 lg:grid-cols-[minmax(0,3fr)_minmax(20rem,1fr)]">
              {renderRoom(top, { top: true, index: 0 })}
              <MatchReasonCard room={top} checkIn={checkIn} preferences={preferences} />
            </div>

            {afterTop}

            {alternates.length > 0 && (
              <div className="mt-10">
                <h2 className="font-desert text-2xl font-bold uppercase tracking-[1px] text-[#4E332D] md:text-3xl">
                  Other High Matching Options
                </h2>
                <div className="mt-5 space-y-5">
                  {alternates.slice(0, 2).map((room, index) => (
                    <div key={room.categoryId}>{renderRoom(room, { top: false, index: index + 1 })}</div>
                  ))}
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="rounded-2xl border-2 border-[#4E332D] bg-[#FAF9F9] p-10 text-center">
            <h2 className="font-desert text-3xl font-bold uppercase text-[#4E332D]">No exact matches yet</h2>
            <p className="mx-auto mt-3 max-w-lg font-editorial text-sm text-[#6B6259]">
              Try adjusting your party or preference selections, or browse every available room.
            </p>
          </div>
        )}

        <div className="mt-10 border-t border-[#4E332D]/20 pt-6 text-center">
          <button type="button" onClick={onBrowseAll} className="font-bianco text-xs font-bold uppercase tracking-[2px] text-[#4E332D] underline underline-offset-4">
            View All {totalAvailable} Rooms
          </button>
        </div>
      </div>
    </section>
  );
}
