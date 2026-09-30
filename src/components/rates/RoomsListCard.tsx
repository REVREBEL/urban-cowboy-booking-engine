import React from 'react';
import { RoomType } from '../types';
import { ROOM_IMAGE_ASSETS } from '../data/roomImagePlaceholders';
import { Sparkles, Eye, ArrowRight, Dog, Flame, Bath } from 'lucide-react';

export type RoomCardColor = 'paper' | 'forest' | 'smoke' | 'copper';
export type RoomCardLayout = 'left' | 'right';

export interface RoomsListCardProps {
  room: RoomType;
  color?: RoomCardColor;
  layout?: RoomCardLayout;
  onSelectRoom?: (room: RoomType) => void;
  onOpenRoomDetails?: (room: RoomType) => void;
  customImage?: string;
  isTopMatch?: boolean;

  // Dedicated slots for maximum interchangeability and complex room types
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
  color = 'paper',
  layout = 'left',
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
  className = ''
}) => {
  // Exact Color Tokens from Figma Specification
  const colorStyles = {
    paper: {
      card: 'bg-[#FAF9F9] border-2 border-[#0E301A]',
      title: 'text-[#4E332D]',
      tagline: 'text-[#9A5636]',
      description: 'text-[#4E332D]',
      amenityBadge: 'border border-[#4E332D] text-[#4E332D]',
      highlightBadge: 'border border-[#9A5636] text-[#9A5636]',
      selectBtn: 'bg-[#9A5636] hover:bg-[#783224] text-[#EBE8E0]',
      detailsBtn: 'border border-[#9A5636] text-[#9A5636] hover:bg-[#9A5636]/10',
      price: 'text-[#4E332D]'
    },
    forest: {
      card: 'bg-[#0E301A] border-2 border-[#0E301A]',
      title: 'text-[#FAF9F9]',
      tagline: 'text-[#F2AAA9]',
      description: 'text-[#FAF9F9]',
      amenityBadge: 'border border-[#FAF9F9] text-[#FAF9F9]',
      highlightBadge: 'border border-[#F2AAA9] text-[#F2AAA9]',
      selectBtn: 'bg-[#F2AAA9] hover:bg-[#F2AAA9]/85 text-[#0E301A] font-bold',
      detailsBtn: 'border border-[#F2AAA9] text-[#F2AAA9] hover:bg-[#F2AAA9]/10',
      price: 'text-[#FAF9F9]'
    },
    smoke: {
      card: 'bg-[#343833] border-2 border-[#343833]',
      title: 'text-[#EBE8E0]',
      tagline: 'text-[#A4674A]',
      description: 'text-[#EBE8E0]',
      amenityBadge: 'border border-[#EBE8E0] text-[#EBE8E0]',
      highlightBadge: 'border border-[#AE785E] text-[#AE785E]',
      selectBtn: 'bg-[#9A5636] hover:bg-[#783224] text-[#EBE8E0]',
      detailsBtn: 'border border-[#9A5636] text-[#9A5636] hover:bg-[#9A5636]/10',
      price: 'text-[#EBE8E0]'
    },
    copper: {
      card: 'bg-[#9A5636] border-2 border-[#9A5636]',
      title: 'text-[#DDC5A4]',
      tagline: 'text-[#2F1F1B]',
      description: 'text-[#DDC5A4]',
      amenityBadge: 'border border-[#DDC5A4] text-[#DDC5A4]',
      highlightBadge: 'border border-[#2F1F1B] text-[#2F1F1B]',
      selectBtn: 'bg-[#2F1F1B] hover:bg-black text-[#DDC5A4]',
      detailsBtn: 'border border-[#2F1F1B] text-[#2F1F1B] hover:bg-[#2F1F1B]/10',
      price: 'text-[#DDC5A4]'
    }
  }[color];

  const imageUrl = customImage || room.images?.[0] || ROOM_IMAGE_ASSETS.WALDEN_FOREST_BATHING_SUITE;

  // Build automated badges if no custom slot passed
  const getBadges = () => {
    const list: Array<{ text: string; isHighlight?: boolean }> = [];
    if (room.maxGuests) list.push({ text: `${room.maxGuests} Guests` });
    if (room.bedType) list.push({ text: room.bedType });
    if (room.soakHighlight) list.push({ text: room.soakHighlight });
    if (room.soakType === 'clawfoot-window' || room.soakType === 'copper-den') {
      list.push({ text: 'Clawfoot Bathtub' });
    }
    if (room.ageRestricted21) {
      list.push({ text: '21+', isHighlight: true });
    } else {
      list.push({ text: 'Family Friendly', isHighlight: true });
    }
    if (room.isDogFriendly) {
      list.push({ text: 'Dogs Welcome', isHighlight: true });
    }
    return list;
  };

  // If complete custom children provided, render within the styled card envelope
  if (children) {
    return (
      <div
        data-room-card={room.id}
        className={`w-full rounded-[16px] p-5 sm:p-6 shadow-sm relative transition-all duration-200 ${colorStyles.card} ${className}`}
      >
        {children}
      </div>
    );
  }

  // Media Slot or Default Media Element
  const mediaElement = mediaSlot ?? (
    <div className="w-full lg:w-[46%] xl:w-[48%] self-stretch min-h-[260px] sm:min-h-[300px] lg:min-h-[336px] flex flex-col shrink-0">
      <div className="w-full h-full flex-1 rounded-[17px] overflow-hidden relative group">
        <img
          src={imageUrl}
          alt={room.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 select-none block absolute inset-0"
        />
        {isTopMatch && (
          <div className="absolute top-3 left-3 bg-[#0E301A]/90 backdrop-blur-xs text-[#FAF9F9] px-3 py-1 rounded-full text-[10px] font-brothers uppercase tracking-widest font-bold flex items-center gap-1.5 shadow-sm z-10">
            <Sparkles className="w-3 h-3 text-[#F2AAA9]" />
            <span>Top Pick</span>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div
      data-room-card={room.id}
      className={`w-full rounded-[16px] p-5 sm:p-6 shadow-sm flex flex-col ${
        layout === 'right' ? 'lg:flex-row-reverse' : 'lg:flex-row'
      } items-stretch gap-6 lg:gap-8 transition-all duration-200 hover:shadow-md ${colorStyles.card} ${className}`}
    >
      {/* Media Column */}
      {mediaElement}

      {/* Content Column */}
      <div className="flex-1 w-full flex flex-col justify-between self-stretch min-w-0 py-0.5">
        <div>
          {/* Header Slot or Default Heading & Subtitle */}
          {headerSlot ?? (
            <div className="flex flex-col gap-1.5 mb-2.5">
              <h3
                className={`font-brothers font-bold text-2xl sm:text-3xl md:text-[34px] leading-tight md:leading-[105%] tracking-[0.72px] uppercase ${colorStyles.title}`}
              >
                {room.name}
              </h3>
              {room.tagline && (
                <p
                  className={`font-brothers text-xs sm:text-[13px] tracking-[2.5px] uppercase font-bold ${colorStyles.tagline}`}
                >
                  {room.tagline}
                </p>
              )}
            </div>
          )}

          {/* Body Slot or Default Editorial Description */}
          {bodySlot ?? (
            <p
              className={`font-editorial text-xs sm:text-sm leading-[22px] sm:leading-[23px] mb-4 line-clamp-3 md:line-clamp-4 ${colorStyles.description}`}
            >
              {room.description}
            </p>
          )}

          {/* Badges Slot or Default Pill Badges */}
          {badgesSlot ?? (
            <div className="flex flex-wrap items-center gap-2 py-1 mb-4">
              {getBadges().map((badge, idx) => (
                <div
                  key={idx}
                  className={`px-2.5 py-1 rounded-[12px] text-[10px] font-brothers uppercase tracking-[1px] font-bold ${
                    badge.isHighlight ? colorStyles.highlightBadge : colorStyles.amenityBadge
                  }`}
                >
                  {badge.text}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Action Buttons & Nightly Rate Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-current/15 mt-auto">
          {actionsSlot ?? (
            <div className="flex items-center gap-3">
              {onSelectRoom && (
                <button
                  type="button"
                  onClick={() => onSelectRoom(room)}
                  className={`px-5 py-2.5 rounded-[17px] font-brothers font-bold text-[11px] tracking-[1.1px] uppercase cursor-pointer shadow-xs transition-transform active:scale-95 ${colorStyles.selectBtn}`}
                >
                  Select Room
                </button>
              )}
              {onOpenRoomDetails && (
                <button
                  type="button"
                  onClick={() => onOpenRoomDetails(room)}
                  className={`px-5 py-2 rounded-[17px] font-brothers font-bold text-[11px] tracking-[1.1px] uppercase cursor-pointer transition-colors ${colorStyles.detailsBtn}`}
                >
                  View Details
                </button>
              )}
            </div>
          )}

          {priceSlot ?? (
            <div className="text-right">
              <span className={`font-brothers text-lg sm:text-xl md:text-2xl font-normal ${colorStyles.price}`}>
                from ${room.basePrice}/night
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
