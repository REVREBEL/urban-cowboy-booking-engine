import type { RecommendationResult } from "../model";
import { EmptyState } from "@/components/feedback/empty-state";
import { FindStayRoomCard } from "../rooms/room-card";
import { FindStayTopMatchPanel } from "./top-match-panel";

export function MatchResults({
  results,
  totalAvailable,
  onBack,
  onBrowseAll,
  onViewRoom,
}: {
  results: RecommendationResult[];
  totalAvailable: number;
  onBack?: () => void;
  onBrowseAll: () => void;
  onViewRoom: (result: RecommendationResult) => void;
}) {
  if (results.length === 0) {
    return (
      <main className="min-h-screen bg-linen">
        <div className="mx-auto max-w-4xl px-5 pb-20 pt-10 md:px-10">
          {onBack && (
            <button type="button" onClick={onBack} className="mb-8 text-xs uppercase tracking-widest text-[#767470] hover:text-umber">
              ← Back
            </button>
          )}
          <EmptyState
            heading="No rooms match these criteria"
            body="Try adjusting your preferences or browse all available rooms."
            action={{ label: "Browse All Rooms", onClick: onBrowseAll }}
          />
        </div>
      </main>
    );
  }

  const [top, ...alternates] = results;

  return (
    <main className="min-h-screen bg-linen">
      <div className="mx-auto max-w-5xl px-5 pb-20 pt-10 md:px-10">
        {onBack && (
          <button type="button" onClick={onBack} className="mb-8 text-xs uppercase tracking-widest text-[#767470] hover:text-umber">
            ← Back
          </button>
        )}

        <div className="mb-8">
          <p className="mb-2 text-xs uppercase tracking-widest text-[#9a5636]">Matched for You</p>
          <h1 className="text-4xl leading-none text-umber md:text-5xl" style={{ fontFamily: "var(--font-desert)", fontWeight: 700 }}>
            Your Best Match
          </h1>
        </div>

        <div className="mb-10">
          <FindStayTopMatchPanel result={top} onViewRoom={() => onViewRoom(top)} />
        </div>

        {alternates.length > 0 && (
          <>
            <p className="mb-5 text-xs uppercase tracking-widest text-[#9a5636]">
              {top.explanation?.alternate_match_heading || "Also a Strong Fit"}
            </p>
            <div className="mb-10 grid grid-cols-1 gap-5 md:grid-cols-2">
              {alternates.map((result) => (
                <FindStayRoomCard
                  key={result.room.id}
                  room={result.room}
                  matchBadge={result.matchedInterests.length > 0 ? "GREAT FIT" : undefined}
                  onSelect={() => onViewRoom(result)}
                />
              ))}
            </div>
          </>
        )}

        <div className="border-t border-[#ccc7bb] pt-5 text-center">
          <p className="mb-3 text-sm text-[#767470]">Not seeing what you’re after?</p>
          <button type="button" onClick={onBrowseAll} className="text-xs uppercase tracking-widest text-[#9a5636] hover:underline">
            Browse All {totalAvailable} Rooms →
          </button>
        </div>
      </div>
    </main>
  );
}
