import { Check } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { POINTING_HAND, TOP_MATCH_FALLBACK } from "../cowboy-art";

export type MatchBenefitsCardProps = {
  roomName: string;
  intro: string;
  reasons: string[];
  topMatchArt?: string;
  onShare?: () => void | Promise<void>;
  onSaveChange?: (saved: boolean) => void;
};

export function MatchBenefitsCard({
  roomName,
  intro,
  reasons,
  topMatchArt = TOP_MATCH_FALLBACK,
  onShare,
  onSaveChange,
}: MatchBenefitsCardProps) {
  const [saved, setSaved] = useState(false);
  const firstReason = reasons[0] ?? "A strong fit for the way you want to stay.";
  const secondReason = reasons[1] ?? "The details you asked for are represented in this room.";

  async function handleShare() {
    if (onShare) {
      await onShare();
      return;
    }
    const shareData = { title: roomName, text: intro, url: window.location.href };
    if (navigator.share) {
      await navigator.share(shareData).catch(() => undefined);
      return;
    }
    await navigator.clipboard?.writeText(window.location.href).catch(() => undefined);
  }

  function toggleSaved() {
    setSaved((current) => {
      const next = !current;
      onSaveChange?.(next);
      return next;
    });
  }

  return (
    <aside className="flex h-full min-h-[620px] flex-col overflow-hidden border-[1.5px] border-oxblood bg-white/80 p-6 text-oxblood">
      <img src={topMatchArt} alt="Top match" className="h-auto w-[200px] shrink-0 object-contain" />

      <p className="mt-10 max-w-[20rem] self-center text-base leading-tight text-oxblood">
        {intro}
      </p>

      <div className="mt-9 border-t border-oxblood pt-7">
        <div className="flex items-center gap-4">
          <img src={POINTING_HAND} alt="" aria-hidden="true" className="h-10 w-[82px] shrink-0 object-contain" />
          <h3 className="max-w-48 font-display text-2xl leading-[1.08] text-oxblood">
            You’ll love it because …
          </h3>
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
        <Button
          type="button"
          variant="outline"
          onClick={handleShare}
          className="h-10 rounded-full border-umber bg-transparent px-7 text-xs text-umber shadow-none hover:bg-umber hover:text-primary-foreground"
        >
          Share
        </Button>
        <Button
          type="button"
          aria-pressed={saved}
          onClick={toggleSaved}
          className="h-10 rounded-full bg-oxblood px-7 text-xs text-primary-foreground shadow-none hover:bg-oxblood/90"
        >
          {saved ? <Check aria-hidden="true" /> : null}
          {saved ? "Saved" : "Save"}
        </Button>
      </div>
    </aside>
  );
}
