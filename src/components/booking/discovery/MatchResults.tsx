import type { RecommendationResult } from "../types";
import TopMatchPanel from "../match/TopMatchPanel";
import RoomCard from "../rooms/RoomCard";

export default function MatchResults({
  results,
  onBack,
  onBrowseAll,
  onViewRoom,
}: {
  results: RecommendationResult[];
  onBack: () => void;
  onBrowseAll: () => void;
  onViewRoom: (roomId: string) => void;
}) {
  if (results.length === 0) {
    return (
      <main className="min-h-screen bg-[#ebe8e0]">
        <div className="mx-auto max-w-4xl px-5 pb-20 pt-10 md:px-10">
          <button
            type="button"
            onClick={onBack}
            className="mb-8 text-xs uppercase tracking-widest text-[#767470] transition-colors hover:text-[#4e332d]"
            style={{ fontFamily: "var(--font-brothers)" }}
          >
            ← Back
          </button>
          <div className="rounded-2xl border border-[#ccc7bb] bg-white/70 p-10 text-center">
            <h2 className="text-3xl text-[#4e332d]" style={{ fontFamily: "var(--font-desert)", fontWeight: 700 }}>
              No rooms match these criteria
            </h2>
            <p className="mx-auto mt-3 max-w-lg text-sm text-[#767470]">
              Adjust your search or browse all currently available rooms.
            </p>
            <button type="button" onClick={onBrowseAll} className="mt-6 rounded-full bg-[#4e332d] px-6 py-3 text-xs font-semibold uppercase tracking-widest text-[#ebe8e0]">
              Browse All Rooms
            </button>
          </div>
        </div>
      </main>
    );
  }

  const [top, ...alternates] = results;

  return (
    <main className="min-h-screen bg-[#ebe8e0]">
      <div className="mx-auto max-w-5xl px-5 pb-20 pt-10 md:px-10">
        <button
          type="button"
          onClick={onBack}
          className="mb-8 text-xs uppercase tracking-widest text-[#767470] transition-colors hover:text-[#4e332d]"
          style={{ fontFamily: "var(--font-brothers)" }}
        >
          ← Back
        </button>

        <div className="mb-8">
          <p className="mb-2 text-xs uppercase tracking-widest text-[#9a5636]" style={{ fontFamily: "var(--font-brothers)" }}>
            Matched for You
          </p>
          <h1 className="text-4xl leading-none text-[#4e332d] md:text-5xl" style={{ fontFamily: "var(--font-desert)", fontWeight: 700 }}>
            Your Best Match
          </h1>
        </div>

        <div className="mb-10">
          <TopMatchPanel result={top} onViewRoom={() => onViewRoom(top.room.id)} />
        </div>

        {alternates.length > 0 && (
          <>
            <div className="mb-5">
              <p className="text-xs uppercase tracking-widest text-[#9a5636]" style={{ fontFamily: "var(--font-brothers)" }}>
                {top.explanation?.alternate_match_heading || "Also a Strong Fit"}
              </p>
            </div>
            <div className="mb-10 grid grid-cols-1 gap-5 md:grid-cols-2">
              {alternates.map((result) => (
                <RoomCard
                  key={result.room.id}
                  room={result.room}
                  matchBadge={result.matchedInterests.length > 0 ? "GREAT FIT" : undefined}
                  score={result.score}
                  onSelect={() => onViewRoom(result.room.id)}
                />
              ))}
            </div>
          </>
        )}

        <div className="text-center">
          <button
            type="button"
            onClick={onBrowseAll}
            className="text-xs uppercase tracking-widest text-[#9a5636] underline underline-offset-4"
            style={{ fontFamily: "var(--font-brothers)" }}
          >
            Browse all available rooms
          </button>
        </div>
      </div>
    </main>
  );
}
