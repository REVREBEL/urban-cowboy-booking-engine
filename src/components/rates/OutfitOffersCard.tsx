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
  /** Submit the email to the REV-115 eligibility Worker. */
  onUnlock?: (email: string) => Promise<{ eligible: boolean }> | { eligible: boolean };
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
  onUnlock,
  pricingDetails,
  isLoading: externalLoading = false,
  disabled = false,
  className = '',
}) => {
  const [internalLoading, setInternalLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [showEmailInput, setShowEmailInput] = useState(false);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [unlockError, setUnlockError] = useState<string | null>(null);
  const isCompact = variant === 'compact';
  const isSubmitting = externalLoading || internalLoading;
  const displayedPrice = isUnlocked ? price : '$X?X?X?';

  const handleAction = async () => {
    if (disabled || isSubmitting) return;

    if (!isExpanded) {
      if (onToggleExpand) {
        onToggleExpand();
        return;
      }
    }

    if (onUnlock && !isUnlocked) {
      setShowEmailInput(true);
      return;
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

  const handleUnlock = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const value = email.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      setUnlockError('Please enter a valid email address.');
      return;
    }
    if (!onUnlock) return;
    setUnlockError(null);
    setInternalLoading(true);
    try {
      const result = await onUnlock(value);
      if (!result.eligible) {
        setUnlockError('This email is not eligible for the Outfit rate.');
        return;
      }
      setIsUnlocked(true);
      setShowEmailInput(false);
    } catch (error) {
      setUnlockError(error instanceof Error ? error.message : 'Unable to unlock this rate. Please try again.');
    } finally {
      setInternalLoading(false);
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
                backgroundColor: 'var(--color-lake-forest)',
                border: '4px solid #F2AAA9',
                borderRadius: '45px',
              }}
            >
              {/* Eyebrow */}
              <div
                className="w-full text-center font-normal lowercase select-none"
                style={{
                  color: 'var(--color-nude-ember)',
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
                    color: 'var(--color-nude-ember)',
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
                    color: 'var(--color-alpine-linen)',
                    fontFamily: "'Fineday-StyleOne', 'Instrument Serif', Georgia, serif",
                    fontSize: '26px',
                    lineHeight: '28px',
                  }}
                >
                  {subheadline}
                </div>
              </div>

              {/* Price Display */}
              <div className="w-full flex flex-col justify-center px-[30px] box-border select-none mb-2" style={{ containerType: 'inline-size' }}>
                <div
                  className="w-full text-left font-normal uppercase select-none whitespace-nowrap"
                  style={{
                    color: 'var(--color-nude-ember)',
                    fontFamily: "'League Gothic', 'Impact', sans-serif-condensed, sans-serif",
                    fontSize: 'clamp(30px, 10cqw, 46px)',
                    lineHeight: '46px',
                    letterSpacing: '0.08em',
                  }}
                >
                  {displayedPrice} {priceUnit}
                </div>
                <div
                  className="w-full text-right font-normal select-none mt-0.5"
                  style={{
                    color: 'var(--color-nude-ember)',
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
                    color: 'var(--color-alpine-linen)',
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
                      className="px-8 py-3.5 rounded-full bg-nude-ember text-lake-forest font-button font-normal text-base uppercase tracking-wider transition-all cursor-pointer shadow-md hover:bg-white whitespace-nowrap"
                      style={{ fontFamily: 'var(--font-button)' }}
                    >
                      {ctaLabel}
                    </button>
                    <span
                      className="text-xs text-alpine-linen text-center"
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
                backgroundColor: 'var(--color-lake-forest)',
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
                        color: 'var(--color-alpine-linen)',
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
                        color: 'var(--color-nude-ember)',
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
                        color: 'var(--color-alpine-linen)',
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
                        color: 'var(--color-alpine-linen)',
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
                  <div className="w-full flex flex-col justify-center px-[30px] box-border select-none" style={{ containerType: 'inline-size' }}>
                    <div
                      className="w-full text-left font-normal uppercase select-none whitespace-nowrap"
                      style={{
                        color: 'var(--color-nude-ember)',
                        fontFamily: "'League Gothic', 'Impact', sans-serif-condensed, sans-serif",
                        fontSize: 'clamp(30px, 10cqw, 46px)',
                        lineHeight: '46px',
                        letterSpacing: '0.08em',
                      }}
                    >
                      {displayedPrice} {priceUnit}
                    </div>
                    <div
                      className="w-full text-right font-normal select-none mt-0.5"
                      style={{
                        color: 'var(--color-nude-ember)',
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
                    {isUnlocked && (
                      <div className="w-full max-w-[380px] rounded-full border border-nude-ember/40 bg-lake-forest px-4 py-3 text-center text-nude-ember" role="status">
                        <span className="font-normal text-[18px] tracking-[1px] uppercase" style={{ fontFamily: 'var(--font-button)' }}>
                          Member rate unlocked
                        </span>
                      </div>
                    )}
                    {showEmailInput && !isUnlocked ? (
                      <form onSubmit={handleUnlock} className="w-full max-w-[380px] flex flex-col gap-2.5">
                        <input
                          type="email"
                          value={email}
                          onChange={(event) => {
                            setEmail(event.target.value);
                            if (unlockError) setUnlockError(null);
                          }}
                          placeholder="Enter your email"
                          autoFocus
                          disabled={isSubmitting}
                          className="w-full rounded-full bg-alpine-linen px-5 py-3 text-sm font-medium text-lake-forest placeholder-[#384D43]/60 shadow-inner focus:outline-none focus:ring-2 focus:ring-nude-ember disabled:opacity-60"
                        />
                        <button
                          type="submit"
                          disabled={disabled || isSubmitting}
                          className="w-full min-h-[64px] rounded-full bg-nude-ember px-6 py-3 text-lake-forest transition-all hover:brightness-105 active:scale-[0.98] disabled:cursor-wait disabled:opacity-70"
                        >
                          <span className="font-normal text-[20px] tracking-[1.2px] uppercase" style={{ fontFamily: 'var(--font-button)' }}>
                            {isSubmitting ? 'Unlocking…' : 'Confirm & Save'}
                          </span>
                        </button>
                        {unlockError && <p className="text-center text-xs font-medium text-rose-200" role="alert">{unlockError}</p>}
                      </form>
                    ) : (
                    <button
                      type="button"
                      onClick={handleAction}
                      disabled={disabled || isSubmitting}
                      className={`group w-full max-w-[380px] min-h-[64px] px-6 py-3 rounded-full flex items-center justify-center transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-nude-ember/30 active:scale-[0.98] whitespace-nowrap ${
                        disabled
                          ? 'cursor-not-allowed bg-nude-ember text-lake-forest border-[length:var(--border-width-control)] border-nude-ember'
                          : isExpanded
                          ? 'bg-nude-ember text-lake-forest'
                          : isSubmitting
                          ? 'bg-nude-ember text-lake-forest cursor-wait border-transparent'
                          : 'cursor-pointer bg-nude-ember text-lake-forest border-[length:var(--border-width-control)] border-nude-ember hover:bg-transparent hover:text-nude-ember'
                      }`}
                      aria-busy={isSubmitting}
                    >
                      {isSubmitting ? (
                        <span
                          className="font-button font-normal text-[18px] tracking-[1px] uppercase whitespace-nowrap"
                          style={{ fontFamily: "'DM Sans', sans-serif" }}
                        >
                          Confirming...
                        </span>
                      ) : (
                        <span
                          className="font-normal text-[20px] sm:text-[22px] tracking-[1.2px] uppercase select-none transition-colors whitespace-nowrap"
                          style={{ fontFamily: 'var(--font-button)' }}
                        >
                          {isExpanded && isUnlocked ? confirmLabel : ctaLabel}
                        </span>
                      )}
                    </button>
                    )}

                    <div
                      className="w-full text-center font-normal text-[13px] select-none whitespace-nowrap"
                      style={{
                        color: 'var(--color-alpine-linen)',
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
                  backgroundColor: 'var(--color-nude-ember)',
                  borderRadius: '0px 0px 50px 50px',
                }}
              >
                <span
                  className="text-center font-bold text-[16px] tracking-[1px] uppercase"
                  style={{
                    color: 'var(--color-lake-forest)',
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
