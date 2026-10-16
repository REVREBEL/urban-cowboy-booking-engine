import React, { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { RestrictionAdvisory, RestrictionType } from "@/types/calendar-restrictions";

export interface DailyRate {
  amount: number;
  currency?: string;
  available?: boolean;
  minNights?: number;
  invalidStayLengths?: number[];
  restrictions?: RestrictionAdvisory[];
}

interface InlineDateRangePickerProps {
  checkIn: string;
  checkOut: string;
  onChange: (checkIn: string, checkOut: string) => void;
  minDate?: string;
  dailyRates?: Record<string, DailyRate>;
  formatRate?: (rate: DailyRate) => string;
  onVisibleRangeChange?: (startDate: string, endDate: string) => void;
}

const RESTRICTION_LABELS: Record<RestrictionType, string> = {
  ClosedToArrival: "Check-in restrictions",
  ClosedToDeparture: "Check-out restrictions",
  ClosedToStay: "Stay restrictions",
};

/** Category/rate-specific hints; always use Search for an authoritative answer. */
function restrictionNote(rate: DailyRate | undefined): string {
  if (!rate?.restrictions?.length) return "";
  const kinds = [...new Set(rate.restrictions.map((item) => RESTRICTION_LABELS[item.type]))];
  return `${kinds.join(", ")} may affect some room types or rates; Search checks your exact stay.`;
}

const pad = (value: number) => String(value).padStart(2, "0");
const toIso = (year: number, month: number, day: number) => `${year}-${pad(month + 1)}-${pad(day)}`;

const fromIso = (value: string) => {
  const [year, month, day] = value.split("-").map(Number);
  return { year, month: month - 1, day };
};

// Module-level caches for expensive Intl instances and month cell calculations
// to avoid GC pressure and repeated allocations during high-frequency mouseover events.
const monthNameFmt = new Intl.DateTimeFormat("en-US", { month: "long", year: "numeric", timeZone: "UTC" });
const rateNumFmtCache = new Map<string, Intl.NumberFormat>();

function defaultFormatRate(rate: DailyRate): string {
  const currency = rate.currency || "USD";
  let fmt = rateNumFmtCache.get(currency);
  if (!fmt) {
    fmt = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    });
    rateNumFmtCache.set(currency, fmt);
  }
  return fmt.format(rate.amount);
}

export interface MonthCell {
  date: string;
  time: number;
  dayNum: number;
}

const monthCellsCache = new Map<string, Array<MonthCell | null>>();
const monthCells = (year: number, month: number): Array<MonthCell | null> => {
  const key = `${year}-${month}`;
  let cached = monthCellsCache.get(key);
  if (!cached) {
    const mondayIndex = (new Date(Date.UTC(year, month, 1)).getUTCDay() + 6) % 7;
    const dayCount = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
    // Reserve six weeks for every month so changing months cannot shift an
    // upward-anchored dropdown or the booking controls underneath it.
    cached = Array<MonthCell | null>(mondayIndex).fill(null);
    for (let day = 1; day <= dayCount; day++) {
      const date = toIso(year, month, day);
      const time = Date.UTC(year, month, day);
      cached.push({ date, time, dayNum: day });
    }
    cached.push(...Array<MonthCell | null>(42 - cached.length).fill(null));
    monthCellsCache.set(key, cached);
  }
  return cached;
};

const shiftMonth = (year: number, month: number, amount: number) => {
  const next = new Date(Date.UTC(year, month + amount, 1));
  return { year: next.getUTCFullYear(), month: next.getUTCMonth() };
};

const monthName = (year: number, month: number) =>
  monthNameFmt.format(new Date(Date.UTC(year, month, 1)));

const monthDayFmt = new Intl.DateTimeFormat("en-US", {
  month: "long",
  day: "numeric",
  timeZone: "UTC",
});
const fullDateFmt = new Intl.DateTimeFormat("en-US", {
  month: "long",
  day: "numeric",
  year: "numeric",
  timeZone: "UTC",
});

const formatSelectedRange = (checkIn: string, checkOut: string) => {
  const start = new Date(`${checkIn}T00:00:00Z`);
  const end = new Date(`${checkOut}T00:00:00Z`);
  const sameYear = start.getUTCFullYear() === end.getUTCFullYear();
  const sameMonth = sameYear && start.getUTCMonth() === end.getUTCMonth();

  if (sameMonth) return `${monthDayFmt.format(start)}–${end.getUTCDate()}, ${end.getUTCFullYear()}`;
  if (sameYear) return `${monthDayFmt.format(start)} – ${fullDateFmt.format(end)}`;
  return `${fullDateFmt.format(start)} – ${fullDateFmt.format(end)}`;
};

export const InlineDateRangePicker: React.FC<InlineDateRangePickerProps> = ({
  checkIn,
  checkOut,
  onChange,
  minDate = new Date().toISOString().slice(0, 10),
  dailyRates,
  formatRate = defaultFormatRate,
  onVisibleRangeChange,
}) => {
  const initial = fromIso(checkIn || minDate);
  const [view, setView] = useState({ year: initial.year, month: initial.month });
  const [hoveredDate, setHoveredDate] = useState<string | null>(null);
  const months = [view, shiftMonth(view.year, view.month, 1)];
  useEffect(() => {
    if (!onVisibleRangeChange) return;
    const startDate = toIso(view.year, view.month, 1);
    const afterSecondMonth = shiftMonth(view.year, view.month, 2);
    onVisibleRangeChange(startDate, toIso(afterSecondMonth.year, afterSecondMonth.month, 1));
  }, [view.year, view.month, onVisibleRangeChange]);
  const selectedRate = checkIn ? dailyRates?.[checkIn] : undefined;
  const selectedMinimumNights = selectedRate?.minNights;
  const previewEnd = !checkOut && hoveredDate && hoveredDate > checkIn ? hoveredDate : checkOut;

  const selectDate = (date: string) => {
    if (date < minDate) return;
    if (!checkIn || checkOut || date <= checkIn) {
      onChange(date, "");
    } else {
      onChange(checkIn, date);
    }
    setHoveredDate(null);
  };

  return (
    <div className="rounded-2xl border border-input-foreground/15 bg-input p-4 text-foreground sm:p-5">
      <div className="mb-4 flex items-center justify-between">
        <button
          type="button"
          aria-label="Previous month"
          onClick={() => setView(shiftMonth(view.year, view.month, -1))}
          className="grid h-9 w-9 place-items-center rounded-full text-(--calendar-date-foreground) transition hover:bg-(--calendar-date-hover-bg) hover:text-(--calendar-date-hover-foreground) focus-visible:outline-2 focus-visible:outline-(--calendar-date-focus-ring)"
        >
          <ChevronLeft className="h-4 w-4" aria-hidden="true" />
        </button>
        <p className="min-w-0 flex-1 truncate px-2 text-center font-label text-sm uppercase tracking-[1.5px] text-(--calendar-date-foreground)">
          {checkIn && checkOut ? formatSelectedRange(checkIn, checkOut) : "Select your dates"}
        </p>
        <button
          type="button"
          aria-label="Next month"
          onClick={() => setView(shiftMonth(view.year, view.month, 1))}
          className="grid h-9 w-9 place-items-center rounded-full text-(--calendar-date-foreground) transition hover:bg-(--calendar-date-hover-bg) hover:text-(--calendar-date-hover-foreground) focus-visible:outline-2 focus-visible:outline-(--calendar-date-focus-ring)"
        >
          <ChevronRight className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>

      <div className="grid gap-7 md:grid-cols-[minmax(0,1fr)_1px_minmax(0,1fr)]">
        {months.map((calendarMonth, monthIndex) => (
          <React.Fragment key={`${calendarMonth.year}-${calendarMonth.month}`}>
            {monthIndex === 1 && (
              <div
                className="hidden self-stretch bg-linear-to-b from-transparent via-foreground/15 to-transparent md:block"
                aria-hidden="true"
              />
            )}
            <div className={monthIndex === 1 ? "hidden md:block" : ""}>
              <p className="mb-3 text-center font-body text-sm text-(--calendar-date-foreground)">
                {monthName(calendarMonth.year, calendarMonth.month)}
              </p>
              <div
                role="grid"
                aria-label={monthName(calendarMonth.year, calendarMonth.month)}
                className="grid grid-cols-7 text-center"
              >
                {["M", "T", "W", "T", "F", "S", "S"].map((weekday, index) => (
                  <span
                    key={`${weekday}-${index}`}
                    role="columnheader"
                    className="pb-2 font-number text-[10px] font-bold uppercase text-(--calendar-date-muted-foreground)"
                  >
                    {weekday}
                  </span>
                ))}
                {(() => {
                  const checkInTime = checkIn ? Date.parse(`${checkIn}T00:00:00Z`) : 0;
                  return monthCells(calendarMonth.year, calendarMonth.month).map((cell, index) => {
                    if (!cell) return <span key={`blank-${index}`} role="gridcell" className="h-14" />;
                    const { date, time, dayNum } = cell;
                    const rate = dailyRates?.[date];
                    const unavailable = rate?.available === false && !rate.minNights;
                    const serviceNote = restrictionNote(rate);
                    const choosingCheckout = Boolean(checkIn && !checkOut && date > checkIn);
                    const candidateNights = choosingCheckout && checkIn
                      ? Math.max(
                          0,
                          Math.round((time - checkInTime) / 86_400_000),
                        )
                      : 0;
                    const minimumStayAdvisory = Boolean(
                      choosingCheckout &&
                        selectedMinimumNights &&
                        candidateNights < selectedMinimumNights,
                    );
                    const stayThroughAdvisory = Boolean(
                      choosingCheckout &&
                        selectedRate?.invalidStayLengths?.includes(candidateNights),
                    );
                    const restrictionAdvisory = minimumStayAdvisory || stayThroughAdvisory;
                    // The shared calendar is only a cached two-adult snapshot. Keep its sold
                    // state visible as guidance, but leave every future date selectable so the
                    // guest can build a range and let live Search validate exact occupancy.
                    const disabled = date < minDate;
                    const start = date === checkIn;
                    const end = Boolean(previewEnd && date === previewEnd && date !== checkIn);
                    const inRange = Boolean(checkIn && previewEnd && date > checkIn && date < previewEnd);
                    return (
                      <div
                        key={date}
                        role="gridcell"
                        aria-selected={start || end || inRange}
                        className={`relative h-14 ${inRange ? "bg-(--calendar-date-range-bg)" : ""}`}
                        onMouseEnter={() => !disabled && setHoveredDate(date)}
                        onMouseLeave={() => setHoveredDate(null)}
                      >
                        <button
                          type="button"
                          disabled={disabled}
                          onClick={() => selectDate(date)}
                          aria-label={`${date}${restrictionAdvisory ? ", cached calendar restriction may affect this stay; Search will verify live availability" : rate ? `, ${unavailable ? "availability not confirmed" : rate.minNights ? `minimum ${rate.minNights} nights` : formatRate(rate)}` : ""}${serviceNote ? `, ${serviceNote}` : ""}`}
                          aria-pressed={start || end}
                          className="group absolute inset-0 flex w-full flex-col items-center justify-center font-number transition focus-visible:outline-none"
                        >
                          <span
                            className={`grid h-8 w-8 place-items-center rounded-full text-sm transition group-focus-visible:ring-2 group-focus-visible:ring-(--calendar-date-focus-ring) group-focus-visible:ring-offset-2 group-focus-visible:ring-offset-(--calendar-date-ring-offset-bg) ${
                              disabled
                                ? "text-(--calendar-date-disabled-foreground) line-through"
                                : start || end
                                  ? `bg-(--calendar-date-selected-bg) text-(--calendar-date-selected-foreground) ${start && rate?.minNights ? "ring-2 ring-(--calendar-date-selected-bg) ring-offset-2 ring-offset-(--calendar-date-ring-offset-bg)" : ""}`
                                  : unavailable
                                    ? "text-(--calendar-date-disabled-foreground) line-through"
                                  : restrictionAdvisory
                                    ? "text-(--calendar-date-restricted-foreground) ring-1 ring-(--calendar-date-restricted-ring)"
                                    : "text-(--calendar-date-foreground) group-hover:bg-(--calendar-date-hover-bg) group-hover:text-(--calendar-date-hover-foreground)"
                            }`}
                          >
                            {dayNum}
                          </span>
                        {rate && (
                          <span
                            className={`mt-1.5 font-number text-[9px] font-bold leading-none ${unavailable ? "text-(--calendar-date-rate-unavailable-foreground)" : "text-(--calendar-date-rate-foreground)"}`}
                          >
                            {unavailable ? (serviceNote ? "Check" : "Sold") : rate.minNights ? `Min ${rate.minNights}nt` : formatRate(rate)}
                          </span>
                        )}
                        {(rate?.minNights || serviceNote) && (
                          <span
                            role="tooltip"
                            className="pointer-events-none absolute -top-7 z-20 whitespace-nowrap rounded bg-(--calendar-tooltip-bg) px-2 py-1 font-number text-[10px] font-normal normal-case tracking-normal text-(--calendar-tooltip-foreground) opacity-0 shadow-md transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100"
                          >
                            {rate?.minNights ? `Min. of ${rate.minNights} nights. ` : ""}{serviceNote}
                          </span>
                        )}
                      </button>
                    </div>
                  );
                });
              })()}
              </div>
            </div>
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};
