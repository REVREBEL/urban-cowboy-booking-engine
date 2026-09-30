import React, { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface InlineDateRangePickerProps {
  checkIn: string;
  checkOut: string;
  onChange: (checkIn: string, checkOut: string) => void;
  minDate?: string;
  dailyRates?: Record<string, DailyRate>;
  formatRate?: (rate: DailyRate) => string;
}

export interface DailyRate {
  amount: number;
  currency?: string;
  available?: boolean;
}

const pad = (value: number) => String(value).padStart(2, '0');
const toIso = (year: number, month: number, day: number) =>
  `${year}-${pad(month + 1)}-${pad(day)}`;

const fromIso = (value: string) => {
  const [year, month, day] = value.split('-').map(Number);
  return { year, month: month - 1, day };
};

const monthCells = (year: number, month: number): Array<string | null> => {
  const mondayIndex = (new Date(Date.UTC(year, month, 1)).getUTCDay() + 6) % 7;
  const dayCount = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
  return [
    ...Array<string | null>(mondayIndex).fill(null),
    ...Array.from({ length: dayCount }, (_, index) => toIso(year, month, index + 1))
  ];
};

const shiftMonth = (year: number, month: number, amount: number) => {
  const next = new Date(Date.UTC(year, month + amount, 1));
  return { year: next.getUTCFullYear(), month: next.getUTCMonth() };
};

const monthName = (year: number, month: number) =>
  new Intl.DateTimeFormat('en-US', {
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC'
  }).format(new Date(Date.UTC(year, month, 1)));

export const InlineDateRangePicker: React.FC<InlineDateRangePickerProps> = ({
  checkIn,
  checkOut,
  onChange,
  minDate = new Date().toISOString().slice(0, 10),
  dailyRates,
  formatRate = (rate) =>
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: rate.currency || 'USD',
      maximumFractionDigits: 0
    }).format(rate.amount)
}) => {
  const initial = fromIso(checkIn || minDate);
  const [view, setView] = useState({ year: initial.year, month: initial.month });
  const [hoveredDate, setHoveredDate] = useState<string | null>(null);
  const months = [view, shiftMonth(view.year, view.month, 1)];
  const hasDailyRates = Boolean(dailyRates && Object.keys(dailyRates).length > 0);
  const previewEnd = !checkOut && hoveredDate && hoveredDate > checkIn ? hoveredDate : checkOut;

  const nightCount = useMemo(() => {
    if (!checkIn || !checkOut) return 0;
    return Math.max(
      0,
      Math.round(
        (new Date(`${checkOut}T00:00:00Z`).getTime() -
          new Date(`${checkIn}T00:00:00Z`).getTime()) /
          86_400_000
      )
    );
  }, [checkIn, checkOut]);

  const selectDate = (date: string) => {
    if (date < minDate) return;
    if (!checkIn || checkOut || date <= checkIn) {
      onChange(date, '');
      setHoveredDate(null);
      return;
    }
    onChange(checkIn, date);
    setHoveredDate(null);
  };

  return (
    <div className="rounded-2xl border border-[#4E332D]/15 bg-white p-4 sm:p-5">
      <div className="mb-4 flex items-center justify-between">
        <button
          type="button"
          aria-label="Previous month"
          onClick={() => setView(shiftMonth(view.year, view.month, -1))}
          className="grid h-9 w-9 place-items-center rounded-full text-[#4E332D] transition hover:bg-[#EBE8E0]"
        >
          <ChevronLeft className="h-4 w-4" aria-hidden="true" />
        </button>
        <p className="font-brothers text-sm uppercase tracking-[1.5px] text-[#4E332D]">
          {nightCount > 0 ? `${nightCount} night${nightCount === 1 ? '' : 's'} selected` : 'Select your dates'}
        </p>
        <button
          type="button"
          aria-label="Next month"
          onClick={() => setView(shiftMonth(view.year, view.month, 1))}
          className="grid h-9 w-9 place-items-center rounded-full text-[#4E332D] transition hover:bg-[#EBE8E0]"
        >
          <ChevronRight className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>

      <div className="grid gap-7 md:grid-cols-[minmax(0,1fr)_1px_minmax(0,1fr)]">
        {months.map((calendarMonth, monthIndex) => (
          <React.Fragment key={`${calendarMonth.year}-${calendarMonth.month}`}>
          {monthIndex === 1 && (
            <div
              className="hidden self-stretch bg-gradient-to-b from-transparent via-[#4E332D]/15 to-transparent md:block"
              aria-hidden="true"
            />
          )}
          <div className={monthIndex === 1 ? 'hidden md:block' : ''}>
            <p className="mb-3 text-center font-uchen text-sm text-[#4E332D]">
              {monthName(calendarMonth.year, calendarMonth.month)}
            </p>
            <div className="grid grid-cols-7 text-center">
              {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((weekday, index) => (
                <span
                  key={`${weekday}-${index}`}
                  className="pb-2 font-brothers text-[10px] uppercase text-[#4E332D]/45"
                >
                  {weekday}
                </span>
              ))}
              {monthCells(calendarMonth.year, calendarMonth.month).map((date, index) => {
                if (!date) return <span key={`blank-${index}`} className={hasDailyRates ? 'h-14' : 'h-10'} />;
                const rate = dailyRates?.[date];
                const unavailable = rate?.available === false;
                const disabled = date < minDate || unavailable;
                const start = date === checkIn;
                const end = Boolean(previewEnd && date === previewEnd && date !== checkIn);
                const inRange = Boolean(checkIn && previewEnd && date > checkIn && date < previewEnd);
                return (
                  <div
                    key={date}
                    className={`relative ${hasDailyRates ? 'h-14' : 'h-10'} ${inRange ? 'bg-[#9A5636]/10' : ''}`}
                    onMouseEnter={() => !disabled && setHoveredDate(date)}
                    onMouseLeave={() => setHoveredDate(null)}
                  >
                    <button
                      type="button"
                      disabled={disabled}
                      onClick={() => selectDate(date)}
                      aria-label={`${date}${rate ? `, ${unavailable ? 'unavailable' : formatRate(rate)}` : ''}`}
                      aria-pressed={start || end}
                      className={`group absolute inset-0 flex w-full flex-col items-center justify-center font-uchen transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#9A5636] ${
                        disabled
                          ? 'cursor-not-allowed'
                          : 'text-[#4E332D]'
                      }`}
                    >
                      <span
                        className={`grid h-9 w-9 place-items-center rounded-full text-sm transition ${
                          disabled
                            ? 'text-[#4E332D]/20 line-through'
                            : start || end
                              ? 'bg-[#4E332D] text-[#FAF9F9]'
                              : 'text-[#4E332D] group-hover:bg-[#9A5636] group-hover:text-[#FAF9F9]'
                        }`}
                      >
                        {fromIso(date).day}
                      </span>
                      {rate && (
                        <span
                          className={`mt-0.5 font-brothers text-[9px] leading-none ${
                            unavailable ? 'text-[#4E332D]/30' : 'text-[#4E332D]/65'
                          }`}
                        >
                          {unavailable ? 'Sold' : formatRate(rate)}
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
