// FindYourStayTravelPartyButton.tsx
import React, { useState } from 'react';

export type TravelPartyOption = 'partner' | 'friends' | 'family' | 'solo';

export interface TravelPartyItem {
  id: TravelPartyOption | string;
  title: string;
  subtitle: string;
}

export interface FindYourStayTravelPartyButtonProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'onClick'> {
  /** Unique identifier for the party type */
  id: TravelPartyOption | string;
  /** Primary bold headline (e.g., 'PARTNER') */
  title: string;
  /** Secondary narrative subtitle (e.g., 'Just the two of us') */
  subtitle: string;
  /** Selected active state */
  isSelected?: boolean;
  /** Selection callback supporting async actions */
  onSelect?: (id: string) => Promise<void> | void;
  /** Externally controlled loading state */
  isLoading?: boolean;
  /** Disabled state */
  disabled?: boolean;
  /** Optional container class name */
  className?: string;
}

export const DEFAULT_TRAVEL_PARTY_OPTIONS: TravelPartyItem[] = [
  {
    id: 'partner',
    title: 'PARTNER',
    subtitle: 'Just the two of us',
  },
  {
    id: 'friends',
    title: 'FRIENDS',
    subtitle: 'A crew weekend',
  },
  {
    id: 'family',
    title: 'FAMILY',
    subtitle: 'Grown-ups and kids',
  },
  {
    id: 'solo',
    title: 'SOLO',
    subtitle: 'Time to myself',
  },
];

export const FindYourStayTravelPartyButton: React.FC<FindYourStayTravelPartyButtonProps> = ({
  id,
  title,
  subtitle,
  isSelected = false,
  onSelect,
  isLoading: externalLoading = false,
  disabled = false,
  className = '',
  style = {},
  ...buttonProps
}) => {
  const [internalLoading, setInternalLoading] = useState(false);
  const isBusy = externalLoading || internalLoading;
  const isInteractiveDisabled = disabled || isBusy;

  const handleClick = async () => {
    if (isInteractiveDisabled) return;

    if (onSelect) {
      try {
        const result = onSelect(id);
        if (result instanceof Promise) {
          setInternalLoading(true);
          await result;
        }
      } catch (err) {
        console.error(`Selection failed for travel party option "${id}":`, err);
      } finally {
        setInternalLoading(false);
      }
    }
  };

  const colors = {
    bg: isSelected ? 'rgba(255, 255, 255, 0.7)' : 'rgba(255, 255, 255, 0.25)',
    border: isSelected ? '#4E332D' : '#A79996',
    title: isSelected ? '#4E332D' : '#A79996',
    subtitle: isSelected ? '#4E332D' : '#A79996',
  };

  return (
    <button
      type="button"
      role="radio"
      aria-checked={isSelected}
      aria-busy={isBusy}
      aria-label={`${title}: ${subtitle}${isSelected ? ', selected' : ''}`}
      disabled={isInteractiveDisabled}
      onClick={handleClick}
      className={`group relative flex flex-col justify-center items-start text-left box-border transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-[#4E332D]/30 ${
        disabled
          ? 'opacity-40 cursor-not-allowed'
          : isBusy
          ? 'cursor-wait opacity-90'
          : isSelected
          ? 'cursor-pointer shadow-md'
          : 'cursor-pointer hover:bg-white/35 active:scale-[0.99]'
      } ${className}`}
      style={{
        width: '248px',
        height: '100px',
        padding: '20px',
        gap: '5px',
        borderRadius: '16px',
        backgroundColor: colors.bg,
        borderWidth: '2px',
        borderStyle: 'solid',
        borderColor: colors.border,
        ...style,
      }}
      {...buttonProps}
    >
      {/* Loading Overlay per SKILL.md */}
      {isBusy && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/20 backdrop-blur-[1px] rounded-[14px]">
          <div className="flex items-center gap-2">
            <svg
              className="animate-spin h-4 w-4 text-[#4E332D]"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v8H4z"
              />
            </svg>
            <span
              className="text-[10px] font-bold tracking-wider uppercase text-[#4E332D]"
              style={{ fontFamily: "'Brothers OT', 'League Spartan', sans-serif" }}
            >
              UPDATING...
            </span>
          </div>
        </div>
      )}

      {/* Primary Headline Title */}
      <div className="w-full flex flex-row items-center h-[24px]">
        <span
          className="font-normal uppercase select-none transition-colors duration-200"
          style={{
            fontFamily: "'Brothers OT', 'League Spartan', sans-serif",
            fontSize: '24px',
            lineHeight: '24px',
            letterSpacing: '1.28px',
            color: colors.title,
          }}
        >
          {title}
        </span>
      </div>

      {/* Descriptive Narrative Subtitle */}
      <div className="w-full flex flex-row items-center h-[16px]">
        <span
          className="font-normal select-none transition-colors duration-200"
          style={{
            fontFamily: "'Uchen', 'Noto Serif Tibetan', 'Noto Serif', Georgia, serif",
            fontSize: '12px',
            lineHeight: '16px',
            color: colors.subtitle,
          }}
        >
          {subtitle}
        </span>
      </div>
    </button>
  );
};

export interface TravelPartyGroupProps {
  /** Array of party items to render */
  options?: TravelPartyItem[];
  /** Currently selected option ID */
  value?: string | null;
  /** Selection change handler */
  onChange?: (selectedId: string) => Promise<void> | void;
  /** Global loading state */
  isLoading?: boolean;
  /** Global disabled state */
  disabled?: boolean;
  /** Optional container class name */
  className?: string;
}

export const TravelPartyGroup: React.FC<TravelPartyGroupProps> = ({
  options = DEFAULT_TRAVEL_PARTY_OPTIONS,
  value,
  onChange,
  isLoading = false,
  disabled = false,
  className = '',
}) => {
  return (
    <div
      role="radiogroup"
      aria-label="Select your travel party"
      className={`grid grid-cols-1 sm:grid-cols-2 gap-5 w-full max-w-[516px] select-none ${className}`}
    >
      {options.map((option) => (
        <FindYourStayTravelPartyButton
          key={option.id}
          id={option.id}
          title={option.title}
          subtitle={option.subtitle}
          isSelected={value === option.id}
          onSelect={onChange}
          isLoading={isLoading}
          disabled={disabled}
        />
      ))}
    </div>
  );
};
