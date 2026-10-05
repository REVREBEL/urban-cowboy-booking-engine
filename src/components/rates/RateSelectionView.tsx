import React, { useState, useRef, useEffect } from 'react';
import { RoomType, RateOption, SearchCriteria } from '../../types';
import type { ShapedRate } from '../../types/mews';
import type { RateCardConfig } from '../../types/rate-card';
import { RATE_OPTIONS } from '../../data/hotelData';
import { resolveRateCardConfig } from '../../lib/rateCardConfig';
import {
  cancellationConfirmation,
  rateCardPricePresentation,
} from '../../lib/rateCardLiveContent';
import { ConfigurableRateCard } from './ConfigurableRateCard';
import { OffersCard } from './RideEasyOffersCard';
import { OffersCardOutfit } from './OutfitOffersCard';
import { OffersCardSunup } from './SunupOffersCard';
import { OffersCardStayAWhile } from './StayAwhileOffersCard';
import { OffersCardPlanAhead } from './PlanAheadOffersCard';
import {
  ArrowLeft,
  Calendar,
  Users,
  Moon,
  DoorOpen,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

const RATE_CARD_KEYS = ['ride-easy', 'member', 'sunup', 'stay-while', 'plan-ahead'] as const;
// Staggered top-to-bottom vertical offsets (in px) across the 5 cards
const STAGGER_OFFSETS = [36, 0, 52, 12, 44];

interface RateSelectionViewProps {
  room: RoomType;
  criteria: SearchCriteria;
  selectedRate: RateOption | null;
  onSelectRate: (rate: RateOption) => void;
  onChangeRoom: () => void;
  onOpenRoomDetails?: (room: RoomType) => void;
  activeVersion?: 'v1' | 'v2';
  onSelectVersion?: (version: 'v1' | 'v2') => void;
  /** Live Mews rates for the selected room. When supplied, unavailable product cards are omitted. */
  liveRates?: ShapedRate[];
  /** Published Webflow presentation records, matched only by durable Mews Rate.Id (or an explicit CMS default). */
  rateCardConfigs?: RateCardConfig[];
  onSelectLiveRate?: (rate: ShapedRate) => void;
  /** Explicitly returned member rate after REV-115 eligibility + Mews retrieval. */
  memberRate?: ShapedRate | null;
  /** REV-115 eligibility operation. No client-side member unlock is assumed. */
  onUnlockMember?: (email: string) => Promise<{ eligible: boolean }> | { eligible: boolean };
}

export const RateSelectionView: React.FC<RateSelectionViewProps> = ({
  room,
  criteria,
  selectedRate: _selectedRate,
  onSelectRate,
  onChangeRoom,
  liveRates,
  rateCardConfigs = [],
  onSelectLiveRate,
  memberRate = null,
  onUnlockMember,
}) => {
  const [rateCardsVariant] = useState<'default' | 'compact'>('default');
  const [expandedRateId, setExpandedRateId] = useState<string | null>(null);
  const [showInclusionsMatrix, setShowInclusionsMatrix] = useState<boolean>(false);

  const [spotlightIndex, setSpotlightIndex] = useState<number>(0);

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const cardWrapperRefs = useRef<(HTMLDivElement | null)[]>([]);
  const isProgrammaticScrollRef = useRef<boolean>(false);
  const scrollTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const rafIdRef = useRef<number | null>(null);

  const scrollToCard = (index: number, willBeExpanded?: boolean) => {
    setSpotlightIndex(index);
    isProgrammaticScrollRef.current = true;
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }

    const targetEl = cardWrapperRefs.current[index];
    const container = scrollContainerRef.current;
    if (targetEl && container) {
      const isCardExpanded = willBeExpanded !== undefined
        ? willBeExpanded
        : expandedRateId === RATE_CARD_KEYS[index];

      // Exact known width of the card when expanded vs unexpanded
      const fullWidth = isCardExpanded
        ? (rateCardsVariant === 'compact' ? 991 : 944)
        : (rateCardsVariant === 'compact' ? 482 : 480);

      const containerWidth = container.clientWidth;
      const targetLeft = targetEl.offsetLeft;
      // Center the card smoothly in the scroll container viewport
      const scrollTarget = targetLeft - (containerWidth / 2) + (fullWidth / 2);

      container.scrollTo({
        left: Math.max(0, scrollTarget),
        behavior: 'smooth'
      });
    }

    // Reset programmatic flag after smooth scroll settles
    scrollTimeoutRef.current = setTimeout(() => {
      isProgrammaticScrollRef.current = false;
    }, 500);
  };

  // Center the first offer that is actually available for this search.
  useEffect(() => {
    const timer = setTimeout(() => {
      const firstVisible = cardWrapperRefs.current.findIndex(Boolean);
      scrollToCard(firstVisible >= 0 ? firstVisible : 0);
    }, 200);
    return () => clearTimeout(timer);
  }, [liveRates, memberRate]);

  // Automatically close expanded card if deselected (clicking outside the card)
  useEffect(() => {
    if (!expandedRateId) return;

    const handleDocumentClick = (e: MouseEvent) => {
      const activeIdx = RATE_CARD_KEYS.indexOf(expandedRateId as any);
      if (activeIdx !== -1) {
        const activeEl = cardWrapperRefs.current[activeIdx];
        if (activeEl && activeEl.contains(e.target as Node)) {
          return; // Click is inside the expanded card, preserve state
        }
      }
      // Click was outside the active card: automatically deselect and close!
      setExpandedRateId(null);
    };

    const timer = setTimeout(() => {
      document.addEventListener('click', handleDocumentClick);
    }, 50);

    return () => {
      clearTimeout(timer);
      document.removeEventListener('click', handleDocumentClick);
    };
  }, [expandedRateId]);

  // Update spotlight card as the user scrolls (only on manual scroll, debounced with RAF)
  const handleScroll = () => {
    if (isProgrammaticScrollRef.current) return;
    if (!scrollContainerRef.current) return;

    if (rafIdRef.current) {
      cancelAnimationFrame(rafIdRef.current);
    }

    rafIdRef.current = requestAnimationFrame(() => {
      if (!scrollContainerRef.current || isProgrammaticScrollRef.current) return;
      const container = scrollContainerRef.current;
      const containerCenter = container.scrollLeft + container.clientWidth / 2;

      let closestIdx = spotlightIndex;
      let minDistance = Infinity;

      cardWrapperRefs.current.forEach((el, idx) => {
        if (!el) return;
        const elCenter = el.offsetLeft + el.offsetWidth / 2;
        const distance = Math.abs(containerCenter - elCenter);
        if (distance < minDistance) {
          minDistance = distance;
          closestIdx = idx;
        }
      });

      if (closestIdx !== spotlightIndex && closestIdx >= 0 && closestIdx < 5) {
        setSpotlightIndex(closestIdx);
      }
    });
  };

  // Handle selecting / clicking a card wrapper
  const handleSelectCard = (rateId: string, index: number) => {
    // If another card is currently open, automatically close it!
    if (expandedRateId && expandedRateId !== rateId) {
      setExpandedRateId(null);
    }
    scrollToCard(index);
  };

  // Handle toggle expand/collapse on a specific card
  const handleToggleExpandCard = (rateId: string, index: number) => {
    if (expandedRateId === rateId) {
      // Deselect and close
      setExpandedRateId(null);
      scrollToCard(index, false);
    } else {
      // Close any other open card and expand this one
      setSpotlightIndex(index);
      setExpandedRateId(rateId);
      // Clean, single smooth scroll coordinated with expansion
      requestAnimationFrame(() => {
        scrollToCard(index, true);
      });
    }
  };

  const handlePrevCard = () => {
    const visibleIndexes = cardWrapperRefs.current
      .map((element, index) => element ? index : -1)
      .filter((index) => index >= 0);
    const currentPosition = visibleIndexes.indexOf(spotlightIndex);
    const prevIdx = visibleIndexes[Math.max(0, currentPosition - 1)] ?? visibleIndexes[0] ?? 0;
    if (expandedRateId && expandedRateId !== RATE_CARD_KEYS[prevIdx]) {
      setExpandedRateId(null);
    }
    scrollToCard(prevIdx);
  };

  const handleNextCard = () => {
    const visibleIndexes = cardWrapperRefs.current
      .map((element, index) => element ? index : -1)
      .filter((index) => index >= 0);
    const currentPosition = visibleIndexes.indexOf(spotlightIndex);
    const nextIdx = visibleIndexes[Math.min(visibleIndexes.length - 1, currentPosition + 1)] ?? visibleIndexes[0] ?? 0;
    if (expandedRateId && expandedRateId !== RATE_CARD_KEYS[nextIdx]) {
      setExpandedRateId(null);
    }
    scrollToCard(nextIdx);
  };

  const liveRateForCard = (cardId: typeof RATE_CARD_KEYS[number]): ShapedRate | null => {
    if (!liveRates) return null;
    const matching = (predicate: (rate: ShapedRate) => boolean) => liveRates.find(predicate) ?? null;
    switch (cardId) {
      case 'member':
        // Mews `IsPrivate` describes rate retrieval, not Outfit/member eligibility.
        // REV-115 must establish eligibility before this card can be unlocked.
        return memberRate;
      case 'sunup':
        return matching((rate) => rate.knownRateGroup === 'PACKAGE') ?? matching((rate) => /breakfast|sunup/i.test(`${rate.name} ${rate.description}`));
      case 'plan-ahead':
        return matching((rate) => rate.knownRateGroup === 'NON_REFUNDABLE');
      case 'stay-while':
        return matching((rate) => rate.knownRateGroup === 'DISCOUNTED_RATES' || rate.knownRateGroup === 'PROMOTIONS');
      case 'ride-easy':
        return matching((rate) => rate.knownRateGroup === 'FLEXIBLE') ?? liveRates[0] ?? null;
    }
  };

  const calculateNightlyRate = (rate: RateOption, liveRate?: ShapedRate | null) => {
    if (liveRates && liveRate) return liveRate.perNightGross ?? liveRate.totalGross ?? 0;
    return Math.round(room.basePrice * rate.rateMultiplier);
  };

  const calculateStayTotal = (rate: RateOption, liveRate?: ShapedRate | null) => {
    if (liveRates && liveRate) {
      const total = liveRate.totalGross ?? 0;
      const dueToday = liveRate.settlement.trigger === 'Confirmation'
        ? total * (liveRate.settlement.value ?? 1)
        : 0;
      return {
        nightly: liveRate.perNightGross ?? total,
        subtotal: total,
        taxes: liveRate.totalTax ?? 0,
        resortFee: 0,
        taxesAndFees: liveRate.totalTax ?? 0,
        total,
        dueToday,
        remaining: Math.max(0, total - dueToday),
      };
    }
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

  const selectCardRate = (cardId: typeof RATE_CARD_KEYS[number], fallback: RateOption) => {
    const liveRate = liveRateForCard(cardId);
    if (liveRate && onSelectLiveRate) onSelectLiveRate(liveRate);
    else if (!liveRates) onSelectRate(fallback);
  };

  const configurableCardForRate = (liveRate?: ShapedRate | null): RateCardConfig | null => {
    if (!liveRate) return null;

    const resolved = resolveRateCardConfig(rateCardConfigs, liveRate.rateId);
    if (resolved) return resolved;

    // A live Mews rate must never fall back to a legacy promotional component.
    // Until an editor publishes matching artwork, render the configurable card's
    // accessible semantic treatment with the live offer copy.
    return {
      id: `mews-${liveRate.rateId}`,
      name: liveRate.name,
      mewsRateId: liveRate.rateId,
      isDefault: false,
      active: true,
      sortOrder: Number.MAX_SAFE_INTEGER,
      desktopArtworkUrl: null,
      mobileArtworkUrl: null,
      desktopOverlayPosition: 'normal',
      mobileOverlayPosition: 'normal',
      buttonStyle: 'filled',
      buttonColor: 'cowboy-umber',
      textColor: 'cowboy-umber',
      fontPair: 'brothers-bianco',
      ctaLabel: 'Book Now',
      cancellationPenaltyWindow: null,
      cancellationPenaltyWindowPeriod: null,
      cancellationFullForfeitWindow: null,
      cancellationFullForfeitWindowPeriod: null,
      eyebrow: liveRate.knownRateGroup?.replace(/_/g, ' ') ?? 'DIRECT RATE',
      headline: liveRate.name,
      description: liveRate.description || 'Book direct for the best available offer.',
      supportingText: null,
    };
  };

  const formatLivePrice = (liveRate: ShapedRate, amount: number) =>
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: liveRate.currency,
      minimumFractionDigits: amount % 1 === 0 ? 0 : 2,
      maximumFractionDigits: 2,
    }).format(amount);

  const configurableLiveContent = (
    liveRate: ShapedRate,
    config: RateCardConfig,
    fallbackCta: string,
  ) => {
    const presentation = rateCardPricePresentation(liveRate, criteria.nights);
    return {
      price: formatLivePrice(liveRate, presentation.amount),
      priceUnit: 'Nightly',
      taxLabel: presentation.taxLabel,
      cancellationText: cancellationConfirmation(liveRate, config, criteria.checkIn),
      ctaLabel: config.ctaLabel || fallbackCta,
    };
  };

  // Format date string for display (e.g. "Oct 14, 2026")
  const formatDateDisplay = (dateStr: string) => {
    try {
      const parts = dateStr.split('-');
      if (parts.length === 3) {
        const [y, m, d] = parts.map(Number);
        const date = new Date(y, m - 1, d);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      }
      return dateStr;
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="w-full texture-linen min-h-screen pb-24 overflow-x-hidden">
      {/* ================= TOP HEADER BAR: SELECTED ROOM & TRIP SPECS ================= */}
      <div className="bg-[#FAF9F9] border-b-2 border-[#4E332D]/20 shadow-xs sticky top-0 z-30 backdrop-blur-md bg-[#FAF9F9]/95">
        <div className="max-w-[1600px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-5">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 max-w-[1600px] w-full mx-auto">
            
            {/* Left Section: Back to Room Selection + Room Type Name */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
              <button
                type="button"
                onClick={onChangeRoom}
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-full border border-[#4E332D]/25 bg-white hover:bg-[#EBE8E0] text-[#4E332D] font-woodblock text-xs uppercase tracking-wider transition-all cursor-pointer shadow-2xs group shrink-0 self-start sm:self-auto"
                title="Change suite or go back to room selection"
              >
                <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" />
                <span>Back to Room Selection</span>
              </button>

              <div className="h-7 w-[1px] bg-[#4E332D]/20 hidden sm:block" />

              <div>
                <span className="font-woodblock text-[10px] uppercase tracking-widest text-[#9A5636] font-bold block">
                  SELECTED SUITE · {room.buildingName.toUpperCase()}
                </span>
                <h1 className="font-display font-extrabold text-xs sm:text-sm lg:text-base text-[#221C18] uppercase tracking-wide leading-tight">
                  {room.name}
                </h1>
              </div>
            </div>

            {/* Right Section: Dates, # Nights, # Guests Pill Badges */}
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              {/* Selected Dates */}
              <div className="flex items-center gap-2 bg-white px-3.5 py-2 rounded-xl border border-[#4E332D]/15 shadow-2xs">
                <Calendar className="w-4 h-4 text-[#9A5636] shrink-0" />
                <div className="text-left">
                  <span className="block text-[9px] font-woodblock uppercase tracking-wider text-[#73716D] leading-none">
                    DATES
                  </span>
                  <span className="block text-xs sm:text-sm font-sans font-bold text-[#221C18] mt-0.5 whitespace-nowrap">
                    {formatDateDisplay(criteria.checkIn)} – {formatDateDisplay(criteria.checkOut)}
                  </span>
                </div>
              </div>

              {/* # Nights */}
              <div className="flex items-center gap-2 bg-white px-3.5 py-2 rounded-xl border border-[#4E332D]/15 shadow-2xs">
                <Moon className="w-4 h-4 text-[#9A5636] shrink-0" />
                <div className="text-left">
                  <span className="block text-[9px] font-woodblock uppercase tracking-wider text-[#73716D] leading-none">
                    NIGHTS
                  </span>
                  <span className="block text-xs sm:text-sm font-sans font-bold text-[#221C18] mt-0.5 whitespace-nowrap">
                    {criteria.nights} {criteria.nights === 1 ? 'NIGHT' : 'NIGHTS'}
                  </span>
                </div>
              </div>

              {/* # Guests */}
              <div className="flex items-center gap-2 bg-white px-3.5 py-2 rounded-xl border border-[#4E332D]/15 shadow-2xs">
                <Users className="w-4 h-4 text-[#9A5636] shrink-0" />
                <div className="text-left">
                  <span className="block text-[9px] font-woodblock uppercase tracking-wider text-[#73716D] leading-none">
                    GUESTS
                  </span>
                  <span className="block text-xs sm:text-sm font-sans font-bold text-[#221C18] mt-0.5 whitespace-nowrap">
                    {criteria.guests} {criteria.guests === 1 ? 'GUEST' : 'GUESTS'}
                  </span>
                </div>
              </div>

              {/* Change Suite Link */}
              <button
                type="button"
                onClick={onChangeRoom}
                className="inline-flex items-center gap-1 text-xs font-woodblock uppercase tracking-wider text-[#9A5636] hover:text-[#4E332D] font-bold px-2 py-1 cursor-pointer transition-colors hover:underline"
              >
                <DoorOpen className="w-3.5 h-3.5" />
                <span>Change Room</span>
              </button>
            </div>

          </div>
        </div>
      </div>

      {/* ================= MAIN CONTAINER: RATE SELECTION & OFFERS CARDS ================= */}
      <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <div className="space-y-4">
          
          {/* Header Bar: SELECT A RATE + CAROUSEL CONTROLS */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b-2 border-[#4E332D]">
            <div>
              <div className="flex items-center gap-3">
                <h2 className="font-display font-extrabold text-2xl sm:text-3xl text-[#221C18] uppercase tracking-[0.15em]">
                  Select a Rate
                </h2>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {/* Spotlight Carousel Arrow Controls */}
              <div className="flex items-center gap-1.5 bg-[#FAF9F9] border border-[#4E332D]/20 rounded-full p-1 shadow-2xs">
                <button
                  type="button"
                  onClick={handlePrevCard}
                  disabled={spotlightIndex === 0}
                  className="w-7 h-7 rounded-full flex items-center justify-center text-[#4E332D] hover:bg-[#EBE8E0] disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
                  title="Previous rate"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-[10px] font-mono font-bold text-[#4E332D] px-2 uppercase whitespace-nowrap">
                  RATE {Math.max(1, cardWrapperRefs.current.filter(Boolean).indexOf(cardWrapperRefs.current[spotlightIndex]) + 1)} OF {Math.max(1, cardWrapperRefs.current.filter(Boolean).length)}
                </span>
                <button
                  type="button"
                  onClick={handleNextCard}
                  disabled={spotlightIndex === 4}
                  className="w-7 h-7 rounded-full flex items-center justify-center text-[#4E332D] hover:bg-[#EBE8E0] disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
                  title="Next rate"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              <button
                type="button"
                onClick={() => setShowInclusionsMatrix(!showInclusionsMatrix)}
                className="font-woodblock text-xs uppercase tracking-wider text-[#9A5636] font-bold hover:underline cursor-pointer flex items-center gap-1"
              >
                <span>{showInclusionsMatrix ? 'Hide Table' : 'Compare Rates'}</span>
                {showInclusionsMatrix ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
            </div>
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

          {/* ================= HORIZONTAL SIDE-BY-SIDE OFFERS CARDS WITH PROPORTIONAL SCALING ================= */}
          <div className="relative w-full">
            <div
              ref={scrollContainerRef}
              onScroll={handleScroll}
              onClick={(e) => {
                if (e.target === e.currentTarget && expandedRateId) {
                  setExpandedRateId(null);
                }
              }}
              className="w-full flex flex-row items-start gap-8 sm:gap-10 overflow-x-auto py-8"
              style={{
                scrollbarWidth: 'thin',
                scrollbarColor: '#9A5636 #FAF9F9',
                paddingLeft: 'max(48px, calc(50% - 250px))',
                paddingRight: 'max(80px, calc(50% - 250px))',
              }}
            >
              {/* 1. RIDE EASY (Best Flexible Rate) */}
              {(() => {
                const idx = 0;
                const isSpotlight = spotlightIndex === idx;
                const isExpanded = expandedRateId === 'ride-easy';
                const rate = RATE_OPTIONS.find((r) => r.id === 'ride-easy') || RATE_OPTIONS[0];
                const liveRate = liveRateForCard('ride-easy');
                if (liveRates && !liveRate) return null;
                const pricing = calculateStayTotal(rate, liveRate);
                const cmsConfig = configurableCardForRate(liveRate);
                return (
                  <div
                    ref={(el) => { cardWrapperRefs.current[idx] = el; }}
                    onClick={() => handleSelectCard('ride-easy', idx)}
                    className="shrink-0 flex flex-col items-center cursor-pointer w-auto"
                    style={{
                      marginTop: `${STAGGER_OFFSETS[idx]}px`,
                      transform: isSpotlight ? 'scale(0.85)' : 'scale(0.70)',
                      transformOrigin: 'top center',
                      zIndex: isSpotlight ? 30 : 10,
                      opacity: isSpotlight ? 1 : 0.82,
                      filter: isSpotlight ? 'drop-shadow(0 20px 30px rgba(0, 0, 0, 0.20))' : 'drop-shadow(0 4px 10px rgba(0, 0, 0, 0.08))',
                      transition: 'transform 0.45s cubic-bezier(0.16, 1, 0.3, 1), margin-top 0.45s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.35s ease, filter 0.35s ease',
                      height: `${(cmsConfig ? 1038 : (rateCardsVariant === 'compact' ? 657 : 820)) * (isSpotlight ? 0.85 : 0.70)}px`,
                      willChange: 'transform',
                    }}
                  >

                    {/* Offer Card (Scales in exact proportion with full width to expand) */}
                    {cmsConfig && liveRate ? (
                      <ConfigurableRateCard
                        config={cmsConfig}
                        live={configurableLiveContent(liveRate, cmsConfig, 'Book This Rate')}
                        onBook={() => selectCardRate('ride-easy', rate)}
                      />
                    ) : <OffersCard
                      variant={rateCardsVariant}
                      price={`$${pricing.nightly}`}
                      priceUnit="Nightly"
                      isExpanded={isExpanded}
                      onToggleExpand={() => handleToggleExpandCard('ride-easy', idx)}
                      onConfirmBooking={() => selectCardRate('ride-easy', rate)}
                      pricingDetails={pricing}
                      cancellationText={liveRate?.description || `Free Cancellation until ${criteria.checkIn}`}
                    />}
                  </div>
                );
              })()}

              {/* 2. THE OUTFIT (Member Rate / Book Direct & Save) */}
              {(() => {
                const idx = 1;
                const isSpotlight = spotlightIndex === idx;
                const isExpanded = expandedRateId === 'member';
                const rate = RATE_OPTIONS.find((r) => r.id === 'member') || RATE_OPTIONS[4];
                const liveRate = liveRateForCard('member');
                if (liveRates && !liveRate) return null;
                const pricing = calculateStayTotal(rate, liveRate);
                const cmsConfig = configurableCardForRate(liveRate);
                return (
                  <div
                    ref={(el) => { cardWrapperRefs.current[idx] = el; }}
                    onClick={() => handleSelectCard('member', idx)}
                    className="shrink-0 flex flex-col items-center cursor-pointer w-auto"
                    style={{
                      marginTop: `${STAGGER_OFFSETS[idx]}px`,
                      transform: isSpotlight ? 'scale(0.85)' : 'scale(0.70)',
                      transformOrigin: 'top center',
                      zIndex: isSpotlight ? 30 : 10,
                      opacity: isSpotlight ? 1 : 0.82,
                      filter: isSpotlight ? 'drop-shadow(0 20px 30px rgba(0, 0, 0, 0.20))' : 'drop-shadow(0 4px 10px rgba(0, 0, 0, 0.08))',
                      transition: 'transform 0.45s cubic-bezier(0.16, 1, 0.3, 1), margin-top 0.45s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.35s ease, filter 0.35s ease',
                      height: `${(cmsConfig ? 1038 : (rateCardsVariant === 'compact' ? 657 : 820)) * (isSpotlight ? 0.85 : 0.70)}px`,
                      willChange: 'transform',
                    }}
                  >

                    {/* Offer Card (Scales in exact proportion with full width to expand) */}
                    {cmsConfig && liveRate ? (
                      <ConfigurableRateCard
                        config={cmsConfig}
                        live={configurableLiveContent(liveRate, cmsConfig, 'Unlock This Rate')}
                        onBook={() => selectCardRate('member', rate)}
                        disabled={!onUnlockMember}
                      />
                    ) : <OffersCardOutfit
                      variant={rateCardsVariant}
                      price={liveRate ? `${liveRate.currency} ${pricing.nightly}` : '—'}
                      priceUnit="NIGHTLY"
                      isExpanded={isExpanded}
                      onToggleExpand={() => handleToggleExpandCard('member', idx)}
                      onConfirmBooking={() => liveRate && selectCardRate('member', rate)}
                      onUnlock={onUnlockMember}
                      pricingDetails={liveRate ? pricing : undefined}
                      disabled={!liveRate || !onUnlockMember}
                      cancellationText={liveRate?.description || `Free Cancellation until ${criteria.checkIn}`}
                    />}
                  </div>
                );
              })()}

              {/* 3. SUNUP BEFORE THE TRAIL (Room + Breakfast) — MIDDLE SPOTLIGHT CARD */}
              {(() => {
                const idx = 2;
                const isSpotlight = spotlightIndex === idx;
                const isExpanded = expandedRateId === 'sunup';
                const rate = RATE_OPTIONS.find((r) => r.id === 'sunup') || RATE_OPTIONS[1];
                const liveRate = liveRateForCard('sunup');
                if (liveRates && !liveRate) return null;
                const pricing = calculateStayTotal(rate, liveRate);
                const cmsConfig = configurableCardForRate(liveRate);
                return (
                  <div
                    ref={(el) => { cardWrapperRefs.current[idx] = el; }}
                    onClick={() => handleSelectCard('sunup', idx)}
                    className="shrink-0 flex flex-col items-center cursor-pointer w-auto"
                    style={{
                      marginTop: `${STAGGER_OFFSETS[idx]}px`,
                      transform: isSpotlight ? 'scale(0.85)' : 'scale(0.70)',
                      transformOrigin: 'top center',
                      zIndex: isSpotlight ? 30 : 10,
                      opacity: isSpotlight ? 1 : 0.82,
                      filter: isSpotlight ? 'drop-shadow(0 20px 30px rgba(0, 0, 0, 0.20))' : 'drop-shadow(0 4px 10px rgba(0, 0, 0, 0.08))',
                      transition: 'transform 0.45s cubic-bezier(0.16, 1, 0.3, 1), margin-top 0.45s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.35s ease, filter 0.35s ease',
                      height: `${(cmsConfig ? 1038 : (rateCardsVariant === 'compact' ? 657 : 820)) * (isSpotlight ? 0.85 : 0.70)}px`,
                      willChange: 'transform',
                    }}
                  >

                    {/* Offer Card (Scales in exact proportion with full width to expand) */}
                    {cmsConfig && liveRate ? (
                      <ConfigurableRateCard
                        config={cmsConfig}
                        live={configurableLiveContent(liveRate, cmsConfig, 'Book This Rate')}
                        onBook={() => selectCardRate('sunup', rate)}
                      />
                    ) : <OffersCardSunup
                      variant={rateCardsVariant}
                      price={`$${pricing.nightly}`}
                      priceUnit="NIGHTLY"
                      isExpanded={isExpanded}
                      onToggleExpand={() => handleToggleExpandCard('sunup', idx)}
                      onConfirmBooking={() => selectCardRate('sunup', rate)}
                      pricingDetails={pricing}
                      cancellationText={liveRate?.description || `Free Cancellation until ${criteria.checkIn}`}
                    />}
                  </div>
                );
              })()}

              {/* 4. STAY A WHILE & UNCLINCH (Extended 5+ Nights) */}
              {(() => {
                const idx = 3;
                const isSpotlight = spotlightIndex === idx;
                const isExpanded = expandedRateId === 'stay-while';
                const rate = RATE_OPTIONS.find((r) => r.id === 'stay-while') || RATE_OPTIONS[3];
                const liveRate = liveRateForCard('stay-while');
                if (liveRates && !liveRate) return null;
                const pricing = calculateStayTotal(rate, liveRate);
                const cmsConfig = configurableCardForRate(liveRate);
                return (
                  <div
                    ref={(el) => { cardWrapperRefs.current[idx] = el; }}
                    onClick={() => handleSelectCard('stay-while', idx)}
                    className="shrink-0 flex flex-col items-center cursor-pointer w-auto"
                    style={{
                      marginTop: `${STAGGER_OFFSETS[idx]}px`,
                      transform: isSpotlight ? 'scale(0.85)' : 'scale(0.70)',
                      transformOrigin: 'top center',
                      zIndex: isSpotlight ? 30 : 10,
                      opacity: isSpotlight ? 1 : 0.82,
                      filter: isSpotlight ? 'drop-shadow(0 20px 30px rgba(0, 0, 0, 0.20))' : 'drop-shadow(0 4px 10px rgba(0, 0, 0, 0.08))',
                      transition: 'transform 0.45s cubic-bezier(0.16, 1, 0.3, 1), margin-top 0.45s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.35s ease, filter 0.35s ease',
                      height: `${(cmsConfig ? 1038 : (rateCardsVariant === 'compact' ? 657 : 820)) * (isSpotlight ? 0.85 : 0.70)}px`,
                      willChange: 'transform',
                    }}
                  >

                    {/* Offer Card (Scales in exact proportion with full width to expand) */}
                    {cmsConfig && liveRate ? (
                      <ConfigurableRateCard
                        config={cmsConfig}
                        live={configurableLiveContent(liveRate, cmsConfig, 'Book This Rate')}
                        onBook={() => selectCardRate('stay-while', rate)}
                      />
                    ) : <OffersCardStayAWhile
                      variant={rateCardsVariant}
                      price={`$${pricing.nightly}`}
                      priceUnit="NIGHTLY"
                      isExpanded={isExpanded}
                      onToggleExpand={() => handleToggleExpandCard('stay-while', idx)}
                      onConfirmBooking={() => selectCardRate('stay-while', rate)}
                      pricingDetails={pricing}
                      cancellationText={liveRate?.description || `Free Cancellation until ${criteria.checkIn}`}
                    />}
                  </div>
                );
              })()}

              {/* 5. PLAN AHEAD. SAVE A LITTLE. (Advance Purchase / Non-refundable) */}
              {(() => {
                const idx = 4;
                const isSpotlight = spotlightIndex === idx;
                const isExpanded = expandedRateId === 'plan-ahead';
                const rate = RATE_OPTIONS.find((r) => r.id === 'plan-ahead') || RATE_OPTIONS[2];
                const liveRate = liveRateForCard('plan-ahead');
                if (liveRates && !liveRate) return null;
                const pricing = calculateStayTotal(rate, liveRate);
                const cmsConfig = configurableCardForRate(liveRate);
                return (
                  <div
                    ref={(el) => { cardWrapperRefs.current[idx] = el; }}
                    onClick={() => handleSelectCard('plan-ahead', idx)}
                    className="shrink-0 flex flex-col items-center cursor-pointer w-auto"
                    style={{
                      marginTop: `${STAGGER_OFFSETS[idx]}px`,
                      transform: isSpotlight ? 'scale(0.85)' : 'scale(0.70)',
                      transformOrigin: 'top center',
                      zIndex: isSpotlight ? 30 : 10,
                      opacity: isSpotlight ? 1 : 0.82,
                      filter: isSpotlight ? 'drop-shadow(0 20px 30px rgba(0, 0, 0, 0.20))' : 'drop-shadow(0 4px 10px rgba(0, 0, 0, 0.08))',
                      transition: 'transform 0.45s cubic-bezier(0.16, 1, 0.3, 1), margin-top 0.45s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.35s ease, filter 0.35s ease',
                      height: `${(cmsConfig ? 1038 : (rateCardsVariant === 'compact' ? 657 : 820)) * (isSpotlight ? 0.85 : 0.70)}px`,
                      willChange: 'transform',
                    }}
                  >

                    {/* Offer Card (Scales in exact proportion with full width to expand) */}
                    {cmsConfig && liveRate ? (
                      <ConfigurableRateCard
                        config={cmsConfig}
                        live={configurableLiveContent(liveRate, cmsConfig, 'Commit to the Cowboy')}
                        onBook={() => selectCardRate('plan-ahead', rate)}
                      />
                    ) : <OffersCardPlanAhead
                      variant={rateCardsVariant}
                      price={`$${pricing.nightly}`}
                      priceUnit="Nightly"
                      isExpanded={isExpanded}
                      onToggleExpand={() => handleToggleExpandCard('plan-ahead', idx)}
                      onConfirmBooking={() => selectCardRate('plan-ahead', rate)}
                      pricingDetails={pricing}
                    />}
                  </div>
                );
              })()}
              {/* Generous right-side spacer to ensure cards have 100% full scroll clearance when expanded */}
              <div className="shrink-0 w-64 sm:w-96 lg:w-[480px] h-1 pointer-events-none" aria-hidden="true" />
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
