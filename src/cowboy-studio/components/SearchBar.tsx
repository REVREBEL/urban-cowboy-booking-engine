import React, { useState } from 'react';
import { CalendarDays, X } from 'lucide-react';
import { SearchCriteria } from '../types';
import {
  SearchBarExpanded,
  type ActiveSearchSection
} from '../features/find-your-stay/components/search/SearchBarExpanded';
import {
  InlineDateRangePicker,
  type DailyRate
} from '../features/find-your-stay/components/search/InlineDateRangePicker';
import { SearchBarGuestsDropdown } from '../features/find-your-stay/components/search/SearchBarGuestsDropdown';
import { SearchBarLocationDropdown } from '../features/find-your-stay/components/search/SearchBarLocationDropdown';
import { SearchBarPromoDropdown } from '../features/find-your-stay/components/search/SearchBarPromoDropdown';
import { SearchButton } from '../features/find-your-stay/components/search/SearchButton';

interface SearchBarProps {
  criteria: SearchCriteria;
  onUpdateCriteria: (criteria: SearchCriteria) => void;
  onSearch: () => void;
  compact?: boolean;
  dailyRates?: Record<string, DailyRate>;
}

const QUICK_DATES = [
  { label: 'Fall Foliage (Oct 14–17)', checkIn: '2026-10-14', checkOut: '2026-10-17' },
  { label: 'Summer Solstice (Jun 2–5)', checkIn: '2027-06-02', checkOut: '2027-06-05' },
  { label: 'Cozy Fireside Weekend (Nov 5–8)', checkIn: '2026-11-05', checkOut: '2026-11-08' }
];

const formatDateDisplay = (date: string) => {
  if (!date) return 'Add date';
  const [year, month, day] = date.split('-').map(Number);
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  }).format(new Date(year, month - 1, day));
};

const countNights = (checkIn: string, checkOut: string) => {
  if (!checkIn || !checkOut) return 1;
  return Math.max(
    1,
    Math.round(
      (new Date(`${checkOut}T00:00:00Z`).getTime() -
        new Date(`${checkIn}T00:00:00Z`).getTime()) /
        86_400_000
    )
  );
};

export const SearchBar: React.FC<SearchBarProps> = ({
  criteria,
  onUpdateCriteria,
  onSearch,
  compact = false,
  dailyRates
}) => {
  const [activeDropdown, setActiveDropdown] = useState<ActiveSearchSection>(null);
  const [promoInput, setPromoInput] = useState(criteria.promoCode || '');

  const updateDates = (checkIn: string, checkOut: string) => {
    onUpdateCriteria({
      ...criteria,
      checkIn,
      checkOut,
      nights: countNights(checkIn, checkOut)
    });
    if (checkIn && checkOut) setActiveDropdown(null);
  };

  const applyPromo = () => {
    const promoCode = promoInput.trim().toUpperCase();
    if (!promoCode) return;
    onUpdateCriteria({ ...criteria, promoCode });
    setActiveDropdown(null);
  };

  if (compact) {
    return (
      <div className="relative inline-flex items-center gap-2 rounded-full border border-[#D1C9BE] bg-white/90 px-4 py-2 font-brothers text-xs uppercase tracking-wider text-[#221C18] shadow-xs">
        <span className="font-semibold text-[#4E332D]">
          {formatDateDisplay(criteria.checkIn).slice(0, 6)} – {formatDateDisplay(criteria.checkOut).slice(0, 6)}
        </span>
        <span className="text-[#CCC7BB]">|</span>
        <span className="text-[#6B6259]">
          {criteria.guests} adults · {criteria.rooms} room
        </span>
        <button
          type="button"
          onClick={() => setActiveDropdown(activeDropdown ? null : 'dates')}
          className="ml-2 font-uchen text-[11px] normal-case text-[#9A5636] underline"
        >
          Change
        </button>

        {activeDropdown && (
          <div className="absolute right-0 top-full z-50 mt-2 w-80 rounded-2xl border-2 border-[#4E332D] bg-[#FAF9F9] p-4 text-left normal-case shadow-xl">
            <div className="mb-3 flex items-center justify-between border-b border-[#D1C9BE]/50 pb-2">
              <span className="font-brothers text-xs uppercase tracking-wider text-[#4E332D]">
                Update stay
              </span>
              <button type="button" onClick={() => setActiveDropdown(null)} aria-label="Close">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="space-y-3 font-uchen text-xs">
              <label className="block">
                <span className="mb-1 block text-[#4E332D]">Check-in</span>
                <input
                  type="date"
                  value={criteria.checkIn}
                  onChange={(event) => updateDates(event.target.value, criteria.checkOut)}
                  className="w-full rounded-lg border border-[#D1C9BE] bg-white px-2.5 py-1.5 text-[#221C18]"
                />
              </label>
              <label className="block">
                <span className="mb-1 block text-[#4E332D]">Check-out</span>
                <input
                  type="date"
                  value={criteria.checkOut}
                  onChange={(event) => updateDates(criteria.checkIn, event.target.value)}
                  className="w-full rounded-lg border border-[#D1C9BE] bg-white px-2.5 py-1.5 text-[#221C18]"
                />
              </label>
            </div>
          </div>
        )}
      </div>
    );
  }

  const dropdownBase =
    'absolute top-full z-50 mt-3 rounded-3xl border-2 border-[#4E332D] bg-[#FAF9F9] shadow-2xl';

  const dropdownSlot = (
    <>
      {activeDropdown === 'property' && (
        <SearchBarLocationDropdown
          value={criteria.property}
          onChange={(property) => onUpdateCriteria({ ...criteria, property })}
          onClose={() => setActiveDropdown(null)}
          className="absolute left-0 top-full z-50 mt-3"
        />
      )}

      {activeDropdown === 'dates' && (
        <div className={`${dropdownBase} left-0 right-0 p-4 sm:p-6`}>
          <div className="mb-4 flex items-center justify-between border-b border-[#D1C9BE] pb-3">
            <div className="flex items-center gap-2">
              <CalendarDays className="h-5 w-5 text-[#9A5636]" aria-hidden="true" />
              <h4 className="font-brothers text-base uppercase tracking-[1.2px] text-[#4E332D]">
                Select dates of stay
              </h4>
            </div>
            <button
              type="button"
              onClick={() => setActiveDropdown(null)}
              aria-label="Close date picker"
              className="rounded-full p-1 text-[#767470] transition hover:bg-[#EBE8E0] hover:text-[#4E332D]"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <InlineDateRangePicker
            checkIn={criteria.checkIn}
            checkOut={criteria.checkOut}
            onChange={updateDates}
            dailyRates={dailyRates}
          />

          <div className="mt-4 flex flex-wrap items-center gap-4 border-t border-[#EBE8E0] pt-4">
            <span className="font-brothers text-[10px] uppercase tracking-[1.2px] text-[#767470]">
              Quick select
            </span>
            <div className="flex flex-wrap items-center gap-2">
              {QUICK_DATES.map((preset) => (
                <button
                  type="button"
                  key={preset.label}
                  onClick={() => updateDates(preset.checkIn, preset.checkOut)}
                  className="rounded-full border border-[#4E332D] bg-transparent px-3 pb-1 pt-[6px] font-uchen text-xs leading-none text-[#4E332D] transition-colors hover:bg-[#4E332D] hover:text-[#FAF9F9] focus-visible:bg-[#4E332D] focus-visible:text-[#FAF9F9] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#9A5636] focus-visible:ring-offset-2"
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeDropdown === 'guests' && (
        <SearchBarGuestsDropdown
          counts={{
            adults: criteria.guests,
            children: criteria.children ?? 0,
            accessible: criteria.accessible ?? false
          }}
          onChange={({ adults, children, accessible }) =>
            onUpdateCriteria({ ...criteria, guests: adults, children, accessible })
          }
          className="absolute right-[18%] top-full z-50 mt-3"
        />
      )}

      {activeDropdown === 'promo' && (
        <SearchBarPromoDropdown
          value={promoInput}
          onChange={setPromoInput}
          onApply={applyPromo}
          onClose={() => setActiveDropdown(null)}
          className="absolute right-0 top-full z-50 mt-3"
        />
      )}
    </>
  );

  return (
    <div className="booking-shell">
      <SearchBarExpanded
        values={{
          property: criteria.property,
          checkInDate: formatDateDisplay(criteria.checkIn),
          checkOutDate: formatDateDisplay(criteria.checkOut),
          guests: criteria.guests,
          children: criteria.children,
          accessible: criteria.accessible,
          promoCode: criteria.promoCode || ''
        }}
        activeSection={activeDropdown}
        onSectionClick={setActiveDropdown}
        onSearch={onSearch}
        buttonSlot={
          <>
            <SearchButton variant="full-circle" onClick={onSearch} className="hidden md:flex" />
            <SearchButton variant="icon-circle" onClick={onSearch} className="flex md:hidden" />
          </>
        }
        dropdownSlot={dropdownSlot}
      />
    </div>
  );
};
