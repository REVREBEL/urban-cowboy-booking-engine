import type { RecommendationResult } from "../model";

export function FindStayTopMatchPanel({
  result,
  onViewRoom,
}: {
  result: RecommendationResult;
  onViewRoom: () => void;
}) {
  const copy = result.explanation;
  const benefits = copy ? [copy.benefit_1, copy.benefit_2, copy.benefit_3].filter(Boolean) : [];

  return (
    <article className="flex flex-col overflow-hidden rounded-2xl bg-white shadow-lg md:flex-row">
      <div className="relative min-h-[220px] overflow-hidden md:w-[45%]">
        <img src={result.room.thumbImage} alt={result.room.name} className="absolute inset-0 h-full w-full object-cover" />
        <span className="absolute left-4 top-4 rounded-full bg-[#9a5636] px-3 py-1 text-[10px] uppercase tracking-widest text-white">
          {copy?.match_badge ?? "TOP MATCH"}
        </span>
      </div>

      <div className="flex flex-1 flex-col justify-between p-6 md:p-8">
        <div>
          <p className="mb-1 text-xs uppercase tracking-widest text-[#9a5636]">
            {copy?.room_type ?? result.room.experience}
          </p>
          <h2 className="mb-2 text-2xl leading-tight text-umber md:text-3xl" style={{ fontFamily: "var(--font-desert)", fontWeight: 700 }}>
            {result.room.name}
          </h2>
          <p className="mb-4 text-sm text-[#767470]">
            {copy?.top_match_reason ?? result.room.tagline}
          </p>

          {benefits.length > 0 && (
            <ul className="mb-6 flex flex-col gap-2">
              {benefits.map((benefit) => (
                <li key={benefit} className="flex items-center gap-2 text-sm text-umber">
                  <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#9a5636]" />
                  {benefit}
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-xs text-[#767470]">Starting from</p>
            <p className="text-2xl text-umber">
              {"$"}{result.room.startingFrom}<span className="text-sm text-[#767470]">/night</span>
            </p>
          </div>
          <button type="button" onClick={onViewRoom} className="rounded-full bg-[#9a5636] px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#8b3a2e]">
            View Room
          </button>
        </div>
      </div>
    </article>
  );
}
