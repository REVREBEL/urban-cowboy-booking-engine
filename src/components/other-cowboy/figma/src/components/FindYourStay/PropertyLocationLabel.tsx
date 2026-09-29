// PropertyLocationLabel.tsx
import React, { useState } from 'react';

export type PropertyLocation = 'catskills' | 'nashville' | 'denver';

export interface PropertyLocationLabelProps {
  location: PropertyLocation | string;
  selected?: boolean;
  interactive?: boolean;
  onClick?: (location: PropertyLocation | string) => void | Promise<void>;
  className?: string;
  style?: React.CSSProperties;
}

const LOCATION_DISPLAY_NAMES: Record<string, string> = {
  catskills: 'CATSKILLS',
  nashville: 'NASHVILLE',
  denver: 'DENVER',
};

export const PropertyLocationLabel: React.FC<PropertyLocationLabelProps> = ({
  location,
  selected = false,
  interactive = false,
  onClick,
  className = '',
  style,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const formattedName =
    LOCATION_DISPLAY_NAMES[location.toLowerCase()] || location.toUpperCase();

  const handleClick = async () => {
    if (!interactive || !onClick || isSubmitting) return;

    try {
      setIsSubmitting(true);
      await onClick(location);
    } catch (error) {
      console.error('Failed location selection handler:', error);
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
        inline-flex items-center justify-center transition-all duration-200 select-none
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
        ...style,
      }}
    >
      {isSubmitting ? (
        <span className="flex items-center gap-1.5">
          <svg
            className="animate-spin h-3 w-3 text-[#4E332D]"
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

export interface LocationGroupProps {
  locations?: (PropertyLocation | string)[];
  selectedLocation?: PropertyLocation | string;
  onSelect?: (location: PropertyLocation | string) => void | Promise<void>;
  className?: string;
}

export const PropertyLocationGroup: React.FC<LocationGroupProps> = ({
  locations = ['catskills', 'nashville', 'denver'],
  selectedLocation,
  onSelect,
  className = '',
}) => {
  return (
    <div
      className={`flex flex-col justify-center items-start p-3 gap-3 w-[98px] h-[90px] rounded-[5px] bg-transparent ${className}`}
      role="group"
      aria-label="Property Location Filters"
    >
      {locations.map((loc) => (
        <PropertyLocationLabel
          key={loc}
          location={loc}
          interactive={Boolean(onSelect)}
          selected={selectedLocation?.toLowerCase() === loc.toLowerCase()}
          onClick={onSelect}
        />
      ))}
    </div>
  );
};

export default function PropertyLocationLabelShowcase() {
  const [activeLoc, setActiveLoc] = useState<PropertyLocation | string>('catskills');
  const [asyncLog, setAsyncLog] = useState<string>('Select a location...');

  const handleSelect = async (loc: PropertyLocation | string) => {
    setActiveLoc(loc);
    setAsyncLog(`Updating property filter to ${loc.toUpperCase()}...`);
    await new Promise((resolve) => setTimeout(resolve, 800));
    setAsyncLog(`Filter active: ${loc.toUpperCase()}`);
  };

  return (
    <div className="min-h-screen bg-[#F5F3EE] p-8 flex flex-col items-center justify-center gap-8 font-sans">
      <div className="text-center max-w-md">
        <h1
          className="text-2xl font-bold mb-2 tracking-wide text-[#343833]"
          style={{ fontFamily: "'Brothers OT', 'League Spartan', sans-serif" }}
        >
          PROPERTY LOCATION LABEL
        </h1>
        <p className="text-sm text-[#767470]">
          Design token implementation for Urban Cowboy property location badges.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-2xl">
        {/* Static Spec Frame */}
        <div className="bg-white p-6 rounded-xl border border-[#E2DFD7] shadow-sm flex flex-col items-center">
          <span className="text-xs font-semibold text-[#8C8880] uppercase tracking-wider mb-4">
            CSS SPEC CONTAINER (98px × 90px)
          </span>
          <div className="border border-dashed border-[#A79996] p-3 rounded-[5px] bg-[#FAF9F6]">
            <PropertyLocationGroup />
          </div>
        </div>

        {/* Interactive Selector */}
        <div className="bg-white p-6 rounded-xl border border-[#E2DFD7] shadow-sm flex flex-col items-center">
          <span className="text-xs font-semibold text-[#8C8880] uppercase tracking-wider mb-4">
            INTERACTIVE FILTER SELECTOR
          </span>
          <div className="border border-[#4E332D]/20 p-3 rounded-[5px] bg-[#EBE8E0]/40 mb-4">
            <PropertyLocationGroup
              selectedLocation={activeLoc}
              onSelect={handleSelect}
            />
          </div>
          <div className="text-xs font-mono text-[#4E332D] bg-[#EBE8E0] px-3 py-1.5 rounded-md w-full text-center">
            {asyncLog}
          </div>
        </div>
      </div>
    </div>
  );
}