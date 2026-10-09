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
      className={`box-border relative flex flex-col items-start p-[24px] w-[275px] max-w-[2089px] h-[151px] max-h-[520px] bg-paper border-2 border-smoke shadow-[0px_10px_15px_-3px_rgba(0,0,0,0.1),0px_4px_6px_-4px_rgba(0,0,0,0.1)] rounded-none select-none overflow-hidden ${className}`}
    >
      {/* Container: 223px x 99px, padding: 8px 0px, gap: 8px */}
      <div className="flex flex-col items-start py-[8px] px-0 gap-[8px] w-[223px] h-[99px] self-stretch">
        {/* Label: 223px x 17px, font-label */}
        <div className="flex flex-col items-start p-0 w-[223px] h-[17px] self-stretch">
          <label
            htmlFor={inputId}
            className="w-[223px] h-[17px] font-label text-[14px] leading-[17px] uppercase text-smoke flex items-center cursor-pointer tracking-wider"
          >
            PROMO
          </label>
        </div>

        {/* Input Container: 223px x 58px */}
        <div className="relative w-[223px] h-[58px] flex flex-col justify-end">
          <div className="box-border flex flex-row items-center w-full h-[50px] border-b border-cowboy-umber bg-paper transition-colors focus-within:border-b-2 focus-within:border-smoke">
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
              className="w-full h-[36px] bg-transparent font-body text-[16px] leading-[30px] text-cowboy-umber placeholder:text-cowboy-umber placeholder:opacity-100 border-none outline-none p-0 pr-2"
            />

            {/* Trailing action / status indicator */}
            <div className="flex items-center gap-1 shrink-0">
              {isVerifying && (
                <div
                  className="w-4 h-4 border-2 border-cowboy-umber border-t-transparent rounded-full animate-spin"
                  aria-label="Verifying code"
                />
              )}

              {!isVerifying && currentValue && (
                <button
                  type="button"
                  onClick={handleClear}
                  aria-label="Clear promo code input"
                  className="p-1 text-cowboy-umber hover:opacity-70 transition-opacity focus:outline-none"
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
              <span className="text-[11px] font-urbanist font-medium text-bandana-red">
                {statusFeedback.errorMessage}
              </span>
            )}
            {statusFeedback?.discountDescription && (
              <span className="text-[11px] font-urbanist font-semibold text-lake-forest-100">
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
