// OffersCardOutfit.tsx
import React, { useState } from 'react';

export interface OffersCardOutfitProps {
  /** Variant of the card: 'default' displays full narrative and callout footer; 'compact' displays condensed view */
  variant?: 'default' | 'compact';
  /** Top eyebrow text */
  eyebrow?: string;
  /** Primary display headline for default variant (one word per line) */
  headline?: string;
  /** Primary display headline for compact variant (three lines) */
  compactHeadline?: string;
  /** Subheadline tag below headline */
  subheadline?: string;
  /** Offer description copy (hidden in compact variant) */
  description?: string;
  /** Rate value or formatted string */
  price?: string | number;
  /** Rate cadence unit */
  priceUnit?: string;
  /** Tax disclaimer line */
  taxDisclaimer?: string;
  /** CTA button text */
  ctaLabel?: string;
  /** Cancellation policy footnote */
  cancellationText?: string;
  /** Bottom banner callout text (default variant only) */
  calloutText?: string;
  /** Async or sync booking handler */
  onBook?: () => Promise<void> | void;
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
  cancellationText = 'Free Cancellation until May 31, 2027',
  calloutText = 'A BETTER RATE, STRAIGHT FROM COWBOY.',
  onBook,
  isLoading: externalLoading = false,
  disabled = false,
  className = '',
}) => {
  const [internalLoading, setInternalLoading] = useState(false);
  const isCompact = variant === 'compact';
  const isSubmitting = externalLoading || internalLoading;

  const handleAction = async () => {
    if (disabled || isSubmitting) return;

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

  const activeHeadline = isCompact ? compactHeadline : headline;

  return (
    <div
      className={`relative w-full max-w-[500px] flex flex-col overflow-hidden box-border transition-all duration-300 ${className}`}
      style={{
        backgroundColor: '#0E301A',
        borderRadius: '50px',
      }}
    >
      {/* Main Inner Body */}
      <div
        className="w-full flex flex-col justify-between items-center transition-all duration-300 box-border"
        style={{
          minHeight: isCompact ? '700px' : '980px',
          padding: isCompact ? '38px 24px' : '44px 30px 36px',
          gap: isCompact ? '20px' : '28px',
        }}
      >
        {/* Top Content Group: Flushed Eyebrow + Rebalanced Display Headline + Flushed Subheadline */}
        <div className="w-full flex flex-col items-center">
          {/* Zero-Gap Headline Lockup (Eyebrow + Main Headline + Subheadline) */}
          <div className="w-full flex flex-col items-center gap-0 p-0 m-0">
            {/* Eyebrow Text */}
            <div
              className="w-full text-center font-normal lowercase select-none m-0 p-0"
              style={{
                color: '#EBE8E0',
                fontFamily: "'Fineday-StyleOne', 'Instrument Serif', Georgia, serif",
                fontSize: '32px',
                lineHeight: '32px',
                letterSpacing: '-0.03em',
              }}
            >
              {eyebrow}
            </div>

            {/* Headline Display Block (Pulled back one level for optimal balance) */}
            <h2
              className="w-full text-center font-normal uppercase m-0 p-0 select-none whitespace-pre-line tracking-[0.02em]"
              style={{
                color: '#F2AAA9',
                fontFamily: "'League Gothic', 'Impact', sans-serif-condensed, sans-serif",
                fontSize: isCompact ? 'clamp(96px, 22vw, 120px)' : 'clamp(108px, 25vw, 132px)',
                lineHeight: isCompact ? '98px' : '108px',
              }}
            >
              {activeHeadline}
            </h2>

            {/* Subheadline Tag Flush Below Headline */}
            <div
              className="w-full text-center font-normal lowercase select-none m-0 p-0"
              style={{
                color: '#EBE8E0',
                fontFamily: "'Fineday-StyleOne', 'Instrument Serif', Georgia, serif",
                fontSize: '30px',
                lineHeight: '30px',
              }}
            >
              {subheadline}
            </div>
          </div>

          {/* Description Block (Default variant only) */}
          {!isCompact && (
            <div className="w-full max-w-[360px] flex flex-row justify-center items-center mt-5">
              <p
                className="w-full font-medium text-center m-0 text-balance"
                style={{
                  color: '#EBE8E0',
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: '21px',
                  lineHeight: '27px',
                }}
              >
                {description}
              </p>
            </div>
          )}
        </div>

        {}
        {/* Bottom Action Group: Price + CTA Button + Cancellation Policy */}
        <div className="w-full flex flex-col items-center gap-6 mt-auto">
          {/* Price Container (30px inline padding, left-aligned rate, right-aligned disclaimer) */}
          <div className="w-full flex flex-col justify-center px-[30px] box-border">
            <div
              className="w-full text-left font-normal uppercase select-none"
              style={{
                color: '#F2AAA9',
                fontFamily: "'League Gothic', 'Impact', sans-serif-condensed, sans-serif",
                fontSize: '52px',
                lineHeight: '50px',
                letterSpacing: '0.08em',
              }}
            >
              {price} {priceUnit}
            </div>
            <div
              className="w-full text-right font-normal select-none mt-1"
              style={{
                color: '#F2AAA9',
                fontFamily: "'DM Sans', sans-serif",
                fontSize: '19px',
                lineHeight: '20px',
                letterSpacing: '1px',
              }}
            >
              {taxDisclaimer}
            </div>
          </div>

          {/* CTA Button Group */}
          <div className="w-full flex flex-col items-center gap-3">
            <button
              type="button"
              onClick={handleAction}
              disabled={disabled || isSubmitting}
              className={`group w-full max-w-[390px] min-h-[80px] px-8 py-4 rounded-full flex items-center justify-center transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-[#F2AAA9]/30 active:scale-[0.98] ${
                disabled
                  ? 'opacity-50 cursor-not-allowed bg-[#F2AAA9]/50 text-[#0E301A]/60 border-[#F2AAA9]/50'
                  : isSubmitting
                  ? 'bg-[#F2AAA9] text-[#0E301A] cursor-wait border-transparent'
                  : 'cursor-pointer bg-[#F2AAA9] text-[#0E301A] border-[3px] border-[#F2AAA9] hover:bg-transparent hover:text-[#F2AAA9]'
              }`}
              aria-busy={isSubmitting}
            >
              {isSubmitting ? (
                <div className="flex items-center gap-3 text-inherit">
                  <svg
                    className="animate-spin h-6 w-6 text-current"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v8H4z"
                    />
                  </svg>
                  <span
                    className="font-bold text-[22px] tracking-[1px] uppercase"
                    style={{ fontFamily: "'DM Sans', sans-serif" }}
                  >
                    Unlocking...
                  </span>
                </div>
              ) : (
                <span
                  className="font-normal text-[26px] tracking-[1.5px] uppercase select-none transition-colors"
                  style={{ fontFamily: "'Brothers OT', 'League Spartan', sans-serif" }}
                >
                  {ctaLabel}
                </span>
              )}
            </button>

            {/* Cancellation Policy Footnote */}
            <div
              className="w-full text-center font-normal text-[15px] select-none"
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

      {}
      {/* Bottom Callout Banner (Default variant only) */}
      {!isCompact && (
        <div
          className="w-full py-4 px-6 flex items-center justify-center select-none"
          style={{
            backgroundColor: '#F2AAA9',
            borderRadius: '0px 0px 50px 50px',
          }}
        >
          <span
            className="text-center font-bold text-[19px] tracking-[1px] uppercase"
            style={{
              color: '#0E301A',
              fontFamily: "'DM Sans', sans-serif",
            }}
          >
            {calloutText}
          </span>
        </div>
      )}
    </div>
  );
};

export default function App() {
  const [selectedVariant, setSelectedVariant] = useState<'default' | 'compact'>('default');
  const [bookedStatus, setBookedStatus] = useState<string | null>(null);

  const handleBooking = async () => {
    setBookedStatus(null);
    await new Promise((resolve) => setTimeout(resolve, 1200));
    setBookedStatus('Member rate unlocked and applied!');
  };

  return (
    <div className="min-h-screen bg-[#1F2722] py-12 px-4 flex flex-col items-center justify-center font-sans">
      {/* Control Switcher Header */}
      <div className="mb-8 flex flex-col items-center gap-4 text-center">
        <h1 className="text-2xl font-bold text-[#F2AAA9] tracking-wide">
          Offers Card - Outfit Preview
        </h1>
        <div className="inline-flex rounded-full bg-[#0E301A] p-1 border-2 border-[#F2AAA9] shadow-sm">
          <button
            type="button"
            onClick={() => {
              setSelectedVariant('default');
              setBookedStatus(null);
            }}
            className={`px-5 py-2 rounded-full font-bold text-sm tracking-wider uppercase transition-all ${
              selectedVariant === 'default'
                ? 'bg-[#F2AAA9] text-[#0E301A]'
                : 'text-[#F2AAA9] hover:bg-[#F2AAA9]/10'
            }`}
          >
            Default (4 Lines)
          </button>
          <button
            type="button"
            onClick={() => {
              setSelectedVariant('compact');
              setBookedStatus(null);
            }}
            className={`px-5 py-2 rounded-full font-bold text-sm tracking-wider uppercase transition-all ${
              selectedVariant === 'compact'
                ? 'bg-[#F2AAA9] text-[#0E301A]'
                : 'text-[#F2AAA9] hover:bg-[#F2AAA9]/10'
            }`}
          >
            Compact (3 Lines)
          </button>
        </div>

        {bookedStatus && (
          <div className="text-sm font-semibold text-emerald-300 bg-emerald-950/80 border border-emerald-500 px-4 py-1.5 rounded-full">
            {bookedStatus}
          </div>
        )}
      </div>

      {/* Render Component */}
      <OffersCardOutfit
        variant={selectedVariant}
        onBook={handleBooking}
      />
    </div>
  );
}