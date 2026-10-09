// SearchBarLocationDropdown.tsx
import React, { useState, useRef, useId } from 'react';

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
      className={`box-border relative flex flex-col items-start p-6.25 gap-2.5 w-90.5 h-64.75 bg-paper border-2 border-cowboy-umber shadow-[0px_10px_15px_-3px_rgba(0,0,0,0.1),0px_4px_6px_-4px_rgba(0,0,0,0.1)] rounded-none select-none outline-none ${className}`}
    >
      {/* Frame: 308px x 205px, gap: 5px */}
      <div className="flex flex-col items-start p-0 gap-1.25 w-77 h-51.25 self-stretch flex-1">
        {/* Inner container (guests-dropdown class in CSS): 308px x 198px, gap: 12px */}
        <div
          ref={listRef}
          role="listbox"
          aria-labelledby={headerId}
          className="flex flex-col items-start p-0 gap-3 w-77 h-49.5"
        >
          {/* Header Row: 308px x 18px */}
          <div className="flex flex-row items-center p-0 w-77 h-4.5 self-stretch">
            <div className="flex flex-col items-start p-0 gap-px w-77 h-4.5 flex-1">
              <span
                id={headerId}
                className="w-44.75 h-4.5 font-label text-[16px] leading-[19px] uppercase text-cowboy-umber-100 flex items-center tracking-wider"
              >
                SELECT A COWBOY
              </span>
            </div>
          </div>

          {/* Divider 1: 308px x 1px, #E2E2E1 */}
          <div className="w-77 h-0.25 bg-alpine-linen-fade self-stretch shrink-0" aria-hidden="true" />

          {/* Location 1: CATSKILLS (Row: 308px x 35px, padding: 8px 0px) */}
          <button
            type="button"
            role="option"
            aria-selected={activeLocation.toUpperCase() === 'CATSKILLS'}
            onClick={() => handleSelect('CATSKILLS')}
            onMouseEnter={() => setFocusedIndex(0)}
            className={`box-border flex flex-row items-center justify-between py-2 px-0 w-77 h-8.75 self-stretch text-left bg-transparent border-none cursor-pointer group transition-all focus:outline-none ${
              focusedIndex === 0 ? 'opacity-100' : 'opacity-90'
            }`}
          >
            <div className="flex flex-col items-start p-0 gap-px w-auto h-4.75">
              <span className="w-22 h-4.75 font-heading text-[16px] leading-[19px] font-bold tracking-[2px] text-cowboy-umber flex items-center group-hover:translate-x-0.5 transition-transform">
                CATSKILLS
              </span>
            </div>
            {activeLocation.toUpperCase() === 'CATSKILLS' && (
              <SelectedCheckIcon className="shrink-0" />
            )}
          </button>

          {/* Divider 2: 308px x 1px, #E2E2E1 */}
          <div className="w-77 h-0.25 bg-alpine-linen-fade self-stretch shrink-0" aria-hidden="true" />

          {/* Location 2: NASHVILLE (Row: 308px x 35px, padding: 8px 0px) */}
          <button
            type="button"
            role="option"
            aria-selected={activeLocation.toUpperCase() === 'NASHVILLE'}
            onClick={() => handleSelect('NASHVILLE')}
            onMouseEnter={() => setFocusedIndex(1)}
            className={`box-border flex flex-row items-center justify-between py-2 px-0 w-77 h-8.75 self-stretch text-left bg-transparent border-none cursor-pointer group transition-all focus:outline-none ${
              focusedIndex === 1 ? 'opacity-100' : 'opacity-90'
            }`}
          >
            <div className="flex flex-col items-start p-0 gap-px w-auto h-4.75">
              <span className="w-23.5 h-4.75 font-heading text-[16px] leading-[19px] font-bold tracking-[2px] text-cowboy-umber flex items-center group-hover:translate-x-0.5 transition-transform">
                NASHVILLE
              </span>
            </div>
            {activeLocation.toUpperCase() === 'NASHVILLE' && (
              <SelectedCheckIcon className="shrink-0" />
            )}
          </button>

          {/* Divider 3: 308px x 1px, #E2E2E1 */}
          <div className="w-77 h-0.25 bg-alpine-linen-fade self-stretch shrink-0" aria-hidden="true" />

          {/* Location 3: DENVER (Row: 308px x 35px, padding: 8px 0px) */}
          <button
            type="button"
            role="option"
            aria-selected={activeLocation.toUpperCase() === 'DENVER'}
            onClick={() => handleSelect('DENVER')}
            onMouseEnter={() => setFocusedIndex(2)}
            className={`box-border flex flex-row items-center justify-between py-2 px-0 w-77 h-8.75 self-stretch text-left bg-transparent border-none cursor-pointer group transition-all focus:outline-none ${
              focusedIndex === 2 ? 'opacity-100' : 'opacity-90'
            }`}
          >
            <div className="flex flex-col justify-center items-start p-0 w-73 h-4.75">
              <span className="w-17.5 h-4.75 font-heading text-[16px] leading-[19px] font-bold tracking-[2px] text-cowboy-umber flex items-center group-hover:translate-x-0.5 transition-transform">
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
