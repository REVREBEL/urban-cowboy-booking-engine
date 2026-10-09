import React, { useState } from 'react';
import { RateOfferSidePanel } from './RateOfferSidePanel';

export interface OffersCardPlanAheadProps {
  /** Variant of the card: 'default' displays full details; 'compact' displays condensed view */
  variant?: 'default' | 'compact';
  /** Main headline text (supports multiline) */
  headline?: string;
  /** Detailed offer copy */
  description?: string;
  /** Nightly rate numeric value or formatted string */
  price?: string | number;
  /** Price cadence label */
  priceUnit?: string;
  /** Tax disclaimer line */
  taxDisclaimer?: string;
  /** Primary button label when unexpanded */
  ctaLabel?: string;
  /** Primary button label when expanded */
  confirmLabel?: string;
  /** Cancellation policy footnote */
  policyText?: string;
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
  /** External control over loading state */
  isLoading?: boolean;
  /** Disabled state for the card action */
  disabled?: boolean;
  /** Optional custom class name */
  className?: string;
}

export const OffersCardPlanAhead: React.FC<OffersCardPlanAheadProps> = ({
  variant = 'default',
  headline = 'plan\nahead.\nsave a\nlittle.',
  description = "Know when you're coming?\nBook ahead and enjoy a better rate for making the call early.",
  price = '$145',
  priceUnit = 'NIGHTLY',
  taxDisclaimer = 'Excluding Taxes + Fees',
  ctaLabel = 'COMMIT TO THE COWBOY',
  confirmLabel = 'CONFIRM BOOKING',
  policyText = 'Full Prepay. Non Refundable.',
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
        console.error('Booking action failed:', err);
      } finally {
        setInternalLoading(false);
      }
    }
  };

  return (
    <div className={`w-auto shrink-0 flex items-start justify-center transition-all duration-500 ease-out ${className}`}>
      <div className="relative flex flex-row items-center justify-center shrink-0 w-auto">
        {/* ================= PRIMARY CARD ================= */}
        <div
          className={`relative z-20 shrink-0 box-border ${
            isCompact ? 'w-120.5' : 'w-120'
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
                backgroundColor: 'var(--color-mist)',
                border: '4px solid #343833',
                borderRadius: '45px',
              }}
            >
              {/* Headline Lockup */}
              <div className="w-full flex flex-col items-start justify-center my-auto">
                <h2
                  className="w-full font-bold lowercase text-black m-0 select-none whitespace-pre-line text-left"
                  style={{
                    fontFamily: "'League Spartan', 'Arial Black', sans-serif",
                    fontSize: 'clamp(56px, 14vw, 76px)',
                    lineHeight: '62px',
                    transform: 'matrix(1, 0.01, 0, 1, 0, 0)',
                    letterSpacing: '-2px',
                  }}
                >
                  {headline}
                </h2>
              </div>

              {/* Price Display */}
              <div className="w-full flex flex-col justify-center px-7.5 box-border select-none mb-2" style={{ containerType: 'inline-size' }}>
                <div
                  className="w-full text-left font-semibold text-smoke uppercase select-none whitespace-nowrap"
                  style={{
                    fontFamily: "'League Spartan', sans-serif",
                    fontSize: 'clamp(28px, 9cqw, 44px)',
                    lineHeight: '44px',
                    letterSpacing: '1px',
                  }}
                >
                  {price} {priceUnit}
                </div>
                <div
                  className="w-full text-right text-smoke font-normal select-none mt-0.5"
                  style={{
                    fontFamily: "'Arvo', Georgia, serif",
                    fontSize: '17px',
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
                  className="w-full font-normal text-black text-left m-0 whitespace-pre-line"
                  style={{
                    fontFamily: "'Arvo', Georgia, serif",
                    fontSize: '15px',
                    lineHeight: '22px',
                    letterSpacing: '0.5px',
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
                      className="px-8 py-3.5 rounded-full bg-smoke text-paper font-button font-normal text-base uppercase tracking-wider transition-all cursor-pointer shadow-md hover:bg-smoke whitespace-nowrap border-2 border-cowboy-umber"
                      style={{ fontFamily: 'var(--font-button)' }}
                    >
                      {ctaLabel}
                    </button>
                    <span
                      className="text-xs text-black font-bold text-center tracking-[1px]"
                      style={{ fontFamily: "'Arvo', Georgia, serif" }}
                    >
                      {policyText}
                    </span>
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* ================= NORMAL VARIANT (min-h-[820px]) ================= */
            <div
              className="relative w-full h-full box-border transition-all duration-300 shadow-lg hover:shadow-xl"
              style={{
                backgroundColor: 'var(--color-mist)',
                border: '4px solid #343833',
                borderRadius: '50px',
                padding: '40px 28px',
              }}
            >
              <div
                className="w-full h-full flex flex-col justify-around items-center transition-all duration-300"
                style={{
                  minHeight: '820px',
                }}
              >
                <div className="w-full flex flex-col items-center gap-4">
                  <div className="w-full flex flex-row justify-center items-center">
                    <h2
                      className="w-full font-bold lowercase text-black m-0 select-none whitespace-pre-line text-left"
                      style={{
                        fontFamily: "'League Spartan', 'Arial Black', sans-serif",
                        fontSize: 'clamp(58px, 15vw, 86px)',
                        lineHeight: '70px',
                        transform: 'matrix(1, 0.01, 0, 1, 0, 0)',
                        letterSpacing: '-2px',
                      }}
                    >
                      {headline}
                    </h2>
                  </div>

                  <div className="w-full flex flex-row justify-end items-center mt-2">
                    <p
                      className="w-full max-w-80 font-normal text-black text-left m-0 whitespace-pre-line"
                      style={{
                        fontFamily: "'Arvo', Georgia, serif",
                        fontSize: '18px',
                        lineHeight: '24px',
                        letterSpacing: '1px',
                        transform: 'matrix(1, 0.01, 0, 1, 0, 0)',
                      }}
                    >
                      {description}
                    </p>
                  </div>
                </div>

                <div className="w-full flex flex-col items-center gap-4">
                  <div className="w-full flex flex-col justify-center px-7.5 box-border select-none" style={{ containerType: 'inline-size' }}>
                    <div
                      className="w-full text-left font-semibold text-smoke uppercase select-none whitespace-nowrap"
                      style={{
                        fontFamily: "'League Spartan', sans-serif",
                        fontSize: 'clamp(28px, 9cqw, 44px)',
                        lineHeight: '44px',
                        letterSpacing: '1px',
                      }}
                    >
                      {price} {priceUnit}
                    </div>
                    <div
                      className="w-full text-right text-smoke font-normal select-none mt-0.5"
                      style={{
                        fontFamily: "'Arvo', Georgia, serif",
                        fontSize: '17px',
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
                      className={`group w-full max-w-95 min-h-16.5 px-6 py-3 rounded-full flex items-center justify-center transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-smoke/30 active:scale-[0.98] whitespace-nowrap ${
                        disabled
                          ? 'opacity-50 cursor-not-allowed bg-smoke/50 text-white/50 border-cowboy-umber/50'
                          : isExpanded
                          ? 'bg-smoke text-white'
                          : isSubmitting
                          ? 'bg-smoke text-white cursor-wait'
                          : 'cursor-pointer bg-smoke text-paper hover:bg-transparent hover:text-smoke'
                      }`}
                      style={{
                        border: '3.5px solid #4E332D',
                      }}
                      aria-busy={isSubmitting}
                    >
                      {isSubmitting ? (
                        <span
                          className="font-button font-normal text-[18px] tracking-[1px] uppercase whitespace-nowrap"
                          style={{ fontFamily: 'var(--font-button)' }}
                        >
                          Confirming...
                        </span>
                      ) : (
                        <span
                          className="font-normal text-[20px] sm:text-[22px] tracking-[1.2px] uppercase select-none transition-colors whitespace-nowrap"
                          style={{ fontFamily: 'var(--font-button)' }}
                        >
                          {isExpanded ? confirmLabel : ctaLabel}
                        </span>
                      )}
                    </button>

                    <div
                      className="text-black font-bold text-[13px] text-center tracking-[1.5px] select-none whitespace-nowrap"
                      style={{
                        fontFamily: "'Arvo', Georgia, serif",
                        transform: 'matrix(1, 0, -0.01, 1, 0, 0)',
                      }}
                    >
                      {policyText}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ================= CONNECTED SLIDING SIDE PANEL ================= */}
        <div
          className={`relative z-10 overflow-hidden transition-all duration-500 ease-out flex flex-row shrink-0 -ml-12 ${
            isExpanded
              ? `opacity-100 ${isCompact ? 'w-139.25' : 'w-128'} translate-x-0 pointer-events-auto`
              : 'opacity-0 w-0 max-w-0 -translate-x-6 pointer-events-none'
          }`}
          style={{
            width: isExpanded ? (isCompact ? '557px' : '512px') : '0px',
            minWidth: isExpanded ? (isCompact ? '557px' : '512px') : '0px',
          }}
        >
          <div
            className={`h-full ${isCompact ? 'w-139.25' : 'w-128'} pl-8 pt-0 shrink-0`}
            style={{
              width: isCompact ? '557px' : '512px',
              minWidth: isCompact ? '557px' : '512px',
            }}
          >
            <RateOfferSidePanel
              variant={variant}
              theme="plan-ahead"
              rateTitle="PLAN AHEAD. SAVE A LITTLE."
              cancellationHeader="FULL PREPAYMENT · NON-REFUNDABLE"
              cancellationSub="18% early-bird discount on standard room rates"
              depositNote="100% full stay prepayment due upon reservation"
              remainingNote="Paid in full today ($0 remaining balance at check-in)"
              nightlyRate={pricingDetails?.nightly || 119}
              stayTotal={pricingDetails?.subtotal || 238}
              taxesAndFees={pricingDetails?.taxesAndFees || 40}
              totalStay={pricingDetails?.total || 278}
              dueAtBooking={pricingDetails?.dueToday || 278}
              remaining={pricingDetails?.remaining || 0}
              policyText="Non-refundable reservations require 100% deposit at time of booking. Modifications or cancellations are not eligible for refund or credit."
              onClose={() => onToggleExpand && onToggleExpand()}
              onConfirm={() => onConfirmBooking && onConfirmBooking()}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
