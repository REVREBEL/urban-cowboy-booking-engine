import { money } from "@/lib/format";
import { t, type TKey } from "@/i18n";
import { IconCheck, IconClock, IconFlame, IconHeart, IconLock, IconStar, IconTag, IconUsers } from "@/components/icons/cowboy-icons";

// Conversion UI is deliberately presentation-only. Every quantitative or factual
// signal must be supplied by a verified source. These components never manufacture
// viewer counts, review totals, urgency, holds, or popularity.

export function Stars({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-flex text-creole ${className}`} aria-hidden="true">
      {Array.from({ length: 5 }).map((_, i) => (
        <IconStar key={i} className="h-3.5 w-3.5" />
      ))}
    </span>
  );
}

export function RatingPill({
  score,
  count,
  className = "",
}: {
  score?: string | number | null;
  count?: number | null;
  className?: string;
}) {
  if (score == null || count == null) return null;
  return (
    <span className={`inline-flex items-center gap-1.5 text-sm ${className}`}>
      <IconStar aria-hidden="true" className="h-4 w-4 text-creole" />
      <strong className="font-semibold text-smoke">{score}</strong>
      <span className="text-smoke/50">{t("conv.reviewsCount", { count })}</span>
    </span>
  );
}

const TRUST = [
  { icon: IconCheck, labelKey: "conv.trustNoFeesLabel", subKey: "conv.trustNoFeesSub" },
  { icon: IconTag, labelKey: "conv.trustBestPriceLabel", subKey: "conv.trustBestPriceSub" },
  { icon: IconLock, labelKey: "conv.trustSecurePayLabel", subKey: "conv.trustSecurePaySub" },
  { icon: IconCheck, labelKey: "conv.trustNoBookingFeeLabel", subKey: "conv.trustNoBookingFeeSub" },
];

export function TrustRow({ compact = false }: { compact?: boolean }) {
  return (
    <ul className={`flex flex-wrap gap-x-5 gap-y-2 ${compact ? "text-xs" : "text-sm"}`}>
      {TRUST.map((row) => (
        <li key={row.labelKey} className="inline-flex items-center gap-2 text-teal-deep">
          <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-turquoise/12 text-turquoise">
            <row.icon aria-hidden="true" className="h-3.5 w-3.5" />
          </span>
          <span>
            <span className="font-semibold text-smoke">{t(row.labelKey as TKey)}</span>
            {!compact && <span className="block text-[11px] text-smoke/45">{t(row.subKey as TKey)}</span>}
          </span>
        </li>
      ))}
    </ul>
  );
}

export function ScarcityBadge({ count }: { count: number }) {
  if (!Number.isFinite(count) || count <= 0) return null;
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-creole/15 px-2.5 py-1 text-[11px] font-semibold text-creole">
      <IconFlame aria-hidden="true" className="h-3.5 w-3.5" /> {t("conv.scarcity", { count })}
    </span>
  );
}

export function HotBadge({ visible = false }: { visible?: boolean }) {
  if (!visible) return null;
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-creole/15 px-2.5 py-1 text-[11px] font-semibold text-creole">
      <IconFlame aria-hidden="true" className="h-3.5 w-3.5" /> {t("conv.hot")}
    </span>
  );
}

export function FavoriteBadge({ visible = false }: { visible?: boolean }) {
  if (!visible) return null;
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-white/95 px-2.5 py-1 text-[11px] font-semibold text-teal-deep shadow-card">
      <IconHeart aria-hidden="true" className="h-3.5 w-3.5 text-creole" /> {t("conv.favorite")}
    </span>
  );
}

export function ViewersNudge({
  viewers,
  booked,
}: {
  viewers?: number | null;
  booked?: number | null;
}) {
  const hasViewers = viewers != null && viewers > 0;
  const hasBooked = booked != null && booked > 0;
  if (!hasViewers && !hasBooked) return null;

  return (
    <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-smoke/55">
      {hasViewers && (
        <span className="inline-flex items-center gap-1.5">
          <IconUsers aria-hidden="true" className="h-3.5 w-3.5 text-turquoise" />
          {t("conv.viewers", { count: viewers })}
        </span>
      )}
      {hasBooked && (
        <span className="inline-flex items-center gap-1.5">
          <IconFlame aria-hidden="true" className="h-3.5 w-3.5 text-creole" />
          {t("conv.bookedTimes", { count: booked })}
        </span>
      )}
    </p>
  );
}

export function UrgencyBanner({
  title,
  body,
}: {
  title?: string | null;
  body?: string | null;
}) {
  if (!title && !body) return null;
  return (
    <div className="flex items-start gap-3 rounded-xl2 border border-creole/30 bg-creole/10 p-3.5 text-sm sm:items-center">
      <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-creole/20 text-creole">
        <IconFlame aria-hidden="true" className="h-4 w-4" />
      </span>
      <p className="text-smoke/80">
        {title && <strong className="font-semibold text-smoke">{title}</strong>}
        {title && body ? " " : null}
        {body}
      </p>
    </div>
  );
}

export function SavingsBadge({ from, max }: { from: number | null; max: number | null }) {
  if (from == null || max == null || max <= from) return null;
  const pct = Math.round((1 - from / max) * 100);
  if (pct < 1) return null;
  return (
    <span className="inline-flex items-center gap-1 rounded-md bg-emerald-100 px-2 py-0.5 text-[11px] font-bold text-emerald-700">
      <IconTag aria-hidden="true" className="h-3 w-3" /> -{pct}%
    </span>
  );
}

export function SavingsLine({ amount, currency }: { amount: number; currency: string }) {
  if (amount <= 0) return null;
  return (
    <p className="inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-700">
      <IconTag aria-hidden="true" className="h-4 w-4" /> {t("conv.savings", { amount: money(amount, currency) })}
    </p>
  );
}

export function HoldTimer({ secondsLeft }: { secondsLeft?: number | null }) {
  if (secondsLeft == null || !Number.isFinite(secondsLeft) || secondsLeft < 0) return null;
  const wholeSeconds = Math.floor(secondsLeft);
  const mm = Math.floor(wholeSeconds / 60);
  const ss = String(wholeSeconds % 60).padStart(2, "0");
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-turquoise/10 px-3 py-1 text-xs font-semibold text-teal-deep tabular-nums">
      <IconClock aria-hidden="true" className="h-3.5 w-3.5 text-turquoise" />
      {t("conv.holdTimer", { time: `${mm}:${ss}` })}
    </span>
  );
}
