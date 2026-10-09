import React, { useState } from 'react';
import { RateOfferSidePanel } from './RateOfferSidePanel';

const SunupCornerFlourish = ({ className = '' }: { className?: string }) => (
  <svg
    aria-hidden="true"
    viewBox="0 0 42 42"
    className={`absolute h-9 w-9 text-copper ${className}`}
    fill="none"
  >
    <path d="M1 20C12 20 20 12 20 1" stroke="currentColor" strokeWidth="3.5" />
    <path d="M8 10c8 1 13 6 14 14M9 6c2 5 6 7 11 8M5 13c5 0 8 3 10 8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    <path d="M11 7c-4-5-8-4-9-3 1 4 4 6 9 3ZM7 15c-5-2-7 1-7 3 4 2 6 1 7-3ZM18 11c-1-5 2-7 4-7 2 4 0 6-4 7Z" fill="currentColor" />
  </svg>
);

const SunupInsetFrame = () => (
  <div aria-hidden="true" className="pointer-events-none absolute inset-[10px] z-10 rounded-modal-xl border-[length:var(--border-width-heavy)] border-copper">
    <SunupCornerFlourish className="-left-[11px] -top-[11px]" />
    <SunupCornerFlourish className="-right-[11px] -top-[11px] rotate-90" />
    <SunupCornerFlourish className="-bottom-[11px] -right-[11px] rotate-180" />
    <SunupCornerFlourish className="-bottom-[11px] -left-[11px] -rotate-90" />
  </div>
);

export interface OffersCardSunupProps {
  /** Variant of the card: 'default' displays full details; 'compact' displays condensed view */
  variant?: 'default' | 'compact';
  /** Category / eyebrow badge text */
  eyebrow?: string;
  /** Primary multi-line display headline */
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
  cancellationText?: string;
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

export const OffersCardSunup: React.FC<OffersCardSunupProps> = ({
  variant = 'default',
  eyebrow = 'ROOM + BREAKFAST',
  headline = 'SUNUP\nBEFORE\nTHE\nTRAIL',
  description = 'Start the day slowly with your room and breakfast wrapped into one easy stay.',
  price = '$145',
  priceUnit = 'NIGHTLY',
  taxDisclaimer = 'Excluding Taxes + Fees',
  ctaLabel = 'BOOK THIS RATE',
  confirmLabel = 'CONFIRM BOOKING',
  cancellationText = 'Free Cancellation until May 19',
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
        console.error('Failed to complete booking action:', err);
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
            isCompact ? 'w-[482px]' : 'w-[480px]'
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
                backgroundColor: 'var(--color-alpine-linen)',
                border: '4px solid #9A5636',
                borderRadius: '45px',
              }}
            >
              {/* Eyebrow */}
              <div
                className="w-full text-center font-bold uppercase select-none tracking-[-0.5px]"
                style={{
                  color: 'var(--color-oxblood)',
                  fontFamily: "'Noto Serif Tibetan', 'Noto Serif', Georgia, serif",
                  fontSize: '26px',
                  lineHeight: '30px',
                  transform: 'rotate(0.28deg)',
                }}
              >
                {eyebrow}
              </div>

              {/* Headline Lockup */}
              <div className="w-full flex flex-col items-center justify-center my-auto">
                <h2
                  className="w-full font-bold uppercase text-center m-0 select-none whitespace-pre-line tracking-tight"
                  style={{
                    color: 'var(--color-copper)',
                    fontFamily: "'Rundeck', 'League Spartan', 'Arial Black', sans-serif",
                    fontSize: 'clamp(50px, 12vw, 68px)',
                    lineHeight: '62px',
                    letterSpacing: '-2px',
                    transform: 'matrix(1, 0.01, 0, 1, 0, 0)',
                  }}
                >
                  SUNUP BEFORE THE TRAIL
                </h2>
              </div>

              {/* Price Display */}
              <div className="w-full flex flex-col justify-center px-[30px] box-border select-none mb-2" style={{ containerType: 'inline-size' }}>
                <div
                  className="w-full text-left font-bold uppercase select-none whitespace-nowrap"
                  style={{
                    color: 'var(--color-copper)',
                    fontFamily: "'Rundeck', 'League Spartan', sans-serif",
                    fontSize: 'clamp(28px, 9cqw, 44px)',
                    lineHeight: '44px',
                    letterSpacing: '-1.5px',
                  }}
                >
                  {price} {priceUnit}
                </div>
                <div
                  className="w-full text-right font-normal select-none mt-0.5"
                  style={{
                    color: 'var(--color-oxblood)',
                    fontFamily: "'Noto Serif Tibetan', 'Noto Serif', serif",
                    fontSize: '17px',
                    lineHeight: '20px',
                    letterSpacing: '1px',
                  }}
                >
                  {taxDisclaimer}
                </div>
              </div>

              {/* Bottom narrative description */}
              <div className="w-full">
                <p
                  className="w-full font-normal text-center m-0 whitespace-normal"
                  style={{
                    color: 'var(--color-copper)',
                    fontFamily: "'Noto Serif Tibetan', 'Noto Serif', Georgia, serif",
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
                      className="px-8 py-3.5 rounded-full bg-copper text-alpine-linen font-button font-normal text-base uppercase tracking-wider transition-all cursor-pointer shadow-md hover:brightness-110 whitespace-nowrap"
                      style={{ fontFamily: 'var(--font-button)' }}
                    >
                      {ctaLabel}
                    </button>
                    <span
                      className="text-xs text-oxblood text-center"
                      style={{ fontFamily: "'Noto Serif Tibetan', 'Noto Serif', serif" }}
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
              className="relative w-full h-full box-border transition-all duration-300 shadow-lg hover:shadow-xl"
              style={{
                backgroundColor: 'var(--color-alpine-linen)',
                borderRadius: '50px',
                padding: '6px',
              }}
            >
              <SunupInsetFrame />
              <div
                className="relative z-20 w-full h-full flex flex-col justify-between items-center transition-all duration-300 box-border"
                style={{
                  minHeight: '820px',
                  padding: '48px 34px 48px',
                }}
              >
                <div className="w-full flex flex-col items-center">
                  <div className="w-full flex flex-col items-center gap-1.5">
                    <div
                      className="w-full text-center uppercase font-bold tracking-[-1px] select-none leading-none"
                      style={{
                        color: 'var(--color-oxblood)',
                        fontFamily: "'Noto Serif Tibetan', 'Noto Serif', Georgia, serif",
                        fontSize: '26px',
                        transform: 'rotate(0.28deg)',
                      }}
                    >
                      {eyebrow}
                    </div>

                    <h2
                      className="w-full font-bold uppercase text-center m-0 select-none whitespace-pre-line"
                      style={{
                        color: 'var(--color-copper)',
                        fontFamily: "'Rundeck', 'League Spartan', 'Arial Black', sans-serif",
                        fontSize: 'clamp(52px, 13vw, 72px)',
                        lineHeight: '68px',
                        letterSpacing: '-3px',
                        transform: 'matrix(1, 0.01, 0, 1, 0, 0)',
                      }}
                    >
                      {headline}
                    </h2>
                  </div>

                  <div className="w-full max-w-[340px] flex flex-row justify-center items-center mt-3">
                    <p
                      className="w-full font-normal text-center m-0 whitespace-normal"
                      style={{
                        color: 'var(--color-copper)',
                        fontFamily: "'Noto Serif Tibetan', 'Noto Serif', Georgia, serif",
                        fontSize: '20px',
                        lineHeight: '28px',
                        letterSpacing: '1px',
                        transform: 'matrix(1, 0.01, 0, 1, 0, 0)',
                      }}
                    >
                      {description}
                    </p>
                  </div>
                </div>

                <div className="w-full flex flex-col items-center gap-4">
                  <div className="w-full flex flex-col justify-center px-[30px] box-border select-none" style={{ containerType: 'inline-size' }}>
                    <div
                      className="w-full text-left font-bold uppercase select-none whitespace-nowrap"
                      style={{
                        color: 'var(--color-copper)',
                        fontFamily: "'Rundeck', 'League Spartan', sans-serif",
                        fontSize: 'clamp(28px, 9cqw, 42px)',
                        lineHeight: '44px',
                        letterSpacing: '-2px',
                      }}
                    >
                      {price} {priceUnit}
                    </div>
                    <div
                      className="w-full text-right font-normal select-none mt-0.5"
                      style={{
                        color: 'var(--color-oxblood)',
                        fontFamily: "'Noto Serif Tibetan', 'Noto Serif', serif",
                        fontSize: '17px',
                        lineHeight: '20px',
                        letterSpacing: '1.5px',
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
                      className={`group w-full max-w-[380px] min-h-[66px] px-6 py-3 rounded-full flex items-center justify-center transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-copper/30 active:scale-[0.98] whitespace-nowrap ${
                        disabled
                          ? 'opacity-50 cursor-not-allowed bg-copper/50 text-alpine-linen/60 border-copper/50'
                          : isExpanded
                          ? 'bg-copper text-alpine-linen'
                          : isSubmitting
                          ? 'bg-copper text-alpine-linen cursor-wait'
                          : 'cursor-pointer bg-copper text-alpine-linen hover:bg-transparent hover:text-copper'
                      }`}
                      style={{
                        border: '3.5px solid #9A5636',
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
                      className="w-full text-center font-normal text-[13px] tracking-[1px] select-none whitespace-nowrap"
                      style={{
                        color: 'var(--color-oxblood)',
                        fontFamily: "'Noto Serif Tibetan', 'Noto Serif', serif",
                      }}
                    >
                      {cancellationText}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ================= CONNECTED SLIDING SIDE PANEL ================= */}
        <div
          className={`relative z-10 overflow-hidden transition-all duration-500 ease-out flex flex-row self-center -ml-12 shrink-0 ${
            isExpanded
              ? `opacity-100 ${isCompact ? 'w-[557px]' : 'w-[512px]'} translate-x-0 pointer-events-auto`
              : 'opacity-0 w-0 max-w-0 -translate-x-6 pointer-events-none'
          }`}
          style={{
            width: isExpanded ? (isCompact ? '557px' : '512px') : '0px',
            minWidth: isExpanded ? (isCompact ? '557px' : '512px') : '0px',
          }}
        >
          <div
            className={`h-full ${isCompact ? 'w-[557px]' : 'w-[512px]'} pl-8 pt-0 shrink-0`}
            style={{
              width: isCompact ? '557px' : '512px',
              minWidth: isCompact ? '557px' : '512px',
            }}
          >
            <RateOfferSidePanel
              variant={variant}
              theme="sunup"
              rateTitle="SUNUP BEFORE THE TRAIL (ROOM + BREAKFAST)"
              cancellationHeader="FREE CANCELLATION UNTIL CHECK-IN DEADLINE"
              cancellationSub="Includes signature artisanal Catskill breakfast daily"
              depositNote="50% deposit due today upon booking confirmation"
              remainingNote="Remaining balance due on arrival at check-in"
              nightlyRate={pricingDetails?.nightly || 167}
              stayTotal={pricingDetails?.subtotal || 334}
              taxesAndFees={pricingDetails?.taxesAndFees || 53}
              totalStay={pricingDetails?.total || 387}
              dueAtBooking={pricingDetails?.dueToday || 194}
              remaining={pricingDetails?.remaining || 193}
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
