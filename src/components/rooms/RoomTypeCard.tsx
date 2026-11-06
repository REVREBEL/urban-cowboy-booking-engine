import type { ReactNode } from "react";

export type RoomTypeCardState = "Default" | "Focus";

export interface RoomTypeCardProps {
  className?: string;
  buildingName?: string;
  roomTypeImage?: ReactNode | null;
  numberOfBeds?: string;
  price?: string;
  roomTypeName?: string;
  state?: RoomTypeCardState;
}

/**
 * Figma RoomTypeCard component set (1352:14810).
 *
 * RoomTypeImage remains a slot, matching Figma, so production callers control
 * the actual media rather than the component inventing image behavior.
 */
export function RoomTypeCard({
  className = "",
  buildingName = "Opa's Cabin",
  roomTypeImage = null,
  numberOfBeds = "8 beds",
  price = "$596",
  roomTypeName = "Opa's Cabin 4 Bedroom",
  state = "Default",
}: RoomTypeCardProps) {
  const isFocus = state === "Focus";

  return (
    <div
      data-figma-node={isFocus ? "1352:14811" : "1352:2574"}
      data-state={state}
      className={[
        "flex h-[345.328px] w-[410px] shrink-0 flex-col items-center justify-center rounded-[6px] p-[20px]",
        isFocus ? "bg-accent" : "bg-primary-foreground",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <div
        data-name="RoomTypeCardWrapper"
        className="flex w-full shrink-0 flex-col items-center justify-center gap-[15px] rounded-[10px]"
      >
        <div
          data-name="RoomTypeImage"
          className="relative h-[245.328px] w-[368px] shrink-0 overflow-hidden rounded-[8px] bg-smoke"
        >
          {roomTypeImage ?? <div aria-hidden="true" className="size-full bg-smoke" />}
        </div>

        <div
          data-name="RoomTypeTextWrapper"
          className="flex w-full shrink-0 flex-col items-start gap-[6px]"
        >
          <div
            data-name="RoomTypeContentWrapper"
            className="grid w-full shrink-0 grid-cols-10 gap-[10px]"
          >
            <div
              data-name="Headline"
              className="col-span-8 flex shrink-0 flex-col items-start justify-self-stretch overflow-clip self-start"
            >
              <p
                className={[
                  "w-full shrink-0 font-heading text-[24px] font-normal leading-none tracking-[0.7065px] uppercase [word-break:break-word]",
                  isFocus ? "text-white" : "text-primary",
                ].join(" ")}
              >
                {roomTypeName}
              </p>
            </div>

            <p
              className={[
                "col-span-2 shrink-0 self-center justify-self-stretch text-right font-number text-[14px] font-normal leading-none tracking-[0.7065px] uppercase [word-break:break-word]",
                isFocus ? "text-white" : "text-primary",
              ].join(" ")}
            >
              {price}
            </p>
          </div>

          <div
            data-name="BuildingContentWrapper"
            className={[
              "isolate flex w-[368px] shrink-0 items-start font-label text-[16px] font-normal leading-none tracking-[0.7065px] uppercase [word-break:break-word]",
              isFocus ? "text-paper" : "text-[#e2e2e1]",
            ].join(" ")}
          >
            <p className="shrink-0 whitespace-nowrap z-[3]">{buildingName}</p>
            <p className="w-[20px] shrink-0 text-center z-[2]">·</p>
            <p className="shrink-0 whitespace-nowrap z-[1]">{numberOfBeds}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RoomTypeCard;
