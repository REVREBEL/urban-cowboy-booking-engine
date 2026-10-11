// PolicyDisplay.tsx
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { RATE_CARD_COLORS } from "@/lib/rateCardPresentation";

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

export interface PolicyDisplayProps {
  title?: string;
  initialAmount?: string;
  remainingAmount?: string;
  freeCancelDate?: MilestoneDate;
  nonRefundableDate?: MilestoneDate;
  initialDepositTooltip?: {
    title: string;
    description: string;
  };
  remainingBalanceTooltip?: {
    title: string;
    description: string;
  };
  className?: string;

  
}

export const PolicyDisplay: React.FC<PolicyDisplayProps> = ({
  title = 'POLICY INFORMATION',
  initialAmount = '$000.00',
  remainingAmount = '$000.00',
  freeCancelDate = { daysPrior: '14', day: '11', month: 'OCT' },
  nonRefundableDate = { daysPrior: '05', day: '30', month: 'OCT' },
  initialDepositTooltip = {
    title: 'INITIAL DEPOSIT',
    description:
      'This is the amount due at booking. Once your reservation is confirmed, the hotel will charge this amount to the payment method provided.',
  },
  remainingBalanceTooltip = {
    title: 'REMAINING BALANCE',
    description:
      'This is the remaining amount due for your stay. It will be charged automatically to your payment method on the date shown above.',
  },
  className = '',
}) => {
  const [activeTooltip, setActiveTooltip] = useState<'initial' | 'remaining' | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const textColor = RATE_CARD_COLORS[config.textColor].hex;
  const accentColor = RATE_CARD_COLORS[config.accentColor].hex;
  // Close active tooltip when clicking outside
  const style = useMemo(
    () =>
      ({
        '--rate-fg': textColor,
        '--rate-accent': accentColor,
      }) as React.CSSProperties,
    [textColor, accentColor]
  );

  // Close active tooltip when clicking outside the component
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
    setActiveTooltip((prev) => (prev === type ? null : type));
  };

  return (
    <div
      ref={containerRef}
      className={`relative w-full max-w-151.25 rounded-lg bg-background p-6 sm:p-8 font-sans select-none text-textColor, shadow-sm ${className}`}
    >
      {/* Policy Heading */}
      <h2 className="text-left text-[15px] font-bold tracking-wider text-textColor, uppercase mb-8">
        {title}
      </h2>

      {/* Milestones Row */}
      <div className="grid grid-cols-3 gap-2 sm:gap-4 items-start text-center mb-8">
        {/* Milestone 1: Due Today */}
        <div className="flex flex-col items-center">
          <div className="w-23.5 h-22.75 bg-white rounded-md flex flex-col items-center justify-center shadow-sm">
            <span className="text-[24px] font-bold leading-none tracking-tight text-textColor,">
              DUE
            </span>
            <span className="text-[14px] font-extrabold leading-tight tracking-wider text-[textColor, uppercase mt-1">
              TODAY
            </span>
          </div>
          <div className="mt-3 text-center">
            <p className="text-[14px] sm:text-[15px] font-bold leading-4.5 text-textColor uppercase">
              AFTER
            </p>
            <p className="text-[14px] sm:text-[15px] font-bold leading-4.5 text-textColor uppercase">
              CONFIRMING
            </p>
          </div>
        </div>

        {/* Milestone 2: Free Cancel */}
        <div className="flex flex-col items-center">
          <div className="relative">
            {/* Circular badge shifted to the left edge so the date inside is completely visible */}
            <div className="absolute -left-7 -top-2 z-10 w-14 h-14 rounded-full bg-textColor text-white flex flex-col items-center justify-center shadow">
              <span className="text-[24px] font-bold leading-none">
                {freeCancelDate.daysPrior}
              </span>
              <span className="text-[10px] font-black leading-none tracking-wider uppercase mt-0.5">
                DAYS
              </span>
            </div>

            {/* Calendar Tile */}
            <div className="w-23.5 h-22.75 bg-white rounded-md flex flex-col items-center justify-center shadow-sm pl-2">
              <span className="text-[34px] font-bold leading-none text-textColor tracking-tight">
                {freeCancelDate.day}
              </span>
              <span className="text-[22px] font-extrabold leading-none uppercase text-textColor mt-1">
                {freeCancelDate.month}
              </span>
            </div>
          </div>

          <div className="mt-3 text-center">
            <p className="text-[14px] sm:text-[15px] font-bold leading-4.5 text-textColor uppercase">
              FREE CANCEL
            </p>
            <p className="text-[13px] sm:text-[14px] font-normal leading-4.5 text-textColor">
              100% Refundable
            </p>
          </div>
        </div>

        {/* Milestone 3: Non-Refundable */}
        <div className="flex flex-col items-center">
          <div className="relative">
            {/* Terracotta Circular badge shifted to the left edge without obstructing the date */}
            <div className="absolute -left-7 -top-2 z-10 w-14 h-14 rounded-full bg-accentColor text-white flex flex-col items-center justify-center shadow">
              <span className="text-[24px] font-bold leading-none">
                {nonRefundableDate.daysPrior}
              </span>
              <span className="text-[10px] font-black leading-none tracking-wider uppercase mt-0.5">
                DAYS
              </span>
            </div>

            {/* Calendar Tile */}
            <div className="w-23.5 h-22.75 bg-white rounded-md flex flex-col items-center justify-center shadow-sm pl-2">
              <span className="text-[34px] font-bold leading-none text-accentColor tracking-tight">
                {nonRefundableDate.day}
              </span>
              <span className="text-[22px] font-extrabold leading-none uppercase text-accentColor mt-1">
                {nonRefundableDate.month}
              </span>
            </div>
          </div>

          <div className="mt-3 text-center">
            <p className="text-[14px] sm:text-[15px] font-bold leading-4.5 text-accentColor uppercase">
              NON-REFUNDABLE
            </p>
            <p className="text-[13px] sm:text-[14px] font-normal leading-4.5 text-accentColor">
              Stay Locked
            </p>
          </div>
        </div>
      </div>

      {/* Horizontal Divider */}
      <div className="w-full h-px bg-textColor/20 my-8" />

      {/* Deposit Information Section */}
      <div className="flex items-center justify-between px-3 sm:px-8">
        {/* Initial Deposit Due (Centered text alignment) */}
        <div className="relative flex flex-col items-center text-center min-w-32.5">
          <div className="flex items-center justify-center gap-1.5">
            <span className="text-[20px] font-bold tracking-tight text-textColor">
              {initialAmount}
            </span>
            <button
              type="button"
              aria-label="Initial Deposit Information"
              onClick={() => toggleTooltip('initial')}
              onMouseEnter={() => setActiveTooltip('initial')}
              onMouseLeave={() => setActiveTooltip(null)}
              className="inline-flex items-center justify-center text-textColor hover:opacity-80 transition-opacity focus:outline-none focus:ring-2 focus:ring-textColor/30 rounded-full"
            >
              <InfoIcon className="w-4.75 h-4.75" />
            </button>
          </div>

          <div className="mt-1.5 text-center">
            <p className="text-[13px] font-bold leading-tight text-textColor">
              Initial
            </p>
            <p className="text-[13px] font-bold leading-tight text-textColor">
              Deposit Due
            </p>
          </div>

          {/* Initial Deposit Tooltip Popover */}
          {activeTooltip === 'initial' && (
            <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-3 z-30 w-64 p-3 bg-white rounded-md shadow-xl border border-gray-200 text-left animate-in fade-in duration-150">
              <div className="flex items-start gap-2">
                <div className="mt-0.5 text-textColor shrink-0">
                  <InfoIcon className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-[12px] font-bold uppercase tracking-wider text-textColor">
                    {initialDepositTooltip.title}
                  </h4>
                  <p className="text-[11px] text-textColor leading-relaxed mt-1 font-serif">
                    {initialDepositTooltip.description}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Transition Arrow */}
        <div className="flex items-center justify-center text-textColor px-2 shrink-0">
          <ArrowRightIcon className="w-10 h-6 text-textColor" />
        </div>

        {/* Remaining Deposit Due (Centered text alignment) */}
        <div className="relative flex flex-col items-center text-center min-w-32.5">
          <div className="flex items-center justify-center gap-1.5">
            <span className="text-[20px] font-bold tracking-tight text-accentColor">
              {remainingAmount}
            </span>
            <button
              type="button"
              aria-label="Remaining Deposit Information"
              onClick={() => toggleTooltip('remaining')}
              onMouseEnter={() => setActiveTooltip('remaining')}
              onMouseLeave={() => setActiveTooltip(null)}
              className="inline-flex items-center justify-center text-accentColor hover:opacity-80 transition-opacity focus:outline-none focus:ring-2 focus:ring-accentColor/30 rounded-full"
            >
              <InfoIcon className="w-4.5 h-4.5" />
            </button>
          </div>

          <div className="mt-1.5 text-center">
            <p className="text-[13px] font-bold leading-tight text-accentColor">
              Remaining
            </p>
            <p className="text-[13px] font-bold leading-tight text-accentColor">
              Deposit Due
            </p>
          </div>

          {/* Remaining Deposit Tooltip Popover */}
          {activeTooltip === 'remaining' && (
            <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-3 z-30 w-64 p-3 bg-white rounded-md shadow-xl border border-gray-200 text-left animate-in fade-in duration-150">
              <div className="flex items-start gap-2">
                <div className="mt-0.5 text-accentColor shrink-0">
                  <InfoIcon className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-[12px] font-bold uppercase tracking-wider text-textColor">
                    {remainingBalanceTooltip.title}
                  </h4>
                  <p className="text-[11px] text-textColor leading-relaxed mt-1 font-serif">
                    {remainingBalanceTooltip.description}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PolicyDisplay;