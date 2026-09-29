// SearchBarLocationDropdown.tsx
import React, { useState, useRef, useEffect, useId } from 'react';

export type CowboyLocation = 'CATSKILLS' | 'NASHVILLE' | 'DENVER' | string;

export interface LocationOption {
  id: string;
  name: string;
  label: string;
}

export interface SearchBarLocationDropdownProps {
  value?: string;
  initialValue?: string;
  onChange?: (location: string) => void;
  onClose?: () => void;
  className?: string;
}

export const DEFAULT_LOCATIONS: LocationOption[] = [
  { id: 'catskills', name: 'CATSKILLS', label: 'CATSKILLS' },
  { id: 'nashville', name: 'NASHVILLE', label: 'NASHVILLE' },
  { id: 'denver', name: 'DENVER', label: 'DENVER' },
];

/**
 * Small indicator for the active selected location
 */
const SelectedCheckIcon: React.FC<{ color?: string; className?: string }> = ({
  color = '#4E332D',
  className = '',
}) => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 14 14"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    aria-hidden="true"
  >
    <path
      d="M2.5 7.5L5.5 10.5L11.5 3.5"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

/**
 * SearchBarLocationDropdown Component
 * Conforms strictly to SearchBarLocationDropdown.css and SearchBarLocationDropdown.pdf:
 * - Dimensions: 362px width, 259px height, 25px padding, 10px gap
 * - Background: #FAF9F9, Border: 2px solid #4E332D
 * - Header: 'SELECT A COWBOY' in 'Brothers OT', 16px/19px, #A79996
 * - Items: 'CATSKILLS', 'NASHVILLE', 'DENVER' in 'DesertRain', 16px/19px, letter-spacing: 2px, font-weight: 700, #4E332D
 * - Dividers: 308px x 1px, #E2E2E1
 */
export const SearchBarLocationDropdown: React.FC<SearchBarLocationDropdownProps> = ({
  value: controlledValue,
  initialValue = 'CATSKILLS',
  onChange,
  onClose,
  className = '',
}) => {
  const [internalValue, setInternalValue] = useState<string>(initialValue);
  const [focusedIndex, setFocusedIndex] = useState<number>(0);

  const isControlled = controlledValue !== undefined;
  const activeLocation = isControlled ? controlledValue : internalValue;

  const headerId = useId();
  const listRef = useRef<HTMLDivElement>(null);

  const handleSelect = (locName: string) => {
    if (!isControlled) {
      setInternalValue(locName);
    }
    onChange?.(locName);
    onClose?.();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setFocusedIndex((prev) => (prev + 1) % DEFAULT_LOCATIONS.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setFocusedIndex((prev) => (prev - 1 + DEFAULT_LOCATIONS.length) % DEFAULT_LOCATIONS.length);
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      const target = DEFAULT_LOCATIONS[focusedIndex];
      if (target) handleSelect(target.name);
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onClose?.();
    }
  };

  return (
    <div
      role="dialog"
      aria-labelledby={headerId}
      tabIndex={0}
      onKeyDown={handleKeyDown}
      className={`box-border relative flex flex-col items-start p-[25px] gap-[10px] w-[362px] h-[259px] bg-[#FAF9F9] border-2 border-[#4E332D] shadow-[0px_10px_15px_-3px_rgba(0,0,0,0.1),0px_4px_6px_-4px_rgba(0,0,0,0.1)] rounded-none select-none outline-none ${className}`}
    >
      {/* Frame: 308px x 205px, gap: 5px */}
      <div className="flex flex-col items-start p-0 gap-[5px] w-[308px] h-[205px] self-stretch flex-1">
        {/* Inner container (guests-dropdown class in CSS): 308px x 198px, gap: 12px */}
        <div
          ref={listRef}
          role="listbox"
          aria-labelledby={headerId}
          className="flex flex-col items-start p-0 gap-[12px] w-[308px] h-[198px]"
        >
          {/* Header Row: 308px x 18px */}
          <div className="flex flex-row items-center p-0 w-[308px] h-[18px] self-stretch">
            <div className="flex flex-col items-start p-0 gap-[1px] w-[308px] h-[18px] flex-1">
              <span
                id={headerId}
                className="w-[179px] h-[18px] font-brothers text-[16px] leading-[19px] uppercase text-[#A79996] flex items-center tracking-wider"
              >
                SELECT A COWBOY
              </span>
            </div>
          </div>

          {/* Divider 1: 308px x 1px, #E2E2E1 */}
          <div className="w-[308px] h-[1px] bg-[#E2E2E1] self-stretch shrink-0" aria-hidden="true" />

          {/* Location 1: CATSKILLS (Row: 308px x 35px, padding: 8px 0px) */}
          <button
            type="button"
            role="option"
            aria-selected={activeLocation.toUpperCase() === 'CATSKILLS'}
            onClick={() => handleSelect('CATSKILLS')}
            onMouseEnter={() => setFocusedIndex(0)}
            className={`box-border flex flex-row items-center justify-between py-[8px] px-0 w-[308px] h-[35px] self-stretch text-left bg-transparent border-none cursor-pointer group transition-all focus:outline-none ${
              focusedIndex === 0 ? 'opacity-100' : 'opacity-90'
            }`}
          >
            <div className="flex flex-col items-start p-0 gap-[1px] w-auto h-[19px]">
              <span className="w-[88px] h-[19px] font-desert text-[16px] leading-[19px] font-bold tracking-[2px] text-[#4E332D] flex items-center group-hover:translate-x-0.5 transition-transform">
                CATSKILLS
              </span>
            </div>
            {activeLocation.toUpperCase() === 'CATSKILLS' && (
              <SelectedCheckIcon className="shrink-0" />
            )}
          </button>

          {/* Divider 2: 308px x 1px, #E2E2E1 */}
          <div className="w-[308px] h-[1px] bg-[#E2E2E1] self-stretch shrink-0" aria-hidden="true" />

          {/* Location 2: NASHVILLE (Row: 308px x 35px, padding: 8px 0px) */}
          <button
            type="button"
            role="option"
            aria-selected={activeLocation.toUpperCase() === 'NASHVILLE'}
            onClick={() => handleSelect('NASHVILLE')}
            onMouseEnter={() => setFocusedIndex(1)}
            className={`box-border flex flex-row items-center justify-between py-[8px] px-0 w-[308px] h-[35px] self-stretch text-left bg-transparent border-none cursor-pointer group transition-all focus:outline-none ${
              focusedIndex === 1 ? 'opacity-100' : 'opacity-90'
            }`}
          >
            <div className="flex flex-col items-start p-0 gap-[1px] w-auto h-[19px]">
              <span className="w-[94px] h-[19px] font-desert text-[16px] leading-[19px] font-bold tracking-[2px] text-[#4E332D] flex items-center group-hover:translate-x-0.5 transition-transform">
                NASHVILLE
              </span>
            </div>
            {activeLocation.toUpperCase() === 'NASHVILLE' && (
              <SelectedCheckIcon className="shrink-0" />
            )}
          </button>

          {/* Divider 3: 308px x 1px, #E2E2E1 */}
          <div className="w-[308px] h-[1px] bg-[#E2E2E1] self-stretch shrink-0" aria-hidden="true" />

          {/* Location 3: DENVER (Row: 308px x 35px, padding: 8px 0px) */}
          <button
            type="button"
            role="option"
            aria-selected={activeLocation.toUpperCase() === 'DENVER'}
            onClick={() => handleSelect('DENVER')}
            onMouseEnter={() => setFocusedIndex(2)}
            className={`box-border flex flex-row items-center justify-between py-[8px] px-0 w-[308px] h-[35px] self-stretch text-left bg-transparent border-none cursor-pointer group transition-all focus:outline-none ${
              focusedIndex === 2 ? 'opacity-100' : 'opacity-90'
            }`}
          >
            <div className="flex flex-col justify-center items-start p-0 w-[292px] h-[19px]">
              <span className="w-[70px] h-[19px] font-desert text-[16px] leading-[19px] font-bold tracking-[2px] text-[#4E332D] flex items-center group-hover:translate-x-0.5 transition-transform">
                DENVER
              </span>
            </div>
            {activeLocation.toUpperCase() === 'DENVER' && (
              <SelectedCheckIcon className="shrink-0" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

/**
 * Interactive Preview Application
 * 1. Isolated Figma Specification View (362px x 259px, border: 2px solid #4E332D)
 * 2. Full Search Bar Integration with Live Location Popover
 * 3. State Inspector for Location Selection
 */
export default function App() {
  const [selectedLocation, setSelectedLocation] = useState<string>('CATSKILLS');
  const [isLocationOpen, setIsLocationOpen] = useState<boolean>(false);
  const [activeDate] = useState<string>('Add dates');
  const [activeGuests] = useState<string>('2 guests');
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const popoverRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(event.target as Node)
      ) {
        setIsLocationOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSearch = async () => {
    if (isSearching) return;
    setIsSearching(true);
    setToastMessage(`Searching accommodations in ${selectedLocation}...`);

    try {
      await new Promise((resolve) => setTimeout(resolve, 800));
      setToastMessage(`Found available cowboy stays in ${selectedLocation}!`);
    } catch {
      setToastMessage('Search request failed. Please retry.');
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#EAE8E3] flex flex-col items-center justify-start py-10 px-4 text-[#343833]">
      {/* Design System Typography */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Urbanist:wght@400;500;600;700&family=Uchen&family=Cinzel:wght@600;700&family=Playfair+Display:wght@700;800&display=swap');

        .font-brothers {
          font-family: 'Brothers OT', 'Cinzel', Georgia, serif;
          letter-spacing: 0.04em;
        }
        .font-desert {
          font-family: 'DesertRain', 'Playfair Display', Georgia, serif;
          font-weight: 700;
        }
        .font-uchen {
          font-family: 'Uchen', Georgia, serif;
        }
        .font-urbanist {
          font-family: 'Urbanist', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        }
      `}</style>

      <div className="w-full max-w-4xl flex flex-col items-center gap-10">
        {/* Header */}
        <div className="text-center">
          <h1 className="font-brothers text-2xl tracking-wide uppercase text-[#343833]">
            Search Bar Location Dropdown
          </h1>
          <p className="text-xs text-[#4E332D] mt-1 font-urbanist">
            Exact design specifications from SearchBarLocationDropdown.css & PDF
          </p>
        </div>

        {/* Status Toast */}
        {toastMessage && (
          <div
            role="status"
            className="w-full max-w-[692px] text-xs font-urbanist bg-[#343833] text-[#EBE8E0] px-4 py-2.5 rounded shadow flex items-center justify-between transition-all"
          >
            <span>{toastMessage}</span>
            <button
              type="button"
              onClick={() => setToastMessage(null)}
              className="text-[#EBE8E0] underline ml-3 font-semibold"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Section 1: Attached Live Search Bar Integration */}
        <div className="flex flex-col items-center gap-3 w-full" ref={popoverRef}>
          <span className="text-[11px] font-brothers uppercase tracking-wider text-[#4E332D]">
            Live Attached Preview (Click Location to toggle dropdown)
          </span>

          <div className="relative">
            {/* 692px Search Bar */}
            <div
              role="search"
              aria-label="Accommodation search bar"
              className="box-border flex flex-row items-center justify-between w-[692px] h-[56px] bg-[#FAF9F9] border border-[#DDDDDD] rounded-[9999px] pr-[5px] shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.1),0px_2px_4px_-2px_rgba(0,0,0,0.1)]"
            >
              {/* WHERE / LOCATION (Trigger for Dropdown) */}
              <button
                type="button"
                onClick={() => setIsLocationOpen((prev) => !prev)}
                aria-expanded={isLocationOpen}
                aria-haspopup="dialog"
                className={`box-border flex flex-col justify-center items-start px-[24px] py-0 gap-[2px] w-[201px] h-[54px] rounded-[9999px] transition-colors text-left focus:outline-none ${
                  isLocationOpen
                    ? 'bg-[#EAE8E3]'
                    : 'bg-[#FAF9F9] hover:bg-[#F3F2EE]'
                }`}
              >
                <span className="font-brothers text-[10px] leading-[12px] uppercase text-[#4E332D]">
                  LOCATION
                </span>
                <span className="font-desert text-[12px] leading-[22px] tracking-[1px] text-[#4E332D] font-bold truncate">
                  {selectedLocation}
                </span>
              </button>

              <div className="w-[1px] h-[30px] bg-[#DDDDDD] shrink-0" />

              {/* WHEN (Dates) */}
              <button
                type="button"
                className="box-border flex flex-col justify-center items-start px-[24px] py-0 gap-[2px] w-[201px] h-[54px] bg-[#FAF9F9] rounded-[9999px] hover:bg-[#F3F2EE] transition-colors text-left focus:outline-none"
              >
                <span className="font-brothers text-[10px] leading-[12px] uppercase text-[#4E332D]">
                  WHEN
                </span>
                <span className="font-uchen text-[12px] leading-[22px] text-[#1C1917] truncate">
                  {activeDate}
                </span>
              </button>

              <div className="w-[1px] h-[30px] bg-[#DDDDDD] shrink-0" />

              {/* GUESTS */}
              <button
                type="button"
                className="box-border flex flex-col justify-center items-start px-[24px] py-0 gap-[2px] w-[201px] h-[54px] bg-[#FAF9F9] rounded-[9999px] hover:bg-[#F3F2EE] transition-colors text-left focus:outline-none"
              >
                <span className="font-brothers text-[10px] leading-[12px] uppercase text-[#4E332D]">
                  GUESTS
                </span>
                <span className="font-uchen text-[12px] leading-[22px] text-[#1C1917] truncate">
                  {activeGuests}
                </span>
              </button>

              {/* Search Button (48px) */}
              <button
                type="button"
                onClick={handleSearch}
                disabled={isSearching}
                aria-label="Search"
                aria-busy={isSearching}
                className="box-border flex items-center justify-center w-[48px] h-[48px] bg-[#343833] text-[#EBE8E0] rounded-[9999px] hover:bg-[#272A26] active:scale-95 transition-all focus:outline-none shrink-0 disabled:opacity-60"
              >
                {isSearching ? (
                  <div className="w-4 h-4 border-2 border-[#EBE8E0] border-t-transparent rounded-full animate-spin" />
                ) : (
                  <svg
                    width="13"
                    height="13"
                    viewBox="0 0 13 13"
                    fill="none"
                    aria-hidden="true"
                  >
                    <circle
                      cx="5.5"
                      cy="5.5"
                      r="4.25"
                      stroke="#EBE8E0"
                      strokeWidth="1.6"
                      strokeLinecap="round"
                    />
                    <line
                      x1="8.8"
                      y1="8.8"
                      x2="12"
                      y2="12"
                      stroke="#EBE8E0"
                      strokeWidth="1.6"
                      strokeLinecap="round"
                    />
                  </svg>
                )}
              </button>
            </div>

            {/* Attached Dropdown Popover */}
            {isLocationOpen && (
              <div className="absolute top-[64px] left-[0px] z-50 animate-in fade-in zoom-in-95 duration-150">
                <SearchBarLocationDropdown
                  value={selectedLocation}
                  onChange={(loc) => {
                    setSelectedLocation(loc);
                    setToastMessage(`Location selected: ${loc}`);
                  }}
                  onClose={() => setIsLocationOpen(false)}
                />
              </div>
            )}
          </div>
        </div>

        {/* Section 2: Isolated Figma Specification View */}
        <div className="flex flex-col items-center gap-3">
          <span className="text-[11px] font-brothers uppercase tracking-wider text-[#4E332D]">
            Figma Component Isolated Spec (362px × 259px, border: 2px solid #4E332D)
          </span>

          <SearchBarLocationDropdown
            value={selectedLocation}
            onChange={(loc) => {
              setSelectedLocation(loc);
              setToastMessage(`Location selected: ${loc}`);
            }}
          />
        </div>

        {/* Section 3: Interactive State Inspector */}
        <div className="w-full max-w-[500px] bg-[#FAF9F9] border border-[#DDDDDD] rounded-lg p-4 shadow-sm text-xs font-urbanist flex flex-col gap-3">
          <div className="flex items-center justify-between border-b border-[#DDDDDD] pb-2">
            <span className="font-semibold text-sm text-[#343833]">
              Location State Inspector
            </span>
            <span className="text-gray-500 text-[11px]">Click a chip to change</span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-gray-500">Selected Cowboy:</span>
            <span className="font-desert font-bold tracking-wider text-sm text-[#4E332D] bg-[#EAE8E3] px-2.5 py-1 rounded">
              {selectedLocation}
            </span>
          </div>

          <div className="flex items-center gap-2 pt-1">
            {DEFAULT_LOCATIONS.map((loc) => (
              <button
                key={loc.id}
                type="button"
                onClick={() => {
                  setSelectedLocation(loc.name);
                  setToastMessage(`Location set to ${loc.name}`);
                }}
                className={`px-3 py-1 rounded border text-xs font-desert font-bold tracking-wider transition-colors ${
                  selectedLocation === loc.name
                    ? 'bg-[#4E332D] text-[#FAF9F9] border-[#4E332D]'
                    : 'bg-white border-[#DDDDDD] text-[#4E332D] hover:bg-gray-50'
                }`}
              >
                {loc.name}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
