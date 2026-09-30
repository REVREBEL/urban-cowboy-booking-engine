import React from 'react';

export type SearchButtonVariant = 'full-circle' | 'icon-circle' | 'full-square' | 'icon-square';

export interface SearchButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: SearchButtonVariant;
  isLoading?: boolean;
}

export const SearchButton = React.forwardRef<HTMLButtonElement, SearchButtonProps>(
  ({ variant = 'full-circle', isLoading = false, disabled, className = '', children = 'Search', ...props }, ref) => {
    const compact = variant.startsWith('icon');
    const square = variant.endsWith('square');
    return (
      <button
        ref={ref}
        type="button"
        disabled={disabled || isLoading}
        aria-label="Search accommodations"
        aria-busy={isLoading}
        className={`items-center justify-center bg-[#4E332D] font-brothers uppercase text-[#FAF9F9] shadow-md transition hover:bg-[#343833] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#9A5636] focus-visible:ring-offset-2 active:scale-[0.98] disabled:opacity-60 ${compact ? 'h-12 w-12 p-0' : 'h-12 gap-2 px-6 text-sm tracking-[1.6px]'} ${square ? 'rounded-[5px]' : 'rounded-full'} ${className}`}
        {...props}
      >
        {!compact && <span>{isLoading ? 'Searching' : children}</span>}
        <span className={`${compact ? 'h-[18px] w-[18px]' : 'h-4 w-4'} shrink-0 bg-[#FAF9F9] [mask-image:url('/assets/icons/ui/arrow-right.svg')] [mask-position:center] [mask-repeat:no-repeat] [mask-size:contain]`} aria-hidden="true" />
      </button>
    );
  }
);

SearchButton.displayName = 'SearchButton';
