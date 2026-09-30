import React, { useState } from 'react';
import { RoomType, RateOption, SearchCriteria } from '../../types';
import { RATE_OPTIONS } from '../../data/hotelData';
import { getFeaturedReviewForRoom } from '../../data/roomReviews';
import {
  AmenityWoodcutIcon,
  WaldenHausWoodcut,
  AlpineHausWoodcut,
  LodgeWoodcut,
  VintageKeyFob
} from '../WoodcutArt';
import { OffersCard } from './RideEasyOffersCard';
import { OffersCardOutfit } from './OutfitOffersCard';
import { OffersCardSunup } from './SunupOffersCard';
import { OffersCardStayAWhile } from './StayAwhileOffersCard';
import { OffersCardPlanAhead } from './PlanAheadOffersCard';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Info,
  Calendar,
  Sparkles,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  SlidersHorizontal,
  ChevronRight,
  PanelLeftClose,
  PanelLeftOpen,
  LayoutGrid,
  ListFilter
} from 'lucide-react';

interface RateSelectionViewProps {
  room: RoomType;
  criteria: SearchCriteria;
  selectedRate: RateOption | null;
  onSelectRate: (rate: RateOption) => void;
  onChangeRoom: () => void;
  onOpenRoomDetails: (room: RoomType) => void;
  activeVersion?: 'v1' | 'v2';
  onSelectVersion?: (version: 'v1' | 'v2') => void;
}

export const RateSelectionView: React.FC<RateSelectionViewProps> = ({
  room,
  criteria,
  selectedRate,
  onSelectRate,
  onChangeRoom,
  onOpenRoomDetails,
  activeVersion = 'v1',
  onSelectVersion
}) => {
  const [rateCardsVariant, setRateCardsVariant] = useState<'default' | 'compact'>('default');
  const [expandedRateId, setExpandedRateId] = useState<string | null>(null);
  const [showInclusionsMatrix, setShowInclusionsMatrix] = useState<boolean>(false);
  const [isLeftCardMinimized, setIsLeftCardMinimized] = useState<boolean>(false);

  const featuredReview = getFeaturedReviewForRoom(room.id, room.buildingId);

  const calculateNightlyRate = (rate: RateOption) => {
    return Math.round(room.basePrice * rate.rateMultiplier);
  };

  const calculateStayTotal = (rate: RateOption) => {
    const rawNightly = calculateNightlyRate(rate);
    const subtotal = rawNightly * criteria.nights;
    const taxes = Math.round(subtotal * 0.085);
    const resortFee = 25;
    const isHalfDeposit = !rate.isNonRefundable;
    return {
      nightly: rawNightly,
      subtotal,
      taxes,
      resortFee,
      taxesAndFees: taxes + resortFee,
      total: subtotal + taxes + resortFee,
      dueToday: isHalfDeposit ? Math.round((subtotal + taxes + resortFee) * 0.5) : subtotal + taxes + resortFee,
      remaining: isHalfDeposit ? Math.round((subtotal + taxes + resortFee) * 0.5) : 0
    };
  };

  return (
    <div className="w-full texture-linen min-h-screen pb-20">
      {/* Top Breadcrumb Navigation */}
      <div className="booking-shell pb-4 pt-8">
        <button
          onClick={onChangeRoom}
          className="inline-flex items-center gap-2 font-woodblock text-xs uppercase tracking-widest text-[#73716D] hover:text-[#4E332D] transition-colors cursor-pointer mb-2"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Rooms & Buildings</span>
        </button>
      </div>

      {/* Main Split Screen */}
      <div className="booking-shell">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
          {/* ================= LEFT COLUMN: ROOM SPEC OR MINIMIZED VERTICAL BAR ================= */}
          {isLeftCardMinimized ? (
            <>
              {/* Mobile Minimized Horizontal Bar */}
              <div
                onClick={() => setIsLeftCardMinimized(false)}
                className="lg:hidden w-full flex items-center justify-between bg-[#FAF9F9] border-2 border-[#0E301A] rounded-2xl p-4 shadow-sm cursor-pointer hover:bg-white transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#EBE8E0] border border-[#0E301A]/30 flex items-center justify-center shrink-0 p-1">
                    {room.buildingId === 'alpine' && <AlpineHausWoodcut className="w-7 h-7" />}
                    {room.buildingId === 'walden' && <WaldenHausWoodcut className="w-7 h-7" />}
                    {room.buildingId === 'lodge' && <LodgeWoodcut className="w-7 h-7" />}
                  </div>
                  <div>
                    <span className="font-woodblock text-[10px] uppercase tracking-widest text-[#9A5636] font-bold block">
                      {room.buildingName}
                    </span>
                    <h3 className="font-brothers font-bold text-sm text-[#221C18] uppercase tracking-wider">
                      {room.name}
                    </h3>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-xs font-woodblock uppercase tracking-wider text-[#4E332D] font-bold">
                  <span>Expand Details</span>
                  <PanelLeftOpen className="w-4 h-4" />
                </div>
              </div>

              {/* Desktop Minimized Vertical Bar (Exact visual from design PDF) */}
              <div
                onClick={() => setIsLeftCardMinimized(false)}
                className="hidden lg:flex lg:col-span-1 flex-col items-center justify-between bg-[#FAF9F9] border-2 border-[#0E301A] rounded-full py-6 px-3 shadow-md hover:shadow-lg hover:bg-white transition-all cursor-pointer group self-stretch min-h-[640px] sticky top-24 select-none"
                title="Click to expand room details"
              >
                {/* Top Circular Badge with Woodcut Icon */}
                <div className="w-12 h-12 rounded-full bg-[#EBE8E0] border border-[#0E301A]/30 flex items-center justify-center shrink-0 p-1.5 shadow-2xs group-hover:scale-105 transition-transform">
                  {room.buildingId === 'alpine' && <AlpineHausWoodcut className="w-8 h-8" />}
                  {room.buildingId === 'walden' && <WaldenHausWoodcut className="w-8 h-8" />}
                  {room.buildingId === 'lodge' && <LodgeWoodcut className="w-8 h-8" />}
                </div>

                {/* Vertical Rotated Room Title */}
                <div className="my-auto py-8 flex items-center justify-center">
                  <span className="font-brothers font-extrabold text-sm sm:text-base lg:text-[15px] xl:text-[16px] text-[#221C18] uppercase tracking-[0.25em] [writing-mode:vertical-rl] rotate-180 whitespace-nowrap select-none group-hover:text-[#9A5636] transition-colors">
                    {room.name}
                  </span>
                </div>

                {/* Bottom Expand Arrow */}
                <div className="w-9 h-9 rounded-full bg-white border border-[#0E301A]/20 flex items-center justify-center text-[#221C18] shadow-2xs group-hover:bg-[#4E332D] group-hover:text-white transition-colors">
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            </>
          ) : (
            <div className="lg:col-span-5 space-y-8 bg-[#FAF9F9] rounded-[32px] p-6 sm:p-8 border-stitched shadow-md">
              {/* Top Room Header */}
              <div>
                <div className="flex items-center justify-between gap-4 mb-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#EBE8E0] border border-[#4E332D]/30 flex items-center justify-center shrink-0">
                      {room.buildingId === 'alpine' && <AlpineHausWoodcut className="w-8 h-8" />}
                      {room.buildingId === 'walden' && <WaldenHausWoodcut className="w-8 h-8" />}
                      {room.buildingId === 'lodge' && <LodgeWoodcut className="w-8 h-8" />}
                    </div>
                    <span className="font-woodblock text-xs uppercase tracking-widest text-[#9A5636] font-bold">
                      {room.buildingName.toUpperCase()}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setIsLeftCardMinimized(true)}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-[#4E332D]/25 bg-white hover:bg-[#EBE8E0] font-woodblock text-[11px] uppercase tracking-wider text-[#4E332D] transition-all cursor-pointer shadow-2xs"
                      title="Minimize to vertical side bar"
                    >
                      <PanelLeftClose className="w-3.5 h-3.5" />
                      <span>Minimize</span>
                    </button>

                    <button
                      onClick={onChangeRoom}
                      className="font-woodblock text-xs uppercase tracking-wider text-[#4E332D] hover:underline cursor-pointer"
                    >
                      Change Suite
                    </button>
                  </div>
                </div>

                <h1 className="font-display font-extrabold text-3xl sm:text-4xl text-[#221C18] uppercase tracking-wide leading-tight">
                  {room.name}
                </h1>

                <span className="font-woodblock text-xs uppercase tracking-wider text-[#9A5636] font-bold block mt-2 mb-3">
                  {room.eyebrow}
                </span>

                <p className="font-editorial text-sm sm:text-base text-[#4E332D]/85 leading-relaxed">
                  {room.description}
                </p>
              </div>

              {/* 3-Photo Editorial Masonry Strip */}
              <div className="grid grid-cols-3 gap-3">
                {room.images.map((imgUrl, idx) => (
                  <div
                    key={idx}
                    onClick={() => onOpenRoomDetails(room)}
                    className="h-32 sm:h-40 rounded-2xl overflow-hidden border border-[#4E332D]/30 shadow-xs cursor-pointer group relative"
                  >
                    <img
                      src={imgUrl}
                      alt={`${room.name} ${idx + 1}`}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors" />
                  </div>
                ))}
              </div>

              <div className="flex justify-between items-center text-xs font-woodblock uppercase tracking-wider text-[#73716D] pt-1">
                <span>{room.bedType} · {room.squareFeet} Sq Ft</span>
                <button
                  onClick={() => onOpenRoomDetails(room)}
                  className="text-[#4E332D] font-bold hover:underline cursor-pointer flex items-center gap-1"
                >
                  <span>View Full Photo Gallery & Specs</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Verified Guest Review Callout (Styled matching the Room Details Blockquote format) */}
              <div
                onClick={() => onOpenRoomDetails(room)}
                className="bg-white rounded-2xl border border-[#4E332D]/20 shadow-xs px-5 py-6 sm:px-8 sm:py-7 text-center hover:shadow-md transition-all duration-200 cursor-pointer group relative"
              >
                <blockquote className="font-cedarville text-xl sm:text-2xl md:text-[25px] text-[#964828] font-normal leading-relaxed tracking-wide max-w-xl mx-auto">
                  "{featuredReview.quote}"
                </blockquote>
                <p className="font-sans text-[11px] sm:text-xs tracking-[0.22em] text-[#964828]/85 uppercase mt-5 font-medium">
                  — {featuredReview.reviewer}, {featuredReview.date} · {featuredReview.site}
                </p>
              </div>

              {/* ================= TOP ROOM AMENITIES (Handcrafted Woodcut Icons from features.pdf) ================= */}
              <div className="pt-6 border-t border-[#4E332D]/15">
                <h3 className="font-woodblock text-xs uppercase tracking-[0.25em] text-[#221C18] font-bold text-center sm:text-left mb-8">
                  Top Room Amenities
                </h3>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-6 sm:gap-x-8 gap-y-10 sm:gap-y-12 text-center">
                  {/* 1. King Bed */}
                  <div className="flex flex-col items-center text-center group">
                    <div className="h-20 sm:h-24 w-full flex items-center justify-center mb-3">
                      <AmenityWoodcutIcon
                        type="bed"
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

                  {/* 8. Soaking Tub */}
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
            </div>
          )}

          {/* ================= RIGHT COLUMN: SELECT A RATE (STACKED VERTICAL OFFERS CARDS) ================= */}
          <div className={`${isLeftCardMinimized ? 'lg:col-span-11' : 'lg:col-span-7'} space-y-8 transition-all duration-300`}>
            {/* Header: SELECT A RATE + VIEW SWITCHER */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b-2 border-[#4E332D]">
              <div>
                <h2 className="font-display font-extrabold text-2xl sm:text-3xl text-[#221C18] uppercase tracking-[0.15em]">
                  Select a Rate
                </h2>
                <span className="font-woodblock text-xs uppercase tracking-wider text-[#73716D] block mt-0.5">
                  {criteria.checkIn} — {criteria.checkOut} · {criteria.nights} Nights · {criteria.guests} Adults
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                {/* Version Toggle (Version 1 vs Version 2) */}
                <div className="flex items-center bg-[#FAF9F9] border border-[#4E332D]/20 rounded-full p-1 text-xs font-woodblock uppercase tracking-wider text-[#4E332D]">
                  <button
                    onClick={() => onSelectVersion && onSelectVersion('v1')}
                    className={`px-3 py-1 rounded-full transition-all cursor-pointer flex items-center gap-1.5 ${
                      activeVersion === 'v1'
                        ? 'bg-[#343833] text-[#FAF9F9] shadow-xs font-bold'
                        : 'text-[#73716D] hover:text-[#343833]'
                    }`}
                  >
                    <span>Version 1</span>
                    <span className="text-[10px] opacity-75 font-mono">(Stored)</span>
                  </button>
                  <button
                    onClick={() => onSelectVersion && onSelectVersion('v2')}
                    className={`px-3 py-1 rounded-full transition-all cursor-pointer flex items-center gap-1.5 ${
                      activeVersion === 'v2'
                        ? 'bg-[#D65241] text-white shadow-xs font-bold'
                        : 'text-[#73716D] hover:text-[#D65241]'
                    }`}
                  >
                    <span>Version 2</span>
                    <span className="text-[10px] opacity-75 font-mono">(Draft)</span>
                  </button>
                </div>

                {/* View toggle (Default vs Compact) */}
                <div className="flex items-center bg-[#FAF9F9] border border-[#4E332D]/20 rounded-full p-1 text-xs font-woodblock uppercase tracking-wider text-[#4E332D]">
                  <button
                    onClick={() => setRateCardsVariant('default')}
                    className={`px-3 py-1 rounded-full transition-all cursor-pointer ${
                      rateCardsVariant === 'default'
                        ? 'bg-[#4E332D] text-[#EBE8E0] shadow-xs'
                        : 'text-[#73716D] hover:text-[#4E332D]'
                    }`}
                  >
                    Normal
                  </button>
                  <button
                    onClick={() => setRateCardsVariant('compact')}
                    className={`px-3 py-1 rounded-full transition-all cursor-pointer ${
                      rateCardsVariant === 'compact'
                        ? 'bg-[#4E332D] text-[#EBE8E0] shadow-xs'
                        : 'text-[#73716D] hover:text-[#4E332D]'
                    }`}
                  >
                    Compact
                  </button>
                </div>

                <button
                  onClick={() => setShowInclusionsMatrix(!showInclusionsMatrix)}
                  className="font-woodblock text-xs uppercase tracking-wider text-[#9A5636] font-bold hover:underline cursor-pointer flex items-center gap-1"
                >
                  <span>{showInclusionsMatrix ? 'Hide Table' : 'Compare Rates'}</span>
                  {showInclusionsMatrix ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Version 1 Archive Notification Banner */}
            <div className="w-full bg-[#343833]/5 border border-[#343833]/20 rounded-xl px-4 py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs font-mono text-[#343833]">
              <div className="flex items-center gap-2">
                <span className="inline-block w-2.5 h-2.5 rounded-full bg-[#343833]"></span>
                <span className="font-bold uppercase tracking-wider">VERSION 1 (PRESERVED BASELINE)</span>
                <span className="text-[#73716D] hidden md:inline">— All 5 cards with slide-out rate drawers locked in place</span>
              </div>
              {onSelectVersion && (
                <button
                  onClick={() => onSelectVersion('v2')}
                  className="px-3 py-1 rounded-lg bg-[#D65241] text-white hover:bg-[#b83f30] font-sans font-semibold text-xs transition-colors cursor-pointer self-start sm:self-auto"
                >
                  Switch to Version 2 to edit &rarr;
                </button>
              )}
            </div>

            {/* Inclusions comparison table if opened */}
            {showInclusionsMatrix && (
              <div className="bg-white rounded-2xl p-5 border border-[#4E332D]/20 shadow-sm text-xs font-sans">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-[#4E332D]/20 text-[#73716D] font-woodblock uppercase tracking-wider text-[10px]">
                      <th className="pb-2">Rate Option</th>
                      <th className="pb-2">Nightly</th>
                      <th className="pb-2">Breakfast</th>
                      <th className="pb-2">Cancellation</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#EBE8E0]">
                    {RATE_OPTIONS.map((r) => (
                      <tr key={r.id} className="text-[#221C18]">
                        <td className="py-2.5 font-bold">{r.title}</td>
                        <td className="py-2.5">${calculateNightlyRate(r)}</td>
                        <td className="py-2.5">{r.isBreakfastIncluded ? '✓ Included' : 'A la carte'}</td>
                        <td className="py-2.5 text-[11px] text-[#73716D]">{r.cancellationPolicy}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* ================= VERTICAL STACKED OFFERS CARDS WITH SIDE-OPEN EXPANSION ================= */}
            <div className="space-y-8 flex flex-col items-center">
              {/* 1. RIDE EASY (Best Flexible Rate) */}
              {(() => {
                const rate = RATE_OPTIONS.find((r) => r.id === 'ride-easy') || RATE_OPTIONS[0];
                const pricing = calculateStayTotal(rate);
                return (
                  <OffersCard
                    variant={rateCardsVariant}
                    price={`$${pricing.nightly}`}
                    priceUnit="Nightly"
                    isExpanded={expandedRateId === 'ride-easy'}
                    onToggleExpand={() => setExpandedRateId(expandedRateId === 'ride-easy' ? null : 'ride-easy')}
                    onConfirmBooking={() => onSelectRate(rate)}
                    pricingDetails={pricing}
                    cancellationText={`Free Cancellation until ${criteria.checkIn}`}
                  />
                );
              })()}

              {/* 2. THE OUTFIT (Member Rate / Book Direct & Save) */}
              {(() => {
                const rate = RATE_OPTIONS.find((r) => r.id === 'member') || RATE_OPTIONS[4];
                const pricing = calculateStayTotal(rate);
                return (
                  <OffersCardOutfit
                    variant={rateCardsVariant}
                    price={`$${pricing.nightly}`}
                    priceUnit="NIGHTLY"
                    isExpanded={expandedRateId === 'member'}
                    onToggleExpand={() => setExpandedRateId(expandedRateId === 'member' ? null : 'member')}
                    onConfirmBooking={() => onSelectRate(rate)}
                    pricingDetails={pricing}
                    cancellationText={`Free Cancellation until ${criteria.checkIn}`}
                  />
                );
              })()}

              {/* 3. SUNUP BEFORE THE TRAIL (Room + Breakfast) */}
              {(() => {
                const rate = RATE_OPTIONS.find((r) => r.id === 'sunup') || RATE_OPTIONS[1];
                const pricing = calculateStayTotal(rate);
                return (
                  <OffersCardSunup
                    variant={rateCardsVariant}
                    price={`$${pricing.nightly}`}
                    priceUnit="NIGHTLY"
                    isExpanded={expandedRateId === 'sunup'}
                    onToggleExpand={() => setExpandedRateId(expandedRateId === 'sunup' ? null : 'sunup')}
                    onConfirmBooking={() => onSelectRate(rate)}
                    pricingDetails={pricing}
                    cancellationText={`Free Cancellation until ${criteria.checkIn}`}
                  />
                );
              })()}

              {/* 4. STAY A WHILE & UNCLINCH (Extended 5+ Nights) */}
              {(() => {
                const rate = RATE_OPTIONS.find((r) => r.id === 'stay-while') || RATE_OPTIONS[3];
                const pricing = calculateStayTotal(rate);
                return (
                  <OffersCardStayAWhile
                    variant={rateCardsVariant}
                    price={`$${pricing.nightly}`}
                    priceUnit="NIGHTLY"
                    isExpanded={expandedRateId === 'stay-while'}
                    onToggleExpand={() => setExpandedRateId(expandedRateId === 'stay-while' ? null : 'stay-while')}
                    onConfirmBooking={() => onSelectRate(rate)}
                    pricingDetails={pricing}
                    cancellationText={`Free Cancellation until ${criteria.checkIn}`}
                  />
                );
              })()}

              {/* 5. PLAN AHEAD. SAVE A LITTLE. (Advance Purchase / Non-refundable) */}
              {(() => {
                const rate = RATE_OPTIONS.find((r) => r.id === 'plan-ahead') || RATE_OPTIONS[2];
                const pricing = calculateStayTotal(rate);
                return (
                  <OffersCardPlanAhead
                    variant={rateCardsVariant}
                    price={`$${pricing.nightly}`}
                    priceUnit="NIGHTLY"
                    isExpanded={expandedRateId === 'plan-ahead'}
                    onToggleExpand={() => setExpandedRateId(expandedRateId === 'plan-ahead' ? null : 'plan-ahead')}
                    onConfirmBooking={() => onSelectRate(rate)}
                    pricingDetails={pricing}
                  />
                );
              })()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
