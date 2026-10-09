// BestRateGuaranteedLabel.tsx
import React, { useState } from 'react';

export interface BestRateGuaranteedLabelProps {
  /** Text content displayed in the label. Defaults to 'BEST PRICE GUARANTEED' per PDF */
  text?: string;
  /** Primary theme color for icon and typography. Defaults to #4E332D */
  color?: string;
  /** Optional custom icon slot */
  iconSlot?: React.ReactNode;
  /** Optional tooltip disclosure message */
  tooltipText?: string;
  /** Additional custom classes */
  className?: string;
}

/**
 * Sheriff Star Badge Icon
 * Recreated from fi-sheriff-badge.svg:
 * - 6-pointed star with circular ball tips on each point.
 * - Sized to 15px x 15px within a 17px container per BestRateGuaranteedLabel.css.
 */
export const SheriffBadgeIcon: React.FC<{
  color?: string;
  className?: string;
}> = ({ color = '#4E332D', className = '' }) => (
  <svg 
    width="15"
    height="15"
    viewBox="0 0 100 100"
    fill={color} 
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    aria-hidden="true"
    >      
    <path d="M82.06 62.01c-.87 0-1.67.22-2.39.58l-6.82-11.81 6.75-11.71c.43.11.89.19 1.36.19 2.97-.01 5.38-2.42 5.38-5.39 -.01-2.97-2.42-5.38-5.39-5.38 -1.86-.01-3.48.93-4.45 2.34H61.32l-7.05-12.2c.54-.85.87-1.85.87-2.92 0-2.98-2.42-5.39-5.39-5.39 -2.98 0-5.39 2.41-5.39 5.38 0 1.04.31 2.02.83 2.84L38.1 30.8H22.57c-.91-1.69-2.67-2.85-4.72-2.85 -2.98-.01-5.39 2.4-5.39 5.37s2.41 5.38 5.38 5.38c.86 0 1.66-.23 2.38-.59l6.82 11.8 -6.76 11.7c-.44-.12-.89-.2-1.37-.2 -2.98 0-5.39 2.41-5.39 5.38 0 2.96 2.41 5.37 5.38 5.37 1.85 0 3.48-.94 4.45-2.35h15.16l6.81 11.8c-.4.75-.65 1.59-.65 2.5 0 2.97 2.41 5.38 5.38 5.38 2.97-.01 5.38-2.42 5.38-5.39 -.01-.88-.24-1.7-.61-2.44l6.85-11.88H77.2c.9 1.68 2.66 2.84 4.71 2.84 2.97 0 5.38-2.41 5.38-5.38 -.01-2.98-2.42-5.39-5.4-5.39Z"/>
    </svg>
);

/**
 * BestRateGuaranteedLabel Component
 * Strictly conforms to BestRateGuaranteedLabel.css and BestRateGuaranteedLabel.pdf:
 * - Minimum dimensions: 179px width x 17px height, gap 8px
 * - Icon container: 17px x 17px, icon: 15px x 15px, background #4E332D
 * - Text container: 154px x 16px, 'Brothers OT', 13px / 16px line-height, uppercase, #4E332D
 */
export const BestRateGuaranteedLabel: React.FC<BestRateGuaranteedLabelProps> = ({
  text = 'BEST PRICE GUARANTEED',
  color = '#4E332D',
  iconSlot,
  tooltipText = 'Book direct for the lowest rate, complimentary room upgrades when available, and flexible cancellations.',
  className = '',
}) => {
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <div
      role="note"
      aria-label={text}
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
      onFocus={() => setShowTooltip(true)}
      onBlur={() => setShowTooltip(false)}
      tabIndex={0}
      className={`box-border relative inline-flex w-max min-w-44.75 flex-row items-center justify-center gap-2 p-0 h-4.25 select-none cursor-default group focus:outline-none focus-visible:ring-1 focus-visible:ring-cowboy-umber rounded-hairline ${className}`}
    >
      {/* 1. best-rate-guaranteed-icon (17px x 17px, padding: 1px, gap: 10px) */}
      <div className="box-border flex flex-row justify-center items-center p-px gap-2.5 w-4.25 h-4.25 shrink-0">
        {iconSlot ? (
          iconSlot
        ) : (
          <div className="w-3.75 h-3.75 shrink-0 flex items-center justify-center">
            <SheriffBadgeIcon color={color} />
          </div>
        )}
      </div>

      {/* 2. Text keeps the original 154px minimum but may grow to fit the full label. */}
      <div className="flex h-4 min-w-38.5 w-max shrink-0 flex-col items-center justify-center p-0">
        <span
          style={{ color }}
          className="flex h-4 w-max min-w-38.5 items-center whitespace-nowrap font-label text-[13px] font-normal uppercase leading-4 tracking-[0.5px]"
        >
          {text}
        </span>
      </div>

      {/* Optional Hover / Focus Disclosure Tooltip */}
      {showTooltip && tooltipText && (
        <div
          role="tooltip"
          className="absolute bottom-6 left-1/2 -translate-x-1/2 z-50 w-60 p-2.5 bg-paper border border-cowboy-umber text-cowboy-umber text-[11px] leading-3.75 font-urbanist rounded shadow-lg pointer-events-none transition-all duration-150 animate-in fade-in zoom-in-95"
        >
          <div className="font-label uppercase font-bold text-[10px] mb-1 tracking-wider text-cowboy-umber">
            Direct Booking Perk
          </div>
          {tooltipText}
          <div className="absolute -bottom-1.25 left-1/2 -translate-x-1/2 w-2 h-2 bg-paper border-b border-r border-cowboy-umber transform rotate-45" />
        </div>
      )}
    </div>
  );
};

/**
 * Interactive Preview Canvas
 * Displays:
 * 1. Isolated Pixel-Perfect Figma Component Spec (179px x 17px with guidelines)
 * 2. Integration preview within the Urban Cowboy Booking UI bar
 * 3. State & typography customizer controls
 */
