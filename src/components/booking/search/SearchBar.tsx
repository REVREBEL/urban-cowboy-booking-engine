// SearchBar.tsx
import * as React from 'react';

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
      'box-border inline-flex items-center justify-center text-center font-button bg-smoke text-alpine-linen transition-all duration-150 select-none focus:outline-none focus-visible:ring-2 focus-visible:ring-smoke focus-visible:ring-offset-2';

    const stateClasses = isInteractive
      ? 'cursor-pointer hover:bg-lake-forest active:bg-lake-forest active:scale-[0.98]'
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
          className={`${baseClasses} ${stateClasses} w-12 h-12 rounded-full p-0 shrink-0 ${className}`}
          {...props}
        >
          {isLoading ? (
            <ButtonSpinner />
          ) : (
            <div className="w-4.19 h-4.19 p-0.5 flex items-center justify-center">
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
          className={`${baseClasses} ${stateClasses} w-12 h-12 rounded-field p-0 shrink-0 ${className}`}
          {...props}
        >
          {isLoading ? (
            <ButtonSpinner />
          ) : (
            <div className="w-4.19 h-4.19 p-0.5 flex items-center justify-center">
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
          className={`${baseClasses} ${stateClasses} w-28.75 h-14 rounded-field px-6 py-4.5 gap-2 shrink-0 ${className}`}
          {...props}
        >
          {isLoading ? (
            <ButtonSpinner />
          ) : (
            <>
              <span className="flex h-5 w-11 items-center justify-center text-center font-button text-[14px] font-semibold leading-[20px] text-alpine-linen">
                {children || 'Search'}
              </span>
              <div className="relative w-3.75 h-2.75 shrink-0 flex items-center justify-center">
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
        className={`${baseClasses} ${stateClasses} w-28.75 h-14 rounded-full px-6 py-4.5 gap-2 shrink-0 ${className}`}
        {...props}
      >
        {isLoading ? (
          <ButtonSpinner />
        ) : (
          <>
            <span className="flex h-5 w-11 items-center justify-center text-center font-button text-[14px] font-semibold leading-[20px] text-alpine-linen">
              {children || 'Search'}
            </span>
            <div className="relative w-3.75 h-2.75 shrink-0 flex items-center justify-center">
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
    'group relative box-border flex flex-col justify-center items-start min-w-0 px-6 py-0 gap-0.5 h-13.5 bg-paper transition-colors rounded-full hover:bg-alpine-linen-fade focus:outline-none cursor-pointer text-left';

  return (
    <div
      role="search"
      aria-label="Accommodation search bar"
      className={`box-border flex flex-row items-center justify-center w-173 min-w-173 h-14 bg-paper border border-alpine-linen-fade shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.1),0px_2px_4px_-2px_rgba(0,0,0,0.1)] ${
        isCircle ? 'rounded-full pr-1.25' : 'rounded-field pr-0.75'
      } ${className}`}
    >
      {/* 1. Date Section (WHEN) */}
      <button
        type="button"
        onClick={onDateClick}
        className={`${sectionBaseStyle} w-50.25 flex-1`}
        aria-label={`${dateLabel}: ${dateValue}`}
      >
        <div className="flex flex-row items-center p-0 w-38.25 h-3 self-stretch">
          <span className="h-3 w-auto font-label text-[10px] font-normal uppercase leading-[12px] tracking-[0.08em] text-cowboy-umber/60">
            {dateLabel}
          </span>
        </div>
        <div className="flex flex-row items-center p-0 w-38.25 h-5.5 max-h-7 self-stretch">
          <span className="truncate font-body text-[12px] font-normal leading-[22px] normal-case text-cowboy-umber">
            {dateValue}
          </span>
        </div>
        <span
          aria-hidden="true"
          className="absolute bottom-1.5 left-4 right-4 h-0.5 origin-left scale-x-0 bg-copper transition-transform group-hover:scale-x-100 group-focus-visible:scale-x-100"
        />
      </button>

      {/* Vertical Rule */}
      <div
        className="flex flex-row items-start px-2 py-0 w-4.25 h-7.5 shrink-0"
        aria-hidden="true"
      >
        <div className="w-0.25 h-7.5 bg-alpine-linen-fade" />
      </div>

      {/* 2. Guest Section (GUESTS) */}
      <button
        type="button"
        onClick={onGuestClick}
        className={`${sectionBaseStyle} w-50.25 flex-1`}
        aria-label={`${guestLabel}: ${guestValue}`}
      >
        <div className="flex flex-row items-center p-0 w-38.25 h-3 self-stretch">
          <span className="h-3 w-auto font-label text-[10px] font-normal uppercase leading-[12px] tracking-[0.08em] text-cowboy-umber/60">
            {guestLabel}
          </span>
        </div>
        <div className="flex flex-row items-center p-0 w-38.25 h-5.5 max-h-7 self-stretch">
          <span className="truncate font-body text-[12px] font-normal leading-[22px] normal-case text-cowboy-umber">
            {guestValue}
          </span>
        </div>
        <span
          aria-hidden="true"
          className="absolute bottom-1.5 left-4 right-4 h-0.5 origin-left scale-x-0 bg-copper transition-transform group-hover:scale-x-100 group-focus-visible:scale-x-100"
        />
      </button>

      {/* Vertical Rule */}
      <div
        className="flex flex-row items-start px-2 py-0 w-4.25 h-7.5 shrink-0"
        aria-hidden="true"
      >
        <div className="w-0.25 h-7.5 bg-alpine-linen-fade" />
      </div>

      {/* 3. Promo Section (PROMO) */}
      <button
        type="button"
        onClick={onPromoClick}
        className={`${sectionBaseStyle} w-50.25 flex-1`}
        aria-label={`${promoLabel}: ${promoValue}`}
      >
        <div className="flex flex-row items-center p-0 w-38.25 h-3 self-stretch">
          <span className="h-3 w-auto font-label text-[10px] font-normal uppercase leading-[12px] tracking-[0.08em] text-cowboy-umber/60">
            {promoLabel}
          </span>
        </div>
        <div className="flex flex-row items-center p-0 w-38.25 h-3.5 max-h-7 self-stretch">
          <span className="truncate font-body text-[12px] font-normal leading-[14px] normal-case text-cowboy-umber">
            {promoValue}
          </span>
        </div>
        <span
          aria-hidden="true"
          className="absolute bottom-1.5 left-4 right-4 h-0.5 origin-left scale-x-0 bg-copper transition-transform group-hover:scale-x-100 group-focus-visible:scale-x-100"
        />
      </button>

      {/* 4. Button Slot — expands to the custom button width while remaining inside the 692px bar */}
      <div
        className={`box-border flex flex-row items-center justify-center p-0 shrink-0 ${
          buttonSlot ? 'w-fit h-14' : 'w-12 h-12'
        }`}
      >
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
