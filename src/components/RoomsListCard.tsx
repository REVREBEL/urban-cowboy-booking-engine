import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Sparkles } from "lucide-react";
import type { ShapedRoom } from "@/types/mews";
import { imgUrl, money } from "@/lib/format";
import { buildRoomCardPills } from "@/lib/roomCardPills";
import { imageContrastColor } from "@/lib/imageContrast";


import { CaretLeft, CaretRight } from "@/components/icons/generated/ui";

export type RoomCardTheme = "paper" | "copper" | "lake-forest";
/** @deprecated Use RoomCardTheme. Retained temporarily for downstream compatibility. */
export type RoomCardColor = RoomCardTheme;
export type RoomCardLayout = "left" | "right";

export interface RoomsListCardProps {
  room: ShapedRoom;
  imageBaseUrl: string;
  theme?: RoomCardTheme;
  /** @deprecated Use theme. */
  color?: RoomCardTheme;
  layout?: RoomCardLayout;
  onSelectRoom?: (room: ShapedRoom) => void;
  onOpenRoomDetails?: (room: ShapedRoom) => void;
  customImage?: string;
  isTopMatch?: boolean;

  // Dedicated slots retained from the approved card contract.
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

  // If complete custom children are provided, render within the approved card envelope.
  if (children) {
    return (
      <div
        data-room-card={room.roomTypeId}
        data-room-card-version="approved-v4"
        data-card-theme={resolvedTheme}
        className={`room-list-card relative w-full rounded-card border-2 p-5 shadow-sm transition-all duration-200 sm:p-6 ${className}`}
      >
        {children}
      </div>
    );
  }

  // Original approved media proportions and treatment.
  const mediaElement = mediaSlot ?? (
    <div className="flex min-h-65 w-full shrink-0 flex-col self-stretch sm:min-h-75 lg:min-h-84 lg:w-[46%] xl:w-[48%]">
      <div className="group relative h-full w-full flex-1 overflow-hidden rounded-card-media bg-[var(--media-placeholder)]">
        {imageUrl ? (
          <img
            ref={imageRef}
            src={imageUrl}
            alt={room.name}
            onLoad={(event) => updateOverlayContrast(event.currentTarget)}
            className="absolute inset-0 block h-full w-full select-none object-cover"
          />
        ) : (
          <div className="absolute inset-0 grid place-items-center font-label text-[10px] font-bold uppercase tracking-widest text-cowboy-umber/45">
            Room imagery unavailable
          </div>
        )}
        {isTopMatch && (
          <div className="absolute left-3 top-3 z-10 flex items-center gap-1.5 rounded-full bg-lake-forest/90 px-3 py-1 font-label text-[10px] font-bold uppercase tracking-widest text-paper shadow-sm backdrop-blur-sm">
            <Sparkles className="h-3 w-3 text-nude-ember" />
            <span>Top Pick</span>
          </div>
        )}
        {hasGallery && (
          <>
            <button
              type="button"
              onClick={showPreviousImage}
              aria-label={`Previous photo of ${room.name}`}
              className="absolute left-2 top-1/2 z-10 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full opacity-70 transition-opacity hover:opacity-100 focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-nude-ember"
            >
              <CaretLeft
                className="h-9 w-9 drop-shadow-sm"
                style={{ color: overlayColors.previous }}
                aria-hidden="true"
              />
            </button>
            <button
              type="button"
              onClick={showNextImage}
              aria-label={`Next photo of ${room.name}`}
              className="absolute right-2 top-1/2 z-10 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full opacity-70 transition-opacity hover:opacity-100 focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-nude-ember"
            >
              <CaretRight
                className="h-9 w-9 drop-shadow-sm"
                style={{ color: overlayColors.next }}
                aria-hidden="true"
              />
            </button>
            <span
              className="absolute bottom-3 right-3 z-10 px-2.5 py-1 font-label text-[9px] font-bold uppercase tracking-wider drop-shadow-sm transition-colors"
              style={{ color: overlayColors.counter }}
            >
              {activeImageIndex + 1} / {imageUrls.length}
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
      className={`room-list-card flex w-full flex-col items-stretch gap-6 rounded-card border-2 p-5 shadow-sm transition-all duration-200 hover:shadow-md sm:p-6 lg:gap-8 ${
        layout === "right" ? "lg:flex-row-reverse" : "lg:flex-row"
      } ${className}`}
    >
      {mediaElement}

      <div className="flex min-w-0 flex-1 flex-col justify-between self-stretch py-0.5">
        <div>
          {headerSlot ?? (
            <div className="mb-2.5 flex flex-col gap-1.5">
              <h3
                className="room-list-card__title text-balance font-label text-2xl font-bold uppercase leading-tight tracking-[0.72px] sm:text-3xl md:text-[34px] md:leading-[105%]"
              >
                {room.name}
              </h3>
              {tagline && (
                <p
                  className="room-list-card__tagline font-label text-xs font-bold uppercase tracking-[2.5px] sm:text-[13px]"
                >
                  {tagline}
                </p>
              )}
            </div>
          )}

          {bodySlot ??
            (cardDescription ? (
              <p
                className="room-list-card__description mb-4 line-clamp-3 font-body text-xs leading-[22px] sm:text-sm sm:leading-[23px] md:line-clamp-4"
              >
                {cardDescription}
              </p>
            ) : null)}

          {badgesSlot ?? (
            <div className="mb-4 flex flex-wrap items-center gap-2 py-1">
              {pills.map((pill) => (
                <div
                  key={pill.key}
                  data-pill-source={pill.source}
                  className={`room-list-card__pill rounded-control-sm border px-2.5 pb-1 pt-1.625 font-label text-[10px] font-bold uppercase tracking-[1px] ${
                    pill.emphasis === "highlight"
                      ? "room-list-card__highlight"
                      : "room-list-card__amenity"
                  }`}
                >
                  {pill.label}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="mt-auto flex flex-wrap items-center justify-between gap-3 border-t border-current/15 pt-3">
          {actionsSlot ?? (
            <div className="flex items-center gap-3">
              {onSelectRoom && (
                <button
                  type="button"
                  onClick={() => onSelectRoom(room)}
                  className="room-list-card__action room-list-card__primary rounded-card-media px-5 pb-2.5 pt-3.125 font-label text-[11px] font-bold uppercase tracking-[1.1px] shadow-sm transition-transform active:scale-95"
                >
                  Select Room
                </button>
              )}
              {onOpenRoomDetails && (
                <button
                  type="button"
                  onClick={() => onOpenRoomDetails(room)}
                  className="room-list-card__action room-list-card__secondary rounded-card-media border px-5 pb-2 pt-2.625 font-label text-[11px] font-bold uppercase tracking-[1.1px] transition-colors"
                >
                  View Details
                </button>
              )}
            </div>
          )}

          {priceSlot ?? (
            <div className="text-right">
              {nightlyRate != null ? (
                <span
                  className="room-list-card__price font-label text-lg font-normal sm:text-xl md:text-2xl"
                >
                  from {money(nightlyRate, currency)}
                  <span className="text-xs">/night</span>
                </span>
              ) : (
                <span className="room-list-card__price font-label text-sm">Check rate</span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
