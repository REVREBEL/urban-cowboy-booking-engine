import { Check } from "lucide-react";
import { useState } from "react";

import { Button } from "../../ui/button";
import { COWBOY_PUBLIC_ASSET } from "../assets";
import type { RoomProduct } from "../types";

export function MatchBenefitsCard({
  room,
  reasons,
  saved: controlledSaved,
  onSavedChange,
  onShare,
}: {
  room: Pick<RoomProduct, "name" | "description" | "tagline">;
  reasons: string[];
  saved?: boolean;
  onSavedChange?: (saved: boolean) => void;
  onShare?: () => void | Promise<void>;
}) {
  const [internalSaved, setInternalSaved] = useState(false);
  const saved = controlledSaved ?? internalSaved;
  const intro = `${room.name} feels made for this stay—${room.description.charAt(0).toLowerCase()}${room.description.slice(1)}`;
  const firstReason = reasons[0] ?? room.tagline;
  const secondReason = reasons[1] ?? room.description;

  async function handleShare() {
    if (onShare) {
      await onShare();
      return;
    }
    const shareData = { title: room.name, text: room.tagline, url: window.location.href };
    if (navigator.share) {
      await navigator.share(shareData).catch(() => undefined);
      return;
    }
    await navigator.clipboard?.writeText(window.location.href).catch(() => undefined);
  }

  function toggleSaved() {
    const next = !saved;
    if (controlledSaved == null) setInternalSaved(next);
    onSavedChange?.(next);
  }

  return (
    <aside className="flex h-full min-h-[620px] flex-col overflow-hidden border-[1.5px] border-oxblood bg-white/80 p-6 text-oxblood">
      <div className="w-fit -rotate-2 border-2 border-oxblood px-5 py-2 text-sm font-black tracking-[0.18em]">
        TOP MATCH
      </div>

      <p className="mt-10 max-w-[20rem] self-center text-base leading-tight text-oxblood">{intro}</p>

      <div className="mt-9 border-t border-oxblood pt-7">
        <div className="flex items-center gap-4">
          <img
            src={COWBOY_PUBLIC_ASSET("pointing-hand-1.svg")}
            alt=""
            aria-hidden="true"
            className="h-10 w-[82px] shrink-0 object-contain"
          />
          <h3 className="max-w-48 font-display text-2xl leading-[1.08] text-oxblood">You’ll love it because …</h3>
        </div>
      </div>

      <div className="mt-7 space-y-7">
        <section>
          <h4 className="text-base font-semibold text-oxblood">Made for Your Stay</h4>
          <p className="mt-2 text-sm leading-tight text-oxblood">{firstReason}</p>
        </section>
        <section>
          <h4 className="text-base font-semibold text-oxblood">The Details You Asked For</h4>
          <p className="mt-2 text-sm leading-tight text-oxblood">{secondReason}</p>
        </section>
      </div>

      <div className="mt-auto flex justify-end gap-3 pt-8">
        <Button type="button" variant="outline" onClick={handleShare} className="h-10 rounded-full border-umber bg-transparent px-7 text-xs text-umber shadow-none hover:bg-umber hover:text-primary-foreground">
          Share
        </Button>
        <Button type="button" aria-pressed={saved} onClick={toggleSaved} className="h-10 rounded-full bg-oxblood px-7 text-xs text-primary-foreground shadow-none hover:bg-oxblood/90">
          {saved ? <Check aria-hidden="true" /> : null}
          {saved ? "Saved" : "Save"}
        </Button>
      </div>
    </aside>
  );
}
