import EmptyState from "@/components/feedback/empty-state";
import type { RecommendationResult } from "../../types";

export type MatchResultsProps = {
  results: RecommendationResult[];
  totalAvailable: number;
  hasPreferences: boolean;
  onBack: () => void;
  onStartQuiz: () => void;
  onViewRoom: (roomId: string) => void;
  onBrowseAll: () => void;
};

function MatchRoomResult({
  result,
  top = false,
  onViewRoom,
}: {
  result: RecommendationResult;
  top?: boolean;
  onViewRoom: (roomId: string) => void;
}) {
  const copy = result.explanation;

  return (
    <article
      className={`rounded-2xl border bg-white p-6 shadow-sm ${top ? "border-[#9a5636]" : "border-[#ccc7bb]"}`}
    >
      <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
        <div className="min-w-0">
          {top && (
            <p
              className="mb-2 text-[10px] uppercase tracking-[0.2em] text-[#9a5636]"
              style={{ fontFamily: "var(--font-brothers)" }}
            >
              {copy?.match_badge || "Top Match"}
            </p>
          )}
          <h2
            className="text-3xl leading-none text-[#4e332d]"
            style={{ fontFamily: "var(--font-desert)", fontWeight: 700 }}
          >
            {result.room.name}
          </h2>
          <p
            className="mt-2 max-w-xl text-sm leading-relaxed text-[#767470]"
            style={{ fontFamily: "var(--font-uchen)" }}
          >
            {copy?.top_match_reason || result.room.description}
          </p>
          {result.matchedInterests.length > 0 && (
            <p
              className="mt-3 text-[10px] uppercase tracking-widest text-[#9a5636]"
              style={{ fontFamily: "var(--font-brothers)" }}
            >
              {result.matchedInterests.length} preference
              {result.matchedInterests.length === 1 ? "" : "s"} matched
            </p>
          )}
        </div>

        <button
          type="button"
          onClick={() => onViewRoom(result.room.id)}
          className="shrink-0 rounded-full bg-[#9a5636] px-5 py-2.5 text-xs uppercase tracking-widest text-white transition-opacity hover:opacity-80"
          style={{ fontFamily: "var(--font-brothers)" }}
        >
          View Room
        </button>
      </div>
    </article>
  );
}

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
          <p
            className="mb-2 text-xs uppercase tracking-widest text-[#9a5636]"
            style={{ fontFamily: "var(--font-brothers)" }}
          >
            Matched for You
          </p>
          <h1
            className="text-4xl leading-none text-[#4e332d] md:text-5xl"
            style={{ fontFamily: "var(--font-desert)", fontWeight: 700 }}
          >
            Your Best Match
          </h1>
        </div>

        <div className="space-y-5">
          <MatchRoomResult result={top} top onViewRoom={onViewRoom} />
          {alternates.map((result) => (
            <MatchRoomResult
              key={result.room.id}
              result={result}
              onViewRoom={onViewRoom}
            />
          ))}
        </div>

        <div className="mt-10 border-t border-[#ccc7bb] pt-4 text-center">
          <p
            className="mb-3 text-sm text-[#767470]"
            style={{ fontFamily: "var(--font-uchen)" }}
          >
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
