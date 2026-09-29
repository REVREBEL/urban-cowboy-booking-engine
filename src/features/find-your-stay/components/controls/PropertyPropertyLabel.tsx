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
