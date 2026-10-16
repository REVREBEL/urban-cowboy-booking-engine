import React, { useState } from "react";
import { RateOfferSidePanel, type OfferCardTheme } from "./RateOfferSidePanel";
import { Button, type ButtonColor } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

export type OfferVariantTheme =
  | "ride-easy"
  | "plan-ahead"
  | "stay-while"
  | "sunup"
  | "outfit";

/* Sheriff Badge Icon for Ride Easy theme */
const SheriffBadgeIcon: React.FC<{ size?: number }> = ({ size = 32 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 100 100"
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
    className="text-bandana-red shrink-0"
    aria-hidden="true"
  >
    <path d="M50 8C52.76 8 55 10.24 55 13C55 13.78 54.82 14.52 54.5 15.17L61.85 27.91L76.54 27.91C77.19 27.59 77.93 27.41 78.71 27.41C81.47 27.41 83.71 29.65 83.71 32.41C83.71 34.05 82.92 35.5 81.71 36.41L74.36 49.15L81.71 61.89C82.92 62.8 83.71 64.25 83.71 65.89C83.71 68.65 81.47 70.89 78.71 70.89C77.93 70.89 77.19 70.71 76.54 70.39L61.85 70.39L54.5 83.13C54.82 83.78 55 84.52 55 85.3C55 88.06 52.76 90.3 50 90.3C47.24 90.3 45 88.06 45 85.3C45 84.52 45.18 83.78 45.5 83.13L38.15 70.39L23.46 70.39C22.81 70.71 22.07 70.89 21.29 70.89C18.53 70.89 16.29 68.65 16.29 65.89C16.29 64.25 17.08 62.8 18.29 61.89L25.64 49.15L18.29 36.41C17.08 35.5 16.29 34.05 16.29 32.41C16.29 29.65 18.53 27.41 21.29 27.41C22.07 27.41 22.81 27.59 23.46 27.91L38.15 27.91L45.5 15.17C45.18 14.52 45 13.78 45 13C45 10.24 47.24 8 50 8Z" />
  </svg>
);

/* Sunup Flourish Corner Icon */
const SunupCornerFlourish = ({ className = "" }: { className?: string }) => (
  <svg
    aria-hidden="true"
    viewBox="0 0 42 42"
    className={cn("absolute h-9 w-9 text-(--offer-border)", className)}
    fill="none"
  >
    <path d="M1 20C12 20 20 12 20 1" stroke="currentColor" strokeWidth="3.5" />
    <path
      d="M8 10c8 1 13 6 14 14M9 6c2 5 6 7 11 8M5 13c5 0 8 3 10 8"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
    />
    <path
      d="M11 7c-4-5-8-4-9-3 1 4 4 6 9 3ZM7 15c-5-2-7 1-7 3 4 2 6 1 7-3ZM18 11c-1-5 2-7 4-7 2 4 0 6-4 7Z"
      fill="currentColor"
    />
  </svg>
);

/* Sunup Inset Frame */
const SunupInsetFrame = () => (
  <div
    aria-hidden="true"
    className="pointer-events-none absolute inset-2.5 z-10 rounded-3xl border-2 border-(--offer-border)"
  >
    <SunupCornerFlourish className="-left-2.75 -top-2.75" />
    <SunupCornerFlourish className="-right-2.75 -top-2.75 rotate-90" />
    <SunupCornerFlourish className="-bottom-2.75 -right-2.75 rotate-180" />
    <SunupCornerFlourish className="-bottom-2.75 -left-2.75 -rotate-90" />
  </div>
);

export interface RateOfferCardProps {
  theme?: OfferVariantTheme;
  variant?: "default" | "compact";
  eyebrow?: string;
  headline?: string;
  subheadline?: string;
  headlineSub?: string[];
  description?: string;
  guaranteeText?: string;
  price?: string | number;
  priceUnit?: string;
  taxDisclaimer?: string;
  ctaLabel?: string;
  confirmLabel?: string;
  policyText?: string;
  calloutText?: string;
  isExpanded?: boolean;
  onToggleExpand?: () => void;
  onBook?: () => Promise<void> | void;
  onConfirmBooking?: () => void;
  onUnlock?: (email: string) => Promise<{ eligible: boolean }> | { eligible: boolean };
  pricingDetails?: {
    nightly: number | string;
    subtotal: number | string;
    taxesAndFees: number | string;
    total: number | string;
    dueToday: number | string;
    remaining: number | string;
  };
  isLoading?: boolean;
  disabled?: boolean;
  className?: string;
}

const BUTTON_COLOR_MAP: Record<OfferVariantTheme, ButtonColor> = {
  "ride-easy": "smoke",
  "plan-ahead": "smoke",
  "stay-while": "paper",
  sunup: "copper",
  outfit: "nude-ember",
};

export const RateOfferCard: React.FC<RateOfferCardProps> = ({
  theme = "ride-easy",
  variant = "default",
  eyebrow = "BEST FLEXIBLE RATE",
  headline = "RIDE\nEASY",
  subheadline,
  headlineSub,
  description = "Flexible rate for guests who want freedom around their plans.",
  guaranteeText = "THE COWBOY BEST RATE GUARANTEE",
  price = "$145",
  priceUnit = "NIGHTLY",
  taxDisclaimer = "Excluding Taxes + Fees",
  ctaLabel = "BOOK RATE",
  confirmLabel = "CONFIRM BOOKING",
  policyText = "Free Cancellation until check-in deadline",
  calloutText = "A BETTER RATE, STRAIGHT FROM COWBOY.",
  isExpanded = false,
  onToggleExpand,
  onBook,
  onConfirmBooking,
  onUnlock,
  pricingDetails,
  isLoading: externalLoading = false,
  disabled = false,
  className = "",
}) => {
  const [internalLoading, setInternalLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [showEmailInput, setShowEmailInput] = useState(false);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [unlockError, setUnlockError] = useState<string | null>(null);

  const isCompact = variant === "compact";
  const isSubmitting = externalLoading || internalLoading;
  const buttonColor = BUTTON_COLOR_MAP[theme];
  const displayedPrice = theme === "outfit" && !isUnlocked ? "$X?X?X?" : price;

  const handleAction = async () => {
    if (disabled || isSubmitting) return;

    if (!isExpanded && onToggleExpand) {
      onToggleExpand();
      return;
    }

    if (theme === "outfit" && onUnlock && !isUnlocked) {
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
        console.error("Booking action failed:", err);
      } finally {
        setInternalLoading(false);
      }
    }
  };

  const handleUnlock = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const value = email.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      setUnlockError("Please enter a valid email address.");
      return;
    }
    if (!onUnlock) return;
    setUnlockError(null);
    setInternalLoading(true);
    try {
      const result = await onUnlock(value);
      if (!result.eligible) {
        setUnlockError("This email is not eligible for the Outfit rate.");
        return;
      }
      setIsUnlocked(true);
      setShowEmailInput(false);
    } catch (error) {
      setUnlockError(
        error instanceof Error ? error.message : "Unable to unlock rate."
      );
    } finally {
      setInternalLoading(false);
    }
  };

  /* Main Card Inner Body - Binds purely to CSS Utility Classes & Variables */
  const cardInnerContent = (
    <div className="relative z-20 flex flex-col justify-between items-center w-full h-full min-h-full flex-1 transition-all duration-300">
      {/* Top Section */}
      <div className="flex flex-col items-center w-full gap-3">
        {eyebrow && (
          <div className="w-full text-center uppercase tracking-wider select-none font-offer-eyebrow text-xs sm:text-sm text-(--offer-eyebrow-color)">
            {eyebrow}
          </div>
        )}

        {/* Headline Lockup */}
        <div className="flex flex-col items-center justify-center w-full my-auto py-1">
          <div className="flex flex-row items-center justify-center w-full gap-3">
            <h2 className="m-0 font-offer-headline font-bold text-center text-(--offer-fg) leading-none uppercase whitespace-pre-line select-none text-[clamp(54px,14vw,88px)] tracking-tight">
              {headline}
            </h2>

            {headlineSub && (
              <div className="flex flex-col items-start font-offer-body font-bold text-xl text-(--offer-fg) leading-tight">
                {headlineSub.map((line, idx) => (
                  <span key={idx}>{line}</span>
                ))}
              </div>
            )}
          </div>

          {subheadline && (
            <div className="mt-1 font-offer-eyebrow text-xl text-center text-(--offer-fg) lowercase select-none">
              {subheadline}
            </div>
          )}
        </div>

        {/* Description (Omitted in Compact Mode) */}
        {!isCompact && description && (
          <p className="max-w-85 m-0 font-offer-body font-normal text-sm sm:text-base text-center text-balance text-(--offer-fg) leading-relaxed">
            {description}
          </p>
        )}

        {/* Stay Awhile Pill Divider */}
        {!isCompact && theme === "stay-while" && (
          <div
            className="w-65 h-1.25 my-1 rounded-full bg-(--offer-border)"
            aria-hidden="true"
          />
        )}

        {/* Ride Easy Sheriff Badge & Guarantee Badge */}
        {theme === "ride-easy" && (
          <div className="flex items-center justify-between w-full mt-4 px-2 text-(--offer-fg)">
            <span className="font-offer-eyebrow font-bold text-xs uppercase tracking-wider text-left max-w-[260px]">
              {guaranteeText}
            </span>
            <SheriffBadgeIcon size={32} />
          </div>
        )}
      </div>

      {/* Bottom Section */}
      <div className="flex flex-col items-center w-full mt-auto pt-4 gap-3">
        {/* Pricing Row */}
        <div className="flex flex-col justify-center w-full px-4 @container">
          <div className="font-offer-headline font-bold text-[clamp(28px,9cqw,46px)] text-left text-(--rate-fg) leading-tight uppercase whitespace-nowrap select-none">
            {displayedPrice} {priceUnit}
          </div>
          <div className="font-offer-body font-normal text-xs sm:text-sm text-right text-(--offer-fg) opacity-80 select-none">
            {taxDisclaimer}
          </div>
        </div>

        {/* CTA Controls */}
        <div className="flex flex-col items-center w-full gap-2">
          {theme === "outfit" && showEmailInput && !isUnlocked ? (
            <form onSubmit={handleUnlock} className="flex flex-col w-full max-w-95 gap-2.5">
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (unlockError) setUnlockError(null);
                }}
                placeholder="Enter your email"
                autoFocus
                disabled={isSubmitting}
                className="checkout-field rounded-full bg-(--offer-input-bg) px-5 py-3 text-sm text-(--offer-input-fg) placeholder-current/50"
              />
              <Button
                type="submit"
                variant="filled"
                colorScheme={buttonColor}
                size="medium"
                className="w-full"
                isLoading={isSubmitting}
              >
                Confirm & Save
              </Button>
              {unlockError && (
                <p className="text-center text-xs text-(--offer-error-fg) font-medium" role="alert">
                  {unlockError}
                </p>
              )}
            </form>
          ) : (
            <Button
              variant={isExpanded ? "filled" : "outline"}
              colorScheme={buttonColor}
              size="large"
              className="w-full max-w-95"
              onClick={handleAction}
              disabled={disabled || isSubmitting}
              isLoading={isSubmitting}
            >
              {isExpanded && isUnlocked ? confirmLabel : ctaLabel}
            </Button>
          )}

          {policyText && (
            <div className="font-offer-body text-xs text-center text-(--offer-fg) tracking-wider opacity-90 select-none">
              {policyText}
            </div>
          )}
        </div>
      </div>

      {/* Outfit Callout Footer */}
      {theme === "outfit" && calloutText && (
        <div className="w-[calc(100%+60px)] mt-4 px-5 py-3 text-center bg-(--offer-callout-bg) rounded-b-[45px] -mb-10">
          <span className="font-offer-body font-bold text-sm text-(--offer-callout-fg) uppercase">
            {calloutText}
          </span>
        </div>
      )}
    </div>
  );

  return (
    <div
      data-offer-theme={theme}
      className={cn(
        "flex w-auto shrink-0 items-start justify-center transition-all duration-500 ease-out",
        className
      )}
    >
      <div className="relative flex flex-row items-center justify-center w-auto shrink-0">
        {/* ================= PRIMARY CARD ================= */}
        <div
          className={cn(
            "relative z-20 shrink-0 box-border text-(--offer-fg) bg-(--offer-bg)",
            isCompact ? "w-[482px] max-w-full h-[657px] p-[54px_30px] rounded-[45px]" : "w-[480px] min-h-[820px] rounded-[50px]"
          )}
        >
          {theme === "ride-easy" ? (
            /* Ride Easy Specific Double Border Frame */
            <div className="w-full h-full border-4 border-(--offer-border) rounded-[45px] p-1.5 box-border">
              <div className="w-full h-full border-[1.5px] border-(--offer-border) rounded-[38px] p-8 box-border flex flex-col justify-between">
                {cardInnerContent}
              </div>
            </div>
          ) : theme === "sunup" ? (
            /* Sunup Inset Frame & Padding (No outer border) */
            <div className="relative w-full h-full p-[48px_34px] box-border">
              {!isCompact && <SunupInsetFrame />}
              {cardInnerContent}
            </div>
          ) : (
            /* Standard Theme Single Border */
            <div className="w-full h-full p-8 box-border border-4 border-(--offer-border) rounded-[50px]">
              {cardInnerContent}
            </div>
          )}
        </div>

        {/* ================= CONNECTED SLIDING SIDE PANEL ================= */}
        <div
          className={cn(
            "relative z-10 flex flex-row shrink-0 -ml-12 overflow-hidden transition-all duration-500 ease-out",
            isExpanded
              ? "opacity-100 translate-x-0 pointer-events-auto"
              : "opacity-0 w-0 max-w-0 -translate-x-6 pointer-events-none"
          )}
          style={{
            width: isExpanded ? (isCompact ? "557px" : "512px") : "0px",
            minWidth: isExpanded ? (isCompact ? "557px" : "512px") : "0px",
          }}
        >
          <div
            className={cn("h-full pt-0 pl-8 shrink-0", isCompact ? "w-139.25" : "w-lg")}
            style={{
              width: isCompact ? "557px" : "512px",
              minWidth: isCompact ? "557px" : "512px",
            }}
          >
            <RateOfferSidePanel
              variant={variant}
              theme={theme as OfferCardTheme}
              rateTitle={headline.replace("\n", " ")}
              cancellationHeader="FREE CANCELLATION UNTIL CHECK-IN DEADLINE"
              depositNote="50% deposit due today upon booking confirmation"
              remainingNote="Remaining balance due on arrival at check-in"
              nightlyRate={pricingDetails?.nightly || 145}
              stayTotal={pricingDetails?.subtotal || 290}
              taxesAndFees={pricingDetails?.taxesAndFees || 45}
              totalStay={pricingDetails?.total || 335}
              dueAtBooking={pricingDetails?.dueToday || 167.5}
              remaining={pricingDetails?.remaining || 167.5}
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

// Backward compatibility exports
export const OffersCard = (props: RateOfferCardProps) => (
  <RateOfferCard theme="ride-easy" {...props} />
);
export const OffersCardPlanAhead = (props: RateOfferCardProps) => (
  <RateOfferCard theme="plan-ahead" {...props} />
);
export const OffersCardStayAWhile = (props: RateOfferCardProps) => (
  <RateOfferCard theme="stay-while" {...props} />
);
export const OffersCardSunup = (props: RateOfferCardProps) => (
  <RateOfferCard theme="sunup" {...props} />
);
export const OffersCardOutfit = (props: RateOfferCardProps) => (
  <RateOfferCard theme="outfit" {...props} />
);

export default RateOfferCard;