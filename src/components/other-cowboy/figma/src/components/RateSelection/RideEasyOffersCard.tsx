// OffersCard.tsx
import React, { useState } from 'react';

// Sheriff Badge Icon (6-point Western Star with circular tips matching fi-sheriff-badge.svg)
const SheriffBadgeIcon: React.FC<{ className?: string; color?: string; size?: number }> = ({
  className = '',
  color = '#D65241',
  size = 28,
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
  /** Detailed offer copy (hidden in compact variant) */
  description?: string;
  /** Guarantee trust badge text */
  guaranteeText?: string;
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

export const OffersCard: React.FC<OffersCardProps> = ({
  variant = 'default',
  eyebrow = 'BEST FLEXIBLE RATE',
  headlineMain = 'RIDE\nEASY',
  headlineSub = ['Keep', 'Your', 'Options', 'Open.'],
  description = 'Our standard rate for guests who want a little more freedom around their plans.',
  guaranteeText = 'THE COWBOY BEST RATE GUARANTEE',
  price = '$145',
  priceUnit = 'Nightly',
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
        backgroundColor: '#E2E2E1',
        border: '4px solid #343833',
        borderRadius: '50px',
        padding: '5px',
      }}
    >
      {/* Inner Card Frame */}
      <div
        className="w-full bg-white flex flex-col justify-between items-center transition-all duration-300"
        style={{
          border: '3px solid #343833',
          borderRadius: '45px',
          minHeight: isCompact ? '657px' : '980px',
          padding: isCompact ? '48px 30px' : '48px 40px 40px 40px',
          gap: isCompact ? '32px' : '44px',
        }}
      >
        {}
        <div className="w-full flex flex-col items-start gap-5">
          {/* Eyebrow Tag */}
          <div
            className="w-full uppercase font-bold tracking-[2px] leading-tight select-none"
            style={{
              color: '#D65241',
              fontFamily: "'Lato', sans-serif",
              fontSize: '28px',
              transform: 'matrix(1, 0.01, 0, 1, 0, 0)',
            }}
          >
            {eyebrow}
          </div>

          {/* Headline Split Lockup */}
          <div className="w-full relative flex flex-row items-center justify-between min-h-[170px] select-none">
            {/* Primary Headline Title */}
            <div
              className="font-bold tracking-[-2.5px] uppercase whitespace-pre-line leading-[0.82]"
              style={{
                color: '#343833',
                fontFamily: "'Noto Serif', serif",
                fontSize: 'clamp(64px, 16vw, 92px)',
              }}
            >
              {headlineMain}
            </div>

            {/* Stacked Subheadline Serif */}
            <div
              className="font-bold tracking-[-1.5px] leading-[1.0] text-black text-left flex flex-col items-end pl-2"
              style={{
                fontFamily: "'Quattrocento', serif",
                fontSize: isCompact ? '34px' : '38px',
                transform: 'matrix(1, 0.01, 0, 1, 0, 0)',
              }}
            >
              {headlineSub.map((line, idx) => (
                <span key={`headline-sub-${idx}`} className="block">
                  {line}
                </span>
              ))}
            </div>
          </div>

          {}
          {!isCompact && (
            <div className="w-full flex flex-col items-start gap-8 mt-2">
              <p
                className="text-black font-normal text-[22px] leading-[30px] tracking-[1.2px] m-0"
                style={{
                  fontFamily: "'Lato', sans-serif",
                  transform: 'matrix(1, 0.01, 0, 1, 0, 0)',
                }}
              >
                {description}
              </p>

              {/* Rate Guarantee Row with Sheriff Badge */}
              <div
                className="w-full relative py-2 flex items-center justify-between border-t border-b border-[#343833]/15"
                style={{
                  transform: 'matrix(1, 0.01, 0, 1, 0, 0)',
                }}
              >
                <span
                  className="font-bold uppercase text-[20px] tracking-[2px] text-black"
                  style={{ fontFamily: "'Lato', sans-serif" }}
                >
                  {guaranteeText}
                </span>
                <div className="flex-shrink-0 ml-3">
                  <SheriffBadgeIcon size={28} color="#D65241" />
                </div>
              </div>
            </div>
          )}
        </div>

        {}
        <div className="w-full flex flex-col items-center gap-6 mt-auto">
          {/* Price Container */}
          <div className="w-full flex flex-col items-center justify-center">
            <div
              className="text-black font-bold text-[40px] tracking-[2px] leading-tight text-center"
              style={{ fontFamily: "'Quattrocento', serif" }}
            >
              {price} {priceUnit}
            </div>
            <div
              className="w-full text-center text-black font-normal text-[17px] tracking-[1.5px] mt-1 opacity-90"
              style={{ fontFamily: "'Lato', sans-serif" }}
            >
              {taxDisclaimer}
            </div>
          </div>

          {/* Call to Action Button */}
          <div className="w-full flex flex-col items-center gap-4">
            <button
              type="button"
              onClick={handleAction}
              disabled={disabled || isSubmitting}
              className={`group w-full max-w-[340px] min-h-[76px] px-8 py-4 rounded-full flex items-center justify-center transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-[#343833]/20 active:scale-[0.98] ${
                disabled
                  ? 'opacity-50 cursor-not-allowed border-[#343833]/40 text-[#343833]/40 bg-transparent'
                  : isSubmitting
                  ? 'bg-[#343833] text-white cursor-wait'
                  : 'cursor-pointer bg-transparent text-[#343833] hover:bg-[#343833] hover:text-white'
              }`}
              style={{
                border: '3.75px solid #343833',
              }}
              aria-busy={isSubmitting}
            >
              {isSubmitting ? (
                <div className="flex items-center gap-3 text-white">
                  <svg
                    className="animate-spin h-6 w-6 text-white"
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
                    className="font-bold text-[22px] tracking-[1px] uppercase text-white"
                    style={{ fontFamily: "'Lato', sans-serif" }}
                  >
                    Reserving...
                  </span>
                </div>
              ) : (
                <span
                  className="font-bold text-[24px] tracking-[1.5px] uppercase select-none transition-colors group-hover:text-white"
                  style={{ fontFamily: "'Lato', 'Brothers OT', sans-serif" }}
                >
                  {ctaLabel}
                </span>
              )}
            </button>

            {/* Cancellation Disclaimer Line */}
            <div
              className="text-black font-normal text-[14px] text-center tracking-[1.5px]"
              style={{ fontFamily: "'Lato', sans-serif" }}
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
    setBookedStatus('Reservation slot held successfully!');
  };

  return (
    <div className="min-h-screen bg-[#F4F4F3] py-12 px-4 flex flex-col items-center justify-center font-sans">
      {/* Control Switcher Header */}
      <div className="mb-8 flex flex-col items-center gap-4 text-center">
        <h1 className="text-2xl font-bold text-[#343833] tracking-wide">
          Offers Card Component Preview
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

      {/* Render Card */}
      <OffersCard
        variant={selectedVariant}
        onBook={handleBooking}
      />
    </div>
  );
}