// SearchButton.tsx
import React from 'react';

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

/**
 * Search Icon matching Figma vectors and coordinates
 * - 'full': 15px x 11px vector
 * - 'icon': 12.76px x 12.76px vector centered in 16.76px box
 */
export const SearchIcon: React.FC<{
  size?: 'full' | 'icon';
  color?: string;
  className?: string;
}> = ({ size = 'full', color = '#EBE8E0', className = '' }) => {
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
 * Exact dimensions and styles from SearchButton.css:
 * - 'full-circle': 115px x 56px, border-radius: 9999px, padding: 18px 24px, gap: 8px
 * - 'icon-circle': 48px x 48px, border-radius: 9999px
 * - 'full-square': 115px x 56px, border-radius: 5px, padding: 18px 24px, gap: 8px
 * - 'icon-square': 48px x 48px, border-radius: 5px
 */
export const SearchButton = React.forwardRef<
  HTMLButtonElement,
  SearchButtonProps
>(
  (
    {
      variant = 'full-circle',
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
 * Showcase / Preview Component matching SearchButton.pdf layout
 */
