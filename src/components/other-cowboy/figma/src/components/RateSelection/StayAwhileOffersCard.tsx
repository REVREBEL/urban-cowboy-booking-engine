// OffersCardStayAWhile.tsx
import React, { useState } from 'react';

export interface OffersCardStayAWhileProps {
  /** Variant of the card: 'default' displays full narrative and divider; 'compact' displays condensed view */
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

export const OffersCardStayAWhile: React.FC<OffersCardStayAWhileProps> = ({
  variant = 'default',
  eyebrow = 'STAY 5+ NIGHTS',
  headline = 'STAY A\nWHILE &\nUNCLINCH',
  description = 'Slip away Sunday through Thursday for slower mornings, quieter trails, and a better reason to stay out a little longer..',
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
        backgroundColor: '#343833',
        borderRadius: '50px',
        padding: isCompact ? '40px 25px' : '50px 35px',
      }}
    >
      <div
        className="w-full flex flex-col justify-between items-center transition-all duration-300"
        style={{
          minHeight: isCompact ? '595px' : '938px',
          gap: isCompact ? '40px' : '66px',
        }}
      >
        {/* Top Content Group: Eyebrow + Headline + Description + Divider */}
        <div className="w-full flex flex-col items-center gap-6">
          {/* Eyebrow Tag */}
          <div
            className="w-full max-w-[280px] font-bold text-center uppercase select-none leading-none tracking-[2px]"
            style={{
              color: '#EBE8E0',
              fontFamily: "'Bianco Sans', 'Lato', sans-serif",
              fontSize: '30px',
              transform: 'rotate(0.28deg)',
            }}
          >
            {eyebrow}
          </div>

          {/* Display Headline */}
          <h2
            className="w-full font-bold uppercase text-white m-0 text-center select-none whitespace-pre-line"
            style={{
              fontFamily: "'Quattrocento', Georgia, serif",
              fontSize: isCompact ? 'clamp(56px, 14vw, 80px)' : 'clamp(62px, 15vw, 87.5px)',
              lineHeight: '75px',
              letterSpacing: '-2.5px',
              transform: 'matrix(1, 0.01, 0, 1, 0, 0)',
            }}
          >
            {headline}
          </h2>

          {/* Description Block (Default variant only) */}
          {!isCompact && (
            <div className="w-full max-w-[340px] flex flex-col items-center gap-8 mt-1">
              <p
                className="w-full font-bold text-center m-0 whitespace-normal"
                style={{
                  color: '#EBE8E0',
                  fontFamily: "'Bianco Sans', 'Lato', sans-serif",
                  fontSize: '25px',
                  lineHeight: '31px',
                  letterSpacing: '2px',
                  transform: 'matrix(1, 0.01, 0, 1, 0, 0)',
                }}
              >
                {description}
              </p>

              {/* Geometric Accent Divider */}
              <div
                className="w-[317px] h-[6px] rounded-full"
                style={{
                  backgroundColor: '#EBE8E0',
                }}
              />
            </div>
          )}
        </div>

        {/* Bottom Action Group: Price + CTA Button + Cancellation Policy */}
        <div className="w-full flex flex-col items-center gap-6 mt-auto">
          {/* Price & Tax Disclaimer Container (full width with 30px inline padding) */}
          <div className="w-full flex flex-col justify-center px-[30px] box-border">
            <div
              className="w-full text-left font-bold text-white uppercase select-none"
              style={{
                fontFamily: "'Quattrocento', serif",
                fontSize: '50px',
                lineHeight: '50px',
                letterSpacing: '2px',
              }}
            >
              {price} {priceUnit}
            </div>
            <div
              className="w-full text-right font-normal select-none mt-1"
              style={{
                color: '#F2F2F2',
                fontFamily: "'Bianco Sans', 'Lato', sans-serif",
                fontSize: '21.25px',
                lineHeight: '21px',
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
              className={`group w-full max-w-[325.5px] min-h-[84.5px] px-8 py-5 rounded-full flex items-center justify-center transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-[#EBE8E0]/40 active:scale-[0.98] ${
                disabled
                  ? 'opacity-50 cursor-not-allowed bg-[#EBE8E0]/50 text-[#343833]/50 border-[#EBE8E0]/50'
                  : isSubmitting
                  ? 'bg-[#EBE8E0] text-[#343833] cursor-wait'
                  : 'cursor-pointer bg-[#EBE8E0] text-[#343833] hover:bg-transparent hover:text-[#EBE8E0]'
              }`}
              style={{
                border: '3.75px solid #EBE8E0',
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
                    style={{ fontFamily: "'Bianco Sans', 'Lato', sans-serif" }}
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
                color: '#EBE8E0',
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
  );
};

export default function App() {
  const [selectedVariant, setSelectedVariant] = useState<'default' | 'compact'>('default');
  const [bookedStatus, setBookedStatus] = useState<string | null>(null);

  const handleBooking = async () => {
    setBookedStatus(null);
    await new Promise((resolve) => setTimeout(resolve, 1200));
    setBookedStatus('Extended stay rate reserved successfully!');
  };

  return (
    <div className="min-h-screen bg-[#E5E2DA] py-12 px-4 flex flex-col items-center justify-center font-sans">
      {/* Control Switcher Header */}
      <div className="mb-8 flex flex-col items-center gap-4 text-center">
        <h1 className="text-2xl font-bold text-[#343833] tracking-wide">
          Offers Card - Stay A While Preview
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
          <div className="text-sm font-semibold text-emerald-800 bg-emerald-100 border border-emerald-400 px-4 py-1.5 rounded-full">
            {bookedStatus}
          </div>
        )}
      </div>

      {/* Render Component */}
      <OffersCardStayAWhile
        variant={selectedVariant}
        onBook={handleBooking}
      />
    </div>
  );
}