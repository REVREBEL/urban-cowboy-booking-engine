import { FigmaRateCard, FigmaRateDetailPopup } from "./FigmaRateComponents";
import { useMemo, useState, type ComponentProps, type ReactNode } from "react";
import { Button } from "@/components/ui/Button";
import type { ShapedRate } from "@/types/mews";
import type { RateCardConfig } from "@/types/rate-card";
import { resolvePolicyLanguage, type PolicyLanguage } from "@/types/policy-language";
import { resolveRateCardConfig } from "@/lib/rateCardConfig";
import { cancellationConfirmation } from "@/lib/rateCardLiveContent";
import {
  buildCancellationTimeline,
  formatShortDate,
  type PhaseKind,
} from "@/lib/cancellationTimeline";

// Named action slots keep every rate-card and tray action on the global Button system.
type RateActionSlot = "change-room" | "details" | "select" | "close-details" | "browse-rooms";
function RateAction({
  slot, children, className = "", ...props
}: {
  slot: RateActionSlot;
  children: ReactNode;
  className?: string;
} & Omit<ComponentProps<typeof Button>, "children" | "className" | "variant" | "colorScheme" | "size">) {
  const isPrimary = slot === "select";
  return (
    <Button
      type="button"
      data-slot={slot}
      variant={isPrimary ? "filled" : "transparent"}
      colorScheme="lake-forest"
      size={isPrimary ? "small" : "xsmall"}
      textCase={isPrimary ? "uppercase" : "title"}
      className={`rc-action-slot ${isPrimary ? "rc-action-primary" : "rc-action-link"} ${className}`}
      {...props}
    >
      {children}
    </Button>
  );
}

const DEFAULT_POLICY = {
  freeCancelDays: 14,
  balanceDueDays: 5,
  depositShare: 0.5,
};

const PROPERTY_TIME_ZONE = "America/New_York";

const PHASE_COPY: Record<PhaseKind, {
  title: keyof PolicyLanguage;
  subtitle: keyof PolicyLanguage;
}> = {
  refundable: { title: "refundableLanguage", subtitle: "refundableLanguageSubTitle" },
  "deposit-kept": { title: "partiallyRefundableLanguage", subtitle: "partiallyRefundableLanguageSubTitle" },
  locked: { title: "nonRefundableLanguage", subtitle: "nonRefundableLanguageSubTitle" },
};

function phaseHeading(phase: PhaseKind, language: PolicyLanguage) {
  return language[PHASE_COPY[phase].title];
}
interface FigmaProductionRateTrayProps {
  roomName: string;
  checkIn: string;
  nights: number;
  rates: ShapedRate[];
  configs: RateCardConfig[];
  policyLanguage?: Partial<PolicyLanguage>;
  selectedRateId?: string | null;
  onSelectRate: (rate: ShapedRate) => void;
  onChangeRoom: () => void;
  showChangeRoomAction?: boolean;
  /** Only a verified server response can unlock the member rate. */
  onUnlockMember?: (email: string, rate: ShapedRate) => Promise<{ eligible: boolean; rate?: ShapedRate | null }>;
}

const rateSelectionHeadingFmt = new Intl.DateTimeFormat("en-US", {
  weekday: "long",
  month: "long",
  day: "numeric",
  timeZone: "UTC",
});

function formatRateSelectionHeading(checkIn: string, nights: number) {
  const [year, month, day] = checkIn.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  const formattedDate = rateSelectionHeadingFmt.format(date);

  return `Rate Selection, ${formattedDate} for ${nights} ${nights === 1 ? "Night" : "Nights"}`;
}

const propertyTodayFmt = new Intl.DateTimeFormat("en-US", {
  timeZone: PROPERTY_TIME_ZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

function todayInPropertyTimeZone() {
  const parts = propertyTodayFmt.formatToParts(new Date());

  const value = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((part) => part.type === type)?.value ?? "";

  return `${value("year")}-${value("month")}-${value("day")}`;
}

function daysFromWindow(
  amount: number | null | undefined,
  period: "hours" | "days" | null | undefined,
  fallback: number,
) {
  if (typeof amount !== "number" || !Number.isFinite(amount) || amount < 0 || !period) {
    return fallback;
  }
  if (period === "days") return amount;
  if (amount % 24 !== 0) return fallback;
  return amount / 24;
}

function depositShareForRate(rate: ShapedRate) {
  if (rate.knownRateGroup === "NON_REFUNDABLE") return 1;

  const total = rate.totalGross ?? 0;
  const settlement = rate.settlement;
  if (settlement.trigger === "Confirmation") {
    if (
      typeof settlement.flatValue === "number" &&
      Number.isFinite(settlement.flatValue) &&
      settlement.flatValue > 0 &&
      total > 0
    ) {
      return Math.min(1, Math.max(0, settlement.flatValue / total));
    }

    if (
      typeof settlement.value === "number" &&
      Number.isFinite(settlement.value)
    ) {
      const normalized = settlement.value > 1 ? settlement.value / 100 : settlement.value;
      return Math.min(1, Math.max(0, normalized));
    }
  }

  return DEFAULT_POLICY.depositShare;
}

function pricingForRate(rate: ShapedRate, nights: number) {
  const total = rate.totalGross ?? 0;
  const taxes = rate.totalTax ?? 0;
  const subtotal = Math.max(0, total - taxes);
  const nightly =
    rate.perNightGross ??
    (nights > 0 && total > 0 ? total / nights : total);

  return { nightly, subtotal, taxes, total };
}

function timelineForRate(
  rate: ShapedRate,
  config: RateCardConfig | null,
  checkIn: string,
) {
  if (rate.knownRateGroup === "NON_REFUNDABLE") return null;

  const total = rate.totalGross ?? 0;
  if (total <= 0) return null;

  const freeCancelDays = daysFromWindow(
    config?.cancellationPenaltyWindow,
    config?.cancellationPenaltyWindowPeriod,
    DEFAULT_POLICY.freeCancelDays,
  );
  const balanceDueDays = daysFromWindow(
    config?.cancellationFullForfeitWindow,
    config?.cancellationFullForfeitWindowPeriod,
    DEFAULT_POLICY.balanceDueDays,
  );

  if (balanceDueDays > freeCancelDays) return null;

  return buildCancellationTimeline(todayInPropertyTimeZone(), checkIn, total, {
    freeCancelDays,
    balanceDueDays,
    depositShare: depositShareForRate(rate),
  });
}

export function ProductionRateTray({
  roomName,
  checkIn,
  nights,
  rates,
  configs,
  policyLanguage,
  selectedRateId,
  onSelectRate,
  onChangeRoom,
  showChangeRoomAction = true,
  onUnlockMember,
}: FigmaProductionRateTrayProps) {
  const language = resolvePolicyLanguage(policyLanguage);
  const [openRateId, setOpenRateId] = useState<string | null>(null);
  const [isDrawerClosing, setIsDrawerClosing] = useState(false);
  const [unlockRateId, setUnlockRateId] = useState<string | null>(null);
  const [memberEmail, setMemberEmail] = useState("");
  const [unlockPending, setUnlockPending] = useState(false);
  const [unlockError, setUnlockError] = useState<string | null>(null);


  const closeDrawer = () => setIsDrawerClosing(true);

  const sortedRates = useMemo(
    () =>
      [...rates].sort((a, b) => {
        const configA = resolveRateCardConfig(configs, a.rateId);
        const configB = resolveRateCardConfig(configs, b.rateId);
        const orderA = configA?.sortOrder ?? Number.MAX_SAFE_INTEGER;
        const orderB = configB?.sortOrder ?? Number.MAX_SAFE_INTEGER;
        if (orderA !== orderB) return orderA - orderB;
        return (a.totalGross ?? Number.MAX_SAFE_INTEGER) - (b.totalGross ?? Number.MAX_SAFE_INTEGER);
      }),
    [rates, configs],
  );

  const unlockRateCandidate = sortedRates.find((rate) => rate.rateId === unlockRateId) ?? null;
  const requestSelection = (rate: ShapedRate, config: RateCardConfig | null) => {
    if (rate.isPrivate && !config?.memberOnly) return;
    if (config?.memberOnly) {
      setUnlockError(null);
      setMemberEmail("");
      setUnlockRateId(rate.rateId);
      return;
    }
    onSelectRate(rate);
  };
  const handleUnlock = async (event: import("react").FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!unlockRateCandidate || !onUnlockMember || unlockPending) return;
    setUnlockPending(true);
    setUnlockError(null);
    try {
      const result = await onUnlockMember(memberEmail.trim(), unlockRateCandidate);
      if (!result.eligible || !result.rate || result.rate.rateId !== unlockRateCandidate.rateId) {
        setUnlockError("We couldn't verify eligibility for this rate. Please try another rate.");
        return;
      }
      setUnlockRateId(null);
      onSelectRate(result.rate);
    } catch {
      setUnlockError("Unable to verify your membership right now. Please try again.");
    } finally {
      setUnlockPending(false);
    }
  };
  const openRate =
    sortedRates.find((rate) => rate.rateId === openRateId) ?? null;
  const openConfig = openRate
    ? resolveRateCardConfig(configs, openRate.rateId)
    : null;

  return (
    <section className="rc-production-page" aria-labelledby="rate-selection-title">
      <div className="rc-production-head">
        <div>
          <p className="rc-eyebrow">{formatRateSelectionHeading(checkIn, nights)}</p>
          <h1 id="rate-selection-title" className="rc-production-title">{roomName}</h1>
        </div>
        {showChangeRoomAction && (
          <RateAction slot="change-room" onClick={onChangeRoom}>
            ← Change room
          </RateAction>
        )}
      </div>

      <div className="rc-production rc-grid-wrap">
        <div className="rc-grid">
          {sortedRates.map((rate, index) => {
            const config = resolveRateCardConfig(configs, rate.rateId);
            const timeline = timelineForRate(rate, config, checkIn);
            const isOpen = openRateId === rate.rateId;
            const isSelected = selectedRateId === rate.rateId;
            const eyebrow =
              config?.eyebrow ||
              (rate.isPrivate
                ? "Exclusive rate"
                : index === 0
                  ? "Most flexible"
                  : rate.knownRateGroup?.replace(/_/g, " ") || "Available rate");
            const headline = config?.headline || rate.name;
            const description = config?.description || rate.description;
            const policyText = config
              ? cancellationConfirmation(rate, config, checkIn)
              : rate.knownRateGroup === "NON_REFUNDABLE"
                ? "Full Prepay Non Refundable"
                : "See rate details for cancellation terms";

            return (
              <FigmaRateCard
                key={rate.rateId}
                eyebrow={eyebrow}
                name={headline}
                description={[description, config?.supportingText].filter(Boolean).join(" ")}
                policy={timeline
                  ? `${phaseHeading(timeline.currentPhase, language)}${timeline.phases.length > 1 ? ` until ${formatShortDate(timeline.phases[0].end)}` : ""}`
                  : rate.knownRateGroup === "NON_REFUNDABLE" ? language.nonRefundableLanguage : policyText}
                roomSummary={`${roomName}, ${nights} ${nights === 1 ? "night" : "nights"}`}
                total={rate.totalGross}
                currency={rate.currency}
                variant={config?.memberOnly ? "member" : rate.knownRateGroup === "PACKAGE" ? "package" : "default"}
                isSelected={isSelected}
                onDetails={() => {
                  if (isOpen) { closeDrawer(); return; }
                  setIsDrawerClosing(false);
                  setOpenRateId(rate.rateId);
                }}
                detailsLabel={isOpen ? "Hide Details" : "View Details"}
                onConfirm={() => requestSelection(rate, config)}
                // Until member eligibility is wired into the booking flow, do not imply an unlock occurred.
                confirmLabel={config?.memberOnly ? "Unlock this rate" : config?.ctaLabel?.trim()}
                disabled={rate.totalGross == null || (Boolean(config?.memberOnly) && !onUnlockMember) || (rate.isPrivate && !config?.memberOnly)}
              />
            );
          })}
        </div>

        {openRate && (
          <div
            key={openRate.rateId}
            className={`rc-drawer-layer ${isDrawerClosing ? "is-closing" : ""}`}
          >
            <Button
              type="button"
              variant="transparent"
              colorScheme="lake-forest"
              size="xsmall"
              textCase="title"
              className="rc-backdrop"
              aria-label="Close rate details"
              onClick={closeDrawer}
            />
            <div
              className="rc-drawer rc-figma-drawer"
              role="dialog"
              aria-modal="true"
              aria-label={`${openConfig?.headline || openRate.name} details`}
              onAnimationEnd={(event) => {
                if (event.target !== event.currentTarget) return;
                if (!isDrawerClosing) return;
                setOpenRateId(null);
                setIsDrawerClosing(false);
              }}
            >
              <FigmaRateDetailPopup
                name={openConfig?.headline || openRate.name}
                eyebrow={openConfig?.eyebrow || "Rate details"}
                description={openConfig?.description || openRate.description || "Book direct for the best available offer."}
                nightly={pricingForRate(openRate, nights).nightly}
                subtotal={pricingForRate(openRate, nights).subtotal}
                taxes={pricingForRate(openRate, nights).taxes}
                total={pricingForRate(openRate, nights).total}
                currency={openRate.currency}
                nights={nights}
                policyText={openConfig
                  ? cancellationConfirmation(openRate, openConfig, checkIn)
                  : openRate.knownRateGroup === "NON_REFUNDABLE" ? "Full Prepay Non Refundable" : "See rate details for cancellation terms"}
                timeline={timelineForRate(openRate, openConfig, checkIn)}
                arrivalDate={checkIn}
                language={language}
                onClose={closeDrawer}
                onConfirm={() => requestSelection(openRate, openConfig)}
                disabled={openRate.totalGross == null || (Boolean(openConfig?.memberOnly) && !onUnlockMember) || (openRate.isPrivate && !openConfig?.memberOnly)}
              />
            </div>
          </div>
        )}
      </div>

      {unlockRateCandidate && (
        <div className="rc-drawer-layer rc-unlock-layer">
          <div className="rc-unlock-backdrop" aria-hidden="true" />
          <section className="rc-unlock-dialog" role="dialog" aria-modal="true" aria-labelledby="rc-figma-unlock-title">
            <div className="rc-sheet-head">
              <h2 id="rc-figma-unlock-title" className="rc-name">Unlock your rate</h2>
              <Button type="button" variant="transparent" colorScheme="lake-forest" size="xsmall" onClick={() => !unlockPending && setUnlockRateId(null)}>Close</Button>
            </div>
            <p>Enter your email to verify member eligibility before choosing this rate.</p>
            <form onSubmit={(event) => void handleUnlock(event)} className="rc-unlock-form">
              <label htmlFor="rc-figma-member-email">Email address</label>
              <input id="rc-figma-member-email" type="email" autoComplete="email" required value={memberEmail} onChange={(event) => setMemberEmail(event.target.value)} disabled={unlockPending} />
              {unlockError && <p role="alert">{unlockError}</p>}
              <Button type="submit" variant="filled" colorScheme="lake-forest" size="small" disabled={!onUnlockMember || unlockPending}>Verify membership</Button>
            </form>
          </section>
        </div>
      )}

      {sortedRates.length === 0 && (
        <div className="rc-empty">
          <p>No rates are available for this room on these dates.</p>
          <RateAction slot="browse-rooms" onClick={onChangeRoom}>
            Browse other rooms
          </RateAction>
        </div>
      )}
    </section>
  );
}

