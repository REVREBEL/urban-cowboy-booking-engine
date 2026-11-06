import type { ReactNode } from "react";

export type RoomTypeCardState = "Default" | "Focus";

interface RoomTypeCardBaseProps {
  roomTypeName: string;
  buildingName: string;
  numberOfBeds: string;
  price: string;
  mediaSlot?: ReactNode | null;
  state?: RoomTypeCardState;
  className?: string;
}

type RoomTypeCardImageProps =
  | {
      imageSrc: string;
      imageAlt: string;
    }
  | {
      imageSrc?: null;
      imageAlt?: never;
    };

export type RoomTypeCardProps = RoomTypeCardBaseProps & RoomTypeCardImageProps;

/**
 * Figma RoomTypeCard (1352:2574 / focus state 1352:14811).
 *
 * Room photography stays data-driven through imageSrc or mediaSlot. When a
 * photo URL is supplied its alt text is required by the component contract.
 * The component preserves the Figma geometry while using project typography
 * and semantic color tokens.
 */
export function RoomTypeCard({
  roomTypeName,
  buildingName,
  numberOfBeds,
  price,
  imageSrc = null,
  imageAlt,
  mediaSlot = null,
  state = "Default",
  className = "",
}: RoomTypeCardProps) {
  const isFocus = state === "Focus";

  return (
    <article
      data-figma-node={isFocus ? "1352:14811" : "1352:2574"}
      data-state={state.toLowerCase()}
      className={[
        "flex h-[345.328px] w-[410px] max-w-full flex-col items-center justify-center rounded-[6px] p-[20px]",
        isFocus ? "bg-accent" : "bg-primary-foreground",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <div className="flex w-full flex-col items-center justify-center gap-[15px] rounded-[10px]">
        <div className="relative h-[245.328px] w-[368px] max-w-full shrink-0 overflow-hidden rounded-[8px] bg-card-foreground">
          {mediaSlot ??
            (imageSrc ? (
              <img
                src={imageSrc}
                alt={imageAlt ?? roomTypeName}
                className="size-full max-w-none object-cover"
              />
            ) : (
              <div aria-hidden="true" className="size-full bg-card-foreground" />
            ))}
        </div>

        <div className="flex w-full shrink-0 flex-col items-start gap-[6px]">
          <div className="grid w-full shrink-0 grid-cols-10 gap-[10px]">
            <div className="col-span-8 self-start overflow-hidden">
              <h3 className="w-full font-heading text-[24px] leading-none tracking-[0.7065px] text-primary uppercase [word-break:break-word]">
                {roomTypeName}
              </h3>
            </div>
            <p className="col-span-2 self-center justify-self-stretch text-right font-number text-[14px] font-normal leading-none tracking-[0.7065px] text-primary uppercase [word-break:break-word]">
              {price}
            </p>
          </div>

          <div
            className={[
              "flex w-full items-start font-label text-[16px] leading-none tracking-[0.7065px] uppercase [word-break:break-word]",
              isFocus ? "text-primary" : "text-secondary-foreground",
            ].join(" ")}
          >
            <p className="shrink-0 whitespace-nowrap">{buildingName}</p>
            <span aria-hidden="true" className="w-[20px] shrink-0 text-center">
              ·
            </span>
            <p className="shrink-0 whitespace-nowrap">{numberOfBeds}</p>
          </div>
        </div>
      </div>
    </article>
  );
}

export default RoomTypeCard;
