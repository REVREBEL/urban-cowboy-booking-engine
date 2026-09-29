import { RATES, rateNightly, type RateId, type Room } from "@/lib/booking/rooms";
import { cn } from "@/lib/utils";

/**
 * The rate display: three ways to book the same room, with the nightly price,
 * the terms in plain language and the total for the stay.
 */
export function RateList({
  room,
  nights,
  selectedRateId,
  onChooseRate,
  className,
}: {
  room: Room;
  nights: number;
  selectedRateId?: RateId | null | undefined;
  onChooseRate: (rateId: RateId) => void;
  className?: string | undefined;
}) {
  return (
    <div className={cn("space-y-3", className)}>
      {RATES.map((rate) => {
        const nightly = rateNightly(room, rate);
        const selected = selectedRateId === rate.id;
        return (
          <button
            key={rate.id}
            type="button"
            onClick={() => onChooseRate(rate.id)}
            className={cn(
              "w-full rounded-xl border bg-snow p-4 text-left transition-colors",
              selected
                ? "border-copper ring-1 ring-copper"
                : "border-border hover:border-copper/60",
            )}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="font-brand text-base text-umber">{rate.name}</p>
                <p className="mt-1 text-sm text-muted-foreground">{rate.pitch}</p>
              </div>
              <div className="shrink-0 text-right">
                <p className="text-2xl leading-none text-foreground">
                  ${nightly}
                </p>
                <p className="eyebrow text-[10px] text-muted-foreground">per night</p>
              </div>
            </div>
            <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-border pt-3">
              <p className="text-xs text-muted-foreground">{rate.terms}</p>
              <p className="text-xs text-foreground">
                {nights > 0
                  ? `$${nightly * nights} total for ${nights} night${nights === 1 ? "" : "s"}`
                  : "Pick your dates for the total"}
              </p>
            </div>
          </button>
        );
      })}
    </div>
  );
}
