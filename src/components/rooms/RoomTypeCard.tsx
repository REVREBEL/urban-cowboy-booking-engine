import type { ReactNode } from "react";

const DEFAULT_ROOM_TYPE_IMAGE_SRC =
  "https://cdn.prod.website-files.com/6abc810fd801e90511049adb/6ac89730346974fa55ed2a44_Opas%20Cabing%20Living%20Room-2.jpg";

export type RoomTypeCardState = "Default" | "Focus";

export interface RoomTypeCardProps {
  className?: string;
  buildingName: string;
  roomTypeImage?: ReactNode | null;
  numberOfBeds: string;
  price: string;
  roomTypeName: string;
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
  buildingName,
  roomTypeImage = null,
  numberOfBeds,
  price,
  roomTypeName,
  state = "Default",
}: RoomTypeCardProps) {
  const isFocus = state === "Focus";

  return (
    <article
      data-figma-node={isFocus ? "1352:14811" : "1352:2574"}
      data-state={state}
      className={[
        "flex min-h-[345.328px] w-full min-w-0 flex-col items-center justify-center rounded-[6px] p-[20px]",
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
          className="relative h-[245.328px] w-full min-w-0 shrink-0 overflow-hidden rounded-[8px] bg-smoke"
        >
          {roomTypeImage ?? (
            <img
              src={DEFAULT_ROOM_TYPE_IMAGE_SRC}
              alt=""
              aria-hidden="true"
              className="absolute inset-0 block size-full max-w-none rounded-[8px] object-contain"
            />
          )}
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
              <h3
                className={[
                  "w-full shrink-0 font-heading text-[24px] font-normal leading-none tracking-[0.7065px] uppercase [word-break:break-word]",
                  isFocus ? "text-paper" : "text-primary",
                ].join(" ")}
              >
                {roomTypeName}
              </h3>
            </div>

            <p
              className={[
                "col-span-2 shrink-0 self-center justify-self-stretch text-right font-number text-[14px] font-normal leading-none tracking-[0.7065px] uppercase [word-break:break-word]",
                isFocus ? "text-paper" : "text-primary",
              ].join(" ")}
            >
              {price}
            </p>
          </div>

          <div
            data-name="BuildingContentWrapper"
            className={[
              "isolate flex w-full min-w-0 flex-wrap items-start font-label text-[16px] font-normal leading-none tracking-[0.7065px] uppercase [word-break:break-word]",
              isFocus ? "text-paper" : "text-alpine-linen-fade",
            ].join(" ")}
          >
            <p className="min-w-0 z-[3]">{buildingName}</p>
            <p className="w-[20px] shrink-0 text-center z-[2]">·</p>
            <p className="min-w-0 z-[1]">{numberOfBeds}</p>
          </div>
        </div>
      </div>
    </article>
  );
}

export default RoomTypeCard;
