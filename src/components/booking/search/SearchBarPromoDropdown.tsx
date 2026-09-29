// SearchBarPromoDropdown.tsx
import React, { useState, useRef, useEffect, useId } from 'react';

export interface SearchBarPromoDropdownProps {
  value?: string;
  initialValue?: string;
  onChange?: (val: string) => void;
  onApply?: (val: string) => Promise<void> | void;
  onClose?: () => void;
  className?: string;
}

export interface PromoValidationResult {
  isValid: boolean;
  discountDescription?: string;
  errorMessage?: string;
}

/**
 * Checkmark vector for valid promo codes
 */
const CheckIcon: React.FC<{ color?: string; className?: string }> = ({
  color = '#2E6930',
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
 * Clear cross icon for resetting input
 */
const ClearIcon: React.FC<{ color?: string; className?: string }> = ({
  color = '#4E332D',
  className = '',
}) => (
  <svg
    width="12"
    height="12"
    viewBox="0 0 12 12"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    aria-hidden="true"
  >
    <path
      d="M1 1L11 11M11 1L1 11"
      stroke={color}
      strokeWidth="1.6"
      strokeLinecap="round"
    />
  </svg>
);

/**
 * SearchBarPromoDropdown Component
 * Strictly conforms to SearchBarPromoDropdown.css & SearchBarPromoDropdown.pdf:
 * - Outer Box: 275px width, 151px height, 24px padding
 * - Background: #FAF9F9, Border: 2px solid #343833, Radius: 0px
 * - Inner container: 223px x 99px, padding 8px 0px, gap 8px
 * - Label: 'Brothers OT', 14px / 17px, uppercase, #343833
 * - Input line: border-bottom 1px solid #4E332D, 'Uchen' 16px / 30px
 */
export const SearchBarPromoDropdown: React.FC<SearchBarPromoDropdownProps> = ({
  value: controlledValue,
  initialValue = '',
  onChange,
  onApply,
  onClose,
  className = '',
}) => {
  const [internalValue, setInternalValue] = useState<string>(initialValue);
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [statusFeedback, setStatusFeedback] = useState<PromoValidationResult | null>(null);

  const isControlled = controlledValue !== undefined;
  const currentValue = isControlled ? controlledValue : internalValue;

  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input automatically upon mounting
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const text = e.target.value;
    if (!isControlled) {
      setInternalValue(text);
    }
    setStatusFeedback(null);
    onChange?.(text);
  };

  const handleClear = () => {
    if (!isControlled) {
      setInternalValue('');
    }
    setStatusFeedback(null);
    onChange?.('');
    inputRef.current?.focus();
  };

  const handleApply = async () => {
    const trimmed = currentValue.trim();
    if (!trimmed) {
      setStatusFeedback({
        isValid: false,
        errorMessage: 'Please enter a code',
      });
      return;
    }

    setIsVerifying(true);
    setStatusFeedback(null);

    try {
      if (onApply) {
        await onApply(trimmed);
      } else {
        // Default local verification according to SKILL.md
        await new Promise((resolve) => setTimeout(resolve, 600));
        const normalized = trimmed.toUpperCase();
        if (
          normalized === 'FALL2026' ||
          normalized === 'VIPGUEST' ||
          normalized === 'SAVE20'
        ) {
          setStatusFeedback({
            isValid: true,
            discountDescription: '20% discount applied!',
          });
        } else {
          setStatusFeedback({
            isValid: false,
            errorMessage: 'Code not found or expired',
          });
        }
      }
    } catch {
      setStatusFeedback({
        isValid: false,
        errorMessage: 'Failed to apply code',
      });
    } finally {
      setIsVerifying(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleApply();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onClose?.();
    }
  };

  return (
    <div
      role="dialog"
      aria-label="Promo code entry"
      className={`box-border relative flex flex-col items-start p-[24px] w-[275px] max-w-[2089px] h-[151px] max-h-[520px] bg-[#FAF9F9] border-2 border-[#343833] shadow-[0px_10px_15px_-3px_rgba(0,0,0,0.1),0px_4px_6px_-4px_rgba(0,0,0,0.1)] rounded-none select-none overflow-hidden ${className}`}
    >
      {/* Container: 223px x 99px, padding: 8px 0px, gap: 8px */}
      <div className="flex flex-col items-start py-[8px] px-0 gap-[8px] w-[223px] h-[99px] self-stretch">
        {/* Label: 223px x 17px, font-brothers */}
        <div className="flex flex-col items-start p-0 w-[223px] h-[17px] self-stretch">
          <label
            htmlFor={inputId}
            className="w-[223px] h-[17px] font-brothers text-[14px] leading-[17px] uppercase text-[#343833] flex items-center cursor-pointer tracking-wider"
          >
            PROMO
          </label>
        </div>

        {/* Input Container: 223px x 58px */}
        <div className="relative w-[223px] h-[58px] flex flex-col justify-end">
          <div className="box-border flex flex-row items-center w-full h-[50px] border-b border-[#4E332D] bg-[#FAF9F9] transition-colors focus-within:border-b-2 focus-within:border-[#343833]">
            {/* Promo / Group Code Input Field */}
            <input
              ref={inputRef}
              id={inputId}
              type="text"
              value={currentValue}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              disabled={isVerifying}
              placeholder="Promo/Group Code"
              aria-invalid={statusFeedback ? !statusFeedback.isValid : undefined}
              className="w-full h-[36px] bg-transparent font-uchen text-[16px] leading-[30px] text-[#4E332D] placeholder:text-[#4E332D] placeholder:opacity-100 border-none outline-none p-0 pr-2"
            />

            {/* Trailing action / status indicator */}
            <div className="flex items-center gap-1 shrink-0">
              {isVerifying && (
                <div
                  className="w-4 h-4 border-2 border-[#4E332D] border-t-transparent rounded-full animate-spin"
                  aria-label="Verifying code"
                />
              )}

              {!isVerifying && currentValue && (
                <button
                  type="button"
                  onClick={handleClear}
                  aria-label="Clear promo code input"
                  className="p-1 text-[#4E332D] hover:opacity-70 transition-opacity focus:outline-none"
                >
                  <ClearIcon />
                </button>
              )}

              {!isVerifying && statusFeedback?.isValid && (
                <CheckIcon />
              )}
            </div>
          </div>

          {/* Validation Feedback Line */}
          <div className="h-[16px] mt-1 flex items-center">
            {statusFeedback?.errorMessage && (
              <span className="text-[11px] font-urbanist font-medium text-[#B91C1C]">
                {statusFeedback.errorMessage}
              </span>
            )}
            {statusFeedback?.discountDescription && (
              <span className="text-[11px] font-urbanist font-semibold text-[#15803D]">
                {statusFeedback.discountDescription}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * Interactive Preview Application
 * Displays:
 * 1. Isolated Pixel-Perfect Figma Component View (275px x 151px)
 * 2. Search Bar Integration with Live Popover Dropdown
 * 3. Test Controls for Code Application and Error States
 */
export default function App() {
  const [activeDate] = useState<string>('Add dates');
  const [activeGuests] = useState<string>('2 guests');
  const [promoValue, setPromoValue] = useState<string>('');
  const [isPromoOpen, setIsPromoOpen] = useState<boolean>(false);
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
        setIsPromoOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleApplyPromo = async (code: string) => {
    await new Promise((resolve) => setTimeout(resolve, 800));
    const upper = code.trim().toUpperCase();
    if (upper === 'FALL2026' || upper === 'VIPGUEST' || upper === 'SAVE20') {
      setPromoValue(upper);
      setToastMessage(`Promo code applied: ${upper} (20% off)`);
      setTimeout(() => setIsPromoOpen(false), 900);
    } else {
      throw new Error('Invalid code');
    }
  };

  const handleSearch = async () => {
    if (isSearching) return;
    setIsSearching(true);
    setToastMessage('Searching stays with selected criteria...');

    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setToastMessage(
        `Search confirmed! ${promoValue ? `Promo applied: ${promoValue}` : 'Standard rates.'}`
      );
    } catch {
      setToastMessage('Search request failed. Please try again.');
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#EAE8E3] flex flex-col items-center justify-start py-10 px-4 text-[#343833]">
      {/* Design System Typography Imports */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Urbanist:wght@400;500;600;700&family=Uchen&family=Cinzel:wght@600;700&display=swap');

        .font-brothers {
          font-family: 'Brothers OT', 'Cinzel', Georgia, serif;
          letter-spacing: 0.05em;
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
            Search Bar Promo Dropdown
          </h1>
          <p className="text-xs text-[#4E332D] mt-1 font-urbanist">
            Exact design specifications from SearchBarPromoDropdown.css & PDF
          </p>
        </div>

        {/* Global Feedback Banner compliant with SKILL.md */}
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
            Live Attached Preview (Click "PROMO" to open dropdown)
          </span>

          <div className="relative">
            {/* 692px Search Bar matching SearchBar.css */}
            <div
              role="search"
              aria-label="Accommodation search bar"
              className="box-border flex flex-row items-center justify-between w-[692px] h-[56px] bg-[#FAF9F9] border border-[#DDDDDD] rounded-[9999px] pr-[5px] shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.1),0px_2px_4px_-2px_rgba(0,0,0,0.1)]"
            >
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

              <div className="w-[1px] h-[30px] bg-[#DDDDDD] shrink-0" />

              {/* PROMO (Trigger for Dropdown) */}
              <button
                type="button"
                onClick={() => setIsPromoOpen((prev) => !prev)}
                aria-expanded={isPromoOpen}
                aria-haspopup="dialog"
                className={`box-border flex flex-col justify-center items-start px-[24px] py-0 gap-[2px] w-[201px] h-[54px] rounded-[9999px] transition-colors text-left focus:outline-none ${
                  isPromoOpen
                    ? 'bg-[#EAE8E3]'
                    : 'bg-[#FAF9F9] hover:bg-[#F3F2EE]'
                }`}
              >
                <span className="font-brothers text-[10px] leading-[12px] uppercase text-[#4E332D]">
                  PROMO
                </span>
                <span className="font-urbanist text-[12px] leading-[14px] text-[#1C1917] truncate font-medium">
                  {promoValue ? promoValue : 'Add promo'}
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
            {isPromoOpen && (
              <div className="absolute top-[64px] right-[52px] z-50 animate-in fade-in zoom-in-95 duration-150">
                <SearchBarPromoDropdown
                  value={promoValue}
                  onChange={setPromoValue}
                  onApply={handleApplyPromo}
                  onClose={() => setIsPromoOpen(false)}
                />
              </div>
            )}
          </div>
        </div>

        {/* Section 2: Isolated Figma Specification View */}
        <div className="flex flex-col items-center gap-3">
          <span className="text-[11px] font-brothers uppercase tracking-wider text-[#4E332D]">
            Figma Component Isolated Spec (275px × 151px, border: 2px solid #343833)
          </span>

          <SearchBarPromoDropdown
            value={promoValue}
            onChange={setPromoValue}
            onApply={handleApplyPromo}
          />
        </div>

        {/* Section 3: Interactive State Inspector */}
        <div className="w-full max-w-[500px] bg-[#FAF9F9] border border-[#DDDDDD] rounded-lg p-4 shadow-sm text-xs font-urbanist flex flex-col gap-3">
          <div className="flex items-center justify-between border-b border-[#DDDDDD] pb-2">
            <span className="font-semibold text-sm text-[#343833]">
              Promo State & Quick Test Codes
            </span>
            <button
              type="button"
              onClick={() => {
                setPromoValue('');
                setToastMessage(null);
              }}
              className="px-2.5 py-1 bg-white border border-[#DDDDDD] rounded hover:bg-gray-50 text-[#343833] transition-colors"
            >
              Clear Promo
            </button>
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <span className="text-gray-500">Current Code:</span>
              <span className="font-mono font-semibold bg-[#EAE8E3] px-2 py-0.5 rounded text-[#343833]">
                {promoValue || '(None)'}
              </span>
            </div>

            <div className="flex items-center gap-2 flex-wrap pt-1">
              <span className="text-gray-500">Try Valid Codes:</span>
              <button
                type="button"
                onClick={() => setPromoValue('FALL2026')}
                className="px-2 py-0.5 bg-[#FAF9F9] border border-[#343833] rounded hover:bg-[#EAE8E3] transition-colors font-mono"
              >
                FALL2026
              </button>
              <button
                type="button"
                onClick={() => setPromoValue('VIPGUEST')}
                className="px-2 py-0.5 bg-[#FAF9F9] border border-[#343833] rounded hover:bg-[#EAE8E3] transition-colors font-mono"
              >
                VIPGUEST
              </button>
              <button
                type="button"
                onClick={() => setPromoValue('INVALID99')}
                className="px-2 py-0.5 bg-[#FAF9F9] border border-red-300 text-red-600 rounded hover:bg-red-50 transition-colors font-mono"
              >
                INVALID99
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}