import { Check } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import type { MatchRoomSummary } from "../types";

export function MatchBenefitsCard({
  room,
  reasons,
}: {
  room: MatchRoomSummary;
  reasons: string[];
}) {
  const [saved, setSaved] = useState(false);
  const intro = `${room.name} feels made for this stay—${room.blurb.charAt(0).toLowerCase()}${room.blurb.slice(1)}`;
  const firstReason = reasons[0] ?? room.headline;
  const secondReason = reasons[1] ?? room.features.slice(0, 2).map((feature) => feature.label).join(" and ");

  async function handleShare() {
    const shareData = { title: room.name, text: room.headline, url: window.location.href };
    if (navigator.share) {
      await navigator.share(shareData).catch(() => undefined);
      return;
    }
    await navigator.clipboard?.writeText(window.location.href).catch(() => undefined);
  }

  return (
    <aside className="flex h-full min-h-[620px] flex-col overflow-hidden border-[1.5px] border-oxblood bg-white/80 p-6 text-oxblood">
      <div className="w-fit -rotate-2 border-2 border-oxblood px-5 py-2 font-label text-sm font-bold tracking-[0.18em]">
        TOP MATCH
      </div>

      <p className="mt-10 max-w-[20rem] self-center text-base leading-tight text-oxblood">{intro}</p>

      <div className="mt-9 border-t border-oxblood pt-7">
        <div className="flex items-center gap-4">
          <img src="/assets/pointing-hand-1.svg" alt="" aria-hidden="true" className="h-10 w-[82px] shrink-0 object-contain" />
          <h3 className="max-w-48 font-display text-2xl leading-[1.08] text-oxblood">You’ll love it because …</h3>
        </div>
      </div>

      <div className="mt-7 space-y-7">
        <section>
          <h4 className="font-topic text-base text-oxblood">Made for Your Stay</h4>
          <p className="mt-2 text-sm leading-tight text-oxblood">{firstReason}</p>
        </section>
        <section>
          <h4 className="font-topic text-base text-oxblood">The Details You Asked For</h4>
          <p className="mt-2 text-sm leading-tight text-oxblood">{secondReason}</p>
        </section>
      </div>

      <div className="mt-auto flex justify-end gap-3 pt-8">
        <Button type="button" variant="outline" onClick={handleShare} className="h-10 rounded-full border-umber bg-transparent px-7 text-xs text-umber shadow-none hover:bg-umber hover:text-primary-foreground">
          Share
        </Button>
        <Button type="button" aria-pressed={saved} onClick={() => setSaved((current) => !current)} className="h-10 rounded-full bg-oxblood px-7 text-xs text-primary-foreground shadow-none hover:bg-oxblood/90">
          {saved ? <Check aria-hidden="true" /> : null}
          {saved ? "Saved" : "Save"}
        </Button>
      </div>
    </aside>
  );
}
