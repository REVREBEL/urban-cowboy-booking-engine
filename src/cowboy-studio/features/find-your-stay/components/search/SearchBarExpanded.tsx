import React, { useState } from 'react';

export type SearchBarExpandedVariant = 'circle' | 'square';
export type ActiveDropdownSection = 'property' | 'dates' | 'guests' | 'promo' | null;

export interface SearchBarExpandedValues {
  property: string;
  checkInDate: string;
  checkOutDate: string;
  guests: number;
  children?: number;
  accessible?: boolean;
  promoCode: string;
}

export interface SearchBarExpandedProps {
  variant?: SearchBarExpandedVariant;
  values?: SearchBarExpandedValues;
  initialValues?: Partial<SearchBarExpandedValues>;
  activeSection?: ActiveDropdownSection;
  onSectionClick?: (section: ActiveDropdownSection) => void;
  onValuesChange?: (values: SearchBarExpandedValues) => void;
  onSearch?: (values: SearchBarExpandedValues) => Promise<void> | void;
  buttonSlot?: React.ReactNode;
  dropdownSlot?: React.ReactNode;
  isLoading?: boolean;
  className?: string;
}

interface SearchSectionProps {
  label: string;
  value: string;
  active: boolean;
  onClick: () => void;
  className?: string;
}

const SearchSection: React.FC<SearchSectionProps> = ({ label, value, active, onClick, className = '' }) => (
  <button
    type="button"
    onClick={onClick}
    aria-expanded={active}
    className={`group relative w-full min-w-0 rounded-none bg-transparent px-4 py-3 text-left transition-colors after:absolute after:bottom-1 after:left-4 after:right-4 after:h-[3px] after:origin-left after:rounded-full after:bg-[#9A5636] after:transition-transform after:content-[''] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#9A5636] focus-visible:ring-offset-2 ${active ? 'after:scale-x-100' : 'after:scale-x-0 hover:after:scale-x-100 focus-visible:after:scale-x-100'} ${className}`}
  >
    <span className="block font-brothers text-[10px] uppercase leading-4 tracking-[1.4px] text-[#4E332D]/70 transition-colors group-hover:text-[#9A5636]">{label}</span>
    <span className="block truncate font-uchen text-sm leading-5 text-[#4E332D] transition-colors group-hover:text-[#9A5636]">{value}</span>
  </button>
);

export const SearchBarExpanded: React.FC<SearchBarExpandedProps> = ({
  variant = 'circle',
  values: controlledValues,
  initialValues,
  activeSection: controlledActiveSection,
  onSectionClick,
  onSearch,
  buttonSlot,
  dropdownSlot,
  className = ''
}) => {
  const [internalValues] = useState<SearchBarExpandedValues>({
    property: initialValues?.property ?? 'CATSKILLS',
    checkInDate: initialValues?.checkInDate ?? 'Add date',
    checkOutDate: initialValues?.checkOutDate ?? 'Add date',
    guests: initialValues?.guests ?? 2,
    children: initialValues?.children ?? 0,
    accessible: initialValues?.accessible ?? false,
    promoCode: initialValues?.promoCode ?? ''
  });
  const [internalActiveSection, setInternalActiveSection] = useState<ActiveDropdownSection>(null);
  const values = controlledValues ?? internalValues;
  const activeSection = controlledActiveSection === undefined ? internalActiveSection : controlledActiveSection;

  const toggle = (section: ActiveDropdownSection) => {
    const next = activeSection === section ? null : section;
    if (controlledActiveSection === undefined) setInternalActiveSection(next);
    onSectionClick?.(next);
  };

  const guestSummary = `${values.guests} adult${values.guests === 1 ? '' : 's'}${values.children ? ` · ${values.children} child${values.children === 1 ? '' : 'ren'}` : ''}${values.accessible ? ' · ADA' : ''}`;

  return (
    <div className={`relative w-full ${className}`}>
      <div
        role="search"
        aria-label="Expanded accommodation search bar"
        className={`grid w-full grid-cols-1 gap-1 border-2 border-[#4E332D] bg-[#FAF9F9] p-2 shadow-[0_4px_12px_rgba(0,0,0,0.08)] md:grid-cols-[1.05fr_1.7fr_.75fr_.75fr_auto] md:items-center md:gap-0 ${variant === 'circle' ? 'rounded-[28px] md:rounded-full' : 'rounded-[5px]'}`}
      >
        <div className="min-w-0 border-b border-[#EBE8E0] md:border-b-0 md:border-r">
          <SearchSection label="Property" value={values.property} active={activeSection === 'property'} onClick={() => toggle('property')} className="[&>span:last-child]:font-desert [&>span:last-child]:font-bold [&>span:last-child]:uppercase [&>span:last-child]:tracking-[2px]" />
        </div>
        <div className="min-w-0 border-b border-[#EBE8E0] md:border-b-0 md:border-r">
          <SearchSection label="When" value={`${values.checkInDate} — ${values.checkOutDate}`} active={activeSection === 'dates'} onClick={() => toggle('dates')} />
        </div>
        <div className="min-w-0 border-b border-[#EBE8E0] md:border-b-0 md:border-r">
          <SearchSection label="Guests" value={guestSummary} active={activeSection === 'guests'} onClick={() => toggle('guests')} />
        </div>
        <SearchSection label="Promo" value={values.promoCode || 'Add promo'} active={activeSection === 'promo'} onClick={() => toggle('promo')} />
        <div className="p-1">
          {buttonSlot ?? (
            <button type="button" onClick={() => onSearch?.(values)} className="w-full rounded-full bg-[#4E332D] px-6 py-3 font-brothers text-sm uppercase tracking-[1.6px] text-[#FAF9F9] md:w-auto">Search</button>
          )}
        </div>
      </div>
      {dropdownSlot}
    </div>
  );
};

export type ActiveSearchSection = ActiveDropdownSection;
export type ExpandedSearchValues = SearchBarExpandedValues;
