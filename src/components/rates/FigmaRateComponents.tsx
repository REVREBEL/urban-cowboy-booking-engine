import { Button } from "@/components/ui/Button";
import SheriffBadge from "@/components/icons/generated/ui/FiSheriffBadge";
import {
  formatShortDate,
  type CancellationTimeline,
  type PhaseKind,
} from "@/lib/cancellationTimeline";

/**
 * Figma 1390:30329. Replaces the old cancellation/payment track.
 * All milestones and charges come from the real rate policy calculation.
 */
const PHASE_NAMES: Record<PhaseKind, string> = {
  refundable: "Free Cancellation",
  "deposit-kept": "Partially Refundable",
  locked: "Non-Refundable",
};
const PHASE_SUBTITLES: Record<PhaseKind, string> = {
  refundable: "100% Refundable",
  "deposit-kept": "Cancellation Fee Applies",
  locked: "Stay Locked",
};
const PHASE_COLORS: Record<PhaseKind, string> = {
  refundable: "bg-lake-forest",
  "deposit-kept": "bg-whiskey-sour",
  locked: "bg-nude-ember",
};
const money = (amount: number, currency: string) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency }).format(amount);

export function FigmaPolicyTimeline({ timeline, currency, arrivalDate }: {
  timeline: CancellationTimeline;
  currency: string;
  arrivalDate: string;
}) {
  return (
    <section className="w-full border-t border-alpine-linen-700 pt-2 text-primary-foreground" aria-label="Policy and deposit timeline" data-figma-node="1390:30329">
      <h3 className="font-label text-xs font-bold uppercase tracking-[2.16px]">Policy &amp; Deposit Timeline</h3>
      <ol className="mt-4 flex w-full flex-col gap-5 md:flex-row md:gap-1" aria-label="Cancellation milestones">
        {timeline.phases.map((phase, index) => (
          <li key={phase.kind} className="min-w-0 flex-1" style={{ flexGrow: phase.weight }}>
            <div className="flex min-h-11 items-end">
              {index === 0 ? (
                <span className="rounded-full bg-primary-foreground px-2.5 py-1 font-label text-xs font-bold uppercase tracking-[1.5px] text-paper">You are here</span>
              ) : (
                <div>
                  <strong className="block font-heading text-xl leading-none">{formatShortDate(phase.start)}</strong>
                  <small className="font-body text-xs">{PHASE_SUBTITLES[phase.kind]}</small>
                </div>
              )}
            </div>
            <div className={`my-2 h-2.5 rounded-sm ${PHASE_COLORS[phase.kind]}`} aria-hidden="true" />
            <div className="flex flex-col gap-1 pr-2">
              <strong className="font-label text-[15px]">{PHASE_NAMES[phase.kind]}</strong>
              <span className="font-body text-[13px]">{PHASE_SUBTITLES[phase.kind]}</span>
              <span className="font-body text-xs">{phase.days} {phase.days === 1 ? "day" : "days"}</span>
            </div>
          </li>
        ))}
        <li className="flex shrink-0 flex-col items-start gap-1 md:items-center">
          <strong className="font-heading text-xl leading-none">{formatShortDate(arrivalDate)}</strong>
          <span className="font-number text-xs">Arrive</span>
          <span className="font-number text-2xl" aria-hidden="true"><SheriffBadge width={25} height={27} /></span>
        </li>
      </ol>
      {timeline.warning && <p className="mt-4 font-body text-sm">{timeline.warning}</p>}
      <div className="mt-6 grid grid-cols-1 gap-5 sm:max-w-[440px] sm:grid-cols-2 sm:gap-10">
        {timeline.charges.map((charge, index) => (
          <div key={charge.date + charge.label} className="min-w-0">
            <strong className="block font-heading text-[15px] leading-tight">{index === 0 ? "Due today" : "Remaining Amount Due"}</strong>
            <span className="block font-number text-xl font-bold">{money(charge.amount, currency)}</span>
            <span className="block font-body text-xs">{index === 0 ? "Amount Charged Once Confirmed" : `Final Payment · ${formatShortDate(charge.date)}`}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

/** Figma 1390:31339, standard, member and package rate-card variants. */
export function FigmaRateCard({
  eyebrow, name, description, policy, roomSummary, total, currency,
  variant = "default", perks, isSelected, onDetails, onConfirm, detailsLabel = "View Details", confirmLabel,
  disabled,
}: {
  eyebrow: string;
  name: string;
  description?: string | null;
  policy: string;
  roomSummary: string;
  total: number | null | undefined;
  currency: string;
  variant?: "default" | "member" | "package";
  perks?: string[];
  isSelected?: boolean;
  onDetails: () => void;
  onConfirm: () => void;
  detailsLabel?: string;
  confirmLabel?: string;
  disabled?: boolean;
}) {
  return (
    <article data-figma-node="1390:31339" data-rate-variant={variant}
      className="flex min-h-[430px] w-full min-w-0 flex-col gap-5 rounded-lg border border-lake-forest/20 bg-paper p-5 text-primary-foreground shadow-[0_18px_25px_rgba(14,48,26,.08)] sm:p-7">
      <header className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-label text-[11px] uppercase tracking-[1.5px]">{eyebrow}</p>
          <h3 className="font-heading text-[clamp(29px,4vw,40px)] leading-none tracking-[2px]">{name}</h3>
        </div>
        {variant === "member" && <span className="shrink-0 rounded-lg bg-bandana-red px-2 py-1 font-label text-[11px] uppercase tracking-wide text-paper">Member Rate</span>}
      </header>
      {description && <p className="font-body text-base leading-6 opacity-75">{description}</p>}
      {variant === "package" && perks?.length ? (
        <div>
          <p className="font-label text-xs uppercase">Included Perks:</p>
          <ul className="mt-2 space-y-1 font-body text-base">
            {perks.map((perk) => <li key={perk}>· {perk}</li>)}
          </ul>
        </div>
      ) : null}
      <div className="flex-1" />
      <p className="font-body text-sm font-bold text-lake-forest">{policy}</p>
      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-lake-forest/20 pt-3">
        <span className="min-w-0 font-number text-sm">{roomSummary}</span>
        <strong className="font-number text-2xl">{total == null ? "Rate unavailable" : money(total, currency)}</strong>
      </div>
      <footer className="flex flex-wrap items-center justify-between gap-3">
        <Button data-slot="details" variant="transparent" colorScheme="bandana-red" size="small" textCase="title"
          onClick={onDetails} aria-label={`View details for ${name}`}>
          {detailsLabel} <span aria-hidden="true">↗</span>
        </Button>
        <Button data-slot="select" variant="filled" colorScheme="lake-forest" size="small"
          onClick={onConfirm} disabled={disabled || total == null}>
          {isSelected ? "Selected" : confirmLabel ?? (variant === "member" ? "Unlock this rate" : "Confirm rate")}
        </Button>
      </footer>
    </article>
  );
}

/** Figma 1390:30695 and 1390:31186. */
export function FigmaRateDetailPopup({
  name, eyebrow, description, nightly, currency, nights, subtotal, taxes, total,
  policyText, timeline, arrivalDate, onClose, onConfirm, disabled,
}: {
  name: string;
  eyebrow: string;
  description: string;
  nightly: number;
  currency: string;
  nights: number;
  subtotal: number;
  taxes: number;
  total: number;
  policyText: string;
  timeline: CancellationTimeline | null;
  arrivalDate: string;
  onClose: () => void;
  onConfirm: () => void;
  disabled?: boolean;
}) {
  const rows: Array<[string, number]> = [
    [`Nightly Average · ${nights} ${nights === 1 ? "night" : "nights"}`, nightly],
    ["Stay Before Taxes", subtotal],
    ["Taxes & Fees", taxes],
    ["Total Stay", total],
  ];
  return (
    <div data-figma-node="1390:30695" className="mx-auto flex w-full max-w-[1200px] flex-col gap-7 bg-[#f9f9f9] px-5 py-7 text-primary-foreground sm:px-10 lg:px-14">
      <header className="flex flex-wrap items-start justify-between gap-6 border-b border-lake-forest/20 pb-5">
        <div>
          <p className="font-label text-[11px] uppercase tracking-[2.2px]">{eyebrow}</p>
          <h2 className="font-heading text-[clamp(30px,5vw,40px)] leading-none">{name}</h2>
        </div>
        <Button data-slot="close-details" variant="transparent" colorScheme="lake-forest" size="small" textCase="title"
          onClick={onClose} aria-label="Close rate details">
          <span data-figma-node="1390:31186">Close</span> <span aria-hidden="true">×</span>
        </Button>
      </header>
      <div className="grid gap-8 md:grid-cols-2">
        <section>
          <h3 className="font-label text-sm uppercase tracking-wider">About This Rate</h3>
          <p className="mt-3 font-body text-base leading-7">{description}</p>
          <p className="mt-4 font-body text-sm">{policyText}</p>
        </section>
        <section aria-label="Stay pricing">
          <div className="flex flex-wrap items-baseline justify-between gap-3">
            <h3 className="font-label text-sm uppercase tracking-wider">Stay Pricing</h3>
            <span className="font-number text-xl">{money(nightly, currency)} / night</span>
          </div>
          <dl className="mt-3 divide-y divide-lake-forest/15">
            {rows.map(([label, value], index) => (
              <div key={label} className="flex items-center justify-between gap-3 py-2">
                <dt className={index === rows.length - 1 ? "font-label font-bold" : "font-number text-sm"}>{label}</dt>
                <dd className="font-number font-bold">{money(value, currency)}</dd>
              </div>
            ))}
          </dl>
        </section>
      </div>
      {timeline && <FigmaPolicyTimeline timeline={timeline} currency={currency} arrivalDate={arrivalDate} />}
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-lake-forest/20 pt-5">
        <strong className="font-number text-2xl">{money(total, currency)}</strong>
        <Button data-slot="select" variant="filled" colorScheme="lake-forest" size="small" onClick={onConfirm} disabled={disabled}>
          Confirm rate
        </Button>
      </div>
    </div>
  );
}
