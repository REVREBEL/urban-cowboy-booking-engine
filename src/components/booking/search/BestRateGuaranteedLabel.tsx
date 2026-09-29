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
      className={`box-border relative inline-flex w-max min-w-[179px] flex-row items-center justify-center gap-[8px] p-0 h-[17px] select-none cursor-default group focus:outline-none focus-visible:ring-1 focus-visible:ring-[#4E332D] rounded-[2px] ${className}`}
    >
      {/* 1. best-rate-guaranteed-icon (17px x 17px, padding: 1px, gap: 10px) */}
      <div className="box-border flex flex-row justify-center items-center p-[1px] gap-[10px] w-[17px] h-[17px] shrink-0">
        {iconSlot ? (
          iconSlot
        ) : (
          <div className="w-[15px] h-[15px] shrink-0 flex items-center justify-center">
            <SheriffBadgeIcon color={color} />
          </div>
        )}
      </div>

      {/* 2. Text keeps the original 154px minimum but may grow to fit the full label. */}
      <div className="flex h-[16px] min-w-[154px] w-max shrink-0 flex-col items-center justify-center p-0">
        <span
          style={{ color }}
          className="flex h-[16px] w-max min-w-[154px] items-center whitespace-nowrap font-brothers text-[13px] font-normal uppercase leading-[16px] tracking-[0.5px]"
        >
          {text}
        </span>
      </div>

      {/* Optional Hover / Focus Disclosure Tooltip */}
      {showTooltip && tooltipText && (
        <div
          role="tooltip"
          className="absolute bottom-[24px] left-1/2 -translate-x-1/2 z-50 w-[240px] p-2.5 bg-[#FAF9F9] border border-[#4E332D] text-[#4E332D] text-[11px] leading-[15px] font-urbanist rounded shadow-lg pointer-events-none transition-all duration-150 animate-in fade-in zoom-in-95"
        >
          <div className="font-brothers uppercase font-bold text-[10px] mb-1 tracking-wider text-[#4E332D]">
            Direct Booking Perk
          </div>
          {tooltipText}
          <div className="absolute -bottom-[5px] left-1/2 -translate-x-1/2 w-2 h-2 bg-[#FAF9F9] border-b border-r border-[#4E332D] transform rotate-45" />
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
export default function App() {
  const [selectedText, setSelectedText] = useState<'BEST PRICE GUARANTEED' | 'BEST RATE GUARANTEED'>(
    'BEST PRICE GUARANTEED'
  );
  const [customColor, setCustomColor] = useState<string>('#4E332D');
  const [customCopy, setCustomCopy] = useState<string>('');

  const activeText = customCopy.trim() || selectedText;

  return (
    <div className="min-h-screen w-full bg-[#EAE8E3] flex flex-col items-center justify-start py-10 px-4 text-[#343833]">
      {/* Design System Typography Imports */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Urbanist:wght@400;500;600;700&family=Cinzel:wght@600;700&family=Playfair+Display:wght@700&display=swap');

        .font-brothers {
          font-family: 'Brothers OT', 'Cinzel', Georgia, serif;
          letter-spacing: 0.04em;
        }
        .font-urbanist {
          font-family: 'Urbanist', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        }
      `}</style>

      <div className="w-full max-w-3xl flex flex-col items-center gap-10">
        {/* Header */}
        <div className="text-center">
          <h1 className="font-brothers text-2xl tracking-wide uppercase text-[#343833]">
            Best Rate Guaranteed Label
          </h1>
          <p className="text-xs text-[#4E332D] mt-1 font-urbanist">
            Exact design specifications from BestRateGuaranteedLabel.css & BestRateGuaranteedLabel.pdf
          </p>
        </div>

        {/* Section 1: Isolated Figma Component View */}
        <div className="flex flex-col items-center gap-3">
          <div className="flex items-center justify-between w-full max-w-[320px] px-2">
            <span className="text-[11px] font-brothers uppercase tracking-wider text-[#4E332D]">
              Figma Component (min 179px × 17px)
            </span>
            <span className="text-[11px] text-gray-500 font-mono">min-w:179 h:17</span>
          </div>

          <div className="p-8 bg-[#FAF9F9] border border-dashed border-[#9747FF] rounded-lg shadow-sm flex items-center justify-center">
            <BestRateGuaranteedLabel text={activeText} color={customColor} />
          </div>
        </div>

        {/* Section 2: In-Context Integration View */}
        <div className="flex flex-col items-center gap-3 w-full">
          <span className="text-[11px] font-brothers uppercase tracking-wider text-[#4E332D]">
            Live Placement Example (Booking Bar Header / Footer Banner)
          </span>

          <div className="w-full max-w-xl bg-[#FAF9F9] border border-[#DDDDDD] rounded-xl p-5 shadow-sm flex flex-col items-center gap-4">
            <div className="flex items-center justify-between w-full border-b border-[#DDDDDD] pb-3">
              <div>
                <span className="font-brothers text-sm uppercase text-[#4E332D] tracking-wide block">
                  Urban Cowboy Stays
                </span>
                <span className="text-[11px] text-gray-500 font-urbanist">
                  Direct Guest Reservation Channel
                </span>
              </div>
              <BestRateGuaranteedLabel text={activeText} color={customColor} />
            </div>

            <div className="w-full flex items-center justify-between bg-[#F5F4F0] px-4 py-3 rounded-lg text-xs font-urbanist text-[#4E332D]">
              <span>Starting from <strong>$289 / night</strong></span>
              <button
                type="button"
                className="px-4 py-1.5 bg-[#4E332D] text-[#FAF9F9] rounded-full text-xs font-semibold hover:bg-[#3D2723] transition-colors"
              >
                Check Availability
              </button>
            </div>
          </div>
        </div>

        {/* Section 3: State & Simulation Controls */}
        <div className="w-full max-w-xl bg-[#FAF9F9] border border-[#DDDDDD] rounded-lg p-5 shadow-sm flex flex-col gap-4 text-xs font-urbanist">
          <div className="flex items-center justify-between border-b border-[#DDDDDD] pb-2">
            <span className="font-semibold text-sm text-[#343833]">
              Component State Controls
            </span>
            <span className="text-[11px] text-gray-500">
              Hover over badge above to inspect tooltip
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Label Variant Presets */}
            <div className="flex flex-col gap-1.5">
              <span className="font-medium text-[#4E332D]">Preset Text Options:</span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedText('BEST PRICE GUARANTEED');
                    setCustomCopy('');
                  }}
                  className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${
                    selectedText === 'BEST PRICE GUARANTEED' && !customCopy
                      ? 'bg-[#4E332D] text-white'
                      : 'bg-white border border-[#DDDDDD] text-[#4E332D] hover:bg-gray-50'
                  }`}
                >
                  Best Price (PDF)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedText('BEST RATE GUARANTEED');
                    setCustomCopy('');
                  }}
                  className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${
                    selectedText === 'BEST RATE GUARANTEED' && !customCopy
                      ? 'bg-[#4E332D] text-white'
                      : 'bg-white border border-[#DDDDDD] text-[#4E332D] hover:bg-gray-50'
                  }`}
                >
                  Best Rate (CSS)
                </button>
              </div>
            </div>

            {/* Color Accent Picker */}
            <div className="flex flex-col gap-1.5">
              <span className="font-medium text-[#4E332D]">Brand Color Token:</span>
              <div className="flex items-center gap-2">
                {[
                  { label: 'Brown (#4E332D)', hex: '#4E332D' },
                  { label: 'Burgundy (#69253A)', hex: '#69253A' },
                  { label: 'Dark (#343833)', hex: '#343833' },
                ].map((c) => (
                  <button
                    key={c.hex}
                    type="button"
                    onClick={() => setCustomColor(c.hex)}
                    className={`w-7 h-7 rounded-full border-2 transition-transform ${
                      customColor === c.hex
                        ? 'border-black scale-110 shadow-sm'
                        : 'border-transparent hover:scale-105'
                    }`}
                    style={{ backgroundColor: c.hex }}
                    aria-label={c.label}
                    title={c.label}
                  />
                ))}
              </div>
            </div>

            {/* Custom Input */}
            <div className="sm:col-span-2 flex flex-col gap-1.5">
              <span className="font-medium text-[#4E332D]">Custom Text Override:</span>
              <input
                type="text"
                placeholder="Enter custom label text..."
                value={customCopy}
                onChange={(e) => setCustomCopy(e.target.value)}
                className="px-3 py-1.5 border border-[#DDDDDD] rounded bg-white text-xs outline-none focus:border-[#4E332D]"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}