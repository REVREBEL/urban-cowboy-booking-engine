import React, { useState } from 'react';
import { RateOfferSidePanel } from './RateOfferSidePanel';

// Sheriff Badge Icon (6-point Western Star with circular tips matching fi-sheriff-badge.svg)
const SheriffBadgeIcon: React.FC<{ className?: string; color?: string; size?: number }> = ({
  className = '',
  color = '#D65241',
  size = 32,
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill={color}
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <path d="M50 8C52.76 8 55 10.24 55 13C55 13.78 54.82 14.52 54.5 15.17L61.85 27.91L76.54 27.91C77.19 27.59 77.93 27.41 78.71 27.41C81.47 27.41 83.71 29.65 83.71 32.41C83.71 34.05 82.92 35.5 81.71 36.41L74.36 49.15L81.71 61.89C82.92 62.8 83.71 64.25 83.71 65.89C83.71 68.65 81.47 70.89 78.71 70.89C77.93 70.89 77.19 70.71 76.54 70.39L61.85 70.39L54.5 83.13C54.82 83.78 55 84.52 55 85.3C55 88.06 52.76 90.3 50 90.3C47.24 90.3 45 88.06 45 85.3C45 84.52 45.18 83.78 45.5 83.13L38.15 70.39L23.46 70.39C22.81 70.71 22.07 70.89 21.29 70.89C18.53 70.89 16.29 68.65 16.29 65.89C16.29 64.25 17.08 62.8 18.29 61.89L25.64 49.15L18.29 36.41C17.08 35.5 16.29 34.05 16.29 32.41C16.29 29.65 18.53 27.41 21.29 27.41C22.07 27.41 22.81 27.59 23.46 27.91L38.15 27.91L45.5 15.17C45.18 14.52 45 13.78 45 13C45 10.24 47.24 8 50 8Z" />
    </svg>
  );
};

export interface OffersCardProps {
  /** Variant of the card: 'default' displays full details; 'compact' displays condensed view */
  variant?: 'default' | 'compact';
  /** Category / eyebrow badge text */
  eyebrow?: string;
  /** Primary bold headline word or title */
  headlineMain?: string;
  /** Secondary multi-line headline complement */
  headlineSub?: string[];
  /** Detailed offer copy */
  description?: string;
  /** Guarantee trust badge text */
  guaranteeText?: string;
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
    nightly: number | string;
    subtotal: number | string;
    taxesAndFees: number | string;
    total: number | string;
    dueToday: number | string;
    remaining: number | string;
  };
  /** External control over loading state */
  isLoading?: boolean;
  /** Disabled state for the card action */
  disabled?: boolean;
  /** Optional custom class name */
  className?: string;
}

export const OffersCard: React.FC<OffersCardProps> = ({
  variant = 'compact',
  eyebrow = 'BEST FLEXIBLE RATE',
  headlineMain = 'RIDE\nEASY',
  headlineSub = ['Keep', 'Your', 'Options', 'Open.'],
  description = 'Our standard rate for guests who want a little more freedom around their plans. Plans change. This one gives you room to move, with our most flexible cancellation terms.',
  guaranteeText = 'THE COWBOY BEST RATE GUARANTEE',
  price = '$145',
  priceUnit = 'Nightly',
  taxDisclaimer = 'Excluding Taxes + Fees',
  ctaLabel = 'BOOK RATE',
  confirmLabel = 'CONFIRM BOOKING',
  cancellationText = 'Free Cancellation until May 31, 2027',
  isExpanded = true,
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

    // When not expanded, clicking the button expands the side rate panel
    if (!isExpanded) {
      if (onToggleExpand) {
        onToggleExpand();
        return;
      }
    }

    // When expanded, clicking the button confirms the booking
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
        {/* ================= LEFT PRIMARY CARD (482px x 657px in compact) ================= */}
        <div
          className={`relative z-20 shrink-0 box-border ${
            isCompact ? 'w-120.5' : 'w-120'
          }`}
        >
          {isCompact ? (
            /* ================= EXACT COMPACT CARD (482px x 657px) ================= */
            <div
              className="relative w-full bg-white box-border transition-all duration-300 shadow-xl flex flex-col justify-between items-center"
              style={{
                boxSizing: 'border-box',
                width: '482px',
                maxWidth: '100%',
                height: '657px',
                padding: '54px 30px',
                background: '#FFFFFF',
                border: '4px solid #343833',
                borderRadius: '45px',
              }}
            >
              {/* offer-card-content / headline section (414px x 251.01px) */}
              <div
                className="w-full flex flex-col justify-center items-center p-0 gap-2.5"
                style={{
                  width: '414px',
                  maxWidth: '100%',
                  height: '251.01px',
                }}
              >
                {/* Eyebrow Text */}
                <div
                  className="w-full select-none"
                  style={{
                    width: '414px',
                    maxWidth: '100%',
                    height: '38px',
                    fontFamily: "'Lato', sans-serif",
                    fontWeight: 700,
                    fontSize: '31.25px',
                    lineHeight: '38px',
                    letterSpacing: '2px',
                    textTransform: 'uppercase',
                    color: 'var(--color-bandana-red)',
                    transform: 'matrix(1, 0.01, 0, 1, 0, 0)',
                  }}
                >
                  {eyebrow}
                </div>

                {/* Headline Split Lockup (414px x 200.83px) */}
                <div
                  className="w-full relative select-none"
                  style={{
                    width: '414px',
                    maxWidth: '100%',
                    height: '200.83px',
                  }}
                >
                  {/* Primary Headline: RIDE EASY */}
                  <div
                    className="select-none uppercase"
                    style={{
                      position: 'absolute',
                      width: '269px',
                      height: '149px',
                      left: '0.01px',
                      top: 'calc(50% - 149px/2 + 25.9px)',
                      fontFamily: "'Noto Serif Tibetan', 'Noto Serif', serif",
                      fontWeight: 700,
                      fontSize: '100px',
                      lineHeight: '100px',
                      letterSpacing: '-2.5px',
                      color: 'var(--color-smoke)',
                      display: 'flex',
                      alignItems: 'center',
                    }}
                  >
                    {headlineMain}
                  </div>

                  {/* Subheadline: Keep Your Options Open. */}
                  <div
                    className="select-none flex flex-col items-start"
                    style={{
                      position: 'absolute',
                      width: '146px',
                      height: '160px',
                      left: '269.04px',
                      top: '16.82px',
                      fontFamily: "'Quattrocento', serif",
                      fontWeight: 700,
                      fontSize: '42px',
                      lineHeight: '40px',
                      letterSpacing: '-2.5px',
                      color: 'var(--color-black)',
                      transform: 'matrix(1, 0.01, 0, 1, 0, 0)',
                    }}
                  >
                    {headlineSub.map((line, idx) => (
                      <span key={`sub-${idx}`} className="block">
                        {line}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Price Display (414px x 70px) */}
              <div
                className="w-full flex flex-col justify-center select-none"
                style={{
                  width: '414px',
                  maxWidth: '100%',
                  height: '70px',
                  padding: '0 30px',
                }}
              >
                {/* Price Text */}
                <div
                  className="w-full select-none text-left whitespace-nowrap"
                  style={{
                    width: '100%',
                    height: '45px',
                    fontFamily: "'Quattrocento', serif",
                    fontWeight: 700,
                    fontSize: '45px',
                    lineHeight: '45px',
                    letterSpacing: '2px',
                    color: 'var(--color-black)',
                  }}
                >
                  {price} {priceUnit}
                </div>

                {/* Price Disclaimer */}
                <div
                  className="select-none text-right"
                  style={{
                    width: '100%',
                    height: '25px',
                    fontFamily: "'Lato', sans-serif",
                    fontWeight: 400,
                    fontSize: '21.25px',
                    lineHeight: '21px',
                    letterSpacing: '2px',
                    color: 'var(--color-black)',
                  }}
                >
                  {taxDisclaimer}
                </div>
              </div>

              {/* Bottom Section: Narrative Description in Active Open */}
              <div
                className="w-full pt-1"
                style={{
                  width: '414px',
                  maxWidth: '100%',
                }}
              >
                <p
                  className="m-0 text-left leading-[1.6]"
                  style={{
                    fontFamily: "'Quattrocento', Georgia, serif",
                    fontSize: '15px',
                    color: 'var(--color-black)',
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
                      className="px-8 py-3 rounded-full bg-smoke text-alpine-linen font-button font-normal text-base sm:text-lg uppercase tracking-wider transition-all cursor-pointer shadow-md hover:bg-smoke whitespace-nowrap"
                      style={{ fontFamily: 'var(--font-button)' }}
                    >
                      {ctaLabel}
                    </button>
                    <span
                      className="text-sm text-smoke text-center"
                      style={{ fontFamily: "'Noto Serif Tibetan', 'Noto Serif', serif" }}
                    >
                      {cancellationText}
                    </span>
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* ================= NORMAL VARIANT (Normal Active Open.png) ================= */
            <div
              className="relative w-full h-full bg-white box-border transition-all duration-300 shadow-xl"
              style={{
                border: '4px solid #343833',
                borderRadius: '45px',
                padding: '6px',
              }}
            >
              <div
                className="w-full h-full bg-white flex flex-col justify-between items-start transition-all duration-300"
                style={{
                  border: '1.5px solid #343833',
                  borderRadius: '38px',
                  minHeight: '820px',
                  padding: '40px 30px 34px',
                }}
              >
                {/* Top editorial group: eyebrow, title lockup, and narrative. */}
                <div className="w-full flex flex-col gap-8">
                  <div
                    className="w-full uppercase font-bold tracking-[1.5px] leading-tight select-none"
                    style={{
                      color: 'var(--color-bandana-red)',
                      fontFamily: "'Lato', sans-serif",
                      fontSize: '25px',
                    }}
                  >
                    {eyebrow}
                  </div>

                  <div className="w-full flex flex-row items-center justify-between min-h-30 select-none">
                  <div
                    className="font-bold tracking-[-2px] uppercase whitespace-pre-line leading-[0.85]"
                    style={{
                      color: 'var(--color-smoke)',
                      fontFamily: "'Noto Serif', serif",
                      fontSize: 'clamp(64px, 12vw, 90px)',
                    }}
                  >
                    {headlineMain}
                  </div>

                  <div
                    className="font-bold tracking-[-0.5px] leading-[1.05] text-smoke text-left flex flex-col items-start pl-2"
                    style={{
                      fontFamily: "'Quattrocento', Georgia, serif",
                      fontSize: '30px',
                    }}
                  >
                    {headlineSub.map((line, idx) => (
                      <span key={`headline-sub-${idx}`} className="block">
                        {line}
                      </span>
                    ))}
                  </div>
                  </div>

                {/* 3. Prominent Narrative Paragraph */}
                <div className="w-full">
                  <p
                    className="text-smoke font-normal leading-[1.35] tracking-[0.2px] m-0 text-left"
                    style={{
                      fontFamily: "'Lato', sans-serif",
                      fontSize: '24px',
                    }}
                  >
                    Our standard rate for guests who want a little more freedom around their plans.
                  </p>
                  </div>
                </div>

                {/* 4. Cowboy Best Rate Guarantee Row with Sheriff Badge */}
                <div className="w-full flex items-center justify-between">
                  <span
                    className="font-bold uppercase tracking-[1.5px] text-smoke leading-tight text-left text-balance"
                    style={{
                      fontFamily: "'Lato', sans-serif",
                      fontSize: '22px',
                    }}
                  >
                    {guaranteeText}
                  </span>
                  <div className="shrink-0 ml-3">
                    <SheriffBadgeIcon size={34} color="#D65241" />
                  </div>
                </div>

                {/* 5. Price Row */}
                <div className="w-full flex flex-col justify-center px-7.5 box-border select-none" style={{ containerType: 'inline-size' }}>
                  <div
                    className="w-full text-smoke font-bold tracking-[0.5px] leading-tight text-left whitespace-nowrap"
                    style={{
                      fontFamily: "'Quattrocento', Georgia, serif",
                      fontSize: 'clamp(28px, 9cqw, 40px)',
                    }}
                  >
                    {price} {priceUnit}
                  </div>
                  <div
                    className="w-full text-right text-smoke font-normal tracking-[0.5px] mt-1 text-sm opacity-90"
                    style={{ fontFamily: "'Lato', sans-serif" }}
                  >
                    {taxDisclaimer}
                  </div>
                </div>

                {/* 6. Centered CTA Pill Button on Left Card */}
                <div className="w-full flex flex-col items-center gap-2">
                  <button
                    type="button"
                    onClick={handleAction}
                    disabled={disabled || isSubmitting}
                    className="w-full max-w-105 py-4 px-6 rounded-full bg-smoke hover:bg-smoke text-white font-button font-normal text-sm sm:text-base uppercase tracking-[0.1em] shadow-md hover:shadow-lg active:scale-95 transition-all cursor-pointer flex items-center justify-center whitespace-nowrap"
                  >
                    {isSubmitting ? 'Confirming...' : isExpanded ? confirmLabel : ctaLabel}
                  </button>
                  <span
                    className="text-xs text-smoke tracking-wide mt-1 whitespace-nowrap text-center"
                    style={{ fontFamily: "'Lato', sans-serif" }}
                  >
                    {cancellationText}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ================= RIGHT CONNECTED SIDE PANEL ================= */}
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
              theme="ride-easy"
              rateTitle="RIDE EASY. KEEP YOUR OPTIONS OPEN."
              cancellationHeader="FREE CANCELLATION UNTIL MAY 19"
              depositNote="50% deposit due today"
              remainingNote="Due May 28"
              nightlyRate={pricingDetails?.nightly || '823.08'}
              stayTotal={pricingDetails?.subtotal || '411.54'}
              taxesAndFees={pricingDetails?.taxesAndFees || '411.54'}
              totalStay={pricingDetails?.total || '823.08'}
              dueAtBooking={pricingDetails?.dueToday || '411.54'}
              remaining={pricingDetails?.remaining || '411.54'}
              policyText="Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea"
              onClose={() => onToggleExpand && onToggleExpand()}
              onConfirm={() => onConfirmBooking && onConfirmBooking()}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
