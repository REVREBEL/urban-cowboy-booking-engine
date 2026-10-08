import { Check } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import type { MatchRoomSummary } from "@/types/booking-ui";

export function MatchBenefitsCard({
  room,
  reasons,
  intro,
  reasonHeadings,
  compact = false,
  showActions = true,
}: {
  room: MatchRoomSummary;
  reasons: string[];
  intro?: string;
  reasonHeadings?: [string, string];
  compact?: boolean;
  showActions?: boolean;
}) {
  const [saved, setSaved] = useState(false);
  const recommendationIntro =
    intro ??
    `${room.name} feels made for this stay—${room.blurb.charAt(0).toLowerCase()}${room.blurb.slice(1)}`;
  const firstReason = reasons[0] ?? room.headline;
  const secondReason = reasons[1] ?? room.features.slice(0, 2).map((feature) => feature.label).join(" and ");
  const [firstHeading, secondHeading] = reasonHeadings ?? ["Made for Your Stay", "The Details You Asked For"];

  async function handleShare() {
    const shareData = { title: room.name, text: room.headline, url: window.location.href };
    if (navigator.share) {
      await navigator.share(shareData).catch(() => undefined);
      return;
    }
    await navigator.clipboard?.writeText(window.location.href).catch(() => undefined);
  }

  return (
    <aside
      className={`flex h-full flex-col overflow-hidden border-[1.5px] border-oxblood bg-white/80 text-oxblood ${
        compact ? "min-h-[310px] p-4" : "min-h-[620px] p-6"
      }`}
    >
      <img
        src="/assets/labels/top_match.svg"
        alt="Top Match"
        className={`h-auto w-full text-oxblood object-contain ${compact ? "max-w-28" : "max-w-[15rem]"}`}
      />

      <p className={`${compact ? "mt-4 text-xs" : "mt-10 text-base"} max-w-[20rem] self-center leading-tight text-oxblood`}>
        {recommendationIntro}
      </p>

      <div className={`${compact ? "mt-4 pt-4" : "mt-9 pt-7"} border-t border-oxblood`}>
        <div className={`flex items-center ${compact ? "gap-2" : "gap-4"}`}>
          <img
            src="/assets/icons/ui/left_hand_pointing.svg"
            alt=""
            aria-hidden="true"
            className={`${compact ? "h-6 w-12" : "h-10 w-[82px]"} text-oxblood shrink-0 object-contain`}
          />
          <h3 className={`${compact ? "text-base" : "text-2xl"} max-w-48 font-display leading-[1.08] text-oxblood`}>
            You’ll love it because …
          </h3>
        </div>
      </div>

      <div className={`${compact ? "mt-4 space-y-3" : "mt-7 space-y-7"}`}>
        <section>
          <h4 className={`font-topic text-oxblood ${compact ? "text-xs" : "text-base"}`}>{firstHeading}</h4>
          <p className={`${compact ? "mt-1 text-[11px]" : "mt-2 text-sm"} leading-tight text-oxblood`}>{firstReason}</p>
        </section>
        <section>
          <h4 className={`font-topic text-oxblood ${compact ? "text-xs" : "text-base"}`}>{secondHeading}</h4>
          <p className={`${compact ? "mt-1 text-[11px]" : "mt-2 text-sm"} leading-tight text-oxblood`}>{secondReason}</p>
        </section>
      </div>

      {showActions && (
        <div className={`mt-auto flex justify-end gap-3 ${compact ? "pt-4" : "pt-4"}`}>
          <Button type="button" variant="outline" onClick={handleShare} className={`${compact ? "h-8 px-4 text-[10px]" : "h-10 px-7 text-xs"} rounded-full border-umber bg-transparent text-umber shadow-none hover:bg-umber hover:text-primary-foreground`}>
            Share
          </Button>
          <Button type="button" aria-pressed={saved} onClick={() => setSaved((current) => !current)} className={`${compact ? "h-8 px-4 text-[10px]" : "h-10 px-7 text-xs"} rounded-full bg-oxblood text-primary-foreground shadow-none hover:bg-oxblood/90`}>
            {saved ? <Check aria-hidden="true" /> : null}
            {saved ? "Saved" : "Save"}
          </Button>
        </div>
      )}
    </aside>
  );
}
