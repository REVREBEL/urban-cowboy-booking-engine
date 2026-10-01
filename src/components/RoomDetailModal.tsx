import React, { useState } from 'react';
import { RoomType, SearchCriteria } from '../types';
import { AmenityWoodcutIcon } from './WoodcutArt';
import { getFeaturedReviewForRoom } from '../data/roomReviews';
import { X, Bath, ArrowRight } from 'lucide-react';

interface RoomDetailModalProps {
  room: RoomType | null;
  criteria: SearchCriteria;
  onClose: () => void;
  onProceedToRates: (room: RoomType) => void;
}

export const RoomDetailModal: React.FC<RoomDetailModalProps> = ({
  room,
  criteria,
  onClose,
  onProceedToRates
}) => {
  if (!room) return null;

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const featuredReview = getFeaturedReviewForRoom(room.id, room.buildingId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-black/75 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl bg-[#FAF9F9] rounded-[36px] overflow-hidden shadow-2xl border-4 border-[#4E332D] my-8 max-h-[90vh] flex flex-col texture-linen">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-[#EBE8E0] border-b-2 border-[#4E332D]/20">
          <div className="flex items-center gap-2">
            <span className="font-woodblock text-xs uppercase tracking-widest text-[#9A5636] font-bold">
              {room.buildingName.toUpperCase()} · {room.eyebrow}
            </span>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white border border-[#4E332D]/20 hover:bg-[#EBE8E0] flex items-center justify-center text-[#4E332D] transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="p-6 sm:p-8 overflow-y-auto space-y-8">
          {/* Gallery Carousel with Deckled Borders */}
          <div>
            <div className="relative h-72 sm:h-96 rounded-2xl overflow-hidden border-2 border-[#4E332D] shadow-md mb-3">
              <img
                src={room.images[activeImageIndex]}
                alt={`${room.name} photo ${activeImageIndex + 1}`}
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-4 left-4 bg-[#221C18]/90 text-white px-3.5 py-1 rounded-full text-xs font-woodblock uppercase tracking-wider border border-white/20">
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
                      ? 'border-[#4E332D] scale-105 shadow-sm'
                      : 'border-transparent opacity-60 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt="thumbnail" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* Room Title & Specs */}
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 pb-6 border-b border-[#4E332D]/15">
            <div>
              <h2 className="font-display font-extrabold text-3xl sm:text-4xl text-[#221C18] uppercase tracking-wide">
                {room.name}
              </h2>
              <p className="font-editorial italic text-base text-[#9A5636] mt-1">
                {room.tagline}
              </p>
            </div>

            <div className="flex items-center gap-4 bg-[#FAF9F9] p-4 rounded-2xl border-2 border-[#4E332D] shrink-0">
              <div className="text-right">
                <span className="block text-[10px] font-woodblock uppercase tracking-widest text-[#73716D]">
                  Standard Rate
                </span>
                <span className="font-display font-bold text-3xl text-[#4E332D]">
                  ${room.basePrice}
                </span>
                <span className="text-[10px] text-[#73716D] block">/ night excl. tax</span>
              </div>
            </div>
          </div>

          {/* Narrative Long Description */}
          <div>
            <h3 className="font-woodblock text-xs uppercase tracking-widest text-[#8A7E74] font-bold mb-2">
              THE EXPERIENCE & DESIGN STORY
            </h3>
            <p className="font-editorial text-base sm:text-lg text-[#221C18] leading-relaxed">
              {room.longDescription}
            </p>
          </div>

          {/* The Soaking Ritual Feature Box */}
          <div className="bg-[#FAF9F9] border-2 border-[#9A5636] rounded-2xl p-6 shadow-xs relative">
            <div className="flex items-center gap-2 mb-2">
              <Bath className="w-5 h-5 text-[#9A5636]" />
              <h4 className="font-woodblock text-sm uppercase tracking-wider text-[#4E332D] font-bold">
                The Soaking Tub Ritual
              </h4>
            </div>
            <p className="font-editorial text-sm sm:text-base text-[#4E332D]">
              {room.soakHighlight}. Every bath is stocked with organic botanicals, dead sea bath salts, and plush Turkish waffle robes for unwinding after a Catskill hike.
            </p>
          </div>

          {/* Handcrafted Woodcut Amenity Grid (matching features.pdf layout) */}
          <div className="pt-6 border-t border-[#4E332D]/15">
            <h3 className="font-woodblock text-xs uppercase tracking-[0.25em] text-[#8A7E74] font-bold mb-8 text-center sm:text-left">
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
                <span className="font-brothers font-bold text-[9px] sm:text-[10px] md:text-[11px] uppercase tracking-[0.22em] text-[#221C18] leading-tight max-w-[130px]">
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
                <span className="font-brothers font-bold text-[9px] sm:text-[10px] md:text-[11px] uppercase tracking-[0.22em] text-[#221C18] leading-tight max-w-[130px]">
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
                <span className="font-brothers font-bold text-[9px] sm:text-[10px] md:text-[11px] uppercase tracking-[0.22em] text-[#221C18] leading-tight max-w-[130px]">
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
                <span className="font-brothers font-bold text-[9px] sm:text-[10px] md:text-[11px] uppercase tracking-[0.22em] text-[#221C18] leading-tight max-w-[130px]">
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
                <span className="font-brothers font-bold text-[9px] sm:text-[10px] md:text-[11px] uppercase tracking-[0.22em] text-[#221C18] leading-tight max-w-[130px]">
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
                <span className="font-brothers font-bold text-[9px] sm:text-[10px] md:text-[11px] uppercase tracking-[0.22em] text-[#221C18] leading-tight max-w-[130px]">
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
                <span className="font-brothers font-bold text-[9px] sm:text-[10px] md:text-[11px] uppercase tracking-[0.22em] text-[#221C18] leading-tight max-w-[130px]">
                  CAST IRON<br />WOOD STOVE
                </span>
              </div>

              {/* 8. Soaking Tub (Cedar or Copper Clawfoot) */}
              <div className="flex flex-col items-center text-center group">
                <div className="h-20 sm:h-24 w-full flex items-center justify-center mb-3">
                  <AmenityWoodcutIcon
                    type={room.soakType === 'outdoor-cedar-tub' ? 'cedar-tub' : 'clawfoot-tub'}
                    className="h-16 sm:h-20 md:h-22 w-auto max-w-[130px] transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
                <span className="font-brothers font-bold text-[9px] sm:text-[10px] md:text-[11px] uppercase tracking-[0.22em] text-[#221C18] leading-tight max-w-[130px]">
                  {room.soakType === 'outdoor-cedar-tub' ? (
                    <>OUTDOOR CEDAR<br />SOAKING TUB</>
                  ) : (
                    <>COPPER CLAWFOOT<br />SOAKING TUB</>
                  )}
                </span>
              </div>
            </div>
          </div>

          {/* Guest Review Quote Card (matching Review Quote.pdf) */}
          <div className="pt-4 border-t border-[#4E332D]/15">
            <div className="bg-white rounded-2xl border border-[#4E332D]/20 shadow-xs px-6 py-10 sm:px-12 sm:py-14 text-center my-2">
              <blockquote className="font-cedarville text-2xl sm:text-3xl md:text-[34px] text-[#964828] font-normal leading-relaxed tracking-wide max-w-2xl mx-auto">
                {featuredReview.quote}
              </blockquote>
              <p className="font-sans text-xs sm:text-[13px] tracking-[0.22em] text-[#964828]/85 uppercase mt-6 sm:mt-8 font-medium">
                — {featuredReview.reviewer}, {featuredReview.date} · {featuredReview.site}
              </p>
            </div>
          </div>
        </div>

        {/* Modal Sticky Footer CTA */}
        <div className="p-5 sm:p-6 bg-[#EBE8E0] border-t-2 border-[#4E332D]/20 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs text-[#6B6259] font-sans">
            <span>Stay dates: </span>
            <span className="font-bold text-[#4E332D]">{criteria.checkIn} to {criteria.checkOut}</span> ({criteria.nights} nights)
          </div>

          <button
            onClick={() => onProceedToRates(room)}
            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-[#4E332D] hover:bg-[#343833] text-white px-8 py-3.5 rounded-full font-woodblock text-xs sm:text-sm uppercase tracking-widest shadow-md transition-all cursor-pointer"
          >
            <span>Proceed to Rate Selection</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
