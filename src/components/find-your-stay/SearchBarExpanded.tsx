import React, { useState, useRef, useEffect, useId } from 'react';

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

export default function App() {
  const [activeProperty, setActiveProperty] = useState<string>('CATSKILLS');
  const [checkIn, setCheckIn] = useState<string>('14 Oct 2026');
  const [checkOut, setCheckOut] = useState<string>('17 Oct 2026');
  const [guests, setGuests] = useState<number>(2);
  const [promo, setPromo] = useState<string>('add code');

  const [activeSection, setActiveSection] = useState<ActiveDropdownSection>(null);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);

  // Click outside listener to dismiss active dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setActiveSection(null);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSearch = async (values: SearchBarExpandedValues) => {
    if (isSearching) return;
    setIsSearching(true);
    setToastMessage(`Searching accommodations in ${values.property}...`);

    try {
      await new Promise((resolve) => setTimeout(resolve, 900));
      setToastMessage(
        `Search confirmed for ${values.property} (${values.checkInDate} - ${values.checkOutDate}, ${values.guests} Guests)!`
      );
    } catch {
      setToastMessage('Search request failed. Please try again.');
    } finally {
      setIsSearching(false);
    }
  };

  const handleCycleProperty = () => {
    const locations = ['CATSKILLS', 'NASHVILLE', 'DENVER'];
    const nextIdx = (locations.indexOf(activeProperty) + 1) % locations.length;
    setActiveProperty(locations[nextIdx]);
  };

  const handleCycleGuests = () => {
    setGuests((prev) => (prev >= 6 ? 1 : prev + 1));
  };

  const handleCyclePromo = () => {
    const codes = ['add code', 'FALL2026', 'VIPGUEST', 'SAVE20'];
    const nextIdx = (codes.indexOf(promo) + 1) % codes.length;
    setPromo(codes[nextIdx]);
  };

  return (
    <div className="min-h-screen w-full bg-[#EAE8E3] flex flex-col items-center justify-start py-10 px-4 text-[#343833]">
      {/* Design System Typography Imports */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Urbanist:wght@400;500;600;700&family=Uchen&family=Cinzel:wght@600;700&family=Playfair+Display:wght@700;800&display=swap');

        .font-brothers {
          font-family: 'Brothers OT', 'Cinzel', Georgia, serif;
          letter-spacing: 0.04em;
        }
        .font-desert {
          font-family: 'DesertRain', 'Playfair Display', Georgia, serif;
          font-weight: 700;
        }
        .font-uchen {
          font-family: 'Uchen', Georgia, serif;
        }
        .font-urbanist {
          font-family: 'Urbanist', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        }
      `}</style>

      <div className="w-full max-w-6xl flex flex-col items-center gap-10">
        {/* Header */}
        <div className="text-center">
          <h1 className="font-brothers text-2xl tracking-wide uppercase text-[#343833]">
            Expanded Search Bar
          </h1>
          <p className="text-xs text-[#4E332D] mt-1 font-urbanist">
            Exact design specifications from SearchBarExpanded.css & PDF
          </p>
        </div>

        {/* Global Toast Feedback (SKILL.md) */}
        {toastMessage && (
          <div
            role="status"
            className="w-full max-w-[1057px] text-xs font-urbanist bg-[#343833] text-[#EBE8E0] px-4 py-2.5 rounded shadow flex items-center justify-between transition-all"
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

        {/* Section 1: Figma Artboard Container Spec View (1097px x 224px, dashed border: #9747FF) */}
        <div className="flex flex-col items-center gap-3" ref={containerRef}>
          <span className="text-[11px] font-brothers uppercase tracking-wider text-[#4E332D]">
            Figma Artboard (1097px × 224px, dashed border: #9747FF)
          </span>

          <div className="box-border relative w-[1097px] h-[224px] border border-dashed border-[#9747FF] rounded-[5px] bg-[#FAF9F9]/40 p-0 overflow-visible">
            {/* Property 1=Default (Pill / Circle at top: 20px, left: 20px) */}
            <div className="absolute top-[20px] left-[20px]">
              <SearchBarExpanded
                variant="circle"
                values={{
                  property: activeProperty,
                  checkInDate: checkIn,
                  checkOutDate: checkOut,
                  guests,
                  promoCode: promo,
                }}
                activeSection={activeSection}
                onSectionClick={setActiveSection}
                isLoading={isSearching}
                onSearch={handleSearch}
              />
            </div>

            {/* Property 1=Square (Square at top: 123px, left: 60px) */}
            <div className="absolute top-[123px] left-[60px]">
              <SearchBarExpanded
                variant="square"
                values={{
                  property: activeProperty,
                  checkInDate: checkIn,
                  checkOutDate: checkOut,
                  guests,
                  promoCode: promo,
                }}
                activeSection={activeSection}
                onSectionClick={setActiveSection}
                isLoading={isSearching}
                onSearch={handleSearch}
              />
            </div>
          </div>
        </div>

        {}
        <div className="w-full max-w-[1057px] bg-[#FAF9F9] border border-[#DDDDDD] rounded-lg p-5 shadow-sm flex flex-col gap-4 text-xs font-urbanist">
          <div className="flex items-center justify-between border-b border-[#DDDDDD] pb-3">
            <span className="font-semibold text-sm text-[#343833]">
              Expanded Search Bar State & Simulation Controls
            </span>
            <span className="text-[11px] text-gray-500">
              Click any section in the search bar above or use the test chips below
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Property Switcher */}
            <div className="flex flex-col gap-1.5">
              <span className="font-medium text-[#4E332D]">Property / Cowboy:</span>
              <button
                type="button"
                onClick={handleCycleProperty}
                className="px-3 py-1.5 bg-white border border-[#DDDDDD] rounded hover:bg-gray-100 font-desert font-bold tracking-wider text-[#4E332D] text-left transition-colors"
              >
                {activeProperty} ↻
              </button>
            </div>

            {/* Guest Counter Switcher */}
            <div className="flex flex-col gap-1.5">
              <span className="font-medium text-[#4E332D]">Guests:</span>
              <button
                type="button"
                onClick={handleCycleGuests}
                className="px-3 py-1.5 bg-white border border-[#DDDDDD] rounded hover:bg-gray-100 font-uchen text-left transition-colors"
              >
                {guests} Guests ↻
              </button>
            </div>

            {/* Promo Code Switcher */}
            <div className="flex flex-col gap-1.5">
              <span className="font-medium text-[#4E332D]">Promo Code:</span>
              <button
                type="button"
                onClick={handleCyclePromo}
                className="px-3 py-1.5 bg-white border border-[#DDDDDD] rounded hover:bg-gray-100 font-mono text-left transition-colors"
              >
                {promo} ↻
              </button>
            </div>

            {/* Active Trigger */}
            <div className="flex flex-col gap-1.5">
              <span className="font-medium text-[#4E332D]">Simulation Action:</span>
              <button
                type="button"
                onClick={() =>
                  handleSearch({
                    property: activeProperty,
                    checkInDate: checkIn,
                    checkOutDate: checkOut,
                    guests,
                    promoCode: promo,
                  })
                }
                disabled={isSearching}
                className="px-3 py-1.5 bg-[#4E332D] text-[#FAF9F9] rounded hover:bg-[#3D2723] disabled:opacity-50 transition-colors font-semibold"
              >
                {isSearching ? 'Executing Search...' : 'Trigger Search'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
