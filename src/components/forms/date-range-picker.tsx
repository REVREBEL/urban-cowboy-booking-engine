import { useEffect, useId, useRef, useState } from "react";
import { fmtDate, isoDay, nights } from "@/lib/format";
import { t } from "@/i18n";
import { getLang, LOCALE } from "@/lib/lang";
import { IconCalendar, IconChevron } from "@/components/icons/cowboy-icons";

const WEEKDAYS_FR = ["lun", "mar", "mer", "jeu", "ven", "sam", "dim"];
const WEEKDAYS_EN = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];
const pad = (n: number) => String(n).padStart(2, "0");
const iso = (y: number, m: number, d: number) => `${y}-${pad(m + 1)}-${pad(d)}`;
const monthLabel = (y: number, m: number) =>
  new Intl.DateTimeFormat(LOCALE[getLang()], { month: "long", year: "numeric", timeZone: "UTC" }).format(
    new Date(Date.UTC(y, m, 1)),
  );

function monthCells(y: number, m: number): (string | null)[] {
  const startWeekday = (new Date(Date.UTC(y, m, 1)).getUTCDay() + 6) % 7;
  const count = new Date(Date.UTC(y, m + 1, 0)).getUTCDate();
  const cells: (string | null)[] = Array(startWeekday).fill(null);
  for (let d = 1; d <= count; d++) cells.push(iso(y, m, d));
  return cells;
}

function dateParts(day: string) {
  const d = new Date(`${day}T00:00:00Z`);
  return { y: d.getUTCFullYear(), m: d.getUTCMonth(), d: d.getUTCDate() };
}

function addDays(day: string, amount: number): string {
  const d = new Date(`${day}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + amount);
  return iso(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
}

function addMonths(day: string, amount: number): string {
  const current = dateParts(day);
  const first = new Date(Date.UTC(current.y, current.m + amount, 1));
  const lastDay = new Date(
    Date.UTC(first.getUTCFullYear(), first.getUTCMonth() + 1, 0),
  ).getUTCDate();
  return iso(first.getUTCFullYear(), first.getUTCMonth(), Math.min(current.d, lastDay));
}

export function DateRangePicker({
  checkIn,
  checkOut,
  onChange,
  minDate = isoDay(0),
}: {
  checkIn: string;
  checkOut: string;
  onChange: (checkIn: string, checkOut: string) => void;
  minDate?: string;
}) {
  const pickerId = useId();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [hover, setHover] = useState<string | null>(null);
  const [focusedDay, setFocusedDay] = useState(checkIn || minDate);

  const seed = checkIn || minDate;
  const [view, setView] = useState(() => {
    const d = dateParts(seed);
    return { y: d.y, m: d.m };
  });

  function setViewForDay(day: string) {
    const d = dateParts(day);
    setView({ y: d.y, m: d.m });
  }

  function focusDay(day: string) {
    setFocusedDay(day);
    requestAnimationFrame(() => {
      popoverRef.current
        ?.querySelector<HTMLButtonElement>(`button[data-date="${day}"]`)
        ?.focus();
    });
  }

  function openPicker() {
    const target = checkIn && checkIn >= minDate ? checkIn : minDate;
    setViewForDay(target);
    setFocusedDay(target);
    setOpen(true);
    requestAnimationFrame(() => {
      requestAnimationFrame(() => focusDay(target));
    });
  }

  function closePicker(restoreFocus = true) {
    setOpen(false);
    setHover(null);
    if (restoreFocus) requestAnimationFrame(() => triggerRef.current?.focus());
  }

  useEffect(() => {
    if (open) return;
    const target = checkIn && checkIn >= minDate ? checkIn : minDate;
    setViewForDay(target);
    setFocusedDay(target);
  }, [checkIn, minDate, open]);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) closePicker(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        closePicker(true);
      }
    };
    document.addEventListener("mousedown", onDoc);
    window.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const n = checkIn && checkOut ? nights(checkIn, checkOut) : 0;
  const weekdays = getLang() === "en" ? WEEKDAYS_EN : WEEKDAYS_FR;

  function pick(day: string) {
    if (day < minDate) return;
    if (!checkIn || checkOut) {
      onChange(day, "");
      setFocusedDay(day);
    } else if (day <= checkIn) {
      onChange(day, "");
      setFocusedDay(day);
    } else {
      onChange(checkIn, day);
      setTimeout(() => closePicker(true), 180);
    }
  }

  function moveKeyboard(day: string, event: React.KeyboardEvent<HTMLButtonElement>) {
    let target: string | null = null;
    if (event.key === "ArrowLeft") target = addDays(day, -1);
    else if (event.key === "ArrowRight") target = addDays(day, 1);
    else if (event.key === "ArrowUp") target = addDays(day, -7);
    else if (event.key === "ArrowDown") target = addDays(day, 7);
    else if (event.key === "PageUp") target = addMonths(day, -1);
    else if (event.key === "PageDown") target = addMonths(day, 1);
    else if (event.key === "Home") {
      const weekday = (new Date(`${day}T00:00:00Z`).getUTCDay() + 6) % 7;
      target = addDays(day, -weekday);
    } else if (event.key === "End") {
      const weekday = (new Date(`${day}T00:00:00Z`).getUTCDay() + 6) % 7;
      target = addDays(day, 6 - weekday);
    } else {
      return;
    }

    event.preventDefault();
    if (!target || target < minDate) target = minDate;

    const p = dateParts(target);
    // Keep the keyboard target in the first rendered month. This also works on
    // mobile, where the second desktop month is present in the DOM but hidden.
    if (p.y !== view.y || p.m !== view.m) setView({ y: p.y, m: p.m });
    focusDay(target);
  }

  const previewEnd = !checkOut && hover && checkIn && hover > checkIn ? hover : checkOut;
  const inRange = (day: string) => !!checkIn && !!previewEnd && day > checkIn && day < previewEnd;

  function shiftMonth(delta: number) {
    setView((v) => {
      const m = v.m + delta;
      return { y: v.y + Math.floor(m / 12), m: ((m % 12) + 12) % 12 };
    });
  }

  const canGoPrev = iso(view.y, view.m, 1) > minDate;
  const months = [view, { y: view.y + (view.m === 11 ? 1 : 0), m: (view.m + 1) % 12 }];

  return (
    <div ref={wrapRef} className="relative">
      <button
        ref={triggerRef}
        type="button"
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={pickerId}
        onClick={() => (open ? closePicker(false) : openPicker())}
        className="flex w-full items-stretch overflow-hidden rounded-2xl border border-smoke/15 bg-white text-left transition hover:border-turquoise"
      >
        <Segment
          label={t("datePicker.checkIn")}
          value={checkIn ? fmtDate(checkIn) : t("datePicker.when")}
          active={open && !checkIn}
          icon
        />
        <span className="my-2 w-px bg-smoke/10" />
        <Segment
          label={t("datePicker.checkOut")}
          value={checkOut ? fmtDate(checkOut) : t("datePicker.when")}
          active={open && !!checkIn && !checkOut}
        />
      </button>

      {open && (
        <div
          id={pickerId}
          ref={popoverRef}
          role="dialog"
          aria-modal="false"
          aria-label={t("datePicker.selectDates")}
          className="absolute left-0 right-0 z-50 mt-2 animate-scale-in rounded-2xl border border-smoke/10 bg-white p-4 shadow-float sm:left-auto sm:right-auto sm:w-[640px] sm:p-5"
        >
          <div className="mb-3 flex items-center justify-between">
            <button
              type="button"
              onClick={() => canGoPrev && shiftMonth(-1)}
              disabled={!canGoPrev}
              aria-label={t("datePicker.prevMonth")}
              className="grid h-8 w-8 place-items-center rounded-full text-teal-deep transition hover:bg-turquoise/10 disabled:opacity-25"
            >
              <IconChevron aria-hidden="true" className="h-4 w-4 rotate-180" />
            </button>
            <p className="font-number text-base capitalize text-smoke">
              {n > 0 ? t("datePicker.nights", { count: n }) : t("datePicker.selectDates")}
            </p>
            <button
              type="button"
              onClick={() => shiftMonth(1)}
              aria-label={t("datePicker.nextMonth")}
              className="grid h-8 w-8 place-items-center rounded-full text-teal-deep transition hover:bg-turquoise/10"
            >
              <IconChevron aria-hidden="true" className="h-4 w-4" />
            </button>
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            {months.map((mv, idx) => (
              <div key={`${mv.y}-${mv.m}`} className={idx === 1 ? "hidden sm:block" : ""}>
                <p className="mb-2 text-center font-number text-sm font-semibold capitalize text-smoke">
                  {monthLabel(mv.y, mv.m)}
                </p>
                <div role="grid" className="grid grid-cols-7 gap-y-1 text-center">
                  {weekdays.map((w) => (
                    <span
                      key={w}
                      role="columnheader"
                      aria-label={w}
                      className="pb-1 text-[11px] font-medium uppercase text-smoke/35"
                    >
                      {w.charAt(0)}
                    </span>
                  ))}
                  {monthCells(mv.y, mv.m).map((day, i) => {
                    if (!day) return <span key={`b${i}`} role="gridcell" className="h-10" />;
                    const disabled = day < minDate;
                    const isStart = !!checkIn && day === checkIn;
                    const isEnd = !!previewEnd && day === previewEnd && day !== checkIn;
                    const between = inRange(day);
                    const edge = isStart || isEnd;
                    const band = between
                      ? "bg-turquoise/15"
                      : isStart && previewEnd
                        ? "bg-[linear-gradient(to_right,transparent_50%,#061a2d26_50%)]"
                        : isEnd
                          ? "bg-[linear-gradient(to_right,#061a2d26_50%,transparent_50%)]"
                          : "";
                    return (
                      <div
                        key={day}
                        role="gridcell"
                        aria-selected={edge || between}
                        onMouseEnter={() => setHover(day)}
                        className="relative h-10"
                      >
                        {band && (
                          <span
                            className={`pointer-events-none absolute inset-x-0 top-1/2 h-9 -translate-y-1/2 ${band}`}
                            aria-hidden="true"
                          />
                        )}
                        <button
                          data-date={day}
                          type="button"
                          disabled={disabled}
                          tabIndex={!disabled && day === focusedDay ? 0 : -1}
                          onFocus={() => setFocusedDay(day)}
                          onKeyDown={(e) => moveKeyboard(day, e)}
                          onClick={() => pick(day)}
                          aria-label={fmtDate(day)}
                          aria-pressed={isStart || day === checkOut}
                          aria-current={day === isoDay(0) ? "date" : undefined}
                          className={`absolute inset-0 m-auto grid h-9 w-9 place-items-center rounded-full font-number text-sm transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-turquoise ${
                            disabled
                              ? "cursor-not-allowed text-smoke/25 line-through"
                              : edge
                                ? "bg-teal-deep font-semibold text-cream"
                                : "text-smoke hover:bg-turquoise/20"
                          }`}
                        >
                          {parseInt(day.slice(8), 10)}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 flex items-center justify-between border-t border-smoke/10 pt-3">
            <button
              type="button"
              onClick={() => {
                onChange("", "");
                setHover(null);
                setFocusedDay(minDate);
                setViewForDay(minDate);
                focusDay(minDate);
              }}
              className="text-sm font-semibold text-smoke/60 underline-offset-4 hover:text-smoke hover:underline"
            >
              {t("datePicker.clear")}
            </button>
            <button type="button" onClick={() => closePicker(true)} className="btn-primary px-5 py-2 text-sm">
              {checkIn && checkOut ? t("datePicker.apply") : t("datePicker.close")}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function Segment({
  label,
  value,
  active,
  icon,
}: {
  label: string;
  value: string;
  active: boolean;
  icon?: boolean;
}) {
  return (
    <span className={`flex flex-1 items-center gap-2 px-4 py-3 transition ${active ? "bg-turquoise/5" : ""}`}>
      {icon && <IconCalendar aria-hidden="true" className="h-4 w-4 shrink-0 text-turquoise" />}
      <span className="min-w-0">
        <span className="block text-[11px] font-semibold uppercase tracking-wide text-teal-deep/60">{label}</span>
        <span
          className={`block truncate font-number text-sm ${
            value === t("datePicker.when") ? "text-smoke/40" : "font-medium text-smoke"
          }`}
        >
          {value}
        </span>
      </span>
    </span>
  );
}
