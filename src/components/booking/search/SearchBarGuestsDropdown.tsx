// SearchBarGuestDropdown.tsx
import React, { useState, useId } from 'react';

export interface GuestCounts {
  adults: number;
  children: number;
  infants: number;
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
 * - Dimensions: 360px width, 345px height, 24px padding
 * - Background: #FAF9F9, Border: 2px solid #343833, Radius: 0px
 * - Shadow: 0px 10px 15px -3px rgba(0, 0, 0, 0.1), 0px 4px 6px -4px rgba(0, 0, 0, 0.1)
 * - Row 1: Adults (Age 13+)
 * - Row 2: Children (Ages 4–12)
 * - Row 3: Infants (Under 4)
 * - Row 4: Accessible (ADA Rooms)
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
    infants: initialCounts?.infants ?? 0,
    accessible: initialCounts?.accessible ?? false,
  });

  const isControlled = controlledCounts !== undefined;
  const currentCounts = isControlled ? controlledCounts : internalCounts;

  const adultId = useId();
  const childrenId = useId();
  const infantsId = useId();
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

  const handleInfantsChange = (delta: number) => {
    const nextVal = Math.min(10, Math.max(0, currentCounts.infants + delta));
    updateCounts({ ...currentCounts, infants: nextVal });
  };

  const handleToggleAccessible = () => {
    updateCounts({ ...currentCounts, accessible: !currentCounts.accessible });
  };

  const isAdultMinusDisabled = currentCounts.adults <= 1;
  const isChildrenMinusDisabled = currentCounts.children <= 0;
  const isInfantsMinusDisabled = currentCounts.infants <= 0;
  const isInfantsPlusDisabled = currentCounts.infants >= 10;

  return (
    <div
      role="dialog"
      aria-label="Guest selection"
      className={`relative box-border flex h-86.25 max-h-130 w-90 max-w-full select-none flex-col items-start rounded-none border-2 border-input-border bg-input-bg p-6 text-foreground shadow-[0px_10px_15px_-3px_rgba(0,0,0,0.1),0px_4px_6px_-4px_rgba(0,0,0,0.1)] ${className}`}
    >
      {/* guests-dropdown (308px x 293px, gap: 12px) */}
      <div className="flex h-73.25 w-full flex-col items-start gap-3 p-0 self-stretch">
        {/* ROW 1: Adults (308px x 57px, padding: 8px 0px) */}
        <div className="flex flex-row items-center py-2 px-0 w-77 h-14.25 self-stretch">
          {/* Text block: Adults + Age 13+ (196px x 41px) */}
          <div className="flex flex-col items-start p-0 gap-px w-49 h-10.25 flex-1">
            <p
              id={adultId}
              className="m-0 flex h-4.25 w-49 items-center font-label text-[14px] uppercase leading-[17px] text-foreground"
            >
              Adults
            </p>
            <p className="font-body text-[12.1px] leading-[23px] text-ash m-0 w-49 h-5.75 flex items-center">
              Age 13+
            </p>
          </div>

          {/* Stepper container (112px x 32px, padding-left: 12px) */}
          <div className="flex flex-col items-start pl-3 pr-0 py-0 w-28 h-8 shrink-0">
            <div className="flex flex-row items-center p-0 w-25 h-8 justify-between">
              {/* Component Subtract (32px x 32px, border-radius: 17px) */}
              <button
                type="button"
                onClick={() => handleAdultsChange(-1)}
                disabled={isAdultMinusDisabled}
                aria-label="Decrease adult guests"
                className={`box-border flex h-8 w-8 flex-row items-center justify-center rounded-card-media bg-input-bg p-1.375 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-input-border ${
                  isAdultMinusDisabled
                    ? 'border border-mist cursor-not-allowed opacity-40'
                    : 'cursor-pointer border border-input-border hover:bg-background active:scale-95'
                }`}
              >
                <div className="w-4.5 h-4.5 flex items-center justify-center opacity-80">
                  <StepperMinusIcon
                    color={isAdultMinusDisabled ? '#F2F2F2' : '#343833'}
                  />
                </div>
              </button>

              {/* Count (36px x 30px, Uchen font) */}
              <p
                aria-live="polite"
                className="m-0 flex h-7.5 w-9 items-center justify-center text-center font-number text-[16px] leading-[30px] text-foreground"
              >
                {currentCounts.adults}
              </p>

              {/* Component Add (32px x 32px, border-radius: 17px) */}
              <button
                type="button"
                onClick={() => handleAdultsChange(1)}
                aria-label="Increase adult guests"
                className="box-border flex h-8 w-8 cursor-pointer flex-row items-center justify-center rounded-card-media border border-input-border bg-input-bg p-1.375 transition-colors hover:bg-background focus:outline-none focus-visible:ring-2 focus-visible:ring-input-border active:scale-95"
              >
                <div className="w-4.5 h-4.5 flex items-center justify-center opacity-80">
                  <StepperPlusIcon color="#343833" />
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Divider 1 (308px x 1px, #E1E0E0) */}
        <div
          className="w-77 h-0.25 bg-alpine-linen-fade self-stretch shrink-0"
          aria-hidden="true"
        />

        {/* ROW 2: Children (308px x 58px, padding: 8px 0px) */}
        <div className="flex flex-row items-center py-2 px-0 w-77 h-14.5 self-stretch">
          {/* Text block: Children + Age up to 12 (196px x 42px) */}
          <div className="flex flex-col items-start p-0 gap-px w-49 h-10.5 flex-1">
            <p
              id={childrenId}
              className="m-0 flex h-4.25 w-49 items-center font-label text-[14px] uppercase leading-[17px] text-foreground"
            >
              Children
            </p>
            <p className="font-body text-[12.9px] leading-[24px] text-ash m-0 w-49 h-6 flex items-center">
              Ages 4–12
            </p>
          </div>

          {/* Stepper container (112px x 32px, padding-left: 12px) */}
          <div className="flex flex-col items-start pl-3 pr-0 py-0 w-28 h-8 shrink-0">
            <div className="flex flex-row items-center p-0 w-25 h-8 justify-between">
              {/* Component Subtract */}
              <button
                type="button"
                onClick={() => handleChildrenChange(-1)}
                disabled={isChildrenMinusDisabled}
                aria-label="Decrease child guests"
                className={`box-border flex h-8 w-8 flex-row items-center justify-center rounded-card-media bg-input-bg p-1.375 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-input-border ${
                  isChildrenMinusDisabled
                    ? 'border border-mist cursor-not-allowed opacity-40'
                    : 'cursor-pointer border border-input-border hover:bg-background active:scale-95'
                }`}
              >
                <div className="w-4.5 h-4.5 flex items-center justify-center opacity-80">
                  <StepperMinusIcon
                    color={isChildrenMinusDisabled ? '#F2F2F2' : '#343833'}
                  />
                </div>
              </button>

              {/* Count (36px x 30px, Uchen font) */}
              <p
                aria-live="polite"
                className="m-0 flex h-7.5 w-9 items-center justify-center text-center font-number text-[16px] leading-[30px] text-foreground"
              >
                {currentCounts.children}
              </p>

              {/* Component Add */}
              <button
                type="button"
                onClick={() => handleChildrenChange(1)}
                aria-label="Increase child guests"
                className={`box-border flex h-8 w-8 cursor-pointer flex-row items-center justify-center rounded-card-media bg-input-bg p-1.375 transition-colors hover:bg-background focus:outline-none focus-visible:ring-2 focus-visible:ring-input-border active:scale-95 ${
                  currentCounts.children === 0
                    ? 'border border-alpine-linen-fade'
                    : 'border border-input-border'
                }`}
              >
                <div className="w-4.5 h-4.5 flex items-center justify-center opacity-80">
                  <StepperPlusIcon color="#343833" />
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Divider 2 (308px x 1px, #E1E0E0) */}
        <div
          className="w-77 h-0.25 bg-alpine-linen-fade self-stretch shrink-0"
          aria-hidden="true"
        />

        {/* ROW 3: Infants (308px x 58px, padding: 8px 0px) */}
        <div className="flex h-14.5 w-full flex-row items-center px-0 py-2 self-stretch">
          <div className="flex h-10.5 flex-1 flex-col items-start gap-px p-0">
            <p
              id={infantsId}
              className="m-0 flex h-4.25 items-center font-label text-[14px] uppercase leading-[17px] text-foreground"
            >
              Infants
            </p>
            <p className="m-0 flex h-6 items-center font-body text-[12.9px] leading-[24px] text-ash">
              Under 4 · in a cot
            </p>
          </div>

          <div className="flex h-8 w-28 shrink-0 flex-col items-start py-0 pl-3 pr-0">
            <div className="flex h-8 w-25 flex-row items-center justify-between p-0">
              <button
                type="button"
                onClick={() => handleInfantsChange(-1)}
                disabled={isInfantsMinusDisabled}
                aria-label="Decrease infant guests"
                className={`box-border flex h-8 w-8 flex-row items-center justify-center rounded-card-media bg-input-bg p-1.375 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-input-border ${
                  isInfantsMinusDisabled
                    ? 'cursor-not-allowed border border-mist opacity-40'
                    : 'cursor-pointer border border-input-border hover:bg-background active:scale-95'
                }`}
              >
                <div className="flex h-4.5 w-4.5 items-center justify-center opacity-80">
                  <StepperMinusIcon color={isInfantsMinusDisabled ? '#F2F2F2' : '#343833'} />
                </div>
              </button>

              <p
                aria-live="polite"
                className="m-0 flex h-7.5 w-9 items-center justify-center text-center font-number text-[16px] leading-[30px] text-foreground"
              >
                {currentCounts.infants}
              </p>

              <button
                type="button"
                onClick={() => handleInfantsChange(1)}
                disabled={isInfantsPlusDisabled}
                aria-label="Increase infant guests"
                className={`box-border flex h-8 w-8 flex-row items-center justify-center rounded-card-media bg-input-bg p-1.375 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-input-border ${
                  isInfantsPlusDisabled
                    ? 'cursor-not-allowed border border-mist opacity-40'
                    : 'cursor-pointer border border-input-border hover:bg-background active:scale-95'
                }`}
              >
                <div className="flex h-4.5 w-4.5 items-center justify-center opacity-80">
                  <StepperPlusIcon color={isInfantsPlusDisabled ? '#F2F2F2' : '#343833'} />
                </div>
              </button>
            </div>
          </div>
        </div>

        <div
          className="h-0.25 w-full shrink-0 self-stretch bg-alpine-linen-fade"
          aria-hidden="true"
        />

        {/* ROW 4: Accessible (308px x 57px, padding: 8px 0px) */}
        <div className="flex flex-row items-center py-2 px-0 w-77 h-14.25 self-stretch">
          {/* Text block: Accessible + ADA Rooms (258px x 41px, pr: 16px) */}
          <div className="flex flex-col items-start pr-4 py-0 w-64.5 h-10.25 flex-1">
            <div className="flex flex-col justify-center items-start p-0 w-60.5 h-10.25 self-stretch">
              <p
                id={accessibleId}
                className="m-0 flex h-4.25 w-60 items-center font-label text-[14px] uppercase leading-[17px] text-foreground"
              >
                Accessible
              </p>
              <p className="font-body text-[12.9px] leading-[24px] text-ash m-0 w-60.5 h-6 flex items-center">
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
            className={`relative box-border flex h-8 w-12.5 shrink-0 cursor-pointer flex-row items-center rounded-card p-0.5 transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-input-border ${
              currentCounts.accessible ? 'bg-smoke' : 'bg-alpine-linen-fade'
            }`}
          >
            {/* Sliding Thumb (28px x 28px, rounded: 14px, #FAF9F9) */}
            <div
              className={`flex h-7 w-7 transform flex-col items-center justify-center rounded-control bg-input-bg shadow-sm transition-transform duration-200 ${
                currentCounts.accessible ? 'translate-x-4.5' : 'translate-x-0'
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
 * 1. Isolated Figma Specification View of SearchBarGuestDropdown (360px x 345px)
 * 2. Search Bar Integration with Live Popover Dropdown
 * 3. State & Sync Controls compliant with SKILL.md
 */
