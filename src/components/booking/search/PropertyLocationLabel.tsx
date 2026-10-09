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
        ${interactive ? 'cursor-pointer hover:opacity-80 active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-cowboy-umber' : ''}
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
        color: 'var(--color-cowboy-umber)',
        textTransform: 'uppercase',
        ...style,
      }}
    >
      {isSubmitting ? (
        <span className="flex items-center gap-1.5">
          <svg
            className="animate-spin h-3 w-3 text-cowboy-umber"
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
      className={`flex flex-col justify-center items-start p-3 gap-3 w-24.5 h-22.5 rounded-field bg-transparent ${className}`}
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
