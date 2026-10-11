// PolicyDisplay.tsx
import React, { useState, useMemo, useRef, useEffect } from 'react';

/**
 * Embedded SVG Arrow Right Icon based on fi-arrow-right.svg
 */
export const ArrowRightIcon: React.FC<React.SVGProps<SVGSVGElement>> = ({
  className = 'w-10 h-6',
  ...props
}) => (
  <svg
    viewBox="0 0 100 100"
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
    className={className}
    {...props}
  >
    <path d="M50.86 78.01l36.41-26.06c.66-.48 1.04-1.24 1.05-2.05 0-.01 0-.01 0-.01-.01-.82-.4-1.58-1.06-2.05L50.83 21.95c-.77-.55-1.78-.62-2.62-.19-.84.42-1.37 1.29-1.37 2.23v12.18l-32.71-.01c-1.39 0-2.52 1.12-2.52 2.51v22.54c-.01 1.38 1.12 2.51 2.51 2.51h32.7V75.9c0 .94.53 1.8 1.36 2.23.83.43 1.84.35 2.61-.2Z" />
  </svg>
);

/**
 * Embedded SVG Information Icon based on fi-info.svg
 */
export const InfoIcon: React.FC<React.SVGProps<SVGSVGElement>> = ({
  className = 'w-5 h-5',
  ...props
}) => (
  <svg
    viewBox="0 0 20 20"
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
    className={className}
    {...props}
  >
    <path
      fillRule="evenodd"
      d="M10 18a8 8 0 100-16 8 8 0 000 16zm.75-11.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm-.75 3a.75.75 0 00-.75.75v3.5a.75.75 0 001.5 0v-3.5A.75.75 0 0010 9.75z"
      clipRule="evenodd"
    />
  </svg>
);

export interface MilestoneDate {
  daysPrior: string | number;
  day: string | number;
  month: string;
}

export interface PolicyDisplayConfig {
  textColor?: string;
  accentColor?: string;
}

export interface PolicyDisplayProps {
  title?: string;
  initialAmount?: string;
  remainingAmount?: string;
  freeCancelDate?: MilestoneDate;
  nonRefundableDate?: MilestoneDate;
  orientation?: 'horizontal' | 'vertical';
  showTooltips?: boolean;
  initialDepositTooltip?: {
    title: string;
    description: string;
  };
  remainingBalanceTooltip?: {
    title: string;
    description: string;
  };
  textColor?: string;
  accentColor?: string;
  size?: "default" | "compact";
  className?: string;
}

export const PolicyDisplay: React.FC<PolicyDisplayProps> = ({
  title = "POLICY INFORMATION",
  initialAmount = "$000.00",
  remainingAmount = "$000.00",
  freeCancelDate,
  nonRefundableDate,
  orientation = 'horizontal',
  showTooltips = true,
  initialDepositTooltip = {
    title: "INITIAL DEPOSIT",
    description:
      "This is the amount due at booking. Once your reservation is confirmed, the hotel will charge this amount to the payment method provided.",
  },
  remainingBalanceTooltip = {
    title: "REMAINING BALANCE",
    description:
      "This is the remaining amount due for your stay. It will be charged automatically to your payment method on the applicable due date.",
  },
  textColor = "var(--foreground)",
  accentColor = "var(--color-bandana-red)",
  size = "default",
  className = "",
}) => {
  const [activeTooltip, setActiveTooltip] = useState<"initial" | "remaining" | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const textColor = config?.textColor || 'var(--foreground);
  const accentColor = config?.accentColor || var(--foreground);

  // Memoized CSS custom properties with complete dependency array
  const style = useMemo(
    () =>
      ({
        '--rate-fg': textColor,
        '--rate-accent': accentColor,
      }) as React.CSSProperties,
    [textColor, accentColor]
  );

  // Outside click handler to dismiss active tooltip popovers
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setActiveTooltip(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const toggleTooltip = (type: 'initial' | 'remaining') => {
    if (!showTooltips) return;
    setActiveTooltip((prev) => (prev === type ? null : type));
  };

  const isVertical = orientation === 'vertical';

  return (
    <div
      ref={containerRef}
      style={style}
      className={`relative w-full ${
        isVertical ? 'max-w-90' : 'max-w-151.25'
      } rounded-lg bg-[#F4F4F5] p-6 sm:p-8 font-sans select-none text-(--rate-fg) shadow-sm ${className}`}
    >
      {/* Policy Heading */}
      <h2 className="text-left text-[15px] font-bold tracking-wider uppercase mb-8 text-(--rate-fg)">
        {title}
      </h2>

      {isVertical ? (
        /* ================= VERTICAL LAYOUT VARIANT ================= */
        <div className="grid grid-cols-[1fr_auto_1fr] items-stretch gap-y-4">
          {/* Left Column: Stacked Milestones */}
          <div className="flex flex-col items-center gap-7 pr-3">
            {/* Milestone 1: Due Today */}
            <div className="flex flex-col items-center text-center">
              <div className="w-23.5 h-22.5 bg-white rounded-md flex flex-col items-center justify-center shadow-sm">
                <span className="text-[24px] font-bold leading-none tracking-tight text-(--rate-fg)">
                  DUE
                </span>
                <span className="text-[14px] font-extrabold leading-tight tracking-wider uppercase mt-1 text-(--rate-fg)">
                  TODAY
                </span>
              </div>
              <div className="mt-2.5 text-center">
                <p className="text-[13px] font-bold leading-4.25 uppercase text-(--rate-fg)">
                  AFTER
                </p>
                <p className="text-[13px] font-bold leading-4.25 uppercase text-(--rate-fg)">
                  CONFIRMING
                </p>
              </div>
            </div>

            {/* Milestone 2: Free Cancel */}
            <div className="flex flex-col items-center text-center">
              <div className="relative">
                {/* Offset circular badge */}
                <div className="absolute -left-6 -top-2 z-10 w-13 h-13 rounded-full bg-(--rate-fg) text-white flex flex-col items-center justify-center shadow">
                  <span className="text-[22px] font-bold leading-none">
                    {freeCancelDate.daysPrior}
                  </span>
                  <span className="text-[9px] font-black leading-none tracking-wider uppercase mt-0.5">
                    DAYS
                  </span>
                </div>

                {/* Calendar Tile */}
                <div className="w-23.5 h-22.5 bg-white rounded-md flex flex-col items-center justify-center shadow-sm pl-2">
                  <span className="text-[34px] font-bold leading-none tracking-tight text-(--rate-fg)">
                    {freeCancelDate.day}
                  </span>
                  <span className="text-[22px] font-extrabold leading-none uppercase mt-1 text-(--rate-fg)">
                    {freeCancelDate.month}
                  </span>
                </div>
              </div>

              <div className="mt-2.5 text-center">
                <p className="text-[13px] font-bold leading-4.25 uppercase text-(--rate-fg)">
                  FREE CANCEL
                </p>
                <p className="text-[12px] font-normal leading-4.25 text-(--rate-fg)">
                  100% Refundable
                </p>
              </div>
            </div>

            {/* Milestone 3: Non-Refundable */}
            <div className="flex flex-col items-center text-center">
              <div className="relative">
                {/* Offset circular badge */}
                <div className="absolute -left-6 -top-2 z-10 w-13 h-13 rounded-full bg-(--rate-accent) text-white flex flex-col items-center justify-center shadow">
                  <span className="text-[22px] font-bold leading-none">
                    {nonRefundableDate.daysPrior}
                  </span>
                  <span className="text-[9px] font-black leading-none tracking-wider uppercase mt-0.5">
                    DAYS
                  </span>
                </div>

                {/* Calendar Tile */}
                <div className="w-23.5 h-22.5 bg-white rounded-md flex flex-col items-center justify-center shadow-sm pl-2">
                  <span className="text-[34px] font-bold leading-none tracking-tight text-(--rate-accent)">
                    {nonRefundableDate.day}
                  </span>
                  <span className="text-[22px] font-extrabold leading-none uppercase mt-1 text-(--rate-accent)">
                    {nonRefundableDate.month}
                  </span>
                </div>
              </div>

              <div className="mt-2.5 text-center">
                <p className="text-[13px] font-bold leading-4.25 uppercase text-(--rate-accent)">
                  NON-REFUNDABLE
                </p>
                <p className="text-[12px] font-normal leading-4.25 text-(--rate-accent)">
                  Stay Locked
                </p>
              </div>
            </div>
          </div>

          {/* Vertical Divider Line */}
          <div className="w-px bg-(--rate-fg)/25 self-stretch my-2" />

          {/* Right Column: Vertically distributed deposit amounts */}
          <div className="flex flex-col justify-between items-center py-6 pl-3">
            {/* Initial Deposit Due (Top) */}
            <div className="relative flex flex-col items-center text-center">
              <div className="flex items-center justify-center gap-1.5">
                <span className="text-[20px] font-bold tracking-tight text-(--rate-fg)">
                  {initialAmount}
                </span>
                {showTooltips && (
                  <button
                    type="button"
                    aria-label="Initial Deposit Information"
                    onClick={() => toggleTooltip('initial')}
                    onMouseEnter={() => setActiveTooltip('initial')}
                    onMouseLeave={() => setActiveTooltip(null)}
                    className="inline-flex items-center justify-center text-(--rate-fg) hover:opacity-80 transition-opacity focus:outline-none rounded-full"
                  >
                    <InfoIcon className="w-4.5 h-4.5" />
                  </button>
                )}
              </div>
              <div className="mt-1 text-center">
                <p className="text-[13px] font-bold leading-tight text-(--rate-fg)">
                  Initial
                </p>
                <p className="text-[13px] font-bold leading-tight text-(--rate-fg)">
                  Deposit Due
                </p>
              </div>

              {/* Tooltip Popover */}
              {activeTooltip === 'initial' && (
                <div className="absolute right-0 top-full mt-2 z-30 w-56 p-3 bg-white rounded-md shadow-xl border border-gray-200 text-left">
                  <h4 className="text-[11px] font-bold uppercase tracking-wider text-(--rate-fg)">
                    {initialDepositTooltip.title}
                  </h4>
                  <p className="text-[10.5px] text-gray-700 leading-relaxed mt-1 font-serif">
                    {initialDepositTooltip.description}
                  </p>
                </div>
              )}
            </div>

            {/* Remaining Deposit Due (Bottom) */}
            <div className="relative flex flex-col items-center text-center">
              <div className="flex items-center justify-center gap-1.5">
                <span className="text-[20px] font-bold tracking-tight text-(--rate-accent)">
                  {remainingAmount}
                </span>
                {showTooltips && (
                  <button
                    type="button"
                    aria-label="Remaining Deposit Information"
                    onClick={() => toggleTooltip('remaining')}
                    onMouseEnter={() => setActiveTooltip('remaining')}
                    onMouseLeave={() => setActiveTooltip(null)}
                    className="inline-flex items-center justify-center text-(--rate-accent) hover:opacity-80 transition-opacity focus:outline-none rounded-full"
                  >
                    <InfoIcon className="w-4.5 h-4.5" />
                  </button>
                )}
              </div>
              <div className="mt-1 text-center">
                <p className="text-[13px] font-bold leading-tight text-(--rate-accent)">
                  Remaining
                </p>
                <p className="text-[13px] font-bold leading-tight text-(--rate-accent)">
                  Deposit Due
                </p>
              </div>

              {/* Tooltip Popover */}
              {activeTooltip === 'remaining' && (
                <div className="absolute right-0 bottom-full mb-2 z-30 w-56 p-3 bg-white rounded-md shadow-xl border border-gray-200 text-left">
                  <h4 className="text-[11px] font-bold uppercase tracking-wider text-(--rate-fg)">
                    {remainingBalanceTooltip.title}
                  </h4>
                  <p className="text-[10.5px] text-gray-700 leading-relaxed mt-1 font-serif">
                    {remainingBalanceTooltip.description}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* ================= HORIZONTAL LAYOUT (DEFAULT) ================= */
        <>
          {/* Milestones Row */}
          <div className="grid grid-cols-3 gap-2 sm:gap-4 items-start text-center mb-8">
            {/* Milestone 1: Due Today */}
            <div className="flex flex-col items-center">
              <div className="w-23.5 h-22.5 bg-white rounded-md flex flex-col items-center justify-center shadow-sm">
                <span className="text-[24px] font-bold leading-none tracking-tight text-(--rate-fg)">
                  DUE
                </span>
                <span className="text-[14px] font-extrabold leading-tight tracking-wider uppercase mt-1 text-(--rate-fg)">
                  TODAY
                </span>
              </div>
              <div className="mt-3 text-center">
                <p className="text-[14px] sm:text-[15px] font-bold leading-4.5 uppercase text-(--rate-fg)">
                  AFTER
                </p>
                <p className="text-[14px] sm:text-[15px] font-bold leading-4.5 uppercase text-(--rate-fg)">
                  CONFIRMING
                </p>
              </div>
            </div>

            {/* Milestone 2: Free Cancel */}
            <div className="flex flex-col items-center">
              <div className="relative">
                <div className="absolute -left-7 -top-2 z-10 w-14 h-14 rounded-full bg-(--rate-fg) text-white flex flex-col items-center justify-center shadow">
                  <span className="text-[24px] font-bold leading-none">
                    {freeCancelDate.daysPrior}
                  </span>
                  <span className="text-[10px] font-black leading-none tracking-wider uppercase mt-0.5">
                    DAYS
                  </span>
                </div>

                <div className="w-23.5 h-22.5 bg-white rounded-md flex flex-col items-center justify-center shadow-sm pl-2">
                  <span className="text-[34px] font-bold leading-none tracking-tight text-(--rate-fg)">
                    {freeCancelDate.day}
                  </span>
                  <span className="text-[22px] font-extrabold leading-none uppercase mt-1 text-(--rate-fg)">
                    {freeCancelDate.month}
                  </span>
                </div>
              </div>

              <div className="mt-3 text-center">
                <p className="text-[14px] sm:text-[15px] font-bold leading-4.5 uppercase text-(--rate-fg)">
                  FREE CANCEL
                </p>
                <p className="text-[13px] sm:text-[14px] font-normal leading-4.5 text-(--rate-fg)">
                  100% Refundable
                </p>
              </div>
            </div>

            {/* Milestone 3: Non-Refundable */}
            <div className="flex flex-col items-center">
              <div className="relative">
                <div className="absolute -left-7 -top-2 z-10 w-14 h-14 rounded-full bg-(--rate-accent) text-white flex flex-col items-center justify-center shadow">
                  <span className="text-[24px] font-bold leading-none">
                    {nonRefundableDate.daysPrior}
                  </span>
                  <span className="text-[10px] font-black leading-none tracking-wider uppercase mt-0.5">
                    DAYS
                  </span>
                </div>

                <div className="w-23.5 h-22.5 bg-white rounded-md flex flex-col items-center justify-center shadow-sm pl-2">
                  <span className="text-[34px] font-bold leading-none tracking-tight text-(--rate-accent)">
                    {nonRefundableDate.day}
                  </span>
                  <span className="text-[22px] font-extrabold leading-none uppercase mt-1 text-(--rate-accent)">
                    {nonRefundableDate.month}
                  </span>
                </div>
              </div>

              <div className="mt-3 text-center">
                <p className="text-[14px] sm:text-[15px] font-bold leading-4.5 uppercase text-(--rate-accent)">
                  NON-REFUNDABLE
                </p>
                <p className="text-[13px] sm:text-[14px] font-normal leading-4.5 text-(--rate-accent)">
                  Stay Locked
                </p>
              </div>
            </div>
          </div>

          {/* Horizontal Divider */}
          <div className="w-full h-px bg-(--rate-fg)/20 my-8" />

          {/* Deposit Information Section */}
          <div className="flex items-center justify-between px-3 sm:px-8">
            {/* Initial Deposit Due */}
            <div className="relative flex flex-col items-center text-center min-w-32.5">
              <div className="flex items-center justify-center gap-1.5">
                <span className="text-[20px] font-bold tracking-tight text-(--rate-fg)">
                  {initialAmount}
                </span>
                {showTooltips && (
                  <button
                    type="button"
                    aria-label="Initial Deposit Information"
                    onClick={() => toggleTooltip('initial')}
                    onMouseEnter={() => setActiveTooltip('initial')}
                    onMouseLeave={() => setActiveTooltip(null)}
                    className="inline-flex items-center justify-center text-(--rate-fg) hover:opacity-80 transition-opacity focus:outline-none focus:ring-2 focus:ring-(--rate-fg)/30 rounded-full"
                  >
                    <InfoIcon className="w-5 h-5" />
                  </button>
                )}
              </div>

              <div className="mt-1.5 text-center">
                <p className="text-[13px] font-bold leading-tight text-(--rate-fg)">
                  Initial
                </p>
                <p className="text-[13px] font-bold leading-tight text-(--rate-fg)">
                  Deposit Due
                </p>
              </div>

              {activeTooltip === 'initial' && (
                <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-3 z-30 w-64 p-3 bg-white rounded-md shadow-xl border border-gray-200 text-left">
                  <div className="flex items-start gap-2">
                    <div className="mt-0.5 text-(--rate-fg) shrink-0">
                      <InfoIcon className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-[12px] font-bold uppercase tracking-wider text-(--rate-fg)">
                        {initialDepositTooltip.title}
                      </h4>
                      <p className="text-[11px] text-gray-700 leading-relaxed mt-1 font-serif">
                        {initialDepositTooltip.description}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Transition Arrow */}
            <div className="flex items-center justify-center text-(--rate-fg) px-2 shrink-0">
              <ArrowRightIcon className="w-10 h-6 text-(--rate-fg)" />
            </div>

            {/* Remaining Deposit Due */}
            <div className="relative flex flex-col items-center text-center min-w-32.5">
              <div className="flex items-center justify-center gap-1.5">
                <span className="text-[20px] font-bold tracking-tight text-(--rate-accent)">
                  {remainingAmount}
                </span>
                {showTooltips && (
                  <button
                    type="button"
                    aria-label="Remaining Deposit Information"
                    onClick={() => toggleTooltip('remaining')}
                    onMouseEnter={() => setActiveTooltip('remaining')}
                    onMouseLeave={() => setActiveTooltip(null)}
                    className="inline-flex items-center justify-center text-(--rate-accent) hover:opacity-80 transition-opacity focus:outline-none focus:ring-2 focus:ring-(--rate-accent)/30 rounded-full"
                  >
                    <InfoIcon className="w-5 h-5" />
                  </button>
                )}
              </div>

              <div className="mt-1.5 text-center">
                <p className="text-[13px] font-bold leading-tight text-(--rate-accent)">
                  Remaining
                </p>
                <p className="text-[13px] font-bold leading-tight text-(--rate-accent)">
                  Deposit Due
                </p>
              </div>

              {activeTooltip === 'remaining' && (
                <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-3 z-30 w-64 p-3 bg-white rounded-md shadow-xl border border-gray-200 text-left">
                  <div className="flex items-start gap-2">
                    <div className="mt-0.5 text-(--rate-accent) shrink-0">
                      <InfoIcon className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-[12px] font-bold uppercase tracking-wider text-(--rate-fg)">
                        {remainingBalanceTooltip.title}
                      </h4>
                      <p className="text-[11px] text-gray-700 leading-relaxed mt-1 font-serif">
                        {remainingBalanceTooltip.description}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default PolicyDisplay;
