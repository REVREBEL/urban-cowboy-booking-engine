import { useState, useEffect, useRef } from 'react';

type Props = {
  value: string; // YYYY-MM-DD
  onChange: (date: string) => void;
  label: string;
  min?: string;
  placeholder?: string;
};

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];
const DOW = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

function pad(n: number) {
  return String(n).padStart(2, '0');
}

function toYMD(year: number, month: number, day: number) {
  return `${year}-${pad(month + 1)}-${pad(day)}`;
}

function parseYMD(s: string): { year: number; month: number; day: number } | null {
  if (!s) return null;
  const [y, m, d] = s.split('-').map(Number);
  return { year: y, month: m - 1, day: d };
}

function daysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function firstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}

function fmt(s: string) {
  const p = parseYMD(s);
  if (!p) return '';
  return new Date(s + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export default function DatePicker({ value, onChange, label, min, placeholder = 'Select date' }: Props) {
  const today = new Date().toISOString().split('T')[0];
  const minDate = min || today;

  const parsed = parseYMD(value);
  const minParsed = parseYMD(minDate);

  const initYear = parsed?.year ?? (minParsed?.year ?? new Date().getFullYear());
  const initMonth = parsed?.month ?? (minParsed?.month ?? new Date().getMonth());

  const [open, setOpen] = useState(false);
  const [viewYear, setViewYear] = useState(initYear);
  const [viewMonth, setViewMonth] = useState(initMonth);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handle(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, []);

  function prevMonth() {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
    else setViewMonth(m => m - 1);
  }
  function nextMonth() {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
    else setViewMonth(m => m + 1);
  }

  function selectDay(day: number) {
    const ymd = toYMD(viewYear, viewMonth, day);
    onChange(ymd);
    setOpen(false);
  }

  function isDisabled(day: number) {
    const ymd = toYMD(viewYear, viewMonth, day);
    return ymd < minDate;
  }

  function isSelected(day: number) {
    return value === toYMD(viewYear, viewMonth, day);
  }

  const totalDays = daysInMonth(viewYear, viewMonth);
  const startDow = firstDayOfMonth(viewYear, viewMonth);

  // cells = blanks + days
  const cells: (number | null)[] = [
    ...Array(startDow).fill(null),
    ...Array.from({ length: totalDays }, (_, i) => i + 1),
  ];
  // pad to full weeks
  while (cells.length % 7 !== 0) cells.push(null);

  return (
    <div ref={ref} className="relative">
      {/* Trigger */}
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="w-full text-left"
        aria-label={label}
        aria-expanded={open}
      >
        <p
          className="text-[10px] tracking-widest uppercase text-[#9a5636] mb-1"
          style={{ fontFamily: 'var(--font-brothers)' }}
        >
          {label}
        </p>
        <p
          className="text-base min-h-[1.5rem]"
          style={{
            fontFamily: 'var(--font-uchen)',
            color: value ? '#4e332d' : '#ccc7bb',
          }}
        >
          {value ? fmt(value) : placeholder}
        </p>
      </button>

      {/* Calendar dropdown */}
      {open && (
        <div
          className="absolute top-full left-0 mt-2 z-50 bg-white rounded-2xl shadow-2xl border border-[#ebe8e0] overflow-hidden"
          style={{ width: 280 }}
          role="dialog"
          aria-label={`Calendar for ${label}`}
        >
          {/* Month nav */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-[#ebe8e0]">
            <button
              type="button"
              onClick={prevMonth}
              className="w-7 h-7 rounded-full hover:bg-[#ebe8e0] flex items-center justify-center text-[#4e332d] transition-colors"
              aria-label="Previous month"
            >
              ‹
            </button>
            <span
              className="text-sm text-[#4e332d]"
              style={{ fontFamily: 'var(--font-brothers)', fontWeight: 700 }}
            >
              {MONTHS[viewMonth]} {viewYear}
            </span>
            <button
              type="button"
              onClick={nextMonth}
              className="w-7 h-7 rounded-full hover:bg-[#ebe8e0] flex items-center justify-center text-[#4e332d] transition-colors"
              aria-label="Next month"
            >
              ›
            </button>
          </div>

          {/* Day-of-week headers */}
          <div className="grid grid-cols-7 px-3 pt-2 pb-1">
            {DOW.map(d => (
              <div
                key={d}
                className="text-center text-[10px] text-[#767470] py-1"
                style={{ fontFamily: 'var(--font-inter)' }}
              >
                {d}
              </div>
            ))}
          </div>

          {/* Day grid */}
          <div className="grid grid-cols-7 px-3 pb-3 gap-y-0.5">
            {cells.map((day, i) => (
              <div key={i} className="flex items-center justify-center">
                {day === null ? null : (
                  <button
                    type="button"
                    onClick={() => !isDisabled(day) && selectDay(day)}
                    disabled={isDisabled(day)}
                    className={[
                      'w-8 h-8 rounded-full text-sm transition-colors',
                      isSelected(day)
                        ? 'bg-[#9a5636] text-white font-bold'
                        : isDisabled(day)
                        ? 'text-[#ccc7bb] cursor-not-allowed'
                        : 'text-[#4e332d] hover:bg-[#ebe8e0] cursor-pointer',
                    ].join(' ')}
                    style={{ fontFamily: 'var(--font-uchen)' }}
                    aria-label={`${MONTHS[viewMonth]} ${day}, ${viewYear}`}
                    aria-pressed={isSelected(day)}
                  >
                    {day}
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
