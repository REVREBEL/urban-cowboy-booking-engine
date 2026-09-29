// OffersCardSunup.tsx
import React, { useState } from 'react';

export interface OffersCardSunupProps {
  /** Variant of the card: 'default' displays full details; 'compact' displays condensed view */
  variant?: 'default' | 'compact';
  /** Category / eyebrow badge text */
  eyebrow?: string;
  /** Primary multi-line display headline */
  headline?: string;
  /** Detailed offer copy (hidden in compact variant) */
  description?: string;
  /** Nightly rate numeric value or formatted string */
  price?: string | number;
  /** Price cadence label */
  priceUnit?: string;
  /** Tax disclaimer line */
  taxDisclaimer?: string;
  /** Primary button label */
  ctaLabel?: string;
  /** Cancellation policy footnote */
  cancellationText?: string;
  /** Async or sync booking handler */
  onBook?: () => Promise<void> | void;
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
  cancellationText = 'Free Cancellation until May 31, 2027',
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
        console.error('Failed to complete booking action:', err);
      } finally {
        setInternalLoading(false);
      }
    }
  };

  return (
    <div
      className={`relative w-full max-w-[500px] box-border transition-all duration-300 ${className}`}
      style={{
        backgroundColor: '#EBE8E0',
        borderRadius: '50px',
        padding: '8px',
      }}
    >
      {/* Outer Border Vector Frame */}
      <div
        className="w-full flex flex-col justify-between items-center transition-all duration-300 relative box-border"
        style={{
          border: '5px solid #9A5636',
          borderRadius: '45px',
          minHeight: isCompact ? '659px' : '1022px',
          padding: isCompact ? '35px 25px 45px' : '45px 30px 45px',
        }}
      >
        {/* Top Content Group: Eyebrow + Headline + Optional Description */}
        <div className="w-full flex flex-col items-center">
          {/* Eyebrow & Headline Lockup with reduced gap */}
          <div className="w-full flex flex-col items-center gap-2">
            {/* Eyebrow Tag (Positioned directly above headline) */}
            <div
              className="w-full text-center uppercase font-bold tracking-[-1.25px] select-none leading-none"
              style={{
                color: '#69253A',
                fontFamily: "'Noto Serif Tibetan', 'Noto Serif', Georgia, serif",
                fontSize: isCompact ? '28px' : '30px',
                transform: 'rotate(0.28deg)',
              }}
            >
              {eyebrow}
            </div>

            {/* Display Headline */}
            <h2
              className="w-full font-bold uppercase text-center m-0 select-none whitespace-pre-line"
              style={{
                color: '#9A5636',
                fontFamily: "'Rundeck', 'League Spartan', 'Arial Black', sans-serif",
                fontSize: isCompact ? 'clamp(54px, 14vw, 75px)' : 'clamp(62px, 16vw, 85px)',
                lineHeight: isCompact ? '75px' : '85px',
                letterSpacing: '-5px',
                transform: 'matrix(1, 0.01, 0, 1, 0, 0)',
              }}
            >
              {isCompact ? 'SUNUP\nBEFORE\nTHE TRAIL' : headline}
            </h2>
          </div>

          {/* Description Block (Default variant only) */}
          {!isCompact && (
            <div className="w-full max-w-[380px] flex flex-row justify-center items-center mt-6">
              <p
                className="w-full font-normal text-center m-0 whitespace-normal"
                style={{
                  color: '#9A5636',
                  fontFamily: "'Noto Serif Tibetan', 'Noto Serif', Georgia, serif",
                  fontSize: '24px',
                  lineHeight: '34px',
                  letterSpacing: '1.5px',
                  transform: 'matrix(1, 0.01, 0, 1, 0, 0)',
                }}
              >
                {description}
              </p>
            </div>
          )}
        </div>

        {/* Bottom Action Group: Price + CTA Button + Cancellation Policy */}
        <div
          className={`w-full flex flex-col items-center gap-6 mt-auto ${
            isCompact ? 'pt-16' : 'pt-12'
          }`}
        >
          {/* Price & Tax Disclaimer Container (full width with 30px inline padding) */}
          <div className="w-full flex flex-col justify-center px-[30px] box-border">
            <div
              className="w-full text-left font-bold uppercase select-none"
              style={{
                color: '#9A5636',
                fontFamily: "'Rundeck', 'League Spartan', sans-serif",
                fontSize: '48px',
                lineHeight: '50px',
                letterSpacing: '-4px',
              }}
            >
              {price} {priceUnit}
            </div>
            <div
              className="w-full text-right font-normal select-none mt-1"
              style={{
                color: '#69253A',
                fontFamily: "'Noto Serif Tibetan', 'Noto Serif', serif",
                fontSize: '20px',
                lineHeight: '24px',
                letterSpacing: '2px',
              }}
            >
              {taxDisclaimer}
            </div>
          </div>

          {/* CTA Button Group */}
          <div className="w-full flex flex-col items-center gap-4">
            <button
              type="button"
              onClick={handleAction}
              disabled={disabled || isSubmitting}
              className={`group w-full max-w-[332.5px] min-h-[87.5px] px-8 py-5 rounded-full flex items-center justify-center transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-[#9A5636]/30 active:scale-[0.98] ${
                disabled
                  ? 'opacity-50 cursor-not-allowed bg-[#9A5636]/50 text-[#EBE8E0]/60 border-[#9A5636]/50'
                  : isSubmitting
                  ? 'bg-[#9A5636] text-[#EBE8E0] cursor-wait'
                  : 'cursor-pointer bg-[#9A5636] text-[#EBE8E0] hover:bg-transparent hover:text-[#9A5636]'
              }`}
              style={{
                border: '3.75px solid #9A5636',
              }}
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
                    style={{ fontFamily: "'Lato', sans-serif" }}
                  >
                    Reserving...
                  </span>
                </div>
              ) : (
                <span
                  className="font-normal text-[27px] tracking-[1.5px] uppercase select-none transition-colors"
                  style={{ fontFamily: "'Brothers OT', 'League Spartan', sans-serif" }}
                >
                  {ctaLabel}
                </span>
              )}
            </button>

            {/* Free Cancellation Footnote */}
            <div
              className="w-full text-center font-normal text-[16px] tracking-[2px] select-none"
              style={{
                color: '#69253A',
                fontFamily: "'Noto Serif Tibetan', 'Noto Serif', serif",
              }}
            >
              {cancellationText}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function App() {
  const [selectedVariant, setSelectedVariant] = useState<'default' | 'compact'>('default');
  const [bookedStatus, setBookedStatus] = useState<string | null>(null);

  const handleBooking = async () => {
    setBookedStatus(null);
    await new Promise((resolve) => setTimeout(resolve, 1200));
    setBookedStatus('Room + Breakfast package booked successfully!');
  };

  return (
    <div className="min-h-screen bg-[#DED9CE] py-12 px-4 flex flex-col items-center justify-center font-sans">
      {/* Control Switcher Header */}
      <div className="mb-8 flex flex-col items-center gap-4 text-center">
        <h1 className="text-2xl font-bold text-[#4E332D] tracking-wide">
          Offers Card - Sunup Preview
        </h1>
        <div className="inline-flex rounded-full bg-[#EBE8E0] p-1 border-2 border-[#9A5636] shadow-sm">
          <button
            type="button"
            onClick={() => {
              setSelectedVariant('default');
              setBookedStatus(null);
            }}
            className={`px-5 py-2 rounded-full font-bold text-sm tracking-wider uppercase transition-all ${
              selectedVariant === 'default'
                ? 'bg-[#9A5636] text-[#EBE8E0]'
                : 'text-[#9A5636] hover:bg-[#EBE8E0]/70'
            }`}
          >
            Default Variant
          </button>
          <button
            type="button"
            onClick={() => {
              setSelectedVariant('compact');
              setBookedStatus(null);
            }}
            className={`px-5 py-2 rounded-full font-bold text-sm tracking-wider uppercase transition-all ${
              selectedVariant === 'compact'
                ? 'bg-[#9A5636] text-[#EBE8E0]'
                : 'text-[#9A5636] hover:bg-[#EBE8E0]/70'
            }`}
          >
            Compact Variant
          </button>
        </div>

        {bookedStatus && (
          <div className="text-sm font-semibold text-emerald-800 bg-emerald-100 border border-emerald-400 px-4 py-1.5 rounded-full">
            {bookedStatus}
          </div>
        )}
      </div>

      {/* Render Component */}
      <OffersCardSunup
        variant={selectedVariant}
        onBook={handleBooking}
      />
    </div>
  );
}