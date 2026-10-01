import React, { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import type { ShapedRoom } from "@/types/mews";
import { imgUrl, money } from "@/lib/format";
import { buildRoomCardPills } from "@/lib/roomCardPills";

export type RoomCardColor = "paper" | "forest" | "smoke" | "copper";
export type RoomCardLayout = "left" | "right";

export interface RoomsListCardProps {
  room: ShapedRoom;
  imageBaseUrl: string;
  color?: RoomCardColor;
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

const COLOR_STYLES = {
  paper: {
    card: "bg-[#FAF9F9] border-2 border-[#0E301A]",
    title: "text-[#4E332D]",
    tagline: "text-[#9A5636]",
    description: "text-[#4E332D]",
    amenityBadge: "border border-[#4E332D] text-[#4E332D]",
    highlightBadge: "border border-[#9A5636] text-[#9A5636]",
    selectBtn: "bg-[#9A5636] hover:bg-[#783224] text-[#EBE8E0]",
    detailsBtn: "border border-[#9A5636] text-[#9A5636] hover:bg-[#9A5636]/10",
    price: "text-[#4E332D]",
  },
  forest: {
    card: "bg-[#0E301A] border-2 border-[#0E301A]",
    title: "text-[#FAF9F9]",
    tagline: "text-[#F2AAA9]",
    description: "text-[#FAF9F9]",
    amenityBadge: "border border-[#FAF9F9] text-[#FAF9F9]",
    highlightBadge: "border border-[#F2AAA9] text-[#F2AAA9]",
    selectBtn: "bg-[#F2AAA9] hover:bg-[#F2AAA9]/85 text-[#0E301A] font-bold",
    detailsBtn: "border border-[#F2AAA9] text-[#F2AAA9] hover:bg-[#F2AAA9]/10",
    price: "text-[#FAF9F9]",
  },
  smoke: {
    card: "bg-[#343833] border-2 border-[#343833]",
    title: "text-[#EBE8E0]",
    tagline: "text-[#A4674A]",
    description: "text-[#EBE8E0]",
    amenityBadge: "border border-[#EBE8E0] text-[#EBE8E0]",
    highlightBadge: "border border-[#AE785E] text-[#AE785E]",
    selectBtn: "bg-[#9A5636] hover:bg-[#783224] text-[#EBE8E0]",
    detailsBtn: "border border-[#9A5636] text-[#9A5636] hover:bg-[#9A5636]/10",
    price: "text-[#EBE8E0]",
  },
  copper: {
    card: "bg-[#9A5636] border-2 border-[#9A5636]",
    title: "text-[#DDC5A4]",
    tagline: "text-[#2F1F1B]",
    description: "text-[#DDC5A4]",
    amenityBadge: "border border-[#DDC5A4] text-[#DDC5A4]",
    highlightBadge: "border border-[#2F1F1B] text-[#2F1F1B]",
    selectBtn: "bg-[#2F1F1B] hover:bg-black text-[#DDC5A4]",
    detailsBtn: "border border-[#2F1F1B] text-[#2F1F1B] hover:bg-[#2F1F1B]/10",
    price: "text-[#DDC5A4]",
  },
} as const;

export const RoomsListCard: React.FC<RoomsListCardProps> = ({
  room,
  imageBaseUrl,
  color = "paper",
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
  const colorStyles = COLOR_STYLES[color];
  const imageUrls = useMemo(() => {
    const mewsImages = room.imageIds
      .map((imageId) => imgUrl(imageBaseUrl, imageId, 1200))
      .filter((image): image is string => Boolean(image));
    return [...new Set(customImage ? [customImage, ...mewsImages] : mewsImages)];
  }, [customImage, imageBaseUrl, room.imageIds]);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  useEffect(() => setActiveImageIndex(0), [room.categoryId, imageUrls.length]);
  const imageUrl = imageUrls[activeImageIndex] ?? null;
  const hasGallery = imageUrls.length > 1;
  const showPreviousImage = () =>
    setActiveImageIndex((index) => (index - 1 + imageUrls.length) % imageUrls.length);
  const showNextImage = () =>
    setActiveImageIndex((index) => (index + 1) % imageUrls.length);
  const pills = buildRoomCardPills(room).slice(0, 6);
  const tagline = room.merchandising?.cardTagline ?? null;
  const firstRate = room.rates[0];
  const nightlyRate = firstRate?.perNightGross ?? room.fromGross ?? null;
  const currency = firstRate?.currency ?? "USD";

  // If complete custom children are provided, render within the approved card envelope.
  if (children) {
    return (
      <div
        data-room-card={room.categoryId}
        data-room-card-version="approved-v4"
        className={`room-list-card relative w-full rounded-[16px] p-5 shadow-sm transition-all duration-200 sm:p-6 ${colorStyles.card} ${className}`}
      >
        {children}
      </div>
    );
  }

  // Original approved media proportions and treatment.
  const mediaElement = mediaSlot ?? (
    <div className="flex min-h-[260px] w-full shrink-0 flex-col self-stretch sm:min-h-[300px] lg:min-h-[336px] lg:w-[46%] xl:w-[48%]">
      <div className="group relative h-full w-full flex-1 overflow-hidden rounded-[17px] bg-[#D7D0C7]">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={room.name}
            className="absolute inset-0 block h-full w-full select-none object-contain"
          />
        ) : (
          <div className="absolute inset-0 grid place-items-center font-brothers text-[10px] font-bold uppercase tracking-widest text-[#4E332D]/45">
            Room imagery unavailable
          </div>
        )}
        {isTopMatch && (
          <div className="absolute left-3 top-3 z-10 flex items-center gap-1.5 rounded-full bg-[#0E301A]/90 px-3 py-1 font-brothers text-[10px] font-bold uppercase tracking-widest text-[#FAF9F9] shadow-sm backdrop-blur-sm">
            <Sparkles className="h-3 w-3 text-[#F2AAA9]" />
            <span>Top Pick</span>
          </div>
        )}
        {hasGallery && (
          <>
            <button
              type="button"
              onClick={showPreviousImage}
              aria-label={`Previous photo of ${room.name}`}
              className="absolute left-3 top-1/2 z-10 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full border border-[#FAF9F9]/60 bg-[#221C18]/75 text-[#FAF9F9] shadow-md backdrop-blur-sm transition hover:bg-[#221C18] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F2AAA9]"
            >
              <ChevronLeft className="h-5 w-5" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={showNextImage}
              aria-label={`Next photo of ${room.name}`}
              className="absolute right-3 top-1/2 z-10 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full border border-[#FAF9F9]/60 bg-[#221C18]/75 text-[#FAF9F9] shadow-md backdrop-blur-sm transition hover:bg-[#221C18] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F2AAA9]"
            >
              <ChevronRight className="h-5 w-5" aria-hidden="true" />
            </button>
            <span className="absolute bottom-3 right-3 z-10 rounded-full bg-[#221C18]/75 px-2.5 py-1 font-brothers text-[9px] font-bold uppercase tracking-wider text-[#FAF9F9] backdrop-blur-sm">
              {activeImageIndex + 1} / {imageUrls.length}
            </span>
          </>
        )}
      </div>
    </div>
  );

  return (
    <div
      data-room-card={room.categoryId}
      data-room-card-version="approved-v4"
      className={`room-list-card flex w-full flex-col items-stretch gap-6 rounded-[16px] p-5 shadow-sm transition-all duration-200 hover:shadow-md sm:p-6 lg:gap-8 ${
        layout === "right" ? "lg:flex-row-reverse" : "lg:flex-row"
      } ${colorStyles.card} ${className}`}
    >
      {mediaElement}

      <div className="flex min-w-0 flex-1 flex-col justify-between self-stretch py-0.5">
        <div>
          {headerSlot ?? (
            <div className="mb-2.5 flex flex-col gap-1.5">
              <h3
                className={`room-list-card__title text-balance text-2xl font-bold uppercase leading-tight tracking-[0.72px] sm:text-3xl md:text-[34px] md:leading-[105%] ${colorStyles.title}`}
              >
                {room.name}
              </h3>
              {tagline && (
                <p
                  className={`room-list-card__tagline text-xs font-bold uppercase tracking-[2.5px] sm:text-[13px] ${colorStyles.tagline}`}
                >
                  {tagline}
                </p>
              )}
            </div>
          )}

          {bodySlot ??
            (room.description ? (
              <p
                className={`room-list-card__body mb-4 line-clamp-3 text-xs leading-[22px] sm:text-sm sm:leading-[23px] md:line-clamp-4 ${colorStyles.description}`}
              >
                {room.description}
              </p>
            ) : null)}

          {badgesSlot ?? (
            <div className="mb-4 flex flex-wrap items-center gap-2 py-1">
              {pills.map((pill) => (
                <div
                  key={pill.key}
                  data-pill-source={pill.source}
                  className={`room-list-card__pill rounded-[12px] px-2.5 py-1 text-[10px] font-bold uppercase tracking-[1px] ${
                    pill.emphasis === "highlight"
                      ? colorStyles.highlightBadge
                      : colorStyles.amenityBadge
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
                  className={`room-list-card__action rounded-[17px] px-5 py-2.5 text-[11px] font-bold uppercase tracking-[1.1px] shadow-sm transition-transform active:scale-95 ${colorStyles.selectBtn}`}
                >
                  Select Room
                </button>
              )}
              {onOpenRoomDetails && (
                <button
                  type="button"
                  onClick={() => onOpenRoomDetails(room)}
                  className={`room-list-card__action rounded-[17px] px-5 py-2 text-[11px] font-bold uppercase tracking-[1.1px] transition-colors ${colorStyles.detailsBtn}`}
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
                  className={`room-list-card__price text-lg font-normal sm:text-xl md:text-2xl ${colorStyles.price}`}
                >
                  from {money(nightlyRate, currency)}
                  <span className="text-xs">/night</span>
                </span>
              ) : (
                <span className={`room-list-card__price text-sm ${colorStyles.price}`}>Check rate</span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
