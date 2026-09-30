import React, { useState } from 'react';
import { RateOfferSidePanel } from './RateOfferSidePanel';

export interface OffersCardOutfitProps {
  /** Variant of the card: 'default' displays full narrative and callout footer; 'compact' displays condensed view */
  variant?: 'default' | 'compact';
  /** Top eyebrow text */
  eyebrow?: string;
  /** Primary display headline for default variant */
  headline?: string;
  /** Primary display headline for compact variant */
  compactHeadline?: string;
  /** Subheadline tag below headline */
  subheadline?: string;
  /** Offer description copy */
  description?: string;
  /** Rate value or formatted string */
  price?: string | number;
  /** Rate cadence unit */
  priceUnit?: string;
  /** Tax disclaimer line */
  taxDisclaimer?: string;
  /** CTA button text when unexpanded */
  ctaLabel?: string;
  /** CTA button text when expanded */
  confirmLabel?: string;
  /** Cancellation policy footnote */
  cancellationText?: string;
  /** Bottom banner callout text (default variant only) */
  calloutText?: string;
  /** Side open expansion state */
  isExpanded?: boolean;
  /** Toggle side open expansion */
  onToggleExpand?: () => void;
  /** Async or sync booking handler */
  onBook?: () => Promise<void> | void;
  /** Confirm handler from side panel */
  onConfirmBooking?: () => void;
  /** Pricing calculation details */
  pricingDetails?: {
    nightly: number;
    subtotal: number;
    taxesAndFees: number;
    total: number;
    dueToday: number;
    remaining: number;
  };
  /** External loading indicator */
  isLoading?: boolean;
  /** Card action disabled state */
  disabled?: boolean;
  /** Optional custom styling classes */
  className?: string;
}

export const OffersCardOutfit: React.FC<OffersCardOutfitProps> = ({
  variant = 'default',
  eyebrow = 'book direct & save',
  headline = 'WELCOME\nTO\nTHE\nOUTFIT.',
  compactHeadline = 'WELCOME\nTO THE\nOUTFIT.',
  subheadline = 'member rate',
  description = 'Share your email and unlock our direct-only member rate from your very first stay.',
  price = '$145',
  priceUnit = 'NIGHTLY',
  taxDisclaimer = 'Excluding Taxes + Fees',
  ctaLabel = 'UNLOCK THIS RATE',
  confirmLabel = 'CONFIRM BOOKING',
  cancellationText = 'Free Cancellation until May 19',
  calloutText = 'A BETTER RATE, STRAIGHT FROM COWBOY.',
  isExpanded = false,
  onToggleExpand,
  onBook,
  onConfirmBooking,
  pricingDetails,
  isLoading: externalLoading = false,
  disabled = false,
  className = '',
}) => {
  const [internalLoading, setInternalLoading] = useState(false);
  const isCompact = variant === 'compact';
  const isSubmitting = externalLoading || internalLoading;

  const handleAction = async () => {
    if (disabled || isSubmitting) return;

    if (!isExpanded) {
      if (onToggleExpand) {
        onToggleExpand();
        return;
      }
    }

    if (onConfirmBooking) {
      onConfirmBooking();
      return;
    }

    if (onBook) {
      try {
        const result = onBook();
        if (result instanceof Promise) {
          setInternalLoading(true);
          await result;
        }
      } catch (err) {
        console.error('Failed to execute booking action:', err);
      } finally {
        setInternalLoading(false);
      }
    }
  };

  return (
    <div className={`w-full flex items-start justify-center transition-all duration-500 ease-out ${className}`}>
      <div
        className={`relative flex flex-col xl:flex-row items-center xl:items-center justify-center w-full ${
          isCompact ? 'max-w-[1100px]' : 'max-w-[980px]'
        }`}
      >
        {/* ================= PRIMARY CARD ================= */}
        <div
          className={`relative z-20 shrink-0 mx-auto xl:mx-0 box-border ${
            isCompact ? 'w-[482px] max-w-full' : 'w-[480px] max-w-full'
          }`}
        >
          {isCompact ? (
            /* ================= EXACT COMPACT CARD (482px x 657px) ================= */
            <div
              className="relative w-full box-border transition-all duration-300 shadow-xl flex flex-col justify-between items-center"
              style={{
                boxSizing: 'border-box',
                width: '482px',
                maxWidth: '100%',
                height: '657px',
                padding: '54px 30px',
                backgroundColor: '#0E301A',
                border: '4px solid #F2AAA9',
                borderRadius: '45px',
              }}
            >
              {/* Eyebrow */}
              <div
                className="w-full text-center font-normal lowercase select-none"
                style={{
                  color: '#F2AAA9',
                  fontFamily: "'Fineday-StyleOne', 'Instrument Serif', Georgia, serif",
                  fontSize: '28px',
                  lineHeight: '32px',
                  letterSpacing: '-0.02em',
                }}
              >
                {eyebrow}
              </div>

              {/* Headline Lockup */}
              <div className="w-full flex flex-col items-center justify-center my-auto">
                <h2
                  className="w-full text-center font-normal uppercase m-0 p-0 select-none whitespace-pre-line tracking-[0.02em]"
                  style={{
                    color: '#F2AAA9',
                    fontFamily: "'League Gothic', 'Impact', sans-serif-condensed, sans-serif",
                    fontSize: 'clamp(68px, 15vw, 88px)',
                    lineHeight: '74px',
                  }}
                >
                  {compactHeadline}
                </h2>
                <div
                  className="w-full text-center font-normal lowercase select-none mt-1"
                  style={{
                    color: '#EBE8E0',
                    fontFamily: "'Fineday-StyleOne', 'Instrument Serif', Georgia, serif",
                    fontSize: '26px',
                    lineHeight: '28px',
                  }}
                >
                  {subheadline}
                </div>
              </div>

              {/* Price Display */}
              <div className="w-full flex flex-col justify-center px-[20px] box-border select-none mb-2">
                <div
                  className="w-full text-left font-normal uppercase select-none"
                  style={{
                    color: '#F2AAA9',
                    fontFamily: "'League Gothic', 'Impact', sans-serif-condensed, sans-serif",
                    fontSize: '46px',
                    lineHeight: '46px',
                    letterSpacing: '0.08em',
                  }}
                >
                  {price} {priceUnit}
                </div>
                <div
                  className="w-full text-right font-normal select-none mt-0.5"
                  style={{
                    color: '#F2AAA9',
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: '16px',
                    lineHeight: '18px',
                    letterSpacing: '1px',
                  }}
                >
                  {taxDisclaimer}
                </div>
              </div>

              {/* Bottom narrative description */}
              <div className="w-full">
                <p
                  className="w-full font-medium text-center m-0 text-balance"
                  style={{
                    color: '#EBE8E0',
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: '15px',
                    lineHeight: '22px',
                  }}
                >
                  {description}
                </p>

                {/* If closed, render button group */}
                {!isExpanded && (
                  <div className="w-full flex flex-col items-center gap-3 mt-4">
                    <button
                      type="button"
                      onClick={handleAction}
                      disabled={disabled || isSubmitting}
                      className="px-8 py-3.5 rounded-full bg-[#F2AAA9] text-[#0E301A] font-bold text-base uppercase tracking-wider transition-all cursor-pointer shadow-md hover:bg-white whitespace-nowrap"
                      style={{ fontFamily: "'Brothers OT', 'League Spartan', sans-serif" }}
                    >
                      {ctaLabel}
                    </button>
                    <span
                      className="text-xs text-[#EBE8E0] text-center"
                      style={{ fontFamily: "'DM Sans', sans-serif" }}
                    >
                      {cancellationText}
                    </span>
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* ================= NORMAL VARIANT (min-h-[820px]) ================= */
            <div
              className="relative w-full h-full flex flex-col overflow-hidden box-border transition-all duration-300 shadow-lg hover:shadow-xl"
              style={{
                backgroundColor: '#0E301A',
                borderRadius: '50px',
              }}
            >
              <div
                className="w-full h-full flex flex-col justify-between items-center transition-all duration-300 box-border"
                style={{
                  minHeight: '820px',
                  padding: '38px 26px 32px',
                }}
              >
                {/* Top Content Group */}
                <div className="w-full flex flex-col items-center">
                  <div className="w-full flex flex-col items-center gap-0 p-0 m-0">
                    <div
                      className="w-full text-center font-normal lowercase select-none m-0 p-0"
                      style={{
                        color: '#EBE8E0',
                        fontFamily: "'Fineday-StyleOne', 'Instrument Serif', Georgia, serif",
                        fontSize: '28px',
                        lineHeight: '28px',
                        letterSpacing: '-0.03em',
                      }}
                    >
                      {eyebrow}
                    </div>

                    <h2
                      className="w-full text-center font-normal uppercase m-0 p-0 select-none whitespace-pre-line tracking-[0.02em]"
                      style={{
                        color: '#F2AAA9',
                        fontFamily: "'League Gothic', 'Impact', sans-serif-condensed, sans-serif",
                        fontSize: 'clamp(88px, 18vw, 114px)',
                        lineHeight: '90px',
                      }}
                    >
                      {headline}
                    </h2>

                    <div
                      className="w-full text-center font-normal lowercase select-none m-0 p-0"
                      style={{
                        color: '#EBE8E0',
                        fontFamily: "'Fineday-StyleOne', 'Instrument Serif', Georgia, serif",
                        fontSize: '26px',
                        lineHeight: '26px',
                      }}
                    >
                      {subheadline}
                    </div>
                  </div>

                  <div className="w-full max-w-[340px] flex flex-row justify-center items-center mt-3">
                    <p
                      className="w-full font-medium text-center m-0 text-balance"
                      style={{
                        color: '#EBE8E0',
                        fontFamily: "'DM Sans', sans-serif",
                        fontSize: '18px',
                        lineHeight: '24px',
                      }}
                    >
                      {description}
                    </p>
                  </div>
                </div>

                {/* Bottom Action Group */}
                <div className="w-full flex flex-col items-center gap-4">
                  <div className="w-full flex flex-col justify-center px-[24px] box-border select-none">
                    <div
                      className="w-full text-left font-normal uppercase select-none"
                      style={{
                        color: '#F2AAA9',
                        fontFamily: "'League Gothic', 'Impact', sans-serif-condensed, sans-serif",
                        fontSize: '46px',
                        lineHeight: '46px',
                        letterSpacing: '0.08em',
                      }}
                    >
                      {price} {priceUnit}
                    </div>
                    <div
                      className="w-full text-right font-normal select-none mt-0.5"
                      style={{
                        color: '#F2AAA9',
                        fontFamily: "'DM Sans', sans-serif",
                        fontSize: '16px',
                        lineHeight: '18px',
                        letterSpacing: '1px',
                      }}
                    >
                      {taxDisclaimer}
                    </div>
                  </div>

                  <div className="w-full flex flex-col items-center gap-2">
                    <button
                      type="button"
                      onClick={handleAction}
                      disabled={disabled || isSubmitting}
                      className={`group w-full max-w-[380px] min-h-[64px] px-6 py-3 rounded-full flex items-center justify-center transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-[#F2AAA9]/30 active:scale-[0.98] whitespace-nowrap ${
                        disabled
                          ? 'opacity-50 cursor-not-allowed bg-[#F2AAA9]/50 text-[#0E301A]/60 border-[#F2AAA9]/50'
                          : isExpanded
                          ? 'bg-[#F2AAA9] text-[#0E301A]'
                          : isSubmitting
                          ? 'bg-[#F2AAA9] text-[#0E301A] cursor-wait border-transparent'
                          : 'cursor-pointer bg-[#F2AAA9] text-[#0E301A] border-[3px] border-[#F2AAA9] hover:bg-transparent hover:text-[#F2AAA9]'
                      }`}
                      aria-busy={isSubmitting}
                    >
                      {isSubmitting ? (
                        <span
                          className="font-bold text-[18px] tracking-[1px] uppercase whitespace-nowrap"
                          style={{ fontFamily: "'DM Sans', sans-serif" }}
                        >
                          Confirming...
                        </span>
                      ) : (
                        <span
                          className="font-normal text-[20px] sm:text-[22px] tracking-[1.2px] uppercase select-none transition-colors whitespace-nowrap"
                          style={{ fontFamily: "'Brothers OT', 'League Spartan', sans-serif" }}
                        >
                          {isExpanded ? confirmLabel : ctaLabel}
                        </span>
                      )}
                    </button>

                    <div
                      className="w-full text-center font-normal text-[13px] select-none whitespace-nowrap"
                      style={{
                        color: '#EBE8E0',
                        fontFamily: "'DM Sans', sans-serif",
                        letterSpacing: '1px',
                      }}
                    >
                      {cancellationText}
                    </div>
                  </div>
                </div>
              </div>

              {/* Callout Footer */}
              <div
                className="w-full py-3 px-5 flex items-center justify-center select-none"
                style={{
                  backgroundColor: '#F2AAA9',
                  borderRadius: '0px 0px 50px 50px',
                }}
              >
                <span
                  className="text-center font-bold text-[16px] tracking-[1px] uppercase"
                  style={{
                    color: '#0E301A',
                    fontFamily: "'DM Sans', sans-serif",
                  }}
                >
                  {calloutText}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* ================= CONNECTED SLIDING SIDE PANEL ================= */}
        <div
          className={`relative z-10 overflow-hidden transition-all duration-500 ease-in-out flex flex-col xl:self-center xl:-ml-12 ${
            isExpanded
              ? `max-h-[1400px] opacity-100 ${
                  isCompact ? 'xl:w-[525px]' : 'xl:w-[480px]'
                } w-full translate-x-0`
              : 'max-h-0 opacity-0 xl:w-0 w-full xl:-translate-x-12 pointer-events-none'
          }`}
        >
          <div
            className={`w-full h-full min-w-[320px] ${
              isCompact ? 'sm:min-w-[440px] xl:min-w-[525px]' : 'sm:min-w-[400px] xl:min-w-[440px]'
            } xl:pl-8 pt-4 xl:pt-0`}
          >
            <RateOfferSidePanel
              variant={variant}
              theme="outfit"
              rateTitle="THE OUTFIT MEMBER RATE"
              cancellationHeader="FREE CANCELLATION UNTIL CHECK-IN DEADLINE"
              cancellationSub="Direct booking perk: instant 10% savings"
              depositNote="50% deposit due today upon booking confirmation"
              remainingNote="Remaining balance due on arrival at check-in"
              nightlyRate={pricingDetails?.nightly || 131}
              stayTotal={pricingDetails?.subtotal || 262}
              taxesAndFees={pricingDetails?.taxesAndFees || 44}
              totalStay={pricingDetails?.total || 306}
              dueAtBooking={pricingDetails?.dueToday || 153}
              remaining={pricingDetails?.remaining || 153}
              policyText={description}
              onClose={() => onToggleExpand && onToggleExpand()}
              onConfirm={() => onConfirmBooking && onConfirmBooking()}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
