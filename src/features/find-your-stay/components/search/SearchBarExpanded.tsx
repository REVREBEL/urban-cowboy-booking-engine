import React, { useState } from 'react';

export type SearchBarExpandedVariant = 'circle' | 'square';

export type ActiveDropdownSection = 'property' | 'dates' | 'guests' | 'promo' | null;

export interface SearchBarExpandedValues {
  property: string;
  checkInDate: string;
  checkOutDate: string;
  guests: number;
  promoCode: string;
}

export interface SearchBarExpandedProps {
  variant?: SearchBarExpandedVariant;
  values?: SearchBarExpandedValues;
  initialValues?: Partial<SearchBarExpandedValues>;
  dropdownVisible?: boolean;
  activeSection?: ActiveDropdownSection;
  onSectionClick?: (section: ActiveDropdownSection) => void;
  onValuesChange?: (values: SearchBarExpandedValues) => void;
  onSearch?: (values: SearchBarExpandedValues) => Promise<void> | void;
  buttonSlot?: React.ReactNode;
  dropdownSlot?: React.ReactNode;
  isLoading?: boolean;
  className?: string;
}

export const ExpandedSearchIcon: React.FC<{
  color?: string;
  className?: string;
}> = ({ color = '#EBE8E0', className = '' }) => (
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

export interface ExpandedSearchButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: SearchBarExpandedVariant;
  isLoading?: boolean;
}

export const ExpandedSearchButton = React.forwardRef<
  HTMLButtonElement,
  ExpandedSearchButtonProps
>(
  (
    {
      variant = 'circle',
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
    const isCircle = variant === 'circle';

    return (
      <button
        ref={ref}
        type={type}
        disabled={!isInteractive}
        onClick={onClick}
        aria-label="Search accommodations"
        aria-busy={isLoading}
        className={`box-border flex flex-row justify-center items-center py-[18px] px-[24px] gap-[8px] ${
          isCircle
            ? 'w-[116px] h-[56px] rounded-[999px]'
            : 'w-[123px] h-[61px] rounded-[5px]'
        } bg-[#4E332D] text-[#FAF9F9] transition-all duration-150 select-none focus:outline-none focus-visible:ring-2 focus-visible:ring-[#4E332D] focus-visible:ring-offset-2 ${
          isInteractive
            ? 'cursor-pointer hover:bg-[#3D2723] active:scale-[0.98]'
            : 'cursor-not-allowed opacity-60'
        } ${className}`}
        {...props}
      >
        {isLoading ? (
          <svg
            className="animate-spin h-4 w-4 text-[#FAF9F9]"
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
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        ) : (
          <>
            <span className="w-[52px] h-[20px] font-brothers text-[16px] leading-[20px] text-center text-[#FAF9F9] flex items-center justify-center">
              {children || 'Search'}
            </span>
            <div className="relative w-[15px] h-[11px] shrink-0 flex items-center justify-center">
              <ExpandedSearchIcon color="#EBE8E0" />
            </div>
          </>
        )}
      </button>
    );
  }
);

ExpandedSearchButton.displayName = 'ExpandedSearchButton';

export const SearchBarExpanded: React.FC<SearchBarExpandedProps> = ({
  variant = 'circle',
  values: controlledValues,
  initialValues,
  dropdownVisible = false,
  activeSection: controlledActiveSection,
  onSectionClick,
  onValuesChange,
  onSearch,
  buttonSlot,
  dropdownSlot,
  isLoading = false,
  className = '',
}) => {
  const [internalValues, setInternalValues] = useState<SearchBarExpandedValues>({
    property: initialValues?.property ?? 'CATSKILLS',
    checkInDate: initialValues?.checkInDate ?? '14 Oct 2026',
    checkOutDate: initialValues?.checkOutDate ?? '17 Oct 2026',
    guests: initialValues?.guests ?? 2,
    promoCode: initialValues?.promoCode ?? 'add code',
  });

  const [internalActiveSection, setInternalActiveSection] =
    useState<ActiveDropdownSection>(null);

  const isControlledValues = controlledValues !== undefined;
  const currentValues = isControlledValues ? controlledValues : internalValues;

  const isControlledSection = controlledActiveSection !== undefined;
  const currentActiveSection = isControlledSection
    ? controlledActiveSection
    : internalActiveSection;

  const isCircle = variant === 'circle';

  const handleSectionToggle = (section: ActiveDropdownSection) => {
    const nextSection = currentActiveSection === section ? null : section;
    if (!isControlledSection) {
      setInternalActiveSection(nextSection);
    }
    onSectionClick?.(nextSection);
  };

  const handleSearchSubmit = () => {
    if (isLoading) return;
    onSearch?.(currentValues);
  };

  const sectionButtonBase =
    'box-border flex flex-row items-center bg-[#FAF9F9] rounded-[9999px] transition-colors duration-150 text-left focus:outline-none focus-visible:ring-1 focus-visible:ring-[#4E332D] cursor-pointer';

  return (
    <div
      role="search"
      aria-label="Expanded accommodation search bar"
      className={`box-border flex flex-col justify-center items-center bg-[#FAF9F9] border-2 border-[#4E332D] shadow-[0px_2px_4px_rgba(0,0,0,0.1),0px_4px_6px_rgba(0,0,0,0.1)] backdrop-blur-[8px] transition-all select-none ${
        isCircle
          ? 'w-[1057px] min-h-[82px] rounded-[999px] py-[6px] pl-[24px] pr-[13px]'
          : 'w-[1014px] min-h-[82px] rounded-[5px] py-0 pl-0 pr-[5px]'
      } ${className}`}
    >
      {/* search-bar-wrapper */}
      <div
        className={`flex flex-row items-center ${
          isCircle
            ? 'w-[1008px] h-[66px] pl-[10px]'
            : 'w-[1005px] h-[61px] pl-0'
        }`}
      >
        {/* 1. PROPERTY / LOCATION CONTAINER (222px x 66px / 55px) */}
        <div className="flex flex-col items-start p-0 w-[222px] h-[66px] self-stretch shrink-0 -mx-[3px]">
          <button
            type="button"
            onClick={() => handleSectionToggle('property')}
            aria-expanded={currentActiveSection === 'property'}
            className={`${sectionButtonBase} py-[5px] px-[17px] gap-[5px] w-[222px] ${
              isCircle ? 'h-[66px]' : 'h-[55px]'
            } self-stretch flex-1 ${
              currentActiveSection === 'property'
                ? 'bg-[#EAE8E3]'
                : 'hover:bg-[#F3F2EE]'
            }`}
          >
            {/* Input wrap (205px x 45px) */}
            <div className="flex flex-col items-start p-0 gap-[8px] w-[205px] h-[45px] shrink-0">
              {/* property-label (205px x 17px) */}
              <div className="flex flex-col items-start p-0 gap-[8px] w-[205px] h-[17px] self-stretch shrink-0">
                <span className="w-[49px] h-[17px] font-brothers text-[10px] leading-[16px] uppercase text-[#4E332D]">
                  PROPERTY
                </span>
              </div>
              {/* Location display (205px x 20px) */}
              <div className="flex flex-col items-start p-0 w-[205px] h-[20px] self-stretch shrink-0">
                <div className="flex flex-col items-start p-0 w-auto h-[14px] shrink-0">
                  <span className="font-desert text-[12px] leading-[14px] font-bold tracking-[2px] text-[#4E332D] uppercase truncate">
                    {currentValues.property}
                  </span>
                </div>
              </div>
            </div>
          </button>
        </div>

        {/* Vertical Divider 1 (17px x 30px, padding: 0px 8px) */}
        <div
          className="flex flex-row items-start px-[8px] py-0 w-[17px] h-[30px] shrink-0 -mx-[3px]"
          aria-hidden="true"
        >
          <div className="w-[1px] h-[30px] bg-[#DDDDDD] self-stretch shrink-0" />
        </div>

        {/* 2. DATES CONTAINER: CHECK-IN & CHECK-OUT (326px x 66px) */}
        <div className="flex flex-col items-start p-0 w-[326px] h-[66px] self-stretch shrink-0 -mx-[3px]">
          <button
            type="button"
            onClick={() => handleSectionToggle('dates')}
            aria-expanded={currentActiveSection === 'dates'}
            className={`${sectionButtonBase} py-[5px] px-[17px] gap-[5px] w-[326px] h-[66px] self-stretch flex-1 ${
              currentActiveSection === 'dates'
                ? 'bg-[#EAE8E3]'
                : 'hover:bg-[#F3F2EE]'
            }`}
          >
            {/* Check-In sub-button (124.5px x 56px) */}
            <div className="flex flex-row items-center p-0 w-[124.5px] h-[56px] self-stretch flex-1">
              <div className="flex flex-col items-start p-0 gap-[8px] w-[119px] h-[45px] shrink-0">
                <div className="flex flex-col items-start p-0 gap-[8px] w-[119px] h-[17px] self-stretch shrink-0">
                  <span className="w-[45px] h-[17px] font-brothers text-[10px] leading-[16px] uppercase text-[#4E332D]">
                    CHECK-IN
                  </span>
                </div>
                <div className="flex flex-col items-start p-0 w-[119px] h-[20px] self-stretch shrink-0">
                  <span className="w-auto h-[20px] font-uchen text-[14px] leading-[20px] text-[#4E332D] truncate">
                    {currentValues.checkInDate}
                  </span>
                </div>
              </div>
            </div>

            {/* Inner Date Divider (1px x 56px, padding: 8px 0px) */}
            <div
              className="flex flex-row items-start py-[8px] px-0 w-[1px] h-[56px] self-stretch shrink-0"
              aria-hidden="true"
            >
              <div className="w-[1px] h-[40px] bg-[#061A2D]/10 self-stretch shrink-0" />
            </div>

            {/* Check-Out sub-button (156.5px x 56px, padding: 0px 16px) */}
            <div className="flex flex-row items-center py-0 px-[16px] w-[156.5px] h-[56px] self-stretch flex-1">
              <div className="flex flex-col items-start p-0 gap-[8px] w-[119px] h-[45px] shrink-0">
                <div className="flex flex-col items-start p-0 gap-[8px] w-[119px] h-[17px] self-stretch shrink-0">
                  <span className="w-[53px] h-[17px] font-brothers text-[10px] leading-[16px] uppercase text-[#4E332D]">
                    CHECK-OUT
                  </span>
                </div>
                <div className="flex flex-col items-start p-0 w-[119px] h-[20px] self-stretch shrink-0">
                  <span className="w-auto h-[20px] font-uchen text-[14px] leading-[20px] text-[#4E332D] truncate">
                    {currentValues.checkOutDate}
                  </span>
                </div>
              </div>
            </div>
          </button>
        </div>

        {/* Vertical Divider 2 (17px x 30px, padding: 0px 8px) */}
        <div
          className="flex flex-row items-start px-[8px] py-0 w-[17px] h-[30px] shrink-0 -mx-[3px]"
          aria-hidden="true"
        >
          <div className="w-[1px] h-[30px] bg-[#DDDDDD] self-stretch shrink-0" />
        </div>

        {/* 3. GUESTS CONTAINER (152px x 66px) */}
        <div className="flex flex-row items-center p-0 w-[152px] h-[66px] self-stretch shrink-0 -mx-[3px]">
          <button
            type="button"
            onClick={() => handleSectionToggle('guests')}
            aria-expanded={currentActiveSection === 'guests'}
            className={`${sectionButtonBase} py-[5px] px-[17px] gap-[5px] w-[152px] h-[66px] shrink-0 ${
              currentActiveSection === 'guests'
                ? 'bg-[#EAE8E3]'
                : 'hover:bg-[#F3F2EE]'
            }`}
          >
            <div className="flex flex-col items-start p-0 gap-[8px] w-[118px] h-[45px] flex-1">
              <div className="flex flex-col justify-center items-start p-0 gap-[10px] w-[118px] h-[17px] self-stretch shrink-0">
                <span className="w-[36px] h-[17px] font-brothers text-[10px] leading-[16px] uppercase text-[#4E332D]">
                  GUESTS
                </span>
              </div>
              <div className="flex flex-col items-start p-0 w-[118px] h-[20px] self-stretch shrink-0">
                <span className="w-auto h-[20px] font-uchen text-[14px] leading-[20px] text-[#4E332D]">
                  {currentValues.guests}
                </span>
              </div>
            </div>
          </button>
        </div>

        {/* Vertical Divider 3 (17px x 30px, padding: 0px 8px) */}
        <div
          className="flex flex-row items-start px-[8px] py-0 w-[17px] h-[30px] shrink-0 -mx-[3px]"
          aria-hidden="true"
        >
          <div className="w-[1px] h-[30px] bg-[#DDDDDD] self-stretch shrink-0" />
        </div>

        {/* 4. PROMO CONTAINER (152px x 58px / 56px) */}
        <div
          className={`flex flex-row items-center ${
            isCircle ? 'py-[1px] px-0 h-[58px]' : 'p-0 h-[56px]'
          } gap-[10px] w-[152px] shrink-0 -mx-[3px]`}
        >
          <button
            type="button"
            onClick={() => handleSectionToggle('promo')}
            aria-expanded={currentActiveSection === 'promo'}
            className={`${sectionButtonBase} py-0 px-[17px] w-[152px] h-[56px] shrink-0 ${
              currentActiveSection === 'promo'
                ? 'bg-[#EAE8E3]'
                : 'hover:bg-[#F3F2EE]'
            }`}
          >
            <div className="flex flex-col justify-center items-start p-0 gap-[8px] w-[118px] h-[45px] flex-1">
              <div className="relative w-[118px] h-[17px] self-stretch shrink-0">
                <span className="absolute left-0 top-[calc(50%-8.5px)] w-[35px] h-[17px] font-brothers text-[10px] leading-[16px] uppercase text-[#4E332D]">
                  PROMO
                </span>
              </div>
              <div className="flex flex-col items-start p-0 w-[118px] h-[20px] self-stretch shrink-0">
                <span className="w-auto h-[20px] font-uchen text-[14px] leading-[20px] text-[#4E332D] truncate">
                  {currentValues.promoCode}
                </span>
              </div>
            </div>
          </button>
        </div>

        {/* 5. BUTTON SLOT (116px x 56px for Circle, 123px x 61px for Square) */}
        <div
          className={`flex flex-row items-start p-0 shrink-0 ${
            isCircle ? 'w-[116px] h-[56px]' : 'w-[123px] h-[61px] self-stretch'
          }`}
        >
          {buttonSlot ? (
            buttonSlot
          ) : (
            <ExpandedSearchButton
              variant={variant}
              isLoading={isLoading}
              onClick={handleSearchSubmit}
            />
          )}
        </div>
      </div>

      {}
      {(dropdownVisible || dropdownSlot) && (
        <div className="flex flex-col items-start p-0 w-[1008px] h-auto self-stretch shrink-0 mt-2">
          {dropdownSlot ? (
            dropdownSlot
          ) : (
            <div className="flex flex-col items-start p-4 w-[1008px] bg-white border border-[#DDDDDD] shadow-sm rounded-lg text-xs font-urbanist text-[#343833]">
              <span className="font-semibold text-sm mb-1 text-[#4E332D]">
                Dropdown Region Active: {currentActiveSection?.toUpperCase() || 'NONE'}
              </span>
              <p className="text-gray-500">
                In-bar content slot for Property, Dates, Guests, or Promo dropdown components.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
