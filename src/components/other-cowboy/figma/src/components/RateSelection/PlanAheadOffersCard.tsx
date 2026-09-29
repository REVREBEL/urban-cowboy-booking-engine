import React, { useState } from 'react';

export interface OffersCardPlanAheadProps {
  /** Variant of the card: 'default' displays full details; 'compact' displays condensed view */
  variant?: 'default' | 'compact';
  /** Main headline text (supports multiline) */
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
  policyText?: string;
  /** Async or sync booking handler */
  onBook?: () => Promise<void> | void;
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
  policyText = 'Full Prepay. Non Refundable.',
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
        console.error('Booking action failed:', err);
      } finally {
        setInternalLoading(false);
      }
    }
  };

  return (
    <div
      className={`relative w-full max-w-[500px] box-border transition-all duration-300 ${className}`}
      style={{
        backgroundColor: '#F2F2F2',
        border: '5px solid #343833',
        borderRadius: '50px',
        padding: isCompact ? '40px 25px' : '50px 35px',
      }}
    >
      <div
        className="w-full flex flex-col justify-between items-center transition-all duration-300"
        style={{
          minHeight: isCompact ? '585px' : '928px',
          gap: isCompact ? '40px' : '64px',
        }}
      >
        {/* Top Content Group: Headline + Optional Description */}
        <div className="w-full flex flex-col items-center gap-6">
          {/* Main Display Headline */}
          <div className="w-full flex flex-row justify-center items-center">
            <h2
              className="w-full font-bold lowercase text-black m-0 select-none whitespace-pre-line text-left"
              style={{
                fontFamily: "'League Spartan', 'Arial Black', sans-serif",
                fontSize: isCompact ? 'clamp(60px, 16vw, 95px)' : 'clamp(64px, 18vw, 100px)',
                lineHeight: isCompact ? '75px' : '85px',
                transform: 'matrix(1, 0.01, 0, 1, 0, 0)',
                letterSpacing: '-2px',
              }}
            >
              {headline}
            </h2>
          </div>

          {/* Description Block (Default variant only) */}
          {!isCompact && (
            <div className="w-full flex flex-row justify-end items-center mt-2">
              <p
                className="w-full max-w-[320px] font-normal text-black text-left m-0 whitespace-pre-line"
                style={{
                  fontFamily: "'Arvo', Georgia, serif",
                  fontSize: '24px',
                  lineHeight: '28px',
                  letterSpacing: '2px',
                  transform: 'matrix(1, 0.01, 0, 1, 0, 0)',
                }}
              >
                {description}
              </p>
            </div>
          )}
        </div>

        {/* Bottom Action Group: Price + CTA Button + Cancellation Policy */}
        <div className="w-full flex flex-col items-center gap-6 mt-auto">
          {/* Price & Tax Disclaimer Container */}
          <div className="w-full flex flex-col justify-center px-[30px] box-border">
            <div
              className="w-full text-left font-semibold text-[#343833] uppercase select-none"
              style={{
                fontFamily: "'League Spartan', sans-serif",
                fontSize: '48px',
                lineHeight: '50px',
                letterSpacing: '2px',
              }}
            >
              {price} {priceUnit}
            </div>
            <div
              className="w-full text-right text-[#343833] font-normal select-none mt-1"
              style={{
                fontFamily: "'Arvo', Georgia, serif",
                fontSize: '20px',
                lineHeight: '22px',
                letterSpacing: '2px',
              }}
            >
              {taxDisclaimer}
            </div>
          </div>

          {/* CTA Book Button */}
          <div className="w-full flex flex-col items-center gap-4">
            <button
              type="button"
              onClick={handleAction}
              disabled={disabled || isSubmitting}
              className={`group w-full max-w-[420px] min-h-[88px] px-8 py-5 rounded-full flex items-center justify-center transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-[#343833]/30 active:scale-[0.98] ${
                disabled
                  ? 'opacity-50 cursor-not-allowed bg-[#343833]/50 text-white/50 border-[#4E332D]/50'
                  : isSubmitting
                  ? 'bg-[#343833] text-white cursor-wait'
                  : 'cursor-pointer bg-[#343833] text-[#F9F9F9] hover:bg-transparent hover:text-[#343833]'
              }`}
              style={{
                border: '3.75px solid #4E332D',
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
                    style={{ fontFamily: "'League Spartan', sans-serif" }}
                  >
                    Reserving...
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

            {/* Non-Refundable Cancellation Policy Footnote */}
            <div
              className="text-black font-bold text-[16px] text-center tracking-[2px] select-none"
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
  );
};

export default function App() {
  const [selectedVariant, setSelectedVariant] = useState<'default' | 'compact'>('default');
  const [bookedStatus, setBookedStatus] = useState<string | null>(null);

  const handleBooking = async () => {
    setBookedStatus(null);
    await new Promise((resolve) => setTimeout(resolve, 1200));
    setBookedStatus('Non-refundable rate reserved successfully!');
  };

  return (
    <div className="min-h-screen bg-[#EBEBEA] py-12 px-4 flex flex-col items-center justify-center font-sans">
      {/* Control Switcher Header */}
      <div className="mb-8 flex flex-col items-center gap-4 text-center">
        <h1 className="text-2xl font-bold text-[#343833] tracking-wide">
          Offers Card - Plan Ahead Preview
        </h1>
        <div className="inline-flex rounded-full bg-white p-1 border-2 border-[#343833] shadow-sm">
          <button
            type="button"
            onClick={() => {
              setSelectedVariant('default');
              setBookedStatus(null);
            }}
            className={`px-5 py-2 rounded-full font-bold text-sm tracking-wider uppercase transition-all ${
              selectedVariant === 'default'
                ? 'bg-[#343833] text-white'
                : 'text-[#343833] hover:bg-neutral-100'
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
                ? 'bg-[#343833] text-white'
                : 'text-[#343833] hover:bg-neutral-100'
            }`}
          >
            Compact Variant
          </button>
        </div>

        {bookedStatus && (
          <div className="text-sm font-semibold text-emerald-800 bg-emerald-100 border border-emerald-400 px-4 py-1.5 rounded-full animate-fade-in">
            {bookedStatus}
          </div>
        )}
      </div>

      {/* Render Component */}
      <OffersCardPlanAhead
        variant={selectedVariant}
        onBook={handleBooking}
      />
    </div>
  );
}