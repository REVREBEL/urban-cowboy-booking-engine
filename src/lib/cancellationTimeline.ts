export type PhaseKind = "refundable" | "deposit-kept" | "locked";

export interface TimelinePolicy {
  /** Days before arrival when the deposit stops being refundable. */
  freeCancelDays: number;
  /** Days before arrival when the balance is charged and nothing is refundable. */
  balanceDueDays: number;
  /** Share of the total charged at booking (0–1). */
  depositShare: number;
}

export interface TimelinePhase {
  kind: PhaseKind;
  start: string; // ISO date
  end: string; // ISO date (exclusive)
  days: number;
  /** Amount kept by the hotel if the guest cancels during this phase. */
  kept: number;
  /** Amount refunded if the guest cancels during this phase. */
  refunded: number;
  /** Long stretch drawn compressed with a break mark. */
  compressed: boolean;
  weight: number;
}

export interface TimelineCharge {
  date: string;
  amount: number;
  label: "Due today" | "Remaining balance";
}

export interface CancellationTimeline {
  daysToArrival: number;
  phases: TimelinePhase[];
  charges: TimelineCharge[];
  dueToday: number;
  refundIfCancelToday: number;
  currentPhase: PhaseKind;
  summary: string;
  warning: string | null;
}

const DAY = 86_400_000;
const COMPRESS_AFTER_DAYS = 60;
const WEIGHTS: Record<PhaseKind, number> = { refundable: 40, "deposit-kept": 30, locked: 30 };

function parse(iso: string) {
  const [y, m, d] = iso.split("-").map(Number);
  return Date.UTC(y, m - 1, d);
}
function iso(ms: number) {
  return new Date(ms).toISOString().slice(0, 10);
}
const round = (n: number) => Math.round(n * 100) / 100;

export function formatShortDate(isoDate: string) {
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", timeZone: "UTC" }).format(
    new Date(parse(isoDate)),
  );
}

export function buildCancellationTimeline(
  today: string,
  checkIn: string,
  total: number,
  policy: TimelinePolicy,
): CancellationTimeline {
  const t = parse(today);
  const arrival = parse(checkIn);
  const daysToArrival = Math.max(0, Math.round((arrival - t) / DAY));
  const freeCutoff = arrival - policy.freeCancelDays * DAY;
  const balanceCutoff = arrival - policy.balanceDueDays * DAY;
  const deposit = round(total * policy.depositShare);
  const balance = round(total - deposit);

  const raw: Array<{ kind: PhaseKind; start: number; end: number; kept: number }> = [
    { kind: "refundable", start: t, end: freeCutoff, kept: 0 },
    { kind: "deposit-kept", start: Math.max(t, freeCutoff), end: balanceCutoff, kept: deposit },
    { kind: "locked", start: Math.max(t, balanceCutoff), end: arrival, kept: total },
  ];
  const live = raw.filter((p) => p.end > p.start || (p.kind === "locked" && p.end >= p.start));

  const phases: TimelinePhase[] = live.map((p) => {
    const days = Math.round((p.end - p.start) / DAY);
    const paid = p.kind === "locked" ? total : deposit;
    return {
      kind: p.kind,
      start: iso(p.start),
      end: iso(p.end),
      days,
      kept: p.kept,
      refunded: round(Math.max(0, paid - p.kept)),
      compressed: days > COMPRESS_AFTER_DAYS,
      weight: WEIGHTS[p.kind],
    };
  });

  const currentPhase = phases[0].kind;
  const charges: TimelineCharge[] =
    currentPhase === "locked"
      ? [{ date: today, amount: total, label: "Due today" }]
      : [
          { date: today, amount: deposit, label: "Due today" },
          { date: iso(balanceCutoff), amount: balance, label: "Remaining balance" },
        ];

  const dueToday = charges[0].amount;
  const refundIfCancelToday = phases[0].refunded;

  const summary =
    currentPhase === "refundable"
      ? `Free cancellation until ${formatShortDate(iso(freeCutoff))}`
      : currentPhase === "deposit-kept"
        ? "Deposit non-refundable"
        : "Non-refundable · paid in full";

  const warning =
    currentPhase === "deposit-kept"
      ? `Your stay is within ${policy.freeCancelDays} days, so the deposit can't be refunded.`
      : currentPhase === "locked"
        ? `Your stay is within ${policy.balanceDueDays} days, so the full stay is charged today and can't be refunded.`
        : null;

  return { daysToArrival, phases, charges, dueToday, refundIfCancelToday, currentPhase, summary, warning };
}
