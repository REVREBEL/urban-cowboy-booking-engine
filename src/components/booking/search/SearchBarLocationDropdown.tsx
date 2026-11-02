// SearchBarLocationDropdown.tsx
import React, { useEffect, useId, useLayoutEffect, useRef, useState } from 'react';

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
  /** Focus the currently selected location when opened by an interactive trigger. */
  focusOnOpen?: boolean;
  className?: string;
}

export const DEFAULT_LOCATIONS: LocationOption[] = [
  { id: 'catskills', name: 'CATSKILLS', label: 'CATSKILLS' },
  { id: 'nashville', name: 'NASHVILLE', label: 'NASHVILLE' },
  { id: 'denver', name: 'DENVER', label: 'DENVER' },
];

function locationIndex(location: string): number {
  const index = DEFAULT_LOCATIONS.findIndex((item) => item.name === location.toUpperCase());
  return index >= 0 ? index : 0;
}

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
 * - Header: 'SELECT A COWBOY' in 'Brothers', 16px/19px, #A79996
 * - Items: 'CATSKILLS', 'NASHVILLE', 'DENVER' in 'DesertRain', 16px/19px, letter-spacing: 2px, font-weight: 700, #4E332D
 * - Dividers: 308px x 1px, #E2E2E1
 */
export const SearchBarLocationDropdown: React.FC<SearchBarLocationDropdownProps> = ({
  value: controlledValue,
  initialValue = 'CATSKILLS',
  onChange,
  onClose,
  focusOnOpen = false,
  className = '',
}) => {
  const [internalValue, setInternalValue] = useState<string>(initialValue);

  const isControlled = controlledValue !== undefined;
  const activeLocation = isControlled ? controlledValue : internalValue;
  const [focusedIndex, setFocusedIndex] = useState<number>(() => locationIndex(activeLocation));

  const headerId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const optionRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const triggerRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    setFocusedIndex(locationIndex(activeLocation));
  }, [activeLocation]);

  useLayoutEffect(() => {
    if (!focusOnOpen) return;

    const dropdownElement = rootRef.current;
    const index = locationIndex(activeLocation);
    triggerRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    setFocusedIndex(index);
    optionRefs.current[index]?.focus();

    return () => {
      const activeElement = document.activeElement;
      if (
        activeElement instanceof HTMLElement &&
        dropdownElement?.contains(activeElement) &&
        triggerRef.current?.isConnected
      ) {
        triggerRef.current.focus();
      }
    };
    // focusOnOpen is intentionally an open-time behavior. Changing the selected
    // location must not recapture or restore focus while the dropdown is mounted.
  }, [focusOnOpen]);

  const handleSelect = (locName: string) => {
    if (!isControlled) {
      setInternalValue(locName);
    }
    onChange?.(locName);
    onClose?.();
  };

  const focusOption = (index: number) => {
    const next = (index + DEFAULT_LOCATIONS.length) % DEFAULT_LOCATIONS.length;
    setFocusedIndex(next);
    optionRefs.current[next]?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      focusOption(focusedIndex + 1);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      focusOption(focusedIndex - 1);
    } else if (e.key === 'Home') {
      e.preventDefault();
      focusOption(0);
    } else if (e.key === 'End') {
      e.preventDefault();
      focusOption(DEFAULT_LOCATIONS.length - 1);
    } else if (e.key === 'Escape') {
      e.preventDefault();
      e.stopPropagation();
      onClose?.();
    }
  };

  return (
    <div
      ref={rootRef}
      role="dialog"
      aria-labelledby={headerId}
      onKeyDown={handleKeyDown}
      className={`relative box-border flex h-64.75 w-90.5 select-none flex-col items-start gap-2.5 rounded-none border-2 border-input-border bg-input p-6.25 text-foreground shadow-[0px_10px_15px_-3px_rgba(0,0,0,0.1),0px_4px_6px_-4px_rgba(0,0,0,0.1)] ${className}`}
    >
      {/* Frame: 308px x 205px, gap: 5px */}
      <div className="flex flex-col items-start p-0 gap-1.25 w-77 h-51.25 self-stretch flex-1">
        {/* Inner container (guests-dropdown class in CSS): 308px x 198px, gap: 12px */}
        <div
          role="listbox"
          aria-labelledby={headerId}
          className="flex flex-col items-start p-0 gap-3 w-77 h-49.5"
        >
          {/* Header Row: 308px x 18px */}
          <div className="flex flex-row items-center p-0 w-77 h-4.5 self-stretch">
            <div className="flex flex-col items-start p-0 gap-px w-77 h-4.5 flex-1">
              <span
                id={headerId}
                className="flex h-4.5 w-44.75 items-center font-label text-[16px] uppercase leading-[19px] tracking-wider text-foreground/60"
              >
                SELECT A COWBOY
              </span>
            </div>
          </div>

          {/* Divider 1: 308px x 1px, #E2E2E1 */}
          <div className="w-77 h-px bg-alpine-linen-fade self-stretch shrink-0" aria-hidden="true" />

          {/* Location 1: CATSKILLS (Row: 308px x 35px, padding: 8px 0px) */}
          <button
            ref={(node) => { optionRefs.current[0] = node; }}
            type="button"
            role="option"
            tabIndex={focusedIndex === 0 ? 0 : -1}
            aria-selected={activeLocation.toUpperCase() === 'CATSKILLS'}
            onClick={() => handleSelect('CATSKILLS')}
            onFocus={() => setFocusedIndex(0)}
            onMouseEnter={() => setFocusedIndex(0)}
            className={`box-border flex flex-row items-center justify-between py-2 px-1 w-77 h-8.75 self-stretch rounded text-left bg-transparent border-none cursor-pointer group transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-input-border focus-visible:ring-offset-1 ${
              focusedIndex === 0 ? 'opacity-100 bg-smoke/5' : 'opacity-90'
            }`}
          >
            <div className="flex flex-col items-start p-0 gap-px w-auto h-4.75">
              <span className="flex h-4.75 w-22 items-center font-heading text-[16px] font-bold leading-[19px] tracking-[2px] text-foreground transition-transform group-hover:translate-x-0.5">
                CATSKILLS
              </span>
            </div>
            {activeLocation.toUpperCase() === 'CATSKILLS' && (
              <SelectedCheckIcon className="shrink-0" />
            )}
          </button>

          {/* Divider 2: 308px x 1px, #E2E2E1 */}
          <div className="w-77 h-px bg-alpine-linen-fade self-stretch shrink-0" aria-hidden="true" />

          {/* Location 2: NASHVILLE (Row: 308px x 35px, padding: 8px 0px) */}
          <button
            ref={(node) => { optionRefs.current[1] = node; }}
            type="button"
            role="option"
            tabIndex={focusedIndex === 1 ? 0 : -1}
            aria-selected={activeLocation.toUpperCase() === 'NASHVILLE'}
            onClick={() => handleSelect('NASHVILLE')}
            onFocus={() => setFocusedIndex(1)}
            onMouseEnter={() => setFocusedIndex(1)}
            className={`box-border flex flex-row items-center justify-between py-2 px-1 w-77 h-8.75 self-stretch rounded text-left bg-transparent border-none cursor-pointer group transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-input-border focus-visible:ring-offset-1 ${
              focusedIndex === 1 ? 'opacity-100 bg-smoke/5' : 'opacity-90'
            }`}
          >
            <div className="flex flex-col items-start p-0 gap-px w-auto h-4.75">
              <span className="flex h-4.75 w-23.5 items-center font-heading text-[16px] font-bold leading-[19px] tracking-[2px] text-foreground transition-transform group-hover:translate-x-0.5">
                NASHVILLE
              </span>
            </div>
            {activeLocation.toUpperCase() === 'NASHVILLE' && (
              <SelectedCheckIcon className="shrink-0" />
            )}
          </button>

          {/* Divider 3: 308px x 1px, #E2E2E1 */}
          <div className="w-77 h-px bg-alpine-linen-fade self-stretch shrink-0" aria-hidden="true" />

          {/* Location 3: DENVER (Row: 308px x 35px, padding: 8px 0px) */}
          <button
            ref={(node) => { optionRefs.current[2] = node; }}
            type="button"
            role="option"
            tabIndex={focusedIndex === 2 ? 0 : -1}
            aria-selected={activeLocation.toUpperCase() === 'DENVER'}
            onClick={() => handleSelect('DENVER')}
            onFocus={() => setFocusedIndex(2)}
            onMouseEnter={() => setFocusedIndex(2)}
            className={`box-border flex flex-row items-center justify-between py-2 px-1 w-77 h-8.75 self-stretch rounded text-left bg-transparent border-none cursor-pointer group transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-input-border focus-visible:ring-offset-1 ${
              focusedIndex === 2 ? 'opacity-100 bg-smoke/5' : 'opacity-90'
            }`}
          >
            <div className="flex flex-col justify-center items-start p-0 w-73 h-4.75">
              <span className="flex h-4.75 w-17.5 items-center font-heading text-[16px] font-bold leading-[19px] tracking-[2px] text-foreground transition-transform group-hover:translate-x-0.5">
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
