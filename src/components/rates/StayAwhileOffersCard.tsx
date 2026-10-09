import React, { useState } from 'react';
import { RateOfferSidePanel } from './RateOfferSidePanel';

export interface OffersCardStayAWhileProps {
  /** Variant of the card: 'default' displays full narrative and divider; 'compact' displays condensed view */
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

export const OffersCardStayAWhile: React.FC<OffersCardStayAWhileProps> = ({
  variant = 'default',
  eyebrow = 'STAY 5+ NIGHTS',
  headline = 'STAY A\nWHILE &\nUNCLINCH',
  description = 'Slip away Sunday through Thursday for slower mornings, quieter trails, and a better reason to stay out a little longer.',
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
                backgroundColor: 'var(--color-smoke)',
                border: '4px solid #EBE8E0',
                borderRadius: '45px',
              }}
            >
              {/* Eyebrow */}
              <div
                className="w-full text-center font-bold uppercase select-none tracking-[2px]"
                style={{
                  color: 'var(--color-alpine-linen)',
                  fontFamily: "'Bianco Sans', 'Lato', sans-serif",
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
                  className="w-full font-bold uppercase text-white m-0 text-center select-none whitespace-pre-line"
                  style={{
                    fontFamily: "'Quattrocento', Georgia, serif",
                    fontSize: 'clamp(54px, 13vw, 72px)',
                    lineHeight: '64px',
                    letterSpacing: '-1.5px',
                    transform: 'matrix(1, 0.01, 0, 1, 0, 0)',
                  }}
                >
                  STAY A WHILE & UNCLINCH
                </h2>
              </div>

              {/* Price Display */}
              <div className="w-full flex flex-col justify-center px-[30px] box-border select-none mb-2" style={{ containerType: 'inline-size' }}>
                <div
                  className="w-full text-left font-bold text-white uppercase select-none whitespace-nowrap"
                  style={{
                    fontFamily: "'Quattrocento', serif",
                    fontSize: 'clamp(28px, 9cqw, 44px)',
                    lineHeight: '44px',
                    letterSpacing: '1px',
                  }}
                >
                  {price} {priceUnit}
                </div>
                <div
                  className="w-full text-right font-normal select-none mt-0.5"
                  style={{
                    color: 'var(--color-mist)',
                    fontFamily: "'Bianco Sans', 'Lato', sans-serif",
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
                  className="w-full font-bold text-center m-0 whitespace-normal"
                  style={{
                    color: 'var(--color-alpine-linen)',
                    fontFamily: "'Bianco Sans', 'Lato', sans-serif",
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
                      className="px-8 py-3.5 rounded-full bg-alpine-linen text-smoke font-button font-normal text-base uppercase tracking-wider transition-all cursor-pointer shadow-md hover:bg-white whitespace-nowrap"
                      style={{ fontFamily: 'var(--font-button)' }}
                    >
                      {ctaLabel}
                    </button>
                    <span
                      className="text-xs text-alpine-linen text-center"
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
                backgroundColor: 'var(--color-smoke)',
                borderRadius: '50px',
                padding: '40px 28px',
              }}
            >
              <div
                className="w-full h-full flex flex-col justify-between items-center transition-all duration-300"
                style={{
                  minHeight: '820px',
                }}
              >
                <div className="w-full flex flex-col items-center gap-4">
                  <div
                    className="w-full max-w-[280px] font-bold text-center uppercase select-none leading-none tracking-[2px]"
                    style={{
                      color: 'var(--color-alpine-linen)',
                      fontFamily: "'Bianco Sans', 'Lato', sans-serif",
                      fontSize: '26px',
                      transform: 'rotate(0.28deg)',
                    }}
                  >
                    {eyebrow}
                  </div>

                  <h2
                    className="w-full font-bold uppercase text-white m-0 text-center select-none whitespace-pre-line"
                    style={{
                      fontFamily: "'Quattrocento', Georgia, serif",
                      fontSize: 'clamp(54px, 14vw, 76px)',
                      lineHeight: '68px',
                      letterSpacing: '-2px',
                      transform: 'matrix(1, 0.01, 0, 1, 0, 0)',
                    }}
                  >
                    {headline}
                  </h2>

                  <div className="w-full max-w-[340px] flex flex-col items-center gap-5 mt-1">
                    <p
                      className="w-full font-bold text-center m-0 whitespace-normal"
                      style={{
                        color: 'var(--color-alpine-linen)',
                        fontFamily: "'Bianco Sans', 'Lato', sans-serif",
                        fontSize: '20px',
                        lineHeight: '26px',
                        letterSpacing: '1px',
                        transform: 'matrix(1, 0.01, 0, 1, 0, 0)',
                      }}
                    >
                      {description}
                    </p>

                    <div
                      className="w-[260px] h-[5px] rounded-full"
                      style={{
                        backgroundColor: 'var(--color-alpine-linen)',
                      }}
                    />
                  </div>
                </div>

                <div className="w-full flex flex-col items-center gap-4">
                  <div className="w-full flex flex-col justify-center px-[30px] box-border select-none" style={{ containerType: 'inline-size' }}>
                    <div
                      className="w-full text-left font-bold text-white uppercase select-none whitespace-nowrap"
                      style={{
                        fontFamily: "'Quattrocento', serif",
                        fontSize: 'clamp(28px, 9cqw, 44px)',
                        lineHeight: '44px',
                        letterSpacing: '1px',
                      }}
                    >
                      {price} {priceUnit}
                    </div>
                    <div
                      className="w-full text-right font-normal select-none mt-0.5"
                      style={{
                        color: 'var(--color-mist)',
                        fontFamily: "'Bianco Sans', 'Lato', sans-serif",
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
                      className={`group w-full max-w-[380px] min-h-[66px] px-6 py-3 rounded-full flex items-center justify-center transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-alpine-linen/40 active:scale-[0.98] whitespace-nowrap ${
                        disabled
                          ? 'opacity-50 cursor-not-allowed bg-alpine-linen/50 text-smoke/50 border-alpine-linen/50'
                          : isExpanded
                          ? 'bg-alpine-linen text-smoke'
                          : isSubmitting
                          ? 'bg-alpine-linen text-smoke cursor-wait'
                          : 'cursor-pointer bg-alpine-linen text-smoke hover:bg-transparent hover:text-alpine-linen'
                      }`}
                      style={{
                        border: '3.5px solid #EBE8E0',
                      }}
                      aria-busy={isSubmitting}
                    >
                      {isSubmitting ? (
                        <span
                          className="font-button font-normal text-[18px] tracking-[1px] uppercase whitespace-nowrap"
                          style={{ fontFamily: "'Bianco Sans', 'Lato', sans-serif" }}
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
                        color: 'var(--color-alpine-linen)',
                        fontFamily: "'Noto Serif Tibetan', 'Noto Serif', serif",
                        transform: 'rotate(0.28deg)',
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
          className={`relative z-10 overflow-hidden transition-all duration-500 ease-out flex flex-row shrink-0 -ml-12 ${
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
              theme="stay-while"
              rateTitle="STAY A WHILE & UNCLINCH (5+ NIGHTS)"
              cancellationHeader="FREE CANCELLATION UNTIL CHECK-IN DEADLINE"
              cancellationSub="Extended stay 15% discount applied"
              depositNote="50% deposit due today upon booking confirmation"
              remainingNote="Remaining balance due on arrival at check-in"
              nightlyRate={pricingDetails?.nightly || 123}
              stayTotal={pricingDetails?.subtotal || 246}
              taxesAndFees={pricingDetails?.taxesAndFees || 41}
              totalStay={pricingDetails?.total || 287}
              dueAtBooking={pricingDetails?.dueToday || 144}
              remaining={pricingDetails?.remaining || 143}
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
