// SearchBarGuestDropdown.tsx
import React, { useState, useRef, useEffect, useId } from 'react';

export interface GuestCounts {
  adults: number;
  children: number;
  accessible: boolean;
}

export interface SearchBarGuestDropdownProps {
  counts?: GuestCounts;
  initialCounts?: Partial<GuestCounts>;
  onChange?: (counts: GuestCounts) => void;
  onClose?: () => void;
  className?: string;
}

/**
 * Minus Icon Vector matching Figma specifications:
 * Positioned in 18px x 18px container, vector width: 12px, height: 2px
 */
export const StepperMinusIcon: React.FC<{ color?: string }> = ({
  color = '#343833',
}) => (
  <svg
    width="12"
    height="2"
    viewBox="0 0 12 2"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <rect width="12" height="2" rx="1" fill={color} />
  </svg>
);

/**
 * Plus Icon Vector matching Figma specifications:
 * Positioned in 18px x 18px container, vector width: 12px, height: 12px
 */
export const StepperPlusIcon: React.FC<{ color?: string }> = ({
  color = '#343833',
}) => (
  <svg
    width="12"
    height="12"
    viewBox="0 0 12 12"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <path
      d="M5 0.5C5 0.223858 5.22386 0 5.5 0H6.5C6.77614 0 7 0.223858 7 0.5V11.5C7 11.7761 6.77614 12 6.5 12H5.5C5.22386 12 5 11.7761 5 11.5V0.5Z"
      fill={color}
    />
    <path
      d="M0 5.5C0 5.22386 0.223858 5 0.5 5H11.5C11.7761 5 12 5.22386 12 5.5V6.5C12 6.77614 11.7761 7 11.5 7H0.5C0.223858 7 0 6.77614 0 6.5V5.5Z"
      fill={color}
    />
  </svg>
);

/**
 * Checkmark Icon for the Accessible Toggle Switch
 */
export const ToggleCheckIcon: React.FC<{ color?: string }> = ({
  color = '#343833',
}) => (
  <svg
    width="12"
    height="10"
    viewBox="0 0 12 10"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <path
      d="M1.5 5.2L4.5 8.2L10.5 1.8"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

/**
 * SearchBarGuestDropdown Component
 * Strictly conforms to SearchBarGuestDropdown_2.css & SearchBarGuestDropdown.pdf:
 * - Dimensions: 360px width, 274px height, 24px padding
 * - Background: #FAF9F9, Border: 2px solid #343833, Radius: 0px
 * - Shadow: 0px 10px 15px -3px rgba(0, 0, 0, 0.1), 0px 4px 6px -4px rgba(0, 0, 0, 0.1)
 * - Row 1: Adults (Age 13+)
 * - Row 2: Children (Age up to 12)
 * - Row 3: Accessible (ADA Rooms)
 */
export const SearchBarGuestDropdown: React.FC<SearchBarGuestDropdownProps> = ({
  counts: controlledCounts,
  initialCounts,
  onChange,
  onClose,
  className = '',
}) => {
  // Internal state when not fully controlled
  const [internalCounts, setInternalCounts] = useState<GuestCounts>({
    adults: initialCounts?.adults ?? 2,
    children: initialCounts?.children ?? 0,
    accessible: initialCounts?.accessible ?? false,
  });

  const isControlled = controlledCounts !== undefined;
  const currentCounts = isControlled ? controlledCounts : internalCounts;

  const adultId = useId();
  const childrenId = useId();
  const accessibleId = useId();

  const updateCounts = (updated: GuestCounts) => {
    if (!isControlled) {
      setInternalCounts(updated);
    }
    onChange?.(updated);
  };

  const handleAdultsChange = (delta: number) => {
    const nextVal = Math.max(1, currentCounts.adults + delta);
    updateCounts({ ...currentCounts, adults: nextVal });
  };

  const handleChildrenChange = (delta: number) => {
    const nextVal = Math.max(0, currentCounts.children + delta);
    updateCounts({ ...currentCounts, children: nextVal });
  };

  const handleToggleAccessible = () => {
    updateCounts({ ...currentCounts, accessible: !currentCounts.accessible });
  };

  const isAdultMinusDisabled = currentCounts.adults <= 1;
  const isChildrenMinusDisabled = currentCounts.children <= 0;

  return (
    <div
      role="dialog"
      aria-label="Guest selection"
      className={`box-border relative flex flex-col items-start p-[24px] w-[360px] max-w-[2089px] h-[274px] max-h-[520px] bg-[#FAF9F9] border-2 border-[#343833] shadow-[0px_10px_15px_-3px_rgba(0,0,0,0.1),0px_4px_6px_-4px_rgba(0,0,0,0.1)] rounded-none select-none ${className}`}
    >
      {/* guests-dropdown (308px x 222px, gap: 12px) */}
      <div className="flex flex-col items-start p-0 gap-[12px] w-[308px] h-[222px] self-stretch">
        {/* ROW 1: Adults (308px x 57px, padding: 8px 0px) */}
        <div className="flex flex-row items-center py-[8px] px-0 w-[308px] h-[57px] self-stretch">
          {/* Text block: Adults + Age 13+ (196px x 41px) */}
          <div className="flex flex-col items-start p-0 gap-[1px] w-[196px] h-[41px] flex-1">
            <p
              id={adultId}
              className="font-brothers text-[14px] leading-[17px] uppercase text-[#343833] m-0 w-[196px] h-[17px] flex items-center"
            >
              Adults
            </p>
            <p className="font-uchen text-[12.1px] leading-[23px] text-[#AFAEAE] m-0 w-[196px] h-[23px] flex items-center">
              Age 13+
            </p>
          </div>

          {/* Stepper container (112px x 32px, padding-left: 12px) */}
          <div className="flex flex-col items-start pl-[12px] pr-0 py-0 w-[112px] h-[32px] shrink-0">
            <div className="flex flex-row items-center p-0 w-[100px] h-[32px] justify-between">
              {/* Component Subtract (32px x 32px, border-radius: 17px) */}
              <button
                type="button"
                onClick={() => handleAdultsChange(-1)}
                disabled={isAdultMinusDisabled}
                aria-label="Decrease adult guests"
                className={`box-border flex flex-row justify-center items-center p-[5.5px] w-[32px] h-[32px] bg-[#FAF9F9] rounded-[17px] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#343833] ${
                  isAdultMinusDisabled
                    ? 'border border-[#F2F2F2] cursor-not-allowed opacity-40'
                    : 'border border-[#343833] cursor-pointer hover:bg-[#F0EFEB] active:scale-95'
                }`}
              >
                <div className="w-[18px] h-[18px] flex items-center justify-center opacity-80">
                  <StepperMinusIcon
                    color={isAdultMinusDisabled ? '#F2F2F2' : '#343833'}
                  />
                </div>
              </button>

              {/* Count (36px x 30px, Uchen font) */}
              <p
                aria-live="polite"
                className="w-[36px] h-[30px] font-uchen text-[16px] leading-[30px] text-center text-[#343833] m-0 flex items-center justify-center"
              >
                {currentCounts.adults}
              </p>

              {/* Component Add (32px x 32px, border-radius: 17px) */}
              <button
                type="button"
                onClick={() => handleAdultsChange(1)}
                aria-label="Increase adult guests"
                className="box-border flex flex-row justify-center items-center p-[5.5px] w-[32px] h-[32px] bg-[#FAF9F9] border border-[#343833] rounded-[17px] cursor-pointer hover:bg-[#F0EFEB] active:scale-95 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#343833]"
              >
                <div className="w-[18px] h-[18px] flex items-center justify-center opacity-80">
                  <StepperPlusIcon color="#343833" />
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Divider 1 (308px x 1px, #E1E0E0) */}
        <div
          className="w-[308px] h-[1px] bg-[#E1E0E0] self-stretch shrink-0"
          aria-hidden="true"
        />

        {/* ROW 2: Children (308px x 58px, padding: 8px 0px) */}
        <div className="flex flex-row items-center py-[8px] px-0 w-[308px] h-[58px] self-stretch">
          {/* Text block: Children + Age up to 12 (196px x 42px) */}
          <div className="flex flex-col items-start p-0 gap-[1px] w-[196px] h-[42px] flex-1">
            <p
              id={childrenId}
              className="font-brothers text-[14px] leading-[17px] uppercase text-[#343833] m-0 w-[196px] h-[17px] flex items-center"
            >
              Children
            </p>
            <p className="font-uchen text-[12.9px] leading-[24px] text-[#AFAEAE] m-0 w-[196px] h-[24px] flex items-center">
              Age up to 12
            </p>
          </div>

          {/* Stepper container (112px x 32px, padding-left: 12px) */}
          <div className="flex flex-col items-start pl-[12px] pr-0 py-0 w-[112px] h-[32px] shrink-0">
            <div className="flex flex-row items-center p-0 w-[100px] h-[32px] justify-between">
              {/* Component Subtract */}
              <button
                type="button"
                onClick={() => handleChildrenChange(-1)}
                disabled={isChildrenMinusDisabled}
                aria-label="Decrease child guests"
                className={`box-border flex flex-row justify-center items-center p-[5.5px] w-[32px] h-[32px] bg-[#FAF9F9] rounded-[17px] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#343833] ${
                  isChildrenMinusDisabled
                    ? 'border border-[#F2F2F2] cursor-not-allowed opacity-40'
                    : 'border border-[#343833] cursor-pointer hover:bg-[#F0EFEB] active:scale-95'
                }`}
              >
                <div className="w-[18px] h-[18px] flex items-center justify-center opacity-80">
                  <StepperMinusIcon
                    color={isChildrenMinusDisabled ? '#F2F2F2' : '#343833'}
                  />
                </div>
              </button>

              {/* Count (36px x 30px, Uchen font) */}
              <p
                aria-live="polite"
                className="w-[36px] h-[30px] font-uchen text-[16px] leading-[30px] text-center text-[#343833] m-0 flex items-center justify-center"
              >
                {currentCounts.children}
              </p>

              {/* Component Add */}
              <button
                type="button"
                onClick={() => handleChildrenChange(1)}
                aria-label="Increase child guests"
                className={`box-border flex flex-row justify-center items-center p-[5.5px] w-[32px] h-[32px] bg-[#FAF9F9] rounded-[17px] cursor-pointer hover:bg-[#F0EFEB] active:scale-95 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#343833] ${
                  currentCounts.children === 0
                    ? 'border border-[#E1E0E0]'
                    : 'border border-[#343833]'
                }`}
              >
                <div className="w-[18px] h-[18px] flex items-center justify-center opacity-80">
                  <StepperPlusIcon color="#343833" />
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Divider 2 (308px x 1px, #E1E0E0) */}
        <div
          className="w-[308px] h-[1px] bg-[#E1E0E0] self-stretch shrink-0"
          aria-hidden="true"
        />

        {/* ROW 3: Accessible (308px x 57px, padding: 8px 0px) */}
        <div className="flex flex-row items-center py-[8px] px-0 w-[308px] h-[57px] self-stretch">
          {/* Text block: Accessible + ADA Rooms (258px x 41px, pr: 16px) */}
          <div className="flex flex-col items-start pr-[16px] py-0 w-[258px] h-[41px] flex-1">
            <div className="flex flex-col justify-center items-start p-0 w-[242px] h-[41px] self-stretch">
              <p
                id={accessibleId}
                className="font-brothers text-[14px] leading-[17px] uppercase text-[#343833] m-0 w-[240px] h-[17px] flex items-center"
              >
                Accessible
              </p>
              <p className="font-uchen text-[12.9px] leading-[24px] text-[#AFAEAE] m-0 w-[242px] h-[24px] flex items-center">
                ADA Rooms
              </p>
            </div>
          </div>

          {/* Component Toggle (50px x 32px, border-radius: 16px, padding: 2px) */}
          <button
            type="button"
            role="switch"
            aria-checked={currentCounts.accessible}
            aria-labelledby={accessibleId}
            onClick={handleToggleAccessible}
            className={`box-border relative flex flex-row items-center p-[2px] w-[50px] h-[32px] rounded-[16px] cursor-pointer transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#343833] shrink-0 ${
              currentCounts.accessible ? 'bg-[#343833]' : 'bg-[#E1E0E0]'
            }`}
          >
            {/* Sliding Thumb (28px x 28px, rounded: 14px, #FAF9F9) */}
            <div
              className={`flex flex-col justify-center items-center w-[28px] h-[28px] bg-[#FAF9F9] rounded-[14px] shadow-sm transform transition-transform duration-200 ${
                currentCounts.accessible ? 'translate-x-[18px]' : 'translate-x-0'
              }`}
            >
              {currentCounts.accessible && <ToggleCheckIcon color="#343833" />}
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

/**
 * Interactive Preview Application
 * Displays:
 * 1. Isolated Figma Specification View of SearchBarGuestDropdown (360px x 274px)
 * 2. Search Bar Integration with Live Popover Dropdown
 * 3. State & Sync Controls compliant with SKILL.md
 */
export default function App() {
  const [counts, setCounts] = useState<GuestCounts>({
    adults: 2,
    children: 0,
    accessible: false,
  });

  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [searchFeedback, setSearchFeedback] = useState<string | null>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const totalGuests = counts.adults + counts.children;
  const guestDisplayString = `${totalGuests} guest${
    totalGuests === 1 ? '' : 's'
  }${counts.accessible ? ' • ADA' : ''}`;

  const handleSimulateSearch = async () => {
    if (isSearching) return;
    setIsSearching(true);
    setSearchFeedback(null);

    try {
      // Follow SKILL.md async operation and loading patterns
      await new Promise((resolve) => setTimeout(resolve, 900));
      setSearchFeedback(
        `Search confirmed: ${counts.adults} Adults, ${counts.children} Children${
          counts.accessible ? ' with ADA accessible room' : ''
        }`
      );
    } catch {
      setSearchFeedback('Search failed. Please try again.');
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#EAE8E3] flex flex-col items-center justify-start py-10 px-4 text-[#343833]">
      {/* Typography Styles matching design specs */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Urbanist:wght@400;500;600;700&family=Uchen&family=Cinzel:wght@600;700&display=swap');

        .font-brothers {
          font-family: 'Brothers OT', 'Cinzel', Georgia, serif;
          letter-spacing: 0.04em;
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
            Search Bar Guest Dropdown
          </h1>
          <p className="text-xs text-[#4E332D] mt-1 font-urbanist">
            Exact layout specs from SearchBarGuestDropdown_2.css & SearchBarGuestDropdown.pdf
          </p>
        </div>

        {/* Toast / Status banner according to SKILL.md */}
        {searchFeedback && (
          <div
            role="status"
            className="w-full max-w-[692px] text-xs font-urbanist bg-[#343833] text-[#EBE8E0] px-4 py-2.5 rounded shadow flex items-center justify-between transition-all"
          >
            <span>{searchFeedback}</span>
            <button
              type="button"
              onClick={() => setSearchFeedback(null)}
              className="text-[#EBE8E0] underline ml-3 font-semibold"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Section 1: Live Attached Search Bar Integration */}
        <div className="flex flex-col items-center gap-3 w-full" ref={popoverRef}>
          <span className="text-[11px] font-brothers uppercase tracking-wider text-[#4E332D]">
            Interactive Attached Preview (Click "GUESTS" to toggle dropdown)
          </span>

          <div className="relative">
            {/* 692px Search Bar matching SearchBar.css */}
            <div
              role="search"
              aria-label="Accommodation search bar"
              className="box-border flex flex-row items-center justify-between w-[692px] h-[56px] bg-[#FAF9F9] border border-[#DDDDDD] rounded-[9999px] pr-[5px] shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.1),0px_2px_4px_-2px_rgba(0,0,0,0.1)]"
            >
              {/* Date Section */}
              <button
                type="button"
                className="box-border flex flex-col justify-center items-start px-[24px] py-0 gap-[2px] w-[201px] h-[54px] bg-[#FAF9F9] rounded-[9999px] hover:bg-[#F3F2EE] transition-colors text-left focus:outline-none"
              >
                <span className="font-brothers text-[10px] leading-[12px] uppercase text-[#4E332D]">
                  WHEN
                </span>
                <span className="font-uchen text-[12px] leading-[22px] text-[#1C1917] truncate">
                  Add dates
                </span>
              </button>

              {/* Vertical Rule */}
              <div className="w-[1px] h-[30px] bg-[#DDDDDD] shrink-0" />

              {/* Guest Section (Active Trigger) */}
              <button
                type="button"
                onClick={() => setIsDropdownOpen((prev) => !prev)}
                aria-expanded={isDropdownOpen}
                aria-haspopup="dialog"
                className={`box-border flex flex-col justify-center items-start px-[24px] py-0 gap-[2px] w-[201px] h-[54px] rounded-[9999px] transition-colors text-left focus:outline-none ${
                  isDropdownOpen
                    ? 'bg-[#EAE8E3]'
                    : 'bg-[#FAF9F9] hover:bg-[#F3F2EE]'
                }`}
              >
                <span className="font-brothers text-[10px] leading-[12px] uppercase text-[#4E332D]">
                  GUESTS
                </span>
                <span className="font-uchen text-[12px] leading-[22px] text-[#1C1917] truncate font-medium">
                  {guestDisplayString}
                </span>
              </button>

              {/* Vertical Rule */}
              <div className="w-[1px] h-[30px] bg-[#DDDDDD] shrink-0" />

              {/* Promo Section */}
              <button
                type="button"
                className="box-border flex flex-col justify-center items-start px-[24px] py-0 gap-[2px] w-[201px] h-[54px] bg-[#FAF9F9] rounded-[9999px] hover:bg-[#F3F2EE] transition-colors text-left focus:outline-none"
              >
                <span className="font-brothers text-[10px] leading-[12px] uppercase text-[#4E332D]">
                  PROMO
                </span>
                <span className="font-urbanist text-[12px] leading-[14px] text-[#1C1917] truncate">
                  Add promo
                </span>
              </button>

              {/* Slotted 48px Search Button */}
              <button
                type="button"
                onClick={handleSimulateSearch}
                disabled={isSearching}
                aria-label="Search"
                aria-busy={isSearching}
                className="box-border flex items-center justify-center w-[48px] h-[48px] bg-[#343833] text-[#EBE8E0] rounded-[9999px] hover:bg-[#272A26] active:scale-95 transition-all focus:outline-none shrink-0 disabled:opacity-60"
              >
                {isSearching ? (
                  <svg
                    className="animate-spin h-4 w-4"
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="#EBE8E0"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="#EBE8E0"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
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

            {/* Anchored Dropdown Popover */}
            {isDropdownOpen && (
              <div className="absolute top-[64px] left-[175px] z-50 animate-in fade-in zoom-in-95 duration-150">
                <SearchBarGuestDropdown
                  counts={counts}
                  onChange={setCounts}
                  onClose={() => setIsDropdownOpen(false)}
                />
              </div>
            )}
          </div>
        </div>

        {/* Section 2: Isolated Standalone Component Card View */}
        <div className="flex flex-col items-center gap-3">
          <span className="text-[11px] font-brothers uppercase tracking-wider text-[#4E332D]">
            Figma Component Isolated Spec (360px × 274px, border: 2px solid #343833)
          </span>

          <SearchBarGuestDropdown counts={counts} onChange={setCounts} />
        </div>

        {/* Section 3: Live State Inspector & Controls */}
        <div className="w-full max-w-[500px] bg-[#FAF9F9] border border-[#DDDDDD] rounded-lg p-4 shadow-sm text-xs font-urbanist flex flex-col gap-3">
          <div className="flex items-center justify-between border-b border-[#DDDDDD] pb-2">
            <span className="font-semibold text-sm text-[#343833]">
              Dropdown State Inspector
            </span>
            <button
              type="button"
              onClick={() =>
                setCounts({ adults: 2, children: 0, accessible: false })
              }
              className="px-2.5 py-1 bg-white border border-[#DDDDDD] rounded hover:bg-gray-50 text-[#343833] transition-colors"
            >
              Reset to Defaults
            </button>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="bg-[#F4F3F0] p-2.5 rounded border border-[#E1E0E0]">
              <span className="text-gray-500 block text-[10px] uppercase font-bold">
                Adults
              </span>
              <strong className="text-base text-[#343833] font-uchen">
                {counts.adults}
              </strong>
            </div>
            <div className="bg-[#F4F3F0] p-2.5 rounded border border-[#E1E0E0]">
              <span className="text-gray-500 block text-[10px] uppercase font-bold">
                Children
              </span>
              <strong className="text-base text-[#343833] font-uchen">
                {counts.children}
              </strong>
            </div>
            <div className="bg-[#F4F3F0] p-2.5 rounded border border-[#E1E0E0]">
              <span className="text-gray-500 block text-[10px] uppercase font-bold">
                Accessible
              </span>
              <strong className="text-base text-[#343833] font-uchen">
                {counts.accessible ? 'YES' : 'NO'}
              </strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}