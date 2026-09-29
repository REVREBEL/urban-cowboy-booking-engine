import EmptyState from "@/components/feedback/EmptyState";
import type { RecommendationResult } from "../../types";
import RoomCard from "../rooms/RoomCard";
import TopMatchPanel from "../rooms/TopMatchPanel";

export type MatchResultsProps = {
  results: RecommendationResult[];
  totalAvailable: number;
  hasPreferences: boolean;
  onBack: () => void;
  onStartQuiz: () => void;
  onViewRoom: (roomId: string) => void;
  onBrowseAll: () => void;
};

export default function MatchResults({
  results,
  totalAvailable,
  hasPreferences,
  onBack,
  onStartQuiz,
  onViewRoom,
  onBrowseAll,
}: MatchResultsProps) {
  if (!hasPreferences) {
    return (
      <EmptyState
        heading="No preferences found"
        body="Go back and answer the questions first."
        action={{ label: "Help Me Choose", onClick: onStartQuiz }}
      />
    );
  }

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
          <EmptyState
            heading="No rooms match these criteria"
            body="Your current filters removed all options. Try adjusting your search or browsing all rooms."
            action={{ label: "Browse All Rooms", onClick: onBrowseAll }}
          />
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
                  onSelect={() => onViewRoom(result.room.id)}
                />
              ))}
            </div>
          </>
        )}

        <div className="border-t border-[#ccc7bb] pt-4 text-center">
          <p className="mb-3 text-sm text-[#767470]" style={{ fontFamily: "var(--font-uchen)" }}>
            Not seeing what you&apos;re after?
          </p>
          <button
            type="button"
            onClick={onBrowseAll}
            className="text-xs uppercase tracking-widest text-[#9a5636] hover:underline"
            style={{ fontFamily: "var(--font-brothers)" }}
          >
            Browse All {totalAvailable} Rooms →
          </button>
        </div>
      </div>
    </main>
  );
}
