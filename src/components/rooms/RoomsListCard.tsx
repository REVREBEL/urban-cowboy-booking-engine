import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Sparkles } from "lucide-react";
import type { ShapedRoom } from "@/types/mews";
import { imgUrl, money } from "@/lib/format";
import { buildRoomCardPills } from "@/lib/roomCardPills";
import { imageContrastColor } from "@/lib/imageContrast";
import { CaretLeft, CaretRight } from "@/components/icons/generated/ui";
import { Button, type ButtonColor } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

export type RoomCardTheme = "paper" | "copper" | "lake-forest";
export type RoomCardColor = RoomCardTheme;
export type RoomCardLayout = "left" | "right";

/* Maps card theme to button colorScheme props */
const CARD_THEME_BUTTON_MAP: Record<
  RoomCardTheme,
  { primary: ButtonColor; secondary: ButtonColor }
> = {
  paper: { primary: "lake-forest", secondary: "lake-forest" },
  copper: { primary: "smoke", secondary: "smoke" },
  "lake-forest": { primary: "alpine-linen", secondary: "alpine-linen" },
};

export interface RoomsListCardProps {
  room: ShapedRoom;
  imageBaseUrl: string;
  theme?: RoomCardTheme;
  color?: RoomCardTheme;
  layout?: RoomCardLayout;
  onSelectRoom?: (room: ShapedRoom) => void;
  onOpenRoomDetails?: (room: ShapedRoom) => void;
  customImage?: string;
  isTopMatch?: boolean;

  headerSlot?: React.ReactNode;
  mediaSlot?: React.ReactNode;
  bodySlot?: React.ReactNode;
  badgesSlot?: React.ReactNode;
  actionsSlot?: React.ReactNode;
  priceSlot?: React.ReactNode;
  children?: React.ReactNode;

  className?: string;
}

export const RoomsListCard: React.FC<RoomsListCardProps> = ({
  room,
  imageBaseUrl,
  theme,
  color,
  layout = "left",
  onSelectRoom,
  onOpenRoomDetails,
  customImage,
  isTopMatch = false,
  headerSlot,
  mediaSlot,
  bodySlot,
  badgesSlot,
  actionsSlot,
  priceSlot,
  children,
  className = "",
}) => {
  const resolvedTheme: RoomCardTheme = theme ?? color ?? "paper";
  const buttonColors = CARD_THEME_BUTTON_MAP[resolvedTheme];

  const imageUrls = useMemo(() => {
    const mewsImages = room.imageIds
      .map((imageId) => imgUrl(imageBaseUrl, imageId, 1200))
      .filter((image): image is string => Boolean(image));
    return [...new Set(customImage ? [customImage, ...mewsImages] : mewsImages)];
  }, [customImage, imageBaseUrl, room.imageIds]);

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const imageRef = useRef<HTMLImageElement | null>(null);
  const [overlayColors, setOverlayColors] = useState({
    previous: "var(--icon-color-light)",
    next: "var(--icon-color-light)",
    counter: "var(--icon-color-light)",
  });

  const updateOverlayContrast = useCallback((image: HTMLImageElement) => {
    setOverlayColors({
      previous: imageContrastColor(image, "left-center", { objectFit: "cover" }),
      next: imageContrastColor(image, "right-center", { objectFit: "cover" }),
      counter: imageContrastColor(image, "bottom-right", { objectFit: "cover" }),
    });
  }, []);

  useEffect(() => setActiveImageIndex(0), [room.roomTypeId, imageUrls.length]);
  const imageUrl = imageUrls[activeImageIndex] ?? null;

  useEffect(() => {
    const image = imageRef.current;
    if (!image) return;

    if (image.complete) updateOverlayContrast(image);

    if (typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(() => updateOverlayContrast(image));
    observer.observe(image);
    return () => observer.disconnect();
  }, [imageUrl, updateOverlayContrast]);

  const hasGallery = imageUrls.length > 1;
  const showPreviousImage = () =>
    setActiveImageIndex((index) => (index - 1 + imageUrls.length) % imageUrls.length);
  const showNextImage = () =>
    setActiveImageIndex((index) => (index + 1) % imageUrls.length);

  const pills = buildRoomCardPills(room).slice(0, 6);
  const tagline = room.merchandising?.cardTagline ?? null;
  const cardDescription =
    room.cmsShortDescription ??
    room.merchandising?.cardDescription ??
    room.description;
  const firstRate = room.rates[0];
  const nightlyRate = firstRate?.perNightGross ?? room.fromGross ?? null;
  const currency = firstRate?.currency ?? "USD";

  if (children) {
    return (
      <div
        data-room-card={room.roomTypeId}
        data-room-card-version="approved-v4"
        data-card-theme={resolvedTheme}
        className={cn(
          "room-list-card relative w-full rounded-card border-2 p-5 shadow-xs transition-all duration-200 sm:p-6",
          className
        )}
      >
        {children}
      </div>
    );
  }

  const mediaElement = mediaSlot ?? (
    <div className="flex min-h-65 w-full shrink-0 flex-col self-stretch sm:min-h-75 lg:min-h-84 lg:w-[46%] xl:w-[48%]">
      <div className="group relative h-full w-full flex-1 overflow-hidden rounded-card-media bg-smoke/10">
        {imageUrl ? (
          <img ref={imageRef} src={imageUrl} alt={room.name}
            onLoad={(event) => updateOverlayContrast(event.currentTarget)}
            className="absolute inset-0 block h-full w-full select-none object-cover" />
        ) : (
          <div className="room-list-card__placeholder absolute inset-0 grid place-items-center font-button text-[10px] font-bold uppercase tracking-widest">
            Room imagery unavailable
          </div>
        )}
        {isTopMatch && (
          <div className="room-list-card__badge absolute left-3 top-3 z-10 flex items-center gap-1.5 rounded-full px-3 py-1 font-button text-[10px] font-bold uppercase shadow-xs backdrop-blur-xs">
            <Sparkles className="h-3 w-3" />
            <span>Top Pick</span>
          </div>
        )}
        {hasGallery && (
          <>
            <button type="button" onClick={showPreviousImage}
              aria-label={`Previous photo of ${room.name}`}
              className="absolute left-2 top-1/2 z-10 grid h-11 w-11 -translate-y-1/2 cursor-pointer place-items-center rounded-full opacity-70 transition-opacity hover:opacity-100 focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--card-focus-ring)">
              <CaretLeft className="h-9 w-9 drop-shadow-xs" style={{ color: overlayColors.previous }} aria-hidden="true" />
            </button>
            <button type="button" onClick={showNextImage}
              aria-label={`Next photo of ${room.name}`}
              className="absolute right-2 top-1/2 z-10 grid h-11 w-11 -translate-y-1/2 cursor-pointer place-items-center rounded-full opacity-70 transition-opacity hover:opacity-100 focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--card-focus-ring)">
              <CaretRight className="h-9 w-9 drop-shadow-xs" style={{ color: overlayColors.next }} aria-hidden="true" />
            </button>
            <span className="absolute bottom-3 right-3 z-10 px-2.5 py-1 font-button text-[9px] font-bold uppercase tracking-wider drop-shadow-xs"
              style={{ color: overlayColors.counter }} role="status" aria-live="polite" aria-atomic="true">
              <span aria-hidden="true">{activeImageIndex + 1} / {imageUrls.length}</span>
              <span className="sr-only">Photo {activeImageIndex + 1} of {imageUrls.length}</span>
            </span>
          </>
        )}
      </div>
    </div>
  );

  return (
    <div
      data-room-card={room.roomTypeId}
      data-room-card-version="approved-v4"
      data-card-theme={resolvedTheme}
      className={cn(
        "room-list-card flex w-full flex-col items-stretch gap-6 rounded-card border-2 p-5 shadow-xs transition-all duration-200 hover:shadow-md sm:p-6 lg:gap-8",
        layout === "right" ? "lg:flex-row-reverse" : "lg:flex-row",
        className
      )}
    >
      {mediaElement}

      <div
        className="
          flex flex-1 flex-col justify-between self-stretch
          min-w-0
          py-0.5
        "
      >
        <div>
          {headerSlot ?? (
            <div
              className="
                flex flex-col
                mb-2.5
                gap-1.5
              "
            >
              <h3
                className="
                  text-balance text-2xl sm:text-3xl md:text-[34px]
                  font-button font-bold uppercase
                  leading-tight md:leading-[105%] tracking-[0.72px]
                  room-list-card__title
                "
              >
                {room.name}
              </h3>
              {tagline && (
                <p
                  className="
                    font-button font-bold text-xs sm:text-[13px] uppercase
                    tracking-[2.5px]
                    room-list-card__tagline
                  "
                >
                  {tagline}
                </p>
              )}
            </div>
          )}

          {bodySlot ??
            (cardDescription ? (
              <p
                className="
                  mb-4
                  line-clamp-3 md:line-clamp-4 font-sans text-xs sm:text-sm
                  leading-relaxed sm:leading-relaxed
                  room-list-card__description
                "
              >
                {cardDescription}
              </p>
            ) : null)}

          {badgesSlot ?? (
            <div
              className="
                flex flex-wrap items-center
                mb-4 py-1
                gap-2
              "
            >
              {pills.map((pill) => (
                <div
                  key={pill.key}
                  data-pill-source={pill.source}
                  className={cn(
                    "room-list-card__pill rounded-full border font-button text-[10px] font-bold uppercase leading-none tracking-[1px]",
                    pill.emphasis === "highlight"
                      ? "room-list-card__highlight"
                      : "room-list-card__amenity"
                  )}
                >
                  {pill.label}
                </div>
              ))}
            </div>
          )}
        </div>

        <div
          className="
            flex flex-wrap items-center justify-between
            mt-auto pt-3
            border-t border-current/15
            gap-3
          "
        >
          {actionsSlot ?? (
            <div
              className="
                flex items-center justify-start
                gap-3
              "
            >
              {onSelectRoom && (
                <Button
                  variant="filled"
                  colorScheme={buttonColors.primary}
                  size="small"
                  onClick={() => onSelectRoom(room)}
                >
                  Select Room
                </Button>
              )}
              {onOpenRoomDetails && (
                <Button
                  variant="outline"
                  colorScheme={buttonColors.secondary}
                  size="small"
                  onClick={() => onOpenRoomDetails(room)}
                >
                  View Details
                </Button>
              )}
            </div>
          )}

          {priceSlot ?? (
            <div
              className="
                text-right
              "
            >
              {nightlyRate != null ? (
                <span
                  className="
                    font-button font-normal text-lg sm:text-xl md:text-2xl
                    room-list-card__price
                  "
                >
                  from {money(nightlyRate, currency)}
                  <span
                    className="
                      text-xs
                    "
                  >/night</span>
                </span>
              ) : (
                <span
                  className="
                    font-button text-sm
                    room-list-card__price
                  "
                >Check rate</span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export const RoomListCard = RoomsListCard;
export default RoomsListCard;