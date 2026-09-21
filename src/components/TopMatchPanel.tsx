import type { ShapedRoom } from "../types/mews";
import { buildTopMatchCopy, type RecommendationPreferences } from "../lib/topMatch";

export function TopMatchPanel({
  room,
  preferences,
  checkIn,
}: {
  room: ShapedRoom;
  preferences: RecommendationPreferences;
  checkIn: string;
}) {
  const copy = buildTopMatchCopy(room.name, preferences, checkIn);
  const benefits = [copy.benefit_1, copy.benefit_2, copy.benefit_3];

  return (
    <aside aria-labelledby="top-match-heading" className="h-fit rounded-xl2 border border-teal-deep/15 bg-teal-deep p-6 text-cream shadow-card lg:sticky lg:top-6">
      <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-turquoise-vivid">{copy.match_badge}</p>
      <h2 id="top-match-heading" className="mt-3 font-display text-2xl leading-tight">
        {copy.room_type} is a great fit for {copy.party_summary}.
      </h2>
      <p className="mt-4 text-sm leading-relaxed text-cream/80">
        Based on your interest in <strong className="font-semibold text-cream">{copy.interest_summary}</strong>, this room stands out for {copy.top_match_reason}.
      </p>

      <div className="mt-6 border-t border-cream/15 pt-5">
        <h3 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-cream/65">YOU'LL LOVE IT BECAUSE…</h3>
        <ul className="mt-3 space-y-3">
          {benefits.map((benefit) => (
            <li key={benefit} className="flex gap-3 text-sm leading-relaxed text-cream/85">
              <span aria-hidden="true" className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-turquoise-vivid" />
              <span>{benefit}</span>
            </li>
          ))}
        </ul>
      </div>

      <p className="mt-6 text-xs leading-relaxed text-cream/55">{copy.alternate_match_heading}</p>
    </aside>
  );
}
