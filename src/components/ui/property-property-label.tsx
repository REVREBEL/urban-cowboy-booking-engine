// PropertyPropertyLabel.tsx
import React, { useState } from 'react';

export type PropertyLocationKey = 'catskills' | 'nashville' | 'denver';

export interface PropertyPropertyLabelProps {
  property: PropertyLocationKey | string;
  selected?: boolean;
  interactive?: boolean;
  onClick?: (property: PropertyLocationKey | string) => void | Promise<void>;
  className?: string;
  style?: React.CSSProperties;
}

const PROPERTY_FULL_NAMES: Record<string, string> = {
  catskills: 'URBAN COWBOY CATSKILLS',
  nashville: 'URBAN COWBOY NASHVILLE',
  denver: 'URBAN COWBOY DENVER',
};

export const PropertyPropertyLabel: React.FC<PropertyPropertyLabelProps> = ({
  property,
  selected = false,
  interactive = false,
  onClick,
  className = '',
  style,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const formattedName =
    PROPERTY_FULL_NAMES[property.toLowerCase()] ||
    (property.toUpperCase().startsWith('URBAN COWBOY')
      ? property.toUpperCase()
      : `URBAN COWBOY ${property.toUpperCase()}`);

  const handleClick = async () => {
    if (!interactive || !onClick || isSubmitting) return;

    try {
      setIsSubmitting(true);
      await onClick(property);
    } catch (error) {
      console.error('Failed property selection handler:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const Component = interactive ? 'button' : 'div';

  return (
    <Component
      type={interactive ? 'button' : undefined}
      onClick={interactive ? handleClick : undefined}
      disabled={interactive ? isSubmitting : undefined}
      aria-pressed={interactive ? selected : undefined}
      aria-busy={isSubmitting}
      className={`
        inline-flex items-center justify-start text-left transition-all duration-200 select-none
        ${interactive ? 'cursor-pointer hover:opacity-80 active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#4E332D]' : ''}
        ${selected ? 'opacity-100 font-bold' : interactive ? 'opacity-60 hover:opacity-100' : 'opacity-100'}
        ${isSubmitting ? 'cursor-wait opacity-50' : ''}
        ${className}
      `}
      style={{
        fontFamily: "'DesertRain', 'Brothers OT', 'League Spartan', sans-serif",
        fontStyle: 'normal',
        fontWeight: 700,
        fontSize: '12px',
        lineHeight: '14px',
        letterSpacing: '2px',
        color: '#4E332D',
        textTransform: 'uppercase',
        whiteSpace: 'nowrap',
        ...style,
      }}
    >
      {isSubmitting ? (
        <span className="flex items-center gap-2">
          <svg
            className="animate-spin h-3.5 w-3.5 text-[#4E332D]"
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
          <span>{formattedName}</span>
        </span>
      ) : (
        <span>{formattedName}</span>
      )}
    </Component>
  );
};

export interface PropertyGroupProps {
  properties?: (PropertyLocationKey | string)[];
  selectedProperty?: PropertyLocationKey | string;
  onSelect?: (property: PropertyLocationKey | string) => void | Promise<void>;
  className?: string;
}

export const PropertyPropertyLabelGroup: React.FC<PropertyGroupProps> = ({
  properties = ['catskills', 'nashville', 'denver'],
  selectedProperty,
  onSelect,
  className = '',
}) => {
  return (
    <div
      className={`flex flex-col justify-center items-start p-3 gap-3 w-[235px] h-[90px] rounded-[5px] bg-transparent ${className}`}
      role="group"
      aria-label="Urban Cowboy Property Location Selection"
    >
      {properties.map((prop) => (
        <PropertyPropertyLabel
          key={prop}
          property={prop}
          interactive={Boolean(onSelect)}
          selected={selectedProperty?.toLowerCase() === prop.toLowerCase()}
          onClick={onSelect}
        />
      ))}
    </div>
  );
};

export default function PropertyPropertyLabelShowcase() {
  const [activeProperty, setActiveProperty] = useState<PropertyLocationKey | string>('catskills');
  const [statusLog, setStatusLog] = useState<string>('Select a property location...');

  const handleSelect = async (property: PropertyLocationKey | string) => {
    setActiveProperty(property);
    const name = PROPERTY_FULL_NAMES[property.toLowerCase()] || property.toUpperCase();
    setStatusLog(`Switching destination to ${name}...`);
    await new Promise((resolve) => setTimeout(resolve, 800));
    setStatusLog(`Current location filter: ${name}`);
  };

  return (
    <div className="min-h-screen bg-[#F5F3EE] p-8 flex flex-col items-center justify-center gap-8 font-sans">
      <div className="text-center max-w-md">
        <h1
          className="text-2xl font-bold mb-2 tracking-wide text-[#343833]"
          style={{ fontFamily: "'Brothers OT', 'League Spartan', sans-serif" }}
        >
          PROPERTY PROPERTY LABEL
        </h1>
        <p className="text-sm text-[#767470]">
          Full brand property title badges for Urban Cowboy Catskills, Nashville, and Denver.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-2xl">
        {/* Spec Frame */}
        <div className="bg-white p-6 rounded-xl border border-[#E2DFD7] shadow-sm flex flex-col items-center">
          <span className="text-xs font-semibold text-[#8C8880] uppercase tracking-wider mb-4">
            SPEC CONTAINER (235px × 90px)
          </span>
          <div className="border border-dashed border-[#A79996] p-3 rounded-[5px] bg-[#FAF9F6]">
            <PropertyPropertyLabelGroup />
          </div>
        </div>

        {/* Interactive Selector */}
        <div className="bg-white p-6 rounded-xl border border-[#E2DFD7] shadow-sm flex flex-col items-center">
          <span className="text-xs font-semibold text-[#8C8880] uppercase tracking-wider mb-4">
            INTERACTIVE PROPERTY SELECTOR
          </span>
          <div className="border border-[#4E332D]/20 p-3 rounded-[5px] bg-[#EBE8E0]/40 mb-4">
            <PropertyPropertyLabelGroup
              selectedProperty={activeProperty}
              onSelect={handleSelect}
            />
          </div>
          <div className="text-xs font-mono text-[#4E332D] bg-[#EBE8E0] px-3 py-1.5 rounded-md w-full text-center truncate">
            {statusLog}
          </div>
        </div>
      </div>
    </div>
  );
}