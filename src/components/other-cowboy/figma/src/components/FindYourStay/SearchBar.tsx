// SearchBar.tsx
import React, { useState } from 'react';

export type SearchBarVariant = 'circle' | 'square';

export type SearchButtonVariant =
  | 'full-circle'
  | 'icon-circle'
  | 'full-square'
  | 'icon-square';

export interface SearchButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: SearchButtonVariant;
  isLoading?: boolean;
}

export interface SearchBarProps {
  variant?: SearchBarVariant;
  dateLabel?: string;
  dateValue?: string;
  guestLabel?: string;
  guestValue?: string;
  promoLabel?: string;
  promoValue?: string;
  buttonSlot?: React.ReactNode;
  isLoading?: boolean;
  onSearch?: () => Promise<void> | void;
  onDateClick?: () => void;
  onGuestClick?: () => void;
  onPromoClick?: () => void;
  className?: string;
}

/**
 * Search Icon matching Figma vectors and coordinates
 * - 'full': 15px x 11px vector
 * - 'icon': 12.76px x 12.76px vector centered in 16.76px container
 */
export const SearchIcon: React.FC<{
  size?: 'full' | 'icon';
  color?: string;
  className?: string;
}> = ({ size = 'icon', color = '#EBE8E0', className = '' }) => {
  if (size === 'icon') {
    return (
      <svg
        width="13"
        height="13"
        viewBox="0 0 13 13"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
        aria-hidden="true"
      >
        <circle
          cx="5.5"
          cy="5.5"
          r="4.25"
          stroke={color}
          strokeWidth="1.6"
          strokeLinecap="round"
        />
        <line
          x1="8.8"
          y1="8.8"
          x2="12"
          y2="12"
          stroke={color}
          strokeWidth="1.6"
          strokeLinecap="round"
        />
      </svg>
    );
  }

  return (
    <svg
      width="15"
      height="11"
      viewBox="0 0 15 11"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <circle
        cx="4.75"
        cy="5.25"
        r="3.75"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <line
        x1="7.75"
        y1="7.75"
        x2="13.75"
        y2="10"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
};

/**
 * Loading Spinner matching the button color scheme
 */
export const ButtonSpinner: React.FC<{ color?: string }> = ({
  color = '#EBE8E0',
}) => (
  <svg
    className="animate-spin h-4 w-4"
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    aria-hidden="true"
  >
    <circle
      className="opacity-25"
      cx="12"
      cy="12"
      r="10"
      stroke={color}
      strokeWidth="4"
    />
    <path
      className="opacity-75"
      fill={color}
      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
    />
  </svg>
);

/**
 * SearchButton Component
 * Supports 'full-circle', 'icon-circle', 'full-square', and 'icon-square'
 */
export const SearchButton = React.forwardRef<
  HTMLButtonElement,
  SearchButtonProps
>(
  (
    {
      variant = 'icon-circle',
      isLoading = false,
      disabled,
      className = '',
      children,
      onClick,
      type = 'button',
      ...props
    },
    ref
  ) => {
    const isInteractive = !disabled && !isLoading;

    const baseClasses =
      'box-border inline-flex items-center justify-center bg-[#343833] text-[#EBE8E0] transition-all duration-150 select-none focus:outline-none focus-visible:ring-2 focus-visible:ring-[#343833] focus-visible:ring-offset-2';

    const stateClasses = isInteractive
      ? 'cursor-pointer hover:bg-[#272a26] active:bg-[#1a1c19] active:scale-[0.98]'
      : 'cursor-not-allowed opacity-60';

    if (variant === 'icon-circle') {
      return (
        <button
          ref={ref}
          type={type}
          disabled={!isInteractive}
          onClick={onClick}
          aria-label="Search"
          aria-busy={isLoading}
          className={`${baseClasses} ${stateClasses} w-[48px] h-[48px] rounded-[9999px] p-0 shrink-0 ${className}`}
          {...props}
        >
          {isLoading ? (
            <ButtonSpinner />
          ) : (
            <div className="w-[16.76px] h-[16.76px] p-[2px] flex items-center justify-center">
              <SearchIcon size="icon" />
            </div>
          )}
        </button>
      );
    }

    if (variant === 'icon-square') {
      return (
        <button
          ref={ref}
          type={type}
          disabled={!isInteractive}
          onClick={onClick}
          aria-label="Search"
          aria-busy={isLoading}
          className={`${baseClasses} ${stateClasses} w-[48px] h-[48px] rounded-[5px] p-0 shrink-0 ${className}`}
          {...props}
        >
          {isLoading ? (
            <ButtonSpinner />
          ) : (
            <div className="w-[16.76px] h-[16.76px] p-[2px] flex items-center justify-center">
              <SearchIcon size="icon" />
            </div>
          )}
        </button>
      );
    }

    if (variant === 'full-square') {
      return (
        <button
          ref={ref}
          type={type}
          disabled={!isInteractive}
          onClick={onClick}
          aria-busy={isLoading}
          className={`${baseClasses} ${stateClasses} w-[115px] h-[56px] rounded-[5px] px-[24px] py-[18px] gap-[8px] shrink-0 ${className}`}
          {...props}
        >
          {isLoading ? (
            <ButtonSpinner />
          ) : (
            <>
              <span className="w-[44px] h-[20px] font-urbanist font-semibold text-[14px] leading-[20px] text-center text-[#EBE8E0]">
                {children || 'Search'}
              </span>
              <div className="relative w-[15px] h-[11px] shrink-0 flex items-center justify-center">
                <SearchIcon size="full" />
              </div>
            </>
          )}
        </button>
      );
    }

    // Default: 'full-circle'
    return (
      <button
        ref={ref}
        type={type}
        disabled={!isInteractive}
        onClick={onClick}
        aria-busy={isLoading}
        className={`${baseClasses} ${stateClasses} w-[115px] h-[56px] rounded-[9999px] px-[24px] py-[18px] gap-[8px] shrink-0 ${className}`}
        {...props}
      >
        {isLoading ? (
          <ButtonSpinner />
        ) : (
          <>
            <span className="w-[44px] h-[20px] font-urbanist font-semibold text-[14px] leading-[20px] text-center text-[#EBE8E0]">
              {children || 'Search'}
            </span>
            <div className="relative w-[15px] h-[11px] shrink-0 flex items-center justify-center">
              <SearchIcon size="full" />
            </div>
          </>
        )}
      </button>
    );
  }
);

SearchButton.displayName = 'SearchButton';

/**
 * SearchBar Component
 * Matches SearchBar.css specifications:
 * - 'circle': w: 692px, h: 56px, border-radius: 9999px, padding-right: 5px
 * - 'square': w: 692px, h: 56px, border-radius: 5px, padding-right: 3px
 * - Sections: WHEN (date), GUESTS (counter), PROMO (discount/code)
 * - buttonSlot: Dedicated 48px x 48px slot for the Search Button component
 */
export const SearchBar: React.FC<SearchBarProps> = ({
  variant = 'circle',
  dateLabel = 'WHEN',
  dateValue = 'Add dates',
  guestLabel = 'GUESTS',
  guestValue = '2 guests',
  promoLabel = 'PROMO',
  promoValue = 'Add promo',
  buttonSlot,
  isLoading = false,
  onSearch,
  onDateClick,
  onGuestClick,
  onPromoClick,
  className = '',
}) => {
  const isCircle = variant === 'circle';

  // Section button style
  const sectionBaseStyle =
    'box-border flex flex-col justify-center items-start px-[24px] py-0 gap-[2px] h-[54px] bg-[#FAF9F9] transition-colors rounded-[9999px] hover:bg-[#f3f2ee] focus:outline-none focus-visible:ring-1 focus-visible:ring-[#343833] cursor-pointer text-left';

  return (
    <div
      role="search"
      aria-label="Accommodation search bar"
      className={`box-border flex flex-row items-center justify-center w-[692px] min-w-[692px] h-[56px] bg-[#FAF9F9] border border-[#DDDDDD] shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.1),0px_2px_4px_-2px_rgba(0,0,0,0.1)] ${
        isCircle ? 'rounded-[9999px] pr-[5px]' : 'rounded-[5px] pr-[3px]'
      } ${className}`}
    >
      {/* 1. Date Section (WHEN) */}
      <button
        type="button"
        onClick={onDateClick}
        className={`${sectionBaseStyle} w-[201px] flex-1`}
        aria-label={`${dateLabel}: ${dateValue}`}
      >
        <div className="flex flex-row items-center p-0 w-[153px] h-[12px] self-stretch">
          <span className="w-auto h-[12px] font-brothers text-[10px] leading-[12px] uppercase text-[#4E332D]">
            {dateLabel}
          </span>
        </div>
        <div className="flex flex-row items-center p-0 w-[153px] h-[22px] max-h-[28px] self-stretch">
          <span className="font-uchen text-[12px] leading-[22px] text-[#1C1917] truncate">
            {dateValue}
          </span>
        </div>
      </button>

      {/* Vertical Rule */}
      <div
        className="flex flex-row items-start px-[8px] py-0 w-[17px] h-[30px] shrink-0"
        aria-hidden="true"
      >
        <div className="w-[1px] h-[30px] bg-[#DDDDDD]" />
      </div>

      {/* 2. Guest Section (GUESTS) */}
      <button
        type="button"
        onClick={onGuestClick}
        className={`${sectionBaseStyle} w-[201px] flex-1`}
        aria-label={`${guestLabel}: ${guestValue}`}
      >
        <div className="flex flex-row items-center p-0 w-[153px] h-[12px] self-stretch">
          <span className="w-auto h-[12px] font-brothers text-[10px] leading-[12px] uppercase text-[#4E332D]">
            {guestLabel}
          </span>
        </div>
        <div className="flex flex-row items-center p-0 w-[153px] h-[22px] max-h-[28px] self-stretch">
          <span className="font-uchen text-[12px] leading-[22px] text-[#1C1917] truncate">
            {guestValue}
          </span>
        </div>
      </button>

      {/* Vertical Rule */}
      <div
        className="flex flex-row items-start px-[8px] py-0 w-[17px] h-[30px] shrink-0"
        aria-hidden="true"
      >
        <div className="w-[1px] h-[30px] bg-[#DDDDDD]" />
      </div>

      {/* 3. Promo Section (PROMO) */}
      <button
        type="button"
        onClick={onPromoClick}
        className={`${sectionBaseStyle} w-[201px] flex-1`}
        aria-label={`${promoLabel}: ${promoValue}`}
      >
        <div className="flex flex-row items-center p-0 w-[153px] h-[12px] self-stretch">
          <span className="w-auto h-[12px] font-brothers text-[10px] leading-[12px] uppercase text-[#4E332D]">
            {promoLabel}
          </span>
        </div>
        <div className="flex flex-row items-center p-0 w-[153px] h-[14px] max-h-[28px] self-stretch">
          <span className="font-urbanist text-[12px] leading-[14px] text-[#1C1917] truncate">
            {promoValue}
          </span>
        </div>
      </button>

      {/* 4. Button Slot (Dedicated 48px x 48px Component Slot) */}
      <div className="box-border flex flex-row items-center justify-center p-0 w-[48px] h-[48px] shrink-0">
        {buttonSlot ? (
          buttonSlot
        ) : (
          <SearchButton
            variant={isCircle ? 'icon-circle' : 'icon-square'}
            isLoading={isLoading}
            disabled={isLoading}
            onClick={onSearch}
          />
        )}
      </div>
    </div>
  );
};

/**
 * Canvas Interactive Showcase
 * Displays:
 * 1. Exact Figma artboard representation from SearchBar.css (728px x 172px container)
 * 2. Side-by-side comparison matching SearchBar.pdf
 * 3. Interactive state testing (Custom Slot, Dates, Guests, Promo, Async Loading)
 */
export default function App() {
  const [activeDate, setActiveDate] = useState<string>('Add dates');
  const [guestCount, setGuestCount] = useState<number>(2);
  const [promoCode, setPromoCode] = useState<string>('Add promo');
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [activeSlotType, setActiveSlotType] = useState<
    'default' | 'full-pill' | 'custom'
  >('default');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const handleSearch = async () => {
    if (isSearching) return;
    setIsSearching(true);
    setToastMessage('Searching accommodations...');

    try {
      // Simulate network request according to SKILL.md
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setToastMessage(
        `Search successful! Found stays for ${guestCount} guests.`
      );
    } catch {
      setToastMessage('Error executing search. Please retry.');
    } finally {
      setIsSearching(false);
    }
  };

  const handleCycleDates = () => {
    const options = [
      'Add dates',
      'Oct 12 - Oct 16',
      'Nov 01 - Nov 05',
      'Dec 24 - Jan 02',
    ];
    const nextIdx = (options.indexOf(activeDate) + 1) % options.length;
    setActiveDate(options[nextIdx]);
  };

  const handleCycleGuests = () => {
    const nextCount = guestCount >= 6 ? 1 : guestCount + 1;
    setGuestCount(nextCount);
  };

  const handleCyclePromo = () => {
    const codes = ['Add promo', 'FALL2026 (-20%)', 'SUMMERDEAL', 'VIPGUEST'];
    const nextIdx = (codes.indexOf(promoCode) + 1) % codes.length;
    setPromoCode(codes[nextIdx]);
  };

  return (
    <div className="min-h-screen w-full bg-[#EAE8E3] flex flex-col items-center justify-start py-10 px-4 text-[#343833]">
      {/* Font imports matching design specification */}
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

      {/* Main Container */}
      <div className="w-full max-w-4xl flex flex-col items-center gap-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="font-brothers text-2xl tracking-wide uppercase text-[#343833]">
            Search Bar with Component Slot
          </h1>
          <p className="text-xs text-[#4E332D] mt-1 font-urbanist">
            Exact layout specs from SearchBar.css & SearchBar.pdf
          </p>
        </div>

        {/* Status Toast */}
        {toastMessage && (
          <div
            role="status"
            className="w-full max-w-[692px] text-xs font-urbanist bg-[#343833] text-[#EBE8E0] px-4 py-2.5 rounded-md shadow-md flex items-center justify-between transition-all"
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

        {/* Section 1: Exact Figma Artboard Representation (728px x 172px container) */}
        <div className="flex flex-col items-center gap-2">
          <span className="text-[11px] font-brothers uppercase tracking-wider text-[#4E332D]">
            Figma Artboard (728px × 172px, dashed border: #9747FF)
          </span>

          <div className="box-border relative w-[728px] h-[172px] border border-dashed border-[#9747FF] rounded-[5px] bg-[#FAF9F9]/40 flex flex-col justify-between p-[20px]">
            {/* Property 1=Default (Pill / Circle variant at top: 20px, left: 20px) */}
            <div className="w-[688px] h-[56px] flex items-center">
              <SearchBar
                variant="circle"
                dateValue={activeDate}
                guestValue={`${guestCount} guest${guestCount === 1 ? '' : 's'}`}
                promoValue={promoCode}
                isLoading={isSearching}
                onSearch={handleSearch}
                onDateClick={handleCycleDates}
                onGuestClick={handleCycleGuests}
                onPromoClick={handleCyclePromo}
                buttonSlot={
                  activeSlotType === 'full-pill' ? (
                    <SearchButton
                      variant="full-circle"
                      isLoading={isSearching}
                      onClick={handleSearch}
                    />
                  ) : undefined
                }
              />
            </div>

            {/* Property 1=Square (Square variant at top: 96px, left: 20px) */}
            <div className="w-[688px] h-[56px] flex items-center">
              <SearchBar
                variant="square"
                dateValue={activeDate}
                guestValue={`${guestCount} guest${guestCount === 1 ? '' : 's'}`}
                promoValue={promoCode}
                isLoading={isSearching}
                onSearch={handleSearch}
                onDateClick={handleCycleDates}
                onGuestClick={handleCycleGuests}
                onPromoClick={handleCyclePromo}
                buttonSlot={
                  activeSlotType === 'full-pill' ? (
                    <SearchButton
                      variant="full-square"
                      isLoading={isSearching}
                      onClick={handleSearch}
                    />
                  ) : undefined
                }
              />
            </div>
          </div>
        </div>

        {/* Interactive Controls & Component Slot Customizer */}
        <div className="w-full max-w-[728px] bg-[#FAF9F9] border border-[#DDDDDD] rounded-lg p-5 shadow-sm flex flex-col gap-4 text-xs font-urbanist">
          <div className="flex items-center justify-between border-b border-[#DDDDDD] pb-3">
            <span className="font-semibold text-sm text-[#343833]">
              Slot & State Controls
            </span>
            <span className="text-[11px] text-gray-500">
              Click sections in the search bar above to toggle values
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Slot Variant Selector */}
            <div className="flex flex-col gap-1.5">
              <span className="font-medium text-[#4E332D]">
                Button Slot Option:
              </span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setActiveSlotType('default')}
                  className={`px-3 py-1.5 rounded text-xs transition-colors ${
                    activeSlotType === 'default'
                      ? 'bg-[#343833] text-[#FAF9F9]'
                      : 'bg-white border border-[#DDDDDD] text-[#343833] hover:bg-gray-100'
                  }`}
                >
                  Icon Only (48px)
                </button>
                <button
                  type="button"
                  onClick={() => setActiveSlotType('full-pill')}
                  className={`px-3 py-1.5 rounded text-xs transition-colors ${
                    activeSlotType === 'full-pill'
                      ? 'bg-[#343833] text-[#FAF9F9]'
                      : 'bg-white border border-[#DDDDDD] text-[#343833] hover:bg-gray-100'
                  }`}
                >
                  Full Button (115px)
                </button>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex flex-col gap-1.5">
              <span className="font-medium text-[#4E332D]">
                Simulation Actions:
              </span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleSearch}
                  disabled={isSearching}
                  className="px-3 py-1.5 bg-[#343833] text-[#EBE8E0] rounded hover:bg-[#272a26] disabled:opacity-50 transition-colors"
                >
                  {isSearching ? 'Searching...' : 'Trigger Search'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setActiveDate('Add dates');
                    setGuestCount(2);
                    setPromoCode('Add promo');
                  }}
                  className="px-3 py-1.5 border border-[#343833] text-[#343833] rounded hover:bg-gray-100 transition-colors"
                >
                  Reset Defaults
                </button>
              </div>
            </div>

            {/* Current Values Display */}
            <div className="flex flex-col gap-1 bg-[#F4F3F0] p-2.5 rounded border border-[#E1E0E0] text-[11px]">
              <div>
                <strong>Dates:</strong> {activeDate}
              </div>
              <div>
                <strong>Guests:</strong> {guestCount} adults
              </div>
              <div>
                <strong>Promo:</strong> {promoCode}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}