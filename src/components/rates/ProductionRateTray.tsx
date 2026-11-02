import { useMemo, useState } from "react";
import type { ShapedRate } from "@/types/mews";
import type { RateCardConfig } from "@/types/rate-card";
import { resolvePolicyLanguage, type PolicyLanguage } from "@/types/policy-language";
import { resolveRateCardConfig } from "@/lib/rateCardConfig";
import { cancellationConfirmation } from "@/lib/rateCardLiveContent";
import {
  buildCancellationTimeline,
  formatShortDate,
  type CancellationTimeline,
  type PhaseKind,
} from "@/lib/cancellationTimeline";

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
function phaseSubtitle(phase: PhaseKind, language: PolicyLanguage) {
  return language[PHASE_COPY[phase].subtitle];
}

interface ProductionRateTrayProps {
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
}

function formatMoney(amount: number | null | undefined, currency: string) {
  const value = typeof amount === "number" && Number.isFinite(amount) ? amount : 0;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: value % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(value);
}

function formatRateSelectionHeading(checkIn: string, nights: number) {
  const [year, month, day] = checkIn.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  const formattedDate = new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  }).format(date);

  return `Rate Selection, ${formattedDate} for ${nights} ${nights === 1 ? "Night" : "Nights"}`;
}

function todayInPropertyTimeZone() {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: PROPERTY_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());

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

function RateDetailBody({
  rate,
  config,
  checkIn,
  nights,
  language,
}: {
  rate: ShapedRate;
  config: RateCardConfig | null;
  checkIn: string;
  nights: number;
  language: PolicyLanguage;
}) {
  const pricing = pricingForRate(rate, nights);
  const timeline = useMemo(
    () => timelineForRate(rate, config, checkIn),
    [rate, config, checkIn],
  );
  const policyText = config
    ? cancellationConfirmation(rate, config, checkIn)
    : rate.knownRateGroup === "NON_REFUNDABLE"
      ? "Full Prepay Non Refundable"
      : "See rate details for cancellation terms";

  const description =
    config?.description ||
    rate.description ||
    "Book direct for the best available offer.";

  return (
    <>
      <div className="rc-details-grid">
        <section className="rc-desc">
          <h3 className="rc-h2">About this rate</h3>
          <p>{description}</p>
          {config?.supportingText && <p>{config.supportingText}</p>}
          <p>
            <strong>Cancellation:</strong> {policyText}
          </p>
        </section>

        <section className="rc-table" aria-label="Stay pricing">
          <h3 className="rc-h2">Stay pricing</h3>
          <Row
            label={`Nightly average · ${nights} ${nights === 1 ? "night" : "nights"}`}
            value={formatMoney(pricing.nightly, rate.currency)}
          />
          <Row
            label="Stay before taxes"
            value={formatMoney(pricing.subtotal, rate.currency)}
          />
          <Row
            label="Taxes & fees"
            value={formatMoney(pricing.taxes, rate.currency)}
          />
          <Row
            label="Total stay"
            value={formatMoney(pricing.total, rate.currency)}
            strong
          />
        </section>
      </div>

      {timeline ? (
        <Timeline timeline={timeline} currency={rate.currency} language={language} />
      ) : (
        <section className="rc-timeline" aria-label="Cancellation and payment summary">
          <div className="rc-tl-head">
            <h3 className="rc-h2">Cancellation & payment</h3>
            <p className="rc-today">{policyText}</p>
          </div>
          <div className="rc-charges">
            <div>
              <small>{language.atTimeOfBooking}</small>
              <span className="rc-charge-subtitle">{language.atTimeOfBookingSubTitle}</span>
              <b className="rc-num">
                {formatMoney(
                  rate.knownRateGroup === "NON_REFUNDABLE"
                    ? pricing.total
                    : pricing.total * depositShareForRate(rate),
                  rate.currency,
                )}
              </b>
            </div>
          </div>
        </section>
      )}
    </>
  );
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
}: ProductionRateTrayProps) {
  const language = resolvePolicyLanguage(policyLanguage);
  const [openRateId, setOpenRateId] = useState<string | null>(null);
  const [isDrawerClosing, setIsDrawerClosing] = useState(false);

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
          <button type="button" className="rc-link" onClick={onChangeRoom}>
            ← Change room
          </button>
        )}
      </div>

      <div className="rc-production rc-grid-wrap">
        <div className="rc-grid">
          {sortedRates.map((rate, index) => {
            const config = resolveRateCardConfig(configs, rate.rateId);
            const pricing = pricingForRate(rate, nights);
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
              <article
                key={rate.rateId}
                className={`rc-rate ${isSelected ? "is-chosen" : ""} ${isOpen ? "is-open" : ""}`}
              >
                <p className="rc-eyebrow">{eyebrow}</p>
                <h2 className="rc-name">{headline}</h2>
                {description && <p className="rc-rate-sub">{description}</p>}
                {config?.supportingText && (
                  <p className="rc-rate-supporting">{config.supportingText}</p>
                )}

                {timeline && (
                  <ol className="rc-card-milestones" aria-label="Cancellation milestones">
                    {timeline.phases.map((phase) => (
                      <li key={phase.kind}>
                        <span>{phaseHeading(phase.kind, language)}</span>
                        <time dateTime={phase.end}>
                          {formatShortDate(phase.end)}
                        </time>
                      </li>
                    ))}
                  </ol>
                )}

                <div className="rc-rate-spacer" />

                <p
                  className="rc-policy-line"
                  data-phase={timeline?.currentPhase ?? (rate.knownRateGroup === "NON_REFUNDABLE" ? "locked" : undefined)}
                >
                  {timeline
                    ? `${phaseHeading(timeline.currentPhase, language)}${timeline.phases.length > 1 ? ` until ${formatShortDate(timeline.phases[0].end)}` : ""}`
                    : rate.knownRateGroup === "NON_REFUNDABLE"
                      ? language.nonRefundableLanguage
                      : policyText}
                </p>

                {timeline && <MiniBar timeline={timeline} />}

                <div className="rc-rate-price">
                  <span>
                    {formatMoney(pricing.nightly, rate.currency)} × {nights}{" "}
                    {nights === 1 ? "night" : "nights"}
                  </span>
                  <b className="rc-num">
                    {formatMoney(pricing.total, rate.currency)}
                  </b>
                </div>

                <div className="rc-actions">
                  <button
                    type="button"
                    className="rc-link"
                    aria-expanded={isOpen}
                    onClick={() => {
                      if (isOpen) {
                        closeDrawer();
                        return;
                      }
                      setIsDrawerClosing(false);
                      setOpenRateId(rate.rateId);
                    }}
                  >
                    {isOpen ? "Hide details" : "View details"}
                  </button>
                  <button
                    type="button"
                    className="rc-book"
                    disabled={rate.totalGross == null}
                    onClick={() => onSelectRate(rate)}
                  >
                    {isSelected
                      ? "Selected"
                      : config?.ctaLabel?.trim() || "Choose this rate"}
                  </button>
                </div>
              </article>
            );
          })}
        </div>

        {openRate && (
          <div
            key={openRate.rateId}
            className={`rc-drawer-layer ${isDrawerClosing ? "is-closing" : ""}`}
          >
            <button
              type="button"
              className="rc-backdrop"
              aria-label="Close rate details"
              onClick={closeDrawer}
            />
            <div
              className="rc-drawer"
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
              <div className="rc-sheet-head">
                <div>
                  <p className="rc-eyebrow">{openConfig?.eyebrow || "Rate details"}</p>
                  <h2 className="rc-name">{openConfig?.headline || openRate.name}</h2>
                </div>
                <button
                  type="button"
                  className="rc-link"
                  onClick={closeDrawer}
                >
                  Close ×
                </button>
              </div>

              <div className="rc-drawer-body">
                <RateDetailBody
                  rate={openRate}
                  config={openConfig}
                  checkIn={checkIn}
                  nights={nights}
                  language={language}
                />
              </div>

              <div className="rc-drawer-foot">
                <b className="rc-num">
                  {formatMoney(openRate.totalGross, openRate.currency)}
                </b>
                <button
                  type="button"
                  className="rc-book"
                  disabled={openRate.totalGross == null}
                  onClick={() => onSelectRate(openRate)}
                >
                  {openConfig?.ctaLabel?.trim() || "Choose this rate"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {sortedRates.length === 0 && (
        <div className="rc-empty">
          <p>No rates are available for this room on these dates.</p>
          <button type="button" className="rc-link" onClick={onChangeRoom}>
            Browse other rooms
          </button>
        </div>
      )}
    </section>
  );
}

function Row({
  label,
  value,
  strong,
}: {
  label: string;
  value: string;
  strong?: boolean;
}) {
  return (
    <div className={`rc-row ${strong ? "is-strong" : ""}`}>
      <span>{label}</span>
      <span className="rc-num">{value}</span>
    </div>
  );
}

function MiniBar({ timeline }: { timeline: CancellationTimeline }) {
  return (
    <div className="rc-mini" aria-hidden>
      {timeline.phases.map((phase) => (
        <span
          key={phase.kind}
          className="rc-seg"
          data-phase={phase.kind}
          style={{ flexGrow: phase.weight }}
        />
      ))}
    </div>
  );
}

function Timeline({
  timeline,
  currency,
  language,
}: {
  timeline: CancellationTimeline;
  currency: string;
  language: PolicyLanguage;
}) {
  const balance = timeline.charges[1];

  return (
    <section className="rc-timeline" aria-label="Cancellation timeline">
      <div className="rc-tl-head">
        <h3 className="rc-h2">If you cancel</h3>
        <p className="rc-today">
          Cancel today and get back{" "}
          <strong>{formatMoney(timeline.refundIfCancelToday, currency)}</strong>
        </p>
      </div>

      {timeline.warning && <p className="rc-warning">{timeline.warning}</p>}

      <ol className="rc-track">
        {timeline.phases.map((phase, index) => (
          <li
            key={phase.kind}
            className="rc-phase"
            data-phase={phase.kind}
            style={{ flexGrow: phase.weight }}
          >
            <div className="rc-marker">
              {index === 0 ? (
                <span className="rc-pin">You are here</span>
              ) : (
                <span className="rc-date">
                  <b>{formatShortDate(phase.start)}</b>
                  <small>
                    {phase.kind === "deposit-kept"
                      ? language.partiallyRefundableLanguageSubTitle
                      : language.nonRefundableLanguageSubTitle}
                  </small>
                </span>
              )}
            </div>
            <div className="rc-bar">
              {phase.compressed && (
                <span className="rc-break" aria-hidden>
                  ⫽
                </span>
              )}
            </div>
            <div className="rc-phase-copy">
              <b>{phaseHeading(phase.kind, language)}</b>
              <span>{phaseSubtitle(phase.kind, language)}</span>
              <small>
                {phase.days === 0
                  ? "Arrival day"
                  : `${phase.days} ${phase.days === 1 ? "day" : "days"}`}
              </small>
            </div>
          </li>
        ))}

        <li className="rc-arrive">
          <span className="rc-date">
            <b>{formatShortDate(timeline.phases.at(-1)!.end)}</b>
            <small>Arrive</small>
          </span>
        </li>
      </ol>

      <div className="rc-charges">
        <div>
          <small>{language.atTimeOfBooking}</small>
          <span className="rc-charge-subtitle">{language.atTimeOfBookingSubTitle}</span>
          <b className="rc-num">{formatMoney(timeline.dueToday, currency)}</b>
        </div>
        {balance && (
          <div>
            <small>{language.nextDueDate} · {formatShortDate(balance.date)}</small>
            <span className="rc-charge-subtitle">{language.nextDueDateSubTitle}</span>
            <b className="rc-num">{formatMoney(balance.amount, currency)}</b>
          </div>
        )}
      </div>
    </section>
  );
}
