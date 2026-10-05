import React, { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export interface DailyRate {
  amount: number;
  currency?: string;
  available?: boolean;
  minNights?: number;
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

const pad = (value: number) => String(value).padStart(2, "0");
const toIso = (year: number, month: number, day: number) => `${year}-${pad(month + 1)}-${pad(day)}`;

const fromIso = (value: string) => {
  const [year, month, day] = value.split("-").map(Number);
  return { year, month: month - 1, day };
};

const monthCells = (year: number, month: number): Array<string | null> => {
  const mondayIndex = (new Date(Date.UTC(year, month, 1)).getUTCDay() + 6) % 7;
  const dayCount = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
  return [
    ...Array<string | null>(mondayIndex).fill(null),
    ...Array.from({ length: dayCount }, (_, index) => toIso(year, month, index + 1)),
  ];
};

const shiftMonth = (year: number, month: number, amount: number) => {
  const next = new Date(Date.UTC(year, month + amount, 1));
  return { year: next.getUTCFullYear(), month: next.getUTCMonth() };
};

const addDays = (date: string, days: number) => {
  const value = new Date(`${date}T12:00:00Z`);
  value.setUTCDate(value.getUTCDate() + days);
  return value.toISOString().slice(0, 10);
};

const monthName = (year: number, month: number) =>
  new Intl.DateTimeFormat("en-US", { month: "long", year: "numeric", timeZone: "UTC" }).format(
    new Date(Date.UTC(year, month, 1)),
  );

export const InlineDateRangePicker: React.FC<InlineDateRangePickerProps> = ({
  checkIn,
  checkOut,
  onChange,
  minDate = new Date().toISOString().slice(0, 10),
  dailyRates,
  formatRate = (rate) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: rate.currency || "USD",
      maximumFractionDigits: 0,
    }).format(rate.amount),
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
  const hasDailyRates = Boolean(dailyRates && Object.keys(dailyRates).length > 0);
  const selectedMinimumNights = checkIn ? dailyRates?.[checkIn]?.minNights : undefined;
  const minimumCheckout = checkIn && selectedMinimumNights ? addDays(checkIn, selectedMinimumNights) : undefined;
  const previewEnd = !checkOut && hoveredDate && hoveredDate > checkIn ? hoveredDate : checkOut;

  const nightCount = useMemo(() => {
    if (!checkIn || !checkOut) return 0;
    return Math.max(
      0,
      Math.round(
        (new Date(`${checkOut}T00:00:00Z`).getTime() - new Date(`${checkIn}T00:00:00Z`).getTime()) /
          86_400_000,
      ),
    );
  }, [checkIn, checkOut]);

  const selectDate = (date: string) => {
    if (date < minDate) return;
    if (checkIn && !checkOut && date > checkIn && minimumCheckout && date < minimumCheckout) return;
    if (!checkIn || checkOut || date <= checkIn) {
      onChange(date, "");
    } else {
      onChange(checkIn, date);
    }
    setHoveredDate(null);
  };

  return (
    <div className="rounded-2xl border border-[#4E332D]/15 bg-white p-4 sm:p-5">
      <div className="mb-4 flex items-center justify-between">
        <button type="button" aria-label="Previous month" onClick={() => setView(shiftMonth(view.year, view.month, -1))} className="grid h-9 w-9 place-items-center rounded-full text-[#4E332D] transition hover:bg-[#EBE8E0] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#9A5636]">
          <ChevronLeft className="h-4 w-4" aria-hidden="true" />
        </button>
        <p className="font-brothers text-sm uppercase tracking-[1.5px] text-[#4E332D]">
          {nightCount > 0 ? `${nightCount} night${nightCount === 1 ? "" : "s"} selected` : "Select your dates"}
        </p>
        <button type="button" aria-label="Next month" onClick={() => setView(shiftMonth(view.year, view.month, 1))} className="grid h-9 w-9 place-items-center rounded-full text-[#4E332D] transition hover:bg-[#EBE8E0] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#9A5636]">
          <ChevronRight className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>

      <div className="grid gap-7 md:grid-cols-[minmax(0,1fr)_1px_minmax(0,1fr)]">
        {months.map((calendarMonth, monthIndex) => (
          <React.Fragment key={`${calendarMonth.year}-${calendarMonth.month}`}>
            {monthIndex === 1 && <div className="hidden self-stretch bg-gradient-to-b from-transparent via-[#4E332D]/15 to-transparent md:block" aria-hidden="true" />}
            <div className={monthIndex === 1 ? "hidden md:block" : ""}>
              <p className="mb-3 text-center font-uchen text-sm text-[#4E332D]">{monthName(calendarMonth.year, calendarMonth.month)}</p>
              <div role="grid" aria-label={monthName(calendarMonth.year, calendarMonth.month)} className="grid grid-cols-7 text-center">
                {["M", "T", "W", "T", "F", "S", "S"].map((weekday, index) => (
                  <span key={`${weekday}-${index}`} role="columnheader" className="pb-2 font-bianco text-[10px] font-bold uppercase text-[#4E332D]/45">{weekday}</span>
                ))}
                {monthCells(calendarMonth.year, calendarMonth.month).map((date, index) => {
                  if (!date) return <span key={`blank-${index}`} role="gridcell" className={hasDailyRates ? "h-14" : "h-10"} />;
                  const rate = dailyRates?.[date];
                  const unavailable = rate?.available === false && !rate.minNights;
                  const choosingCheckout = Boolean(checkIn && !checkOut && date > checkIn);
                  const minimumStayBlocked = Boolean(choosingCheckout && minimumCheckout && date < minimumCheckout);
                  // A sold night may still be used as the departure date because the guest
                  // does not occupy the room that night.
                  const disabled = date < minDate || minimumStayBlocked || (unavailable && !choosingCheckout);
                  const start = date === checkIn;
                  const end = Boolean(previewEnd && date === previewEnd && date !== checkIn);
                  const inRange = Boolean(checkIn && previewEnd && date > checkIn && date < previewEnd);
                  return (
                    <div key={date} role="gridcell" aria-selected={start || end || inRange} className={`relative ${hasDailyRates ? "h-14" : "h-10"} ${inRange ? "bg-[#9A5636]/10" : ""}`} onMouseEnter={() => !disabled && setHoveredDate(date)} onMouseLeave={() => setHoveredDate(null)}>
                      <button
                        type="button"
                        disabled={disabled}
                        onClick={() => selectDate(date)}
                        aria-label={`${date}${minimumStayBlocked && selectedMinimumNights ? `, checkout requires at least ${selectedMinimumNights} nights` : rate ? `, ${unavailable ? "unavailable" : rate.minNights ? `minimum ${rate.minNights} nights` : formatRate(rate)}` : ""}`}
                        aria-pressed={start || end}
                        className="group absolute inset-0 flex w-full flex-col items-center justify-center font-uchen transition focus-visible:outline-none"
                      >
                        <span className={`grid h-8 w-8 place-items-center rounded-full text-sm transition group-focus-visible:ring-2 group-focus-visible:ring-[#9A5636] group-focus-visible:ring-offset-2 ${minimumStayBlocked ? "text-[#4E332D]/20" : disabled ? "text-[#4E332D]/20 line-through" : start || end ? `bg-[#4E332D] text-[#FAF9F9] ${start && rate?.minNights ? "ring-2 ring-[#4E332D] ring-offset-2 ring-offset-white" : ""}` : "text-[#4E332D] group-hover:bg-[#9A5636] group-hover:text-[#FAF9F9]"}`}>
                          {fromIso(date).day}
                        </span>
                        {rate && <span className={`mt-1.5 font-bianco text-[9px] font-bold leading-none ${unavailable ? "text-[#4E332D]/30" : "text-[#4E332D]/65"}`}>{unavailable ? "Sold" : rate.minNights ? `Min ${rate.minNights}nt` : formatRate(rate)}</span>}
                        {rate?.minNights && (
                          <span role="tooltip" className="pointer-events-none absolute -top-7 z-20 whitespace-nowrap rounded bg-[#292326] px-2 py-1 font-bianco text-[10px] font-normal normal-case tracking-normal text-white opacity-0 shadow-md transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
                            Min. of {rate.minNights} nights.
                          </span>
                        )}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};
