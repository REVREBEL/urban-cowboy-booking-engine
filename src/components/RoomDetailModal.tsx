import React, { useState } from 'react';
import { RoomType, SearchCriteria } from '../types';
import type { RoomTypeCmsReview } from '../types/room-type-cms';
import { AmenityWoodcutIcon } from './WoodcutArt';
import { GuestReviewQuoteCard } from './GuestReviewQuoteCard';
import { X, Bath, ArrowRight } from 'lucide-react';

function formatReviewDate(value: string | null | undefined): string | null {
  if (!value) return null;
  const timestamp = Date.parse(value);
  if (!Number.isFinite(timestamp)) return null;

  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(timestamp));
}

interface RoomDetailModalProps {
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
}) => {
  if (!room) return null;

  const [activeImageIndex, setActiveImageIndex] = useState(0);

  const reviewDate = formatReviewDate(review?.reviewDate);

  return (
<<<<<<< Updated upstream
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-black/75 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl bg-[#FAF9F9] rounded-[36px] overflow-hidden shadow-2xl border-4 border-[#4E332D] my-8 max-h-[90vh] flex flex-col texture-linen">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-[#EBE8E0] border-b-2 border-[#4E332D]/20">
          <div className="flex items-center gap-2">
            <span className="font-woodblock text-xs uppercase tracking-widest text-[#9A5636] font-bold">
=======
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-foreground/75 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl bg-paper rounded-modal-lg overflow-hidden shadow-2xl border-4 border-foregroundmy-8 max-h-[90vh] flex flex-col texture-linen">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-background border-b-2 border-foreground/20">
          <div className="flex items-center gap-2">
            <span className="font-label text-xs uppercase tracking-widest text-accent font-bold">
>>>>>>> Stashed changes
              {room.buildingName.toUpperCase()} · {room.eyebrow}
            </span>
          </div>
          <button
            onClick={onClose}
<<<<<<< Updated upstream
            className="w-8 h-8 rounded-full bg-white border border-[#4E332D]/20 hover:bg-[#EBE8E0] flex items-center justify-center text-[#4E332D] transition-colors cursor-pointer"
=======
            className="w-8 h-8 rounded-full bg-white border border-foreground/20 hover:bg-background flex items-center justify-center text-foregroundtransition-colors cursor-pointer"
>>>>>>> Stashed changes
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="p-6 sm:p-8 overflow-y-auto space-y-8">
          {/* Gallery Carousel with Deckled Borders */}
          <div>
<<<<<<< Updated upstream
            <div className="relative h-72 sm:h-96 rounded-2xl overflow-hidden border-2 border-[#4E332D] shadow-md mb-3">
=======
            <div className="relative h-72 sm:h-96 rounded-2xl overflow-hidden border-2 border-foregroundshadow-md mb-3">
>>>>>>> Stashed changes
              <img
                src={room.images[activeImageIndex]}
                alt={`${room.name} photo ${activeImageIndex + 1}`}
                className="w-full h-full object-cover"
              />
<<<<<<< Updated upstream
              <div className="absolute bottom-4 left-4 bg-[#221C18]/90 text-white px-3.5 py-1 rounded-full text-xs font-woodblock uppercase tracking-wider border border-white/20">
=======
              <div className="absolute bottom-4 left-4 bg-foreground/90 text-white px-3.5 py-1 rounded-full text-xs font-label uppercase tracking-wider border border-white/20">
>>>>>>> Stashed changes
                Photo {activeImageIndex + 1} of {room.images.length}
              </div>
            </div>

            {/* Thumbnails */}
            <div className="flex items-center gap-3 overflow-x-auto pb-2">
              {room.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImageIndex(idx)}
                  className={`relative w-20 h-16 rounded-xl overflow-hidden shrink-0 border-2 transition-all cursor-pointer ${
                    activeImageIndex === idx
<<<<<<< Updated upstream
                      ? 'border-[#4E332D] scale-105 shadow-sm'
=======
                      ? 'border-foregroundscale-105 shadow-sm'
>>>>>>> Stashed changes
                      : 'border-transparent opacity-60 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt="thumbnail" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* Room Title & Specs */}
<<<<<<< Updated upstream
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 pb-6 border-b border-[#4E332D]/15">
            <div>
              <h2 className="text-balance font-display font-extrabold text-3xl sm:text-4xl text-[#221C18] uppercase tracking-wide">
                {room.name}
              </h2>
              <p className="font-editorial italic text-base text-[#9A5636] mt-1">
=======
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 pb-6 border-b border-foreground/15">
            <div>
              <h2 className="text-balance font-heading font-extrabold text-3xl sm:text-4xl text-foreground uppercase tracking-wide">
                {room.name}
              </h2>
              <p className="font-body italic text-base text-accent mt-1">
>>>>>>> Stashed changes
                {room.tagline}
              </p>
            </div>

<<<<<<< Updated upstream
            <div className="flex items-center gap-4 bg-[#FAF9F9] p-4 rounded-2xl border-2 border-[#4E332D] shrink-0">
              <div className="text-right">
                <span className="block text-[10px] font-woodblock uppercase tracking-widest text-[#73716D]">
                  Standard Rate
                </span>
                <span className="font-display font-bold text-3xl text-[#4E332D]">
                  ${room.basePrice}
                </span>
                <span className="text-[10px] text-[#73716D] block">/ night excl. tax</span>
=======
            <div className="flex items-center gap-4 bg-paper p-4 rounded-2xl border-2 border-foregroundshrink-0">
              <div className="text-right">
                <span className="block text-[10px] font-label uppercase tracking-widest text-foreground-fade">
                  Standard Rate
                </span>
                <span className="font-heading font-bold text-3xl text-foreground">
                  ${room.basePrice}
                </span>
                <span className="text-[10px] text-foreground-fade block">/ night excl. tax</span>
>>>>>>> Stashed changes
              </div>
            </div>
          </div>

          {/* Narrative Long Description */}
          <div>
<<<<<<< Updated upstream
            <h3 className="font-woodblock text-xs uppercase tracking-widest text-[#8A7E74] font-bold mb-2">
              THE EXPERIENCE & DESIGN STORY
            </h3>
            <p className="font-editorial text-base sm:text-lg text-[#221C18] leading-relaxed">
=======
            <h3 className="font-label text-xs uppercase tracking-widest text-foreground-100 font-bold mb-2">
              THE EXPERIENCE & DESIGN STORY
            </h3>
            <p className="font-body text-base sm:text-lg text-foreground leading-relaxed">
>>>>>>> Stashed changes
              {room.longDescription}
            </p>
          </div>

          {/* The Soaking Ritual Feature Box */}
<<<<<<< Updated upstream
          <div className="bg-[#FAF9F9] border-2 border-[#9A5636] rounded-2xl p-6 shadow-xs relative">
            <div className="flex items-center gap-2 mb-2">
              <Bath className="w-5 h-5 text-[#9A5636]" />
              <h4 className="font-woodblock text-sm uppercase tracking-wider text-[#4E332D] font-bold">
                The Soaking Tub Ritual
              </h4>
            </div>
            <p className="font-editorial text-sm sm:text-base text-[#4E332D]">
=======
          <div className="bg-paper border-2 border-accent rounded-2xl p-6 shadow-xs relative">
            <div className="flex items-center gap-2 mb-2">
              <Bath className="w-5 h-5 text-accent" />
              <h4 className="font-label text-sm uppercase tracking-wider text-foregroundfont-bold">
                The Soaking Tub Ritual
              </h4>
            </div>
            <p className="font-body text-sm sm:text-base text-foreground">
>>>>>>> Stashed changes
              {room.soakHighlight}. Every bath is stocked with organic botanicals, dead sea bath salts, and plush Turkish waffle robes for unwinding after a Catskill hike.
            </p>
          </div>

          {/* Handcrafted Woodcut Amenity Grid (matching features.pdf layout) */}
<<<<<<< Updated upstream
          <div className="pt-6 border-t border-[#4E332D]/15">
            <h3 className="font-woodblock text-xs uppercase tracking-[0.25em] text-[#8A7E74] font-bold mb-8 text-center sm:text-left">
=======
          <div className="pt-6 border-t border-foreground/15">
            <h3 className="font-label text-xs uppercase tracking-[0.25em] text-foreground-100 font-bold mb-8 text-center sm:text-left">
>>>>>>> Stashed changes
              SIGNATURE SUITE AMENITIES
            </h3>

            {/* 8 Features Grid matching features.pdf */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-6 sm:gap-x-8 gap-y-10 sm:gap-y-12">
              {/* 1. Bed */}
              <div className="flex flex-col items-center text-center group">
                <div className="h-20 sm:h-24 w-full flex items-center justify-center mb-3">
                  <AmenityWoodcutIcon
                    type={room.bedType.toLowerCase().includes('double') ? 'double-beds' : 'bed'}
                    className="h-16 sm:h-20 md:h-22 w-auto max-w-[130px] transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
<<<<<<< Updated upstream
                <span className="font-brothers font-bold text-[9px] sm:text-[10px] md:text-[11px] uppercase tracking-[0.22em] text-[#221C18] leading-tight max-w-[130px]">
=======
                <span className="font-label font-bold text-[9px] sm:text-[10px] md:text-[11px] uppercase tracking-[0.22em] text-foreground leading-tight max-w-[130px]">
>>>>>>> Stashed changes
                  {room.bedType.toUpperCase().includes('KING') ? 'KING BED' : room.bedType.toUpperCase()}
                </span>
              </div>

              {/* 2. Pendleton Wool Robes */}
              <div className="flex flex-col items-center text-center group">
                <div className="h-20 sm:h-24 w-full flex items-center justify-center mb-3">
                  <AmenityWoodcutIcon
                    type="robes"
                    className="h-16 sm:h-20 md:h-22 w-auto max-w-[110px] transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
<<<<<<< Updated upstream
                <span className="font-brothers font-bold text-[9px] sm:text-[10px] md:text-[11px] uppercase tracking-[0.22em] text-[#221C18] leading-tight max-w-[130px]">
=======
                <span className="font-label font-bold text-[9px] sm:text-[10px] md:text-[11px] uppercase tracking-[0.22em] text-foreground leading-tight max-w-[130px]">
>>>>>>> Stashed changes
                  PENDLETON<br />WOOL ROBES
                </span>
              </div>

              {/* 3. Signature Bath Amenities */}
              <div className="flex flex-col items-center text-center group">
                <div className="h-20 sm:h-24 w-full flex items-center justify-center mb-3">
                  <AmenityWoodcutIcon
                    type="bath-amenities"
                    className="h-16 sm:h-20 md:h-22 w-auto max-w-[120px] transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
<<<<<<< Updated upstream
                <span className="font-brothers font-bold text-[9px] sm:text-[10px] md:text-[11px] uppercase tracking-[0.22em] text-[#221C18] leading-tight max-w-[130px]">
=======
                <span className="font-label font-bold text-[9px] sm:text-[10px] md:text-[11px] uppercase tracking-[0.22em] text-foreground leading-tight max-w-[130px]">
>>>>>>> Stashed changes
                  SIGNATURE<br />BATH AMENITIES
                </span>
              </div>

              {/* 4. Minibar */}
              <div className="flex flex-col items-center text-center group">
                <div className="h-20 sm:h-24 w-full flex items-center justify-center mb-3">
                  <AmenityWoodcutIcon
                    type="minibar"
                    className="h-16 sm:h-20 md:h-22 w-auto max-w-[110px] transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
<<<<<<< Updated upstream
                <span className="font-brothers font-bold text-[9px] sm:text-[10px] md:text-[11px] uppercase tracking-[0.22em] text-[#221C18] leading-tight max-w-[130px]">
=======
                <span className="font-label font-bold text-[9px] sm:text-[10px] md:text-[11px] uppercase tracking-[0.22em] text-foreground leading-tight max-w-[130px]">
>>>>>>> Stashed changes
                  MINIBAR
                </span>
              </div>

              {/* 5. Letter Writing Desk */}
              <div className="flex flex-col items-center text-center group">
                <div className="h-20 sm:h-24 w-full flex items-center justify-center mb-3">
                  <AmenityWoodcutIcon
                    type="desk"
                    className="h-16 sm:h-20 md:h-22 w-auto max-w-[120px] transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
<<<<<<< Updated upstream
                <span className="font-brothers font-bold text-[9px] sm:text-[10px] md:text-[11px] uppercase tracking-[0.22em] text-[#221C18] leading-tight max-w-[130px]">
=======
                <span className="font-label font-bold text-[9px] sm:text-[10px] md:text-[11px] uppercase tracking-[0.22em] text-foreground leading-tight max-w-[130px]">
>>>>>>> Stashed changes
                  LETTER<br />WRITING DESK
                </span>
              </div>

              {/* 6. Radiant Heated Floors */}
              <div className="flex flex-col items-center text-center group">
                <div className="h-20 sm:h-24 w-full flex items-center justify-center mb-3">
                  <AmenityWoodcutIcon
                    type="radiant"
                    className="h-16 sm:h-20 md:h-22 w-auto max-w-[125px] transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
<<<<<<< Updated upstream
                <span className="font-brothers font-bold text-[9px] sm:text-[10px] md:text-[11px] uppercase tracking-[0.22em] text-[#221C18] leading-tight max-w-[130px]">
=======
                <span className="font-label font-bold text-[9px] sm:text-[10px] md:text-[11px] uppercase tracking-[0.22em] text-foreground leading-tight max-w-[130px]">
>>>>>>> Stashed changes
                  RADIANT<br />HEATED FLOORS
                </span>
              </div>

              {/* 7. Cast Iron Wood Stove */}
              <div className="flex flex-col items-center text-center group">
                <div className="h-20 sm:h-24 w-full flex items-center justify-center mb-3">
                  <AmenityWoodcutIcon
                    type="stove"
                    className="h-16 sm:h-20 md:h-22 w-auto max-w-[110px] transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
<<<<<<< Updated upstream
                <span className="font-brothers font-bold text-[9px] sm:text-[10px] md:text-[11px] uppercase tracking-[0.22em] text-[#221C18] leading-tight max-w-[130px]">
=======
                <span className="font-label font-bold text-[9px] sm:text-[10px] md:text-[11px] uppercase tracking-[0.22em] text-foreground leading-tight max-w-[130px]">
>>>>>>> Stashed changes
                  CAST IRON<br />WOOD STOVE
                </span>
              </div>

              {/* 8. Soaking Tub (Cedar or accent Clawfoot) */}
              <div className="flex flex-col items-center text-center group">
                <div className="h-20 sm:h-24 w-full flex items-center justify-center mb-3">
                  <AmenityWoodcutIcon
                    type={room.soakType === 'outdoor-cedar-tub' ? 'cedar-tub' : 'clawfoot-tub'}
                    className="h-16 sm:h-20 md:h-22 w-auto max-w-[130px] transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
<<<<<<< Updated upstream
                <span className="font-brothers font-bold text-[9px] sm:text-[10px] md:text-[11px] uppercase tracking-[0.22em] text-[#221C18] leading-tight max-w-[130px]">
=======
                <span className="font-label font-bold text-[9px] sm:text-[10px] md:text-[11px] uppercase tracking-[0.22em] text-foreground leading-tight max-w-[130px]">
>>>>>>> Stashed changes
                  {room.soakType === 'outdoor-cedar-tub' ? (
                    <>OUTDOOR CEDAR<br />SOAKING TUB</>
                  ) : (
                    <>accent CLAWFOOT<br />SOAKING TUB</>
                  )}
                </span>
              </div>
            </div>
          </div>

          {review?.quote?.trim() ? (
<<<<<<< Updated upstream
            <div className="border-t border-[#4E332D]/15 pt-4">
=======
            <div className="border-t border-foreground/15 pt-4">
>>>>>>> Stashed changes
              <GuestReviewQuoteCard
                quote={review.quote}
                reviewer={review.reviewer}
                date={reviewDate}
                site={review.source}
                sourceUrl={review.sourceUrl}
                size="lg"
                className="my-2 px-6 py-10 sm:px-12 sm:py-14"
              />
            </div>
          ) : null}
        </div>

        {/* Modal Sticky Footer CTA */}
<<<<<<< Updated upstream
        <div className="p-5 sm:p-6 bg-[#EBE8E0] border-t-2 border-[#4E332D]/20 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs text-[#6B6259] font-sans">
            <span>Stay dates: </span>
            <span className="font-bold text-[#4E332D]">{criteria.checkIn} to {criteria.checkOut}</span> ({criteria.nights} nights)
=======
        <div className="p-5 sm:p-6 bg-background border-t-2 border-foreground/20 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs text-ash-900 font-sans">
            <span>Stay dates: </span>
            <span className="font-bold text-foreground">{criteria.checkIn} to {criteria.checkOut}</span> ({criteria.nights} nights)
>>>>>>> Stashed changes
          </div>

          <button
            onClick={() => onProceedToRates(room)}
<<<<<<< Updated upstream
            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-[#4E332D] hover:bg-[#343833] text-white px-8 py-3.5 rounded-full font-woodblock text-xs sm:text-sm uppercase tracking-widest shadow-md transition-all cursor-pointer"
=======
            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-foregroundhover:bg-foreground text-white px-8 py-3.5 rounded-full font-label text-xs sm:text-sm uppercase tracking-widest shadow-md transition-all cursor-pointer"
>>>>>>> Stashed changes
          >
            <span>Proceed to Rate Selection</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
