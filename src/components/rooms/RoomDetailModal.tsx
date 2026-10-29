import * as React from 'react';
import { useState, useEffect, useId, useRef } from 'react';
import { RoomType, SearchCriteria } from '@/types';
import type { RoomTypeCmsReview } from '@/types/room-type-cms';
import { AmenityWoodcutIcon } from '@/components/icons/AmenityWoodcutIcon';
import { GuestReviewQuoteCard } from './GuestReviewQuoteCard';
import { formatReviewDate } from '@/lib/reviewDate';
import { X, Bath, ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';


export interface RoomDetailModalProps {
  room: RoomType | null;
  criteria: SearchCriteria;
  onClose: () => void;
  onProceedToRates: (room: RoomType) => void;
  review?: RoomTypeCmsReview | null;
}

export const RoomDetailModal: React.FC<RoomDetailModalProps> = ({
  room,
  criteria,
  onClose,
  onProceedToRates,
  review = null,
}: RoomDetailModalProps) => {
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const titleId = useId();
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      } else if (e.key === "ArrowLeft" && room && room.images.length > 1) {
        setActiveImageIndex((prev) => (prev - 1 + room.images.length) % room.images.length);
      } else if (e.key === "ArrowRight" && room && room.images.length > 1) {
        setActiveImageIndex((prev) => (prev + 1) % room.images.length);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose, room]);

  const activeReview: RoomTypeCmsReview | null = review ?? null;
  const reviewDate = formatReviewDate(activeReview?.reviewDate);

  useEffect(() => {
    if (!room) return;
    const previousFocus = document.activeElement instanceof HTMLElement
      ? document.activeElement
      : null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    closeButtonRef.current?.focus();

    const focusable = () => Array.from(
      dialogRef.current?.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
      ) ?? [],
    ).filter((element) => element.getClientRects().length > 0);

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        event.stopPropagation();
        onCloseRef.current();
        return;
      }
      if (event.key !== 'Tab') return;
      const elements = focusable();
      if (!elements.length) {
        event.preventDefault();
        dialogRef.current?.focus();
        return;
      }
      const first = elements[0];
      const last = elements[elements.length - 1];
      if (event.shiftKey && (document.activeElement === first || !dialogRef.current?.contains(document.activeElement))) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && (document.activeElement === last || !dialogRef.current?.contains(document.activeElement))) {
        event.preventDefault();
        first.focus();
      }
    };
    const keepFocusInside = (event: FocusEvent) => {
      if (event.target instanceof Node && !dialogRef.current?.contains(event.target)) {
        closeButtonRef.current?.focus();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('focusin', keepFocusInside);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('focusin', keepFocusInside);
      document.body.style.overflow = previousOverflow;
      previousFocus?.focus();
    };
  }, [Boolean(room)]);

  if (!room) return null;

  return (
    <div
      ref={dialogRef}
      tabIndex={-1}
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-black/75 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-4xl bg-paper rounded-modal-lg overflow-hidden shadow-2xl border-4 border-cowboy-umber my-8 max-h-[90vh] flex flex-col texture-linen">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-alpine-linen border-b-2 border-cowboy-umber/20">
          <div className="flex items-center gap-2">
            <span className="font-label text-xs uppercase tracking-widest text-copper font-bold">
              {room.buildingName.toUpperCase()} · {room.eyebrow}
            </span>
          </div>
          <button
            type="button"
            ref={closeButtonRef}
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white border border-cowboy-umber/20 hover:bg-alpine-linen flex items-center justify-center text-cowboy-umber transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-cowboy-umber focus-visible:outline-hidden"
            aria-label={`Close details for ${room.name}`}
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="p-6 sm:p-8 overflow-y-auto space-y-8">
          {/* Gallery Carousel with Deckled Borders */}
          <div>
            <div className="relative h-72 sm:h-96 rounded-2xl overflow-hidden border-2 border-cowboy-umber shadow-md mb-3">
              <img
                src={room.images[activeImageIndex]}
                alt={`${room.name} photo ${activeImageIndex + 1}`}
                className="w-full h-full object-cover"
              />
              {room.images.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={() => setActiveImageIndex((prev) => (prev - 1 + room.images.length) % room.images.length)}
                    aria-label={`Previous photo of ${room.name}`}
                    className="absolute left-3 top-1/2 -translate-y-1/2 grid h-10 w-10 place-items-center rounded-full bg-smoke/80 text-white hover:bg-smoke focus-visible:ring-2 focus-visible:ring-cowboy-umber focus-visible:outline-none transition-colors cursor-pointer"
                  >
                    <ChevronLeft className="w-6 h-6" aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveImageIndex((prev) => (prev + 1) % room.images.length)}
                    aria-label={`Next photo of ${room.name}`}
                    className="absolute right-3 top-1/2 -translate-y-1/2 grid h-10 w-10 place-items-center rounded-full bg-smoke/80 text-white hover:bg-smoke focus-visible:ring-2 focus-visible:ring-cowboy-umber focus-visible:outline-none transition-colors cursor-pointer"
                  >
                    <ChevronRight className="w-6 h-6" aria-hidden="true" />
                  </button>
                </>
              )}
              <div
                className="absolute bottom-4 left-4 bg-smoke/90 text-white px-3.5 py-1 rounded-full text-xs font-label uppercase tracking-wider border border-white/20"
                role="status"
                aria-live="polite"
                aria-atomic="true"
              >
                Photo {activeImageIndex + 1} of {room.images.length}
              </div>
            </div>

            {/* Thumbnails */}
            <div className="flex items-center gap-3 overflow-x-auto pb-2">
              {room.images.map((img: string, idx: number) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setActiveImageIndex(idx)}
                  aria-label={`View photo ${idx + 1} of ${room.images.length}`}
                  aria-current={activeImageIndex === idx ? 'true' : undefined}
                  className={`relative w-20 h-16 rounded-xl overflow-hidden shrink-0 border-2 transition-all cursor-pointer focus-visible:ring-2 focus-visible:ring-cowboy-umber focus-visible:outline-hidden ${
                    activeImageIndex === idx
                      ? 'border-cowboy-umber scale-105 shadow-sm'
                      : 'border-transparent opacity-60 hover:opacity-100'
                  }`}
                >
                  <img
                    src={img}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Room Title & Specs */}
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 pb-6 border-b border-cowboy-umber/15">
            <div>
              <h2
                id={titleId}
                className="text-balance font-heading font-extrabold text-3xl sm:text-4xl text-smoke uppercase tracking-wide"
              >
                {room.name}
              </h2>
              <p className="font-body italic text-base text-copper mt-1">
                {room.tagline}
              </p>
            </div>

            <div className="flex items-center gap-4 bg-paper p-4 rounded-2xl border-2 border-cowboy-umber shrink-0">
              <div className="text-right">
                <span className="block text-[10px] font-label uppercase tracking-widest text-smoke-fade">
                  Standard Rate
                </span>
                <span className="font-heading font-bold text-3xl text-cowboy-umber">
                  ${room.basePrice}
                </span>
                <span className="text-[10px] text-smoke-fade block">/ night excl. tax</span>
              </div>
            </div>
          </div>

          {/* Narrative Long Description */}
          <div>
            <h3 className="font-label text-xs uppercase tracking-widest text-cowboy-umber-100 font-bold mb-2">
              THE EXPERIENCE & DESIGN STORY
            </h3>
            <p className="font-body text-base sm:text-lg text-smoke leading-relaxed">
              {room.longDescription}
            </p>
          </div>

          {/* The Soaking Ritual Feature Box */}
          <div className="bg-paper border-2 border-copper rounded-2xl p-6 shadow-xs relative">
            <div className="flex items-center gap-2 mb-2">
              <Bath className="w-5 h-5 text-copper" />
              <h4 className="font-label text-sm uppercase tracking-wider text-cowboy-umber font-bold">
                The Soaking Tub Ritual
              </h4>
            </div>
            <p className="font-body text-sm sm:text-base text-cowboy-umber">
              {room.soakHighlight}. Every bath is stocked with organic botanicals, dead sea bath salts, and plush Turkish waffle robes for unwinding after a Catskill hike.
            </p>
          </div>

          {/* Handcrafted Woodcut Amenity Grid (matching features.pdf layout) */}
          <div className="pt-6 border-t border-cowboy-umber/15">
            <h3 className="font-label text-xs uppercase tracking-[0.25em] text-cowboy-umber-100 font-bold mb-8 text-center sm:text-left">
              SIGNATURE SUITE AMENITIES
            </h3>

            {/* 8 Features Grid matching features.pdf */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-6 sm:gap-x-8 gap-y-10 sm:gap-y-12">
              {/* 1. Bed */}
              <div className="flex flex-col items-center text-center group">
                <div className="h-20 sm:h-24 w-full flex items-center justify-center mb-3">
                  <AmenityWoodcutIcon
                    type={room.bedType.toLowerCase().includes('double') ? 'double-beds' : 'bed'}
                    className="h-16 sm:h-20 md:h-22 w-auto max-w-32.5 transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
                <span className="font-label font-bold text-[9px] sm:text-[10px] md:text-[11px] uppercase tracking-[0.22em] text-smoke leading-tight max-w-32.5">
                  {room.bedType.toUpperCase().includes('KING') ? 'KING BED' : room.bedType.toUpperCase()}
                </span>
              </div>

              {/* 2. Pendleton Wool Robes */}
              <div className="flex flex-col items-center text-center group">
                <div className="h-20 sm:h-24 w-full flex items-center justify-center mb-3">
                  <AmenityWoodcutIcon
                    type="robes"
                    className="h-16 sm:h-20 md:h-22 w-auto max-w-27.5 transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
                <span className="font-label font-bold text-[9px] sm:text-[10px] md:text-[11px] uppercase tracking-[0.22em] text-smoke leading-tight max-w-32.5">
                  PENDLETON<br />WOOL ROBES
                </span>
              </div>

              {/* 3. Signature Bath Amenities */}
              <div className="flex flex-col items-center text-center group">
                <div className="h-20 sm:h-24 w-full flex items-center justify-center mb-3">
                  <AmenityWoodcutIcon
                    type="bath-amenities"
                    className="h-16 sm:h-20 md:h-22 w-auto max-w-30 transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
                <span className="font-label font-bold text-[9px] sm:text-[10px] md:text-[11px] uppercase tracking-[0.22em] text-smoke leading-tight max-w-32.5">
                  SIGNATURE<br />BATH AMENITIES
                </span>
              </div>

              {/* 4. Minibar */}
              <div className="flex flex-col items-center text-center group">
                <div className="h-20 sm:h-24 w-full flex items-center justify-center mb-3">
                  <AmenityWoodcutIcon
                    type="minibar"
                    className="h-16 sm:h-20 md:h-22 w-auto max-w-27.5 transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
                <span className="font-label font-bold text-[9px] sm:text-[10px] md:text-[11px] uppercase tracking-[0.22em] text-smoke leading-tight max-w-32.5">
                  MINIBAR
                </span>
              </div>

              {/* 5. Letter Writing Desk */}
              <div className="flex flex-col items-center text-center group">
                <div className="h-20 sm:h-24 w-full flex items-center justify-center mb-3">
                  <AmenityWoodcutIcon
                    type="desk"
                    className="h-16 sm:h-20 md:h-22 w-auto max-w-30 transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
                <span className="font-label font-bold text-[9px] sm:text-[10px] md:text-[11px] uppercase tracking-[0.22em] text-smoke leading-tight max-w-32.5">
                  LETTER<br />WRITING DESK
                </span>
              </div>

              {/* 6. Radiant Heated Floors */}
              <div className="flex flex-col items-center text-center group">
                <div className="h-20 sm:h-24 w-full flex items-center justify-center mb-3">
                  <AmenityWoodcutIcon
                    type="radiant"
                    className="h-16 sm:h-20 md:h-22 w-auto max-w-31.25 transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
                <span className="font-label font-bold text-[9px] sm:text-[10px] md:text-[11px] uppercase tracking-[0.22em] text-smoke leading-tight max-w-32.5">
                  RADIANT<br />HEATED FLOORS
                </span>
              </div>

              {/* 7. Cast Iron Wood Stove */}
              <div className="flex flex-col items-center text-center group">
                <div className="h-20 sm:h-24 w-full flex items-center justify-center mb-3">
                  <AmenityWoodcutIcon
                    type="stove"
                    className="h-16 sm:h-20 md:h-22 w-auto max-w-27.5 transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
                <span className="font-label font-bold text-[9px] sm:text-[10px] md:text-[11px] uppercase tracking-[0.22em] text-smoke leading-tight max-w-32.5">
                  CAST IRON<br />WOOD STOVE
                </span>
              </div>

              {/* 8. Soaking Tub (Cedar or accent Clawfoot) */}
              <div className="flex flex-col items-center text-center group">
                <div className="h-20 sm:h-24 w-full flex items-center justify-center mb-3">
                  <AmenityWoodcutIcon
                    type={room.soakType === 'outdoor-cedar-tub' ? 'cedar-tub' : 'clawfoot-tub'}
                    className="h-16 sm:h-20 md:h-22 w-auto max-w-32.5 transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
                <span className="font-label font-bold text-[9px] sm:text-[10px] md:text-[11px] uppercase tracking-[0.22em] text-smoke leading-tight max-w-32.5">
                  {room.soakType === 'outdoor-cedar-tub' ? (
                    <>OUTDOOR CEDAR<br />SOAKING TUB</>
                  ) : (
                    <>accent CLAWFOOT<br />SOAKING TUB</>
                  )}
                </span>
              </div>
            </div>
          </div>

          {activeReview && activeReview.quote && activeReview.quote.trim() ? (
            <div className="border-t border-cowboy-umber/15 pt-4">
              <GuestReviewQuoteCard
                quote={activeReview.quote}
                reviewer={activeReview.reviewer}
                date={reviewDate}
                site={activeReview.source}
                sourceUrl={activeReview.sourceUrl}
                size="lg"
                className="my-2 px-6 py-10 sm:px-12 sm:py-14"
              />
            </div>
          ) : null}
        </div>

        {/* Modal Sticky Footer CTA */}
        <div className="p-5 sm:p-6 bg-alpine-linen border-t-2 border-cowboy-umber/20 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs text-alpine-linen-900 font-sans">
            <span>Stay dates: </span>
            <span className="font-bold text-cowboy-umber">{criteria.checkIn} to {criteria.checkOut}</span> ({criteria.nights} nights)
          </div>

          <button
            type="button"
            onClick={() => onProceedToRates(room)}
            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-cowboy-umber hover:bg-smoke text-white px-8 py-3.5 rounded-full font-label text-xs sm:text-sm uppercase tracking-widest shadow-md transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cowboy-umber focus-visible:ring-offset-2"
          >
            <span>Proceed to Rate Selection</span>
            <ArrowRight className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>
      </div>
    </div>
  );
};
