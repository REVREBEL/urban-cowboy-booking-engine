import type { ReactNode } from "react";

export interface LodgeSignboardProps {
  backgroundImage?: string;
  backboardImage?: string;
  textSlot: ReactNode;
  buttonSlotTop: ReactNode;
  buttonSlotBottom: ReactNode;
  className?: string;
}

/**
 * Layered Cowboy sign composition used by the discovery landing screen.
 *
 * The photography is intentionally owned by /public so the component only
 * positions content over the approved background/backboard artwork.
 */
export function LodgeSignboard({
  backgroundImage = "/assets/decoration/backgrounds/background.png",
  backboardImage = "/assets/decoration/backgrounds/backboard.png",
  textSlot,
  buttonSlotTop,
  buttonSlotBottom,
  className = "",
}: LodgeSignboardProps) {
  return (
    <div
      className={`relative isolate aspect-[4/5] w-full overflow-hidden bg-cowboy-umber shadow-2xl sm:aspect-[16/9] ${className}`}
    >
      <img
        src={backgroundImage}
        alt=""
        aria-hidden="true"
        className="absolute inset-0 h-full w-full object-cover"
      />

      <div
        aria-hidden="true"
        className="absolute inset-0 bg-linear-to-r from-black/20 via-transparent to-black/15"
      />

      <img
        src={backboardImage}
        alt=""
        aria-hidden="true"
        className="absolute left-[31%] top-[12%] h-[58%] w-[36%] object-contain drop-shadow-[0_18px_22px_rgba(0,0,0,0.45)]"
      />

      <div className="absolute left-[35%] top-[20%] z-10 flex h-[40%] w-[28%] items-center justify-center px-3 text-center sm:px-5">
        {textSlot}
      </div>

      <div className="absolute left-[66%] top-[27%] z-10 flex h-[13%] w-[20%] items-center justify-center">
        {buttonSlotTop}
      </div>

      <div className="absolute left-[66%] top-[44%] z-10 flex h-[13%] w-[20%] items-center justify-center">
        {buttonSlotBottom}
      </div>
    </div>
  );
}
