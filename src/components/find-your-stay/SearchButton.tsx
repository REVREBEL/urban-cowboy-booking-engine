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
 * Showcase / Preview Component matching SearchButton.pdf layout
 */
export default function App() {
  const [simulateLoading, setSimulateLoading] = useState(false);
  const [clickCount, setClickCount] = useState(0);

  const handleClick = () => {
    setClickCount((prev) => prev + 1);
  };

  const handleSimulateAsync = () => {
    setSimulateLoading(true);
    setTimeout(() => {
      setSimulateLoading(false);
    }, 1500);
  };

  return (
    <div className="min-h-screen w-full bg-[#F4F3F0] flex flex-col items-center justify-center p-6 text-[#343833]">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Urbanist:wght@500;600;700&display=swap');
        .font-urbanist {
          font-family: 'Urbanist', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        }
      `}</style>

      <div className="w-full max-w-md flex flex-col items-center gap-8 bg-[#FAF9F9] border border-[#E1E0E0] p-8 shadow-sm rounded-lg">
        {/* Header */}
        <div className="text-center">
          <h1 className="font-urbanist font-bold text-xl tracking-tight text-[#343833]">
            Search Button Component
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Exact design specifications from SearchButton.css & PDF
          </p>
        </div>

        {/* Button Variants Display matching SearchButton.pdf */}
        <div className="flex flex-col gap-6 items-center w-full py-4 border-y border-[#E1E0E0]">
          {/* Row 1: Circle Variants */}
          <div className="flex flex-col items-center gap-2">
            <span className="text-[11px] uppercase tracking-wider font-semibold text-gray-400">
              Circle Variants (border-radius: 9999px)
            </span>
            <div className="flex items-center gap-4">
              <SearchButton
                variant="full-circle"
                isLoading={simulateLoading}
                onClick={handleClick}
              />
              <SearchButton
                variant="icon-circle"
                isLoading={simulateLoading}
                onClick={handleClick}
              />
            </div>
          </div>

          {/* Row 2: Square Variants */}
          <div className="flex flex-col items-center gap-2">
            <span className="text-[11px] uppercase tracking-wider font-semibold text-gray-400">
              Square Variants (border-radius: 5px)
            </span>
            <div className="flex items-center gap-4">
              <SearchButton
                variant="full-square"
                isLoading={simulateLoading}
                onClick={handleClick}
              />
              <SearchButton
                variant="icon-square"
                isLoading={simulateLoading}
                onClick={handleClick}
              />
            </div>
          </div>
        </div>

        {/* Interactive Controls & SKILL.md Testing */}
        <div className="flex flex-col gap-3 w-full items-center">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleSimulateAsync}
              disabled={simulateLoading}
              className="px-3 py-1.5 text-xs font-medium bg-[#343833] text-[#EBE8E0] rounded hover:bg-[#272a26] transition-colors disabled:opacity-50"
            >
              {simulateLoading ? 'Loading (1.5s)...' : 'Test Async Loading'}
            </button>
            <button
              type="button"
              onClick={() => setClickCount(0)}
              className="px-3 py-1.5 text-xs font-medium border border-[#343833] text-[#343833] rounded hover:bg-gray-100 transition-colors"
            >
              Reset Counter
            </button>
          </div>
          <span className="text-xs text-gray-600">
            Button Clicks Detected:{' '}
            <strong className="text-[#343833] font-semibold">{clickCount}</strong>
          </span>
        </div>
      </div>
    </div>
  );
}
