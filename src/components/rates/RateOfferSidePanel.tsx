import * as React from "react";
import { X } from "lucide-react";
import { PolicyDisplay } from "@/components/rates/PolicyDisplay";
import { Button, type ButtonColor } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

export type OfferCardTheme =
  | "ride-easy"
  | "outfit"
  | "sunup"
  | "stay-while"
  | "plan-ahead";

export interface RateOfferSidePanelProps {
  variant?: "default" | "compact";
  theme?: OfferCardTheme;
  rateTitle?: string;
  cancellationHeader?: string;
  cancellationSub?: string;
  depositNote?: string;
  remainingNote?: string;
  nightlyRate?: number | string;
  stayTotal?: number | string;
  taxesAndFees?: number | string;
  totalStay?: number | string;
  dueAtBooking?: number | string;
  remaining?: number | string;
  policyText?: string;
  policyDisplay?: React.ReactNode;
  onClose: () => void;
  onConfirm?: () => void;
  isSubmitting?: boolean;
  height?: number;
  standalone?: boolean;
}

const buttonColorForTheme = (theme: OfferCardTheme): ButtonColor => {
  switch (theme) {
    case "outfit":
      return "nude-ember";
    case "sunup":
      return "copper";
    case "stay-while":
      return "alpine-linen";
    case "plan-ahead":
    case "ride-easy":
    default:
      return "smoke";
  }
};

export const RateOfferSidePanel: React.FC<RateOfferSidePanelProps> = ({
  variant = "compact",
  theme = "ride-easy",
  cancellationHeader = "FREE CANCELLATION UNTIL MAY 19",
  cancellationSub,
  depositNote = "50% deposit due today",
  remainingNote = "Due May 28",
  nightlyRate = "823.08",
  stayTotal = "411.54",
  taxesAndFees = "411.54",
  totalStay = "823.08",
  dueAtBooking = "411.54",
  remaining = "411.54",
  policyText = "Our standard rate for guests who want a little more freedom around their plans.",
  policyDisplay,
  onClose,
  onConfirm,
  isSubmitting = false,
  height,
  standalone = false,
}) => {
  const isCompact = variant === "compact";

  /* Standalone Modal Treatment */
  if (standalone) {
    const formattedAmount = (value: number | string | undefined) =>
      typeof value === "number"
        ? value.toLocaleString("en-US", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })
        : value ?? "—";

    const line = (
      label: string,
      value: number | string | undefined,
      strong = false
    ) => (
      <div
        className={cn(
          "flex items-baseline justify-between gap-4 py-2 border-(--ticket-border) text-(--text-primary)",
          strong ? "border-t pt-4 text-base font-bold" : "text-sm"
        )}
      >
        <span
          className="
            font-offer-eyebrow uppercase tracking-[0.12em]
          "
        >
          {label}
        </span>
        <span
          className="
            font-mono tabular-nums
          "
        >
          {formattedAmount(value)}
        </span>
      </div>
    );

    return (
      <section
        data-offer-theme={theme}
        className="
          relative flex flex-col overflow-hidden
          max-h-[calc(100dvh-2rem)] sm:max-h-[calc(100dvh-4rem)] min-h-0 min-w-0
          w-full
          text-(--text-primary)
          bg-(--panel-bg)
          rounded-[28px] border border--panel-border)
          shadow-2xl
        "
        aria-label="Rate policy and deposit details"
      >
        <header
          className="
            flex items-center justify-between
            px-6 sm:px-8 py-4
            border-b border-(--ticket-border)
            shrink-0
          "
        >
          <h2
            className="
              font-offer-heading text-2xl uppercase leading-none
            "
          >
            Rate Details
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close rate details"
            className="
              p-2
              text-(--close-btn)
              rounded-full
              transition-opacity hover:opacity-65
              cursor-pointer
            "
          >
            <X
              className="
                h-6 w-6
              "
              /
            >
          </button>
        </header>

        <div
          className="
            flex-1 overflow-y-auto overscroll-contain
            min-h-0
            px-5 sm:px-8 py-5 sm:py-6
            font-offer-body
          "
        >
          <div
            className="
              grid lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] items-start
              gap-5
            "
          >
            <div
              className="
                min-w-0
              "
            >
              <h3
                className="
                  mb-3
                  font-offer-eyebrow text-xs uppercase tracking-[0.18em]
                "
              >
                Policy information
              </h3>
              <div
                className="
                  overflow-hidden
                  p-4
                  text-cowboy-umber
                  bg-white/90
                  rounded-2xl
                "
              >
                {policyDisplay ?? <PolicyDisplay text={policyText} />}
              </div>
              {policyText && (
                <p
                  className="
                    mt-4
                    text-xs leading-relaxed
                    opacity-80
                  "
                >
                  {policyText}
                </p>
              )}
            </div>

            <div
              className="
                min-w-0
                p-5
                bg-(--ticket-bg)
                rounded-2xl border border-(--ticket-border)
              "
            >
              <h3
                className="
                  mb-3
                  font-offer-eyebrow text-xs uppercase tracking-[0.18em]
                "
              >
                Stay pricing
              </h3>
              {line("Nightly average", nightlyRate)}
              {line("Stay before taxes", stayTotal)}
              {line("Taxes & fees", taxesAndFees)}
              {line("Total stay", totalStay, true)}
              {line("Due at booking", dueAtBooking)}
              {line("Remaining balance", remaining)}
            </div>
          </div>
        </div>

        <footer
          className="
            px-5 sm:px-8 py-4
            bg-(--panel-bg)
            border-t border-(--ticket-border)
            shrink-0
          "
        >
          <Button
            type="button"
            variant="filled"
            colorScheme={buttonColorForTheme(theme)}
            disabled={isSubmitting || !onConfirm}
            onClick={onConfirm}
            className="
              w-full sm:w-auto
            "
          >
            CHOOSE THIS RATE
          </Button>
        </footer>
      </section>
    );
  }

  /* Compact Variant with Custom Policy Node */
  if (isCompact && policyDisplay) {
    return (
      <section
        data-offer-theme={theme}
        className="
          relative box-border flex flex-col
          w-131.25max-w-full
          p-5
          bg-(--panel-bg)
          rounded-r-4xl border-2 border-(--panel-border)
          shadow-xl
        "
        style={{ height: height ? `${height}px` : "675px" }}
        aria-label="Rate policy and deposit details"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close rate details"
          className="
            absolute right-4 top-4 z-20
            p-2
            text-(--close-btn)
            rounded-full
            cursor-pointer
          "
        >
          <X
            className="
              h-5 w-5
            "
            /
          >
        </button>

        <div
          className="
            flex flex-1 items-center justify-center overflow-y-auto
            min-h-0
            pt-6
          "
        >
          {policyDisplay}
        </div>

        <div
          className="
            flex justify-center
            pt-3
          "
        >
          <Button
            type="button"
            variant="filled"
            colorScheme={buttonColorForTheme(theme)}
            onClick={onConfirm}
            disabled={isSubmitting || !onConfirm}
          >
            AGREE &amp; CONFIRM BOOKING
          </Button>
        </div>
      </section>
    );
  }

  /* Compact Standard Variant */
  if (isCompact) {
    return (
      <div
        data-offer-theme={theme}
        className="
          relative box-border flex flex-col justify-between
          w-131.25 min-w-131.25
          p-6 sm:p-7
          font-offer-body text-(--text-primary)
          bg-(--panel-bg)
          rounded-r-[45px] rounded-l-none border-4 border-(--panel-border)
          shadow-xl transition-colors duration-300
          shrink-0
        "
        style={{ height: height ? `${height}px` : "625px" }}
      >
        {/* Close Button */}
        <div
          className="
            flex justify-end
            w-full
            mb-1
          "
        >
          <button
            onClick={onClose}
            type="button"
            className="
              p-1
              text-(--close-btn)
              rounded-full
              transition-all
              hover:scale-110
              cursor-pointer
              shrink-0 -mt-1 -mr-1
            "
            aria-label="Close rate details"
          >
            <X
              className="
                w-8 h-8
                stroke-[3.5]
              "
              /
            >
          </button>
        </div>

        {/* Embedded Ticket Box */}
        <div
          className="
            flex items-center justify-center
            w-116.25 max-w-full
            mx-auto mb-3 px-5 py-5
            bg-(--ticket-bg)
            rounded-2xl border-[1.5px] border-(--ticket-border)
            shadow-xs transition-colors duration-300
          "
        >
          <div
            className="
              flex flex-row justify-between items-start
              w-full
              gap-3
            "
          >
            {!policyDisplay && (
              /* Left Column: Cancellation & Deposit */
              <div
                className="
                  w-33.75
                  space-y-3
                  shrink-0
                "
              >
                <div>
                  <span
                    className="
                      block
                      font-bold text-xs text-(--text-primary) sm:text-[13px]
                      uppercase tracking-wider leading-snug
                    "
                  >
                    {cancellationHeader}
                  </span>
                  {cancellationSub && (
                    <span
                      className="
                        block
                        mt-0.5
                        text-xs text-(--text-secondary)
                      "
                    >
                      {cancellationSub}
                    </span>
                  )}
                </div>

                <div>
                  <span
                    className="
                      block
                      text-xs text-(--text-primary) sm:text-[13px] leading-tight
                    "
                  >
                    {depositNote}
                  </span>
                </div>

                <div>
                  <span
                    className="
                      block
                      text-xs text-(--text-secondary) sm:text-[13px]
                      leading-tight
                    "
                  >
                    Remaining balance
                  </span>
                  <span
                    className="
                      block
                      mt-0.5
                      font-bold text-xs text-(--text-primary) sm:text-[13px]
                    "
                  >
                    {remainingNote}
                  </span>
                </div>
              </div>
            )}

            {/* Right Column: Financial Breakdown */}
            <div
              className={cn(
                "shrink-0 space-y-1.5 font-offer-body text-[18px]",
                policyDisplay ? "w-full" : "w-56.25"
              )}
            >
              <div
                className="
                  flex justify-between items-baseline
                  gap-1
                "
              >
                <div
                  className="
                    flex flex-col
                  "
                >
                  <span
                    className="
                      text-[12px] text-(--text-primary) font-bold uppercase
                      tracking-wider
                    "
                  >
                    NIGHTLY AVERAGE RATE
                  </span>
                  <span
                    className="
                      text-[8px] text-(--text-secondary) uppercase
                      tracking-tight
                    "
                  >
                    EXCLUDING TAXES & FEES
                  </span>
                </div>
                <span
                  className="
                    text-xs text-(--text-primary) sm:text-sm font-medium
                  "
                >
                  ${nightlyRate}
                </span>
              </div>

              <div
                className="
                  flex justify-between items-baseline
                  gap-1
                "
              >
                <div
                  className="
                    flex flex-col
                  "
                >
                  <span
                    className="
                      text-[12px] text-(--text-primary) font-bold uppercase
                      tracking-wider
                    "
                  >
                    STAY TOTAL
                  </span>
                  <span
                    className="
                      text-[8px] text-(--text-secondary) uppercase
                      tracking-tight
                    "
                  >
                    EXCLUDING TAXES & FEES
                  </span>
                </div>
                <span
                  className="
                    text-xs text-(--text-primary) sm:text-sm font-medium
                  "
                >
                  ${stayTotal}
                </span>
              </div>

              <div
                className="
                  flex justify-between items-baseline
                  gap-1
                "
              >
                <span
                  className="
                    text-[12px] text-(--text-primary) font-bold uppercase
                    tracking-wider
                  "
                >
                  TAXES & FEES
                </span>
                <span
                  className="
                    text-xs text-(--text-primary) sm:text-sm font-medium
                  "
                >
                  ${taxesAndFees}
                </span>
              </div>

              <div
                className="
                  flex justify-between items-baseline
                  pt-0.5
                  gap-1
                "
              >
                <div
                  className="
                    flex flex-col
                  "
                >
                  <span
                    className="
                      text-[11px] text-(--text-primary) sm:text-xs font-bold
                      uppercase tracking-wider
                    "
                  >
                    TOTAL STAY
                  </span>
                  <span
                    className="
                      text-[8px] text-(--text-secondary) uppercase
                      tracking-tight
                    "
                  >
                    INCLUDING TAXES & FEES
                  </span>
                </div>
                <span
                  className="
                    text-xs text-(--text-primary) sm:text-sm font-bold
                  "
                >
                  ${totalStay}
                </span>
              </div>

              <div
                className="
                  flex justify-between items-baseline
                  pt-0.5
                  text-(--accent)
                  gap-1
                "
              >
                <span
                  className="
                    text-[13.5px] font-bold uppercase tracking-wider
                  "
                >
                  DUE AT BOOKING
                </span>
                <span
                  className="
                    text-xs sm:text-sm font-bold
                  "
                >
                  ${dueAtBooking}
                </span>
              </div>

              <div
                className="
                  flex justify-between items-baseline
                  gap-1
                "
              >
                <span
                  className="
                    text-[12px] text-(--text-secondary) font-medium uppercase
                    tracking-wider
                  "
                >
                  REMAINING
                </span>
                <span
                  className="
                    text-xs text-(--text-primary) sm:text-sm font-medium
                  "
                >
                  ${remaining}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Policy Disclaimer */}
        <div
          className="
            mb-3 px-1
            text-xs text-center text-(--text-secondary) sm:text-left
            leading-relaxed font-offer-body
          "
        >
          {policyDisplay ?? <PolicyDisplay text={policyText} />}
        </div>

        {/* Confirm Button */}
        <div
          className="
            flex justify-center
            w-full
          "
        >
          <Button
            type="button"
            onClick={onConfirm}
            disabled={isSubmitting}
            isLoading={isSubmitting}
            variant="filled"
            colorScheme={buttonColorForTheme(theme)}
            size="large"
          >
            AGREE &amp; CONFIRM BOOKING
          </Button>
        </div>
      </div>
    );
  }

  /* Normal / Standard Open Variant */
  return (
    <div
      data-offer-theme={theme}
      className={cn(
        "relative box-border flex flex-col items-center justify-between gap-8 rounded-r-[40px] rounded-l-none border-[3.5px] border-(--panel-border) bg-(--panel-bg) font-offer-body text-(--text-primary) py-6 pr-6 pl-18 sm:py-8 sm:pr-8 sm:pl-20 lg:py-10 lg:pr-10 lg:pl-22 shadow-xl transition-colors duration-300 shrink-0 w-132 min-w-132",
        standalone && "rounded-4xl p-6 sm:p-8 pl-6 sm:pl-8"
      )}
      style={{ height: height ? `${height}px` : "800px" }}
    >
      {/* Top Close Icon */}
      <div
        className="
          absolute right-6 sm:right-8 lg:right-10 top-6 sm:top-8 lg:top-10 flex
          justify-end
        "
      >
        <button
          onClick={onClose}
          type="button"
          className="
            p-1
            text-(--close-btn)
            rounded-full
            transition-all
            hover:scale-110
            cursor-pointer
            shrink-0
          "
          aria-label="Close rate details"
        >
          <X
            className="
              w-8 h-8
              stroke-[3.5]
            "
            /
          >
        </button>
      </div>

      {policyDisplay ? (
        <div
          className="
            w-full
          "
        >{policyDisplay}</div>
      ) : (
        <div
          className="
            w-full
            space-y-4
          "
        >
          <div>
            <span
              className="
                block
                font-bold text-sm text-(--text-primary) sm:text-base uppercase
                tracking-wider leading-tight
              "
            >
              {cancellationHeader}
            </span>
            {cancellationSub && (
              <span
                className="
                  block
                  mt-0.5
                  text-xs text-(--text-secondary)
                "
              >
                {cancellationSub}
              </span>
            )}
          </div>

          <div>
            <span
              className="
                block
                text-sm text-(--text-primary) sm:text-base leading-tight
              "
            >
              {depositNote}
            </span>
          </div>

          <div>
            <span
              className="
                block
                text-sm text-(--text-secondary) sm:text-base leading-tight
              "
            >
              Remaining balance
            </span>
            <span
              className="
                block
                mt-0.5
                font-bold text-sm text-(--text-primary) sm:text-base
              "
            >
              {remainingNote}
            </span>
          </div>
        </div>
      )}

      {/* Embedded Ticket Box */}
      <div
        className="
          w-full
          p-6 sm:p-7
          bg-(--ticket-bg)
          rounded-2xl border-[1.5px] border-(--ticket-border)
          shadow-xs transition-colors duration-300
        "
      >
        <div
          className="
            space-y-3.5
          "
        >
          <div
            className="
              flex justify-between items-baseline
              gap-2
            "
          >
            <div
              className="
                flex flex-col
              "
            >
              <span
                className="
                  text-xs text-(--text-primary) font-bold uppercase
                  tracking-wider
                "
              >
                NIGHTLY AVERAGE RATE
              </span>
              <span
                className="
                  text-[9px] text-(--text-secondary) uppercase tracking-tight
                "
              >
                EXCLUDING TAXES & FEES
              </span>
            </div>
            <span
              className="
                text-sm text-(--text-primary) sm:text-base font-medium
              "
            >
              ${nightlyRate}
            </span>
          </div>

          <div
            className="
              flex justify-between items-baseline
              gap-2
            "
          >
            <div
              className="
                flex flex-col
              "
            >
              <span
                className="
                  text-xs text-(--text-primary) font-bold uppercase
                  tracking-wider
                "
              >
                STAY TOTAL
              </span>
              <span
                className="
                  text-[9px] text-(--text-secondary) uppercase tracking-tight
                "
              >
                EXCLUDING TAXES & FEES
              </span>
            </div>
            <span
              className="
                text-sm text-(--text-primary) sm:text-base font-medium
              "
            >
              ${stayTotal}
            </span>
          </div>

          <div
            className="
              flex justify-between items-baseline
              gap-2
            "
          >
            <span
              className="
                text-xs text-(--text-primary) font-bold uppercase tracking-wider
              "
            >
              TAXES & FEES
            </span>
            <span
              className="
                text-sm text-(--text-primary) sm:text-base font-medium
              "
            >
              ${taxesAndFees}
            </span>
          </div>

          <div
            className="
              flex justify-between items-baseline
              pt-1
              border-t border-(--ticket-border)
              gap-2
            "
          >
            <div
              className="
                flex flex-col
              "
            >
              <span
                className="
                  text-xs text-(--text-primary) sm:text-sm font-bold uppercase
                  tracking-wider
                "
              >
                TOTAL STAY
              </span>
              <span
                className="
                  text-[9px] text-(--text-secondary) uppercase tracking-tight
                "
              >
                INCLUDING TAXES & FEES
              </span>
            </div>
            <span
              className="
                text-sm text-(--text-primary) sm:text-base font-bold
              "
            >
              ${totalStay}
            </span>
          </div>

          <div
            className="
              flex justify-between items-baseline
              pt-1
              text-(--accent)
              gap-2
            "
          >
            <span
              className="
                text-xs sm:text-sm font-bold uppercase tracking-wider
              "
            >
              DUE AT BOOKING
            </span>
            <span
              className="
                text-sm sm:text-base font-bold
              "
            >
              ${dueAtBooking}
            </span>
          </div>

          <div
            className="
              flex justify-between items-baseline
              pt-1
              border-t border-(--ticket-border)
              gap-2
            "
          >
            <span
              className="
                text-xs text-(--text-secondary) sm:text-sm font-medium uppercase
                tracking-wider
              "
            >
              REMAINING
            </span>
            <span
              className="
                text-sm text-(--text-primary) sm:text-base font-medium
              "
            >
              ${remaining}
            </span>
          </div>
        </div>
      </div>

      {/* Policy Disclaimer */}
      <div
        className="
          w-full
          px-1
          text-xs text-(--text-secondary) sm:text-[13px] leading-relaxed
          font-offer-body
        "
      >
        {policyDisplay ?? <PolicyDisplay text={policyText} />}
      </div>
    </div>
  );
};

export default RateOfferSidePanel;