import React, { useState } from "react";

export type SearchBarExpandedVariant = "circle" | "square";
export type ActiveDropdownSection = "property" | "dates" | "guests" | "promo" | null;

export interface SearchBarExpandedValues {
  property: string;
  checkInDate: string;
  checkOutDate: string;
  guests: number | string;
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

export interface ExpandedSearchButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: SearchBarExpandedVariant;
  isLoading?: boolean;
}

export const ExpandedSearchButton = React.forwardRef<HTMLButtonElement, ExpandedSearchButtonProps>(
  (
    {
      variant = "circle",
      isLoading = false,
      disabled,
      className = "",
      children,
      onClick,
      type = "button",
      ...props
    },
    ref,
  ) => {
    const isInteractive = !disabled && !isLoading;
    const rounded = variant === "circle" ? "rounded-full" : "rounded-[5px]";

    return (
      <button
        ref={ref}
        type={type}
        disabled={!isInteractive}
        onClick={onClick}
        aria-label="Search accommodations"
        aria-busy={isLoading}
        className={`grid h-12 w-12 shrink-0 place-items-center bg-[#4E332D] text-[#FAF9F9] transition md:flex md:h-14 md:w-[116px] md:gap-2 ${rounded} ${
          isInteractive
            ? "cursor-pointer hover:bg-[#343833] active:scale-[0.98]"
            : "cursor-not-allowed opacity-60"
        } focus:outline-none focus-visible:ring-2 focus-visible:ring-[#4E332D] focus-visible:ring-offset-2 ${className}`}
        {...props}
      >
        {isLoading ? (
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-[#FAF9F9]/35 border-t-[#FAF9F9]" aria-hidden="true" />
        ) : (
          <>
            <span className="hidden font-brothers text-sm uppercase tracking-[1.5px] md:inline">
              {children || "Search"}
            </span>
            <span
              aria-hidden="true"
              className="block h-4 w-4 bg-current"
              style={{
                WebkitMask: 'url("/assets/icons/ui/arrow-right.svg") center / contain no-repeat',
                mask: 'url("/assets/icons/ui/arrow-right.svg") center / contain no-repeat',
              }}
            />
          </>
        )}
      </button>
    );
  },
);

ExpandedSearchButton.displayName = "ExpandedSearchButton";

type SearchSectionProps = {
  label: string;
  value: React.ReactNode;
  section: Exclude<ActiveDropdownSection, null>;
  activeSection: ActiveDropdownSection;
  onClick: (section: Exclude<ActiveDropdownSection, null>) => void;
  className?: string;
};

function SearchSection({ label, value, section, activeSection, onClick, className = "" }: SearchSectionProps) {
  const active = activeSection === section;
  return (
    <button
      type="button"
      aria-expanded={active}
      onClick={() => onClick(section)}
      className={`group relative flex min-h-[64px] min-w-0 flex-1 flex-col justify-center bg-transparent px-4 text-left text-[#4E332D] transition-colors hover:text-[#9A5636] focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#9A5636] md:min-h-[58px] ${className}`}
    >
      <span className="font-bianco text-[10px] font-bold uppercase leading-4 tracking-[1.5px] text-current/75">
        {label}
      </span>
      <span className="mt-0.5 block max-w-full truncate font-uchen text-sm leading-5 text-current">
        {value}
      </span>
      <span
        aria-hidden="true"
        className={`absolute bottom-1.5 left-4 right-4 h-0.5 origin-left bg-[#9A5636] transition-transform ${
          active ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
        }`}
      />
    </button>
  );
}

export const SearchBarExpanded: React.FC<SearchBarExpandedProps> = ({
  variant = "circle",
  values: controlledValues,
  initialValues,
  dropdownVisible = false,
  activeSection: controlledActiveSection,
  onSectionClick,
  onSearch,
  buttonSlot,
  dropdownSlot,
  isLoading = false,
  className = "",
}) => {
  const [internalValues] = useState<SearchBarExpandedValues>({
    property: initialValues?.property ?? "CATSKILLS",
    checkInDate: initialValues?.checkInDate ?? "Add dates",
    checkOutDate: initialValues?.checkOutDate ?? "Add dates",
    guests: initialValues?.guests ?? "2 adults",
    promoCode: initialValues?.promoCode ?? "Add promo",
  });
  const [internalActiveSection, setInternalActiveSection] = useState<ActiveDropdownSection>(null);

  const currentValues = controlledValues ?? internalValues;
  const controlledSection = controlledActiveSection !== undefined;
  const currentActiveSection = controlledSection ? controlledActiveSection : internalActiveSection;
  const rounded = variant === "circle" ? "rounded-[26px] md:rounded-full" : "rounded-[5px]";

  const toggleSection = (section: Exclude<ActiveDropdownSection, null>) => {
    const next = currentActiveSection === section ? null : section;
    if (!controlledSection) setInternalActiveSection(next);
    onSectionClick?.(next);
  };

  const dateValue =
    currentValues.checkInDate === "Add dates" && currentValues.checkOutDate === "Add dates"
      ? "Add dates"
      : `${currentValues.checkInDate} — ${currentValues.checkOutDate}`;

  return (
    <div className={`relative w-full max-w-[1057px] ${className}`}>
      <div
        role="search"
        aria-label="Expanded accommodation search bar"
        className={`grid w-full grid-cols-1 overflow-hidden border-2 border-[#4E332D] bg-[#FAF9F9] p-2 shadow-[0_4px_12px_rgba(0,0,0,0.08)] ${rounded} md:grid-cols-[minmax(150px,1fr)_minmax(280px,1.65fr)_minmax(125px,.72fr)_minmax(125px,.72fr)_auto] md:items-center md:overflow-visible md:p-1.5 md:pl-4`}
      >
        <div className="border-b border-[#4E332D]/10 md:border-b-0 md:border-r">
          <SearchSection label="Property" value={<span className="font-desert font-bold uppercase tracking-[2px]">{currentValues.property}</span>} section="property" activeSection={currentActiveSection} onClick={toggleSection} />
        </div>
        <div className="border-b border-[#4E332D]/10 md:border-b-0 md:border-r">
          <SearchSection label="When" value={<span className="font-number">{dateValue}</span>} section="dates" activeSection={currentActiveSection} onClick={toggleSection} />
        </div>
        <div className="border-b border-[#4E332D]/10 md:border-b-0 md:border-r">
          <SearchSection label="Guests" value={<span className="font-number">{currentValues.guests}</span>} section="guests" activeSection={currentActiveSection} onClick={toggleSection} />
        </div>
        <div className="border-b border-[#4E332D]/10 md:border-b-0 md:border-r">
          <SearchSection label="Promo" value={currentValues.promoCode || "Add promo"} section="promo" activeSection={currentActiveSection} onClick={toggleSection} />
        </div>
        <div className="flex justify-end p-1.5 md:pl-3">
          {buttonSlot ?? (
            <ExpandedSearchButton variant={variant} isLoading={isLoading} onClick={() => !isLoading && onSearch?.(currentValues)} />
          )}
        </div>
      </div>

      {(dropdownVisible || dropdownSlot) && dropdownSlot && (
        <div className="absolute left-0 right-0 top-full z-50 mt-3">{dropdownSlot}</div>
      )}
    </div>
  );
};
