import { useEffect, useRef } from "react";
import { Button } from "@/components/ui/Button";
import { InlineDateRangePicker, type DailyRate } from "./InlineDateRangePicker";

const QUICK_DATE_RANGES = [
  ["Fall Foliage (Oct 14–17)", "2026-10-14", "2026-10-17"],
  ["Summer Solstice (Jun 2–5)", "2027-06-02", "2027-06-05"],
  ["Cozy Fireside Weekend (Nov 5–8)", "2026-11-05", "2026-11-08"],
] as const;

interface DateSearchDropdownProps {
  variant?: "confirm" | "external-actions";
  checkIn: string;
  checkOut: string;
  dailyRates: Record<string, DailyRate>;
  showQuickSelect?: boolean;
  onChange: (checkIn: string, checkOut: string) => void;
  onClose: () => void;
  onVisibleRangeChange: (startDate: string, endDate: string) => void;
  triggerRef?: React.RefObject<HTMLElement | null>;
}

export function DateSearchDropdown({
  variant = "confirm",
  checkIn,
  checkOut,
  dailyRates,
  showQuickSelect = true,
  onChange,
  onClose,
  onVisibleRangeChange,
  triggerRef: externalTriggerRef,
}: DateSearchDropdownProps) {
  const hasCompleteRange = Boolean(checkIn && checkOut && checkOut > checkIn);
  const dialogRef = useRef<HTMLDivElement>(null);
  const restoreFocus = () => {
    const trigger = externalTriggerRef?.current;
    if (trigger?.isConnected) trigger.focus();
  };

  useEffect(() => {
    dialogRef.current?.focus();
  }, []);

  // Restore focus only on explicit dismissal, never when switching sections.
  const handleDismiss = () => {
    onClose();
    restoreFocus();
  };

  useEffect(() => {
    const handleDocumentKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape" || event.defaultPrevented) return;
      const target = event.target;
      if (!(target instanceof HTMLElement)) return;
      const dialog = dialogRef.current;
      const trigger = externalTriggerRef?.current;
      // The keyboard can move to another search-bar control while Dates
      // remains open. Do not intercept Escape in an unrelated overlay.
      const withinDates = Boolean(dialog?.contains(target));
      const withinSearch = Boolean(trigger?.closest('[role="search"]')?.contains(target));
      const otherDialog = target.closest('[role="dialog"]');
      if ((!withinDates && !withinSearch) || (otherDialog && otherDialog !== dialog)) return;

      event.preventDefault();
      event.stopImmediatePropagation();
      onClose();
      // Switching focus into another section must not be undone.
      if (withinDates || target === trigger) restoreFocus();
    };

    document.addEventListener("keydown", handleDocumentKeyDown, true);
    return () => document.removeEventListener("keydown", handleDocumentKeyDown, true);
  }, [onClose, externalTriggerRef]);

  return (
    <div
      ref={dialogRef}
      tabIndex={-1}
      role="dialog"
      aria-label="Select dates of stay"
      className="w-full rounded-3xl border-2 border-input-border bg-input p-4 text-foreground shadow-2xl focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-input-border sm:p-6"
    >
      <div className="mb-4 flex items-center justify-between border-b border-input-border/20 pb-3 text-left">
        <span className="font-number text-sm font-bold uppercase tracking-[2px] text-foreground">
          Select dates of stay
        </span>
        <div className="flex shrink-0 items-center gap-2">
          <Button
            type="button"
            variant="transparent"
            colorScheme="smoke"
            size="xsmall"
            className="underline underline-offset-4"
            style={{ padding: "4px 6px", fontWeight: 400 }}
            disabled={!checkIn && !checkOut}
            onClick={() => onChange("", "")}
          >
            Clear
          </Button>
          <Button
            type="button"
            aria-label="Close date picker"
            variant="transparent"
            colorScheme="smoke"
            size="xsmall"
            className="size-8 rounded-full p-0!"
            onClick={handleDismiss}
          >
            ×
          </Button>
        </div>
      </div>

      <InlineDateRangePicker
        checkIn={checkIn}
        checkOut={checkOut}
        onChange={onChange}
        dailyRates={dailyRates}
        onVisibleRangeChange={onVisibleRangeChange}
      />

      {(showQuickSelect || variant === "confirm") && (
        <div className="mt-4 flex flex-col gap-4 border-t border-cowboy-umber/10 pt-4 text-left sm:flex-row sm:items-end sm:justify-between">
          {showQuickSelect && (
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
              <span className="font-number text-[10px] font-bold uppercase tracking-[1.5px] text-foreground/60">
                Quick Select
              </span>
              <div className="flex flex-wrap gap-2">
                {QUICK_DATE_RANGES.map(([rangeLabel, rangeCheckIn, rangeCheckOut]) => (
                  <button
                    key={rangeLabel}
                    type="button"
                    onClick={() => onChange(rangeCheckIn, rangeCheckOut)}
                    className="rounded-full border border-input-border bg-transparent px-3 pb-1 pt-1.5 font-body text-xs leading-none text-foreground transition-colors hover:bg-foreground hover:text-background focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                  >
                    {rangeLabel}
                  </button>
                ))}
              </div>
            </div>
          )}

          {variant === "confirm" && (
            <Button
              type="button"
              disabled={!hasCompleteRange}
              onClick={handleDismiss}
              variant="filled"
              colorScheme="cowboy-umber"
              size="small"
              className="self-end rounded-full uppercase tracking-[1.5px] sm:shrink-0"
            >
              Confirm dates
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
