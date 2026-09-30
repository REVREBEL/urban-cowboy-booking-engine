import React from 'react';
import { X } from 'lucide-react';

export type OfferCardTheme = 'ride-easy' | 'outfit' | 'sunup' | 'stay-while' | 'plan-ahead';

export interface RateOfferSidePanelProps {
  variant?: 'default' | 'compact';
  theme?: OfferCardTheme;
  rateTitle?: string;
  cancellationHeader?: string;
  cancellationSub?: string;
  depositNote?: string;
  remainingNote?: string;
  nightlyRate?: number | string;
  stayTotal?: number | string;
  taxesAndFees?: number | string;
  totalStay?: number | string;
  dueAtBooking?: number | string;
  remaining?: number | string;
  policyText?: string;
  onClose: () => void;
  onConfirm?: () => void;
  isSubmitting?: boolean;
}

interface ThemeStyles {
  panelBg: string;
  borderColor: string;
  ticketBg: string;
  ticketBorder: string;
  textPrimary: string;
  textSecondary: string;
  accentColor: string;
  closeBtnColor: string;
  btnBg: string;
  btnText: string;
  btnBorder?: string;
  fontFamily: string;
  headingFont: string;
  policyFont: string;
}

const THEME_CONFIGS: Record<OfferCardTheme, ThemeStyles> = {
  'ride-easy': {
    panelBg: '#F2F2F2',
    borderColor: '#343833',
    ticketBg: '#FFFFFF',
    ticketBorder: 'rgba(52, 56, 51, 0.12)',
    textPrimary: '#221C18',
    textSecondary: '#73716D',
    accentColor: '#D65241',
    closeBtnColor: '#343833',
    btnBg: '#343833',
    btnText: '#FFFFFF',
    fontFamily: "'Lato', sans-serif",
    headingFont: "'Noto Serif Tibetan', 'Noto Serif', serif",
    policyFont: "'Quattrocento', Georgia, serif",
  },
  'outfit': {
    panelBg: '#0E301A',
    borderColor: '#F2AAA9',
    ticketBg: '#153C22',
    ticketBorder: 'rgba(242, 170, 169, 0.25)',
    textPrimary: '#EBE8E0',
    textSecondary: 'rgba(235, 232, 224, 0.75)',
    accentColor: '#F2AAA9',
    closeBtnColor: '#F2AAA9',
    btnBg: '#F2AAA9',
    btnText: '#0E301A',
    fontFamily: "'DM Sans', sans-serif",
    headingFont: "'League Gothic', 'Impact', sans-serif-condensed, sans-serif",
    policyFont: "'DM Sans', sans-serif",
  },
  'sunup': {
    panelBg: '#EBE8E0',
    borderColor: '#9A5636',
    ticketBg: '#FAF8F5',
    ticketBorder: 'rgba(154, 86, 54, 0.25)',
    textPrimary: '#69253A',
    textSecondary: '#9A5636',
    accentColor: '#69253A',
    closeBtnColor: '#9A5636',
    btnBg: '#9A5636',
    btnText: '#EBE8E0',
    fontFamily: "'Noto Serif Tibetan', 'Noto Serif', serif",
    headingFont: "'Rundeck', 'League Spartan', sans-serif",
    policyFont: "'Noto Serif Tibetan', 'Noto Serif', serif",
  },
  'stay-while': {
    panelBg: '#343833',
    borderColor: '#EBE8E0',
    ticketBg: '#272B26',
    ticketBorder: 'rgba(235, 232, 224, 0.25)',
    textPrimary: '#EBE8E0',
    textSecondary: 'rgba(235, 232, 224, 0.72)',
    accentColor: '#EBE8E0',
    closeBtnColor: '#EBE8E0',
    btnBg: '#EBE8E0',
    btnText: '#343833',
    fontFamily: "'Bianco Sans', 'Lato', sans-serif",
    headingFont: "'Quattrocento', serif",
    policyFont: "'Bianco Sans', 'Lato', sans-serif",
  },
  'plan-ahead': {
    panelBg: '#F2F2F2',
    borderColor: '#343833',
    ticketBg: '#FFFFFF',
    ticketBorder: 'rgba(52, 56, 51, 0.15)',
    textPrimary: '#000000',
    textSecondary: '#73716D',
    accentColor: '#343833',
    closeBtnColor: '#343833',
    btnBg: '#343833',
    btnText: '#F9F9F9',
    btnBorder: '#4E332D',
    fontFamily: "'League Spartan', sans-serif",
    headingFont: "'League Spartan', sans-serif",
    policyFont: "'Arvo', Georgia, serif",
  },
};

export const RateOfferSidePanel: React.FC<RateOfferSidePanelProps> = ({
  variant = 'compact',
  theme = 'ride-easy',
  cancellationHeader = 'FREE CANCELLATION UNTIL MAY 19',
  cancellationSub,
  depositNote = '50% deposit due today',
  remainingNote = 'Due May 28',
  nightlyRate = '823.08',
  stayTotal = '411.54',
  taxesAndFees = '411.54',
  totalStay = '823.08',
  dueAtBooking = '411.54',
  remaining = '411.54',
  policyText = 'Our standard rate for guests who want a little more freedom around their plans. Plans change. This one gives you room to move, with our most flexible cancellation terms.',
  onClose,
  onConfirm,
  isSubmitting = false,
}) => {
  const isCompact = variant === 'compact';
  const themeConfig = THEME_CONFIGS[theme] || THEME_CONFIGS['ride-easy'];

  if (isCompact) {
    // ================= COMPACT VARIANT (Active_Open.png) =================
    return (
      <div
        className="w-full h-full xl:w-[525px] xl:h-[625px] rounded-[45px] xl:rounded-l-none xl:rounded-r-[45px] p-6 sm:p-7 flex flex-col justify-between shadow-xl relative box-border transition-colors duration-300"
        style={{
          width: '525px',
          height: '625px',
          maxWidth: '100%',
          backgroundColor: themeConfig.panelBg,
          border: `4px solid ${themeConfig.borderColor}`,
          fontFamily: themeConfig.fontFamily,
        }}
      >
        {/* Top Close Icon */}
        <div className="flex justify-end w-full mb-1">
          <button
            onClick={onClose}
            type="button"
            className="hover:scale-110 transition-all p-1 cursor-pointer shrink-0 -mt-1 -mr-1"
            style={{ color: themeConfig.closeBtnColor }}
            aria-label="Close rate details"
          >
            <X className="w-8 h-8 stroke-[3.5]" />
          </button>
        </div>

        {/* Embedded Ticket Box with 2 Columns */}
        <div
          className="rounded-[22px] px-5 shadow-xs mb-3 mx-auto flex items-center justify-center box-border transition-colors duration-300"
          style={{
            width: '465px',
            height: '325px',
            paddingTop: '20px',
            paddingBottom: '20px',
            maxWidth: '100%',
            backgroundColor: themeConfig.ticketBg,
            border: `1.5px solid ${themeConfig.ticketBorder}`,
          }}
        >
          <div className="flex flex-row justify-between items-start gap-3 w-full">
            {/* Left Column: Cancellation & Schedule (width: 135px) */}
            <div
              className="space-y-3 shrink-0"
              style={{ width: '135px', fontFamily: themeConfig.fontFamily }}
            >
              <div>
                <span
                  className="font-bold text-xs sm:text-[13px] uppercase tracking-wider block leading-snug"
                  style={{ color: themeConfig.textPrimary }}
                >
                  {cancellationHeader}
                </span>
                {cancellationSub && (
                  <span
                    className="text-xs mt-0.5 block"
                    style={{ color: themeConfig.textSecondary }}
                  >
                    {cancellationSub}
                  </span>
                )}
              </div>

              <div>
                <span
                  className="text-xs sm:text-[13px] block leading-tight"
                  style={{ color: themeConfig.textPrimary }}
                >
                  {depositNote}
                </span>
              </div>

              <div>
                <span
                  className="text-xs sm:text-[13px] block leading-tight"
                  style={{ color: themeConfig.textSecondary }}
                >
                  Remaining balance
                </span>
                <span
                  className="font-bold text-xs sm:text-[13px] block mt-0.5"
                  style={{ color: themeConfig.textPrimary }}
                >
                  {remainingNote}
                </span>
              </div>
            </div>

            {/* Right Column: Financial Breakdown List (width: 225px, font-size: 18px) */}
            <div
              className="space-y-1.5 shrink-0"
              style={{
                width: '225px',
                fontSize: '18px',
                fontFamily: themeConfig.fontFamily,
              }}
            >
              <div className="flex justify-between items-baseline gap-1">
                <div className="flex flex-col">
                  <span
                    className="font-bold uppercase tracking-wider"
                    style={{ fontSize: '12px', color: themeConfig.textPrimary }}
                  >
                    NIGHTLY AVERAGE RATE
                  </span>
                  <span
                    className="text-[8px] uppercase tracking-tight"
                    style={{ color: themeConfig.textSecondary }}
                  >
                    EXCLUDING TAXES & FEES
                  </span>
                </div>
                <span
                  className="font-medium text-xs sm:text-sm"
                  style={{ color: themeConfig.textPrimary }}
                >
                  ${nightlyRate}
                </span>
              </div>

              <div className="flex justify-between items-baseline gap-1">
                <div className="flex flex-col">
                  <span
                    className="font-bold uppercase tracking-wider"
                    style={{ fontSize: '12px', color: themeConfig.textPrimary }}
                  >
                    STAY TOTAL
                  </span>
                  <span
                    className="text-[8px] uppercase tracking-tight"
                    style={{ color: themeConfig.textSecondary }}
                  >
                    EXCLUDING TAXES & FEES
                  </span>
                </div>
                <span
                  className="font-medium text-xs sm:text-sm"
                  style={{ color: themeConfig.textPrimary }}
                >
                  ${stayTotal}
                </span>
              </div>

              <div className="flex justify-between items-baseline gap-1">
                <span
                  className="font-bold uppercase tracking-wider"
                  style={{ fontSize: '12px', color: themeConfig.textPrimary }}
                >
                  TAXES & FEES
                </span>
                <span
                  className="font-medium text-xs sm:text-sm"
                  style={{ color: themeConfig.textPrimary }}
                >
                  ${taxesAndFees}
                </span>
              </div>

              <div className="flex justify-between items-baseline gap-1 pt-0.5">
                <div className="flex flex-col">
                  <span
                    className="font-bold text-[11px] sm:text-xs uppercase tracking-wider"
                    style={{ color: themeConfig.textPrimary }}
                  >
                    TOTAL STAY
                  </span>
                  <span
                    className="text-[8px] uppercase tracking-tight"
                    style={{ color: themeConfig.textSecondary }}
                  >
                    INCLUDING TAXES & FEES
                  </span>
                </div>
                <span
                  className="font-bold text-xs sm:text-sm"
                  style={{ color: themeConfig.textPrimary }}
                >
                  ${totalStay}
                </span>
              </div>

              <div
                className="flex justify-between items-baseline gap-1 pt-0.5"
                style={{ color: themeConfig.accentColor }}
              >
                <span
                  className="font-bold uppercase tracking-wider"
                  style={{ fontSize: '13.5px' }}
                >
                  DUE AT BOOKING
                </span>
                <span className="font-bold text-xs sm:text-sm">
                  ${dueAtBooking}
                </span>
              </div>

              <div className="flex justify-between items-baseline gap-1">
                <span
                  className="font-medium uppercase tracking-wider"
                  style={{ fontSize: '12px', color: themeConfig.textSecondary }}
                >
                  REMAINING
                </span>
                <span
                  className="font-medium text-xs sm:text-sm"
                  style={{ color: themeConfig.textPrimary }}
                >
                  ${remaining}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Policy Disclaimer */}
        <p
          className="text-xs leading-relaxed text-center sm:text-left mb-3 px-1"
          style={{
            color: themeConfig.textSecondary,
            fontFamily: themeConfig.policyFont,
          }}
        >
          {policyText}
        </p>

        {/* Oval Pill CTA Button: AGREE & CONFIRM BOOKING */}
        <div className="w-full flex justify-center">
          <button
            type="button"
            onClick={onConfirm}
            disabled={isSubmitting}
            style={{
              height: '60px',
              backgroundColor: themeConfig.btnBg,
              color: themeConfig.btnText,
              border: themeConfig.btnBorder ? `2px solid ${themeConfig.btnBorder}` : 'none',
              fontFamily: themeConfig.fontFamily,
            }}
            className="h-[60px] px-8 sm:px-10 rounded-full text-xs sm:text-sm uppercase tracking-[0.12em] font-bold shadow-md hover:shadow-lg hover:brightness-105 active:scale-[0.99] transition-all cursor-pointer flex items-center justify-center whitespace-nowrap disabled:opacity-50"
          >
            {isSubmitting ? 'Confirming...' : 'AGREE & CONFIRM BOOKING'}
          </button>
        </div>
      </div>
    );
  }

  // ================= NORMAL VARIANT (Normal Active Open.png) =================
  return (
    <div
      className="w-full h-full xl:w-[480px] rounded-[40px] xl:rounded-l-none xl:rounded-r-[40px] p-6 sm:p-8 lg:p-10 flex flex-col justify-between shadow-xl relative box-border min-h-[820px] transition-colors duration-300"
      style={{
        backgroundColor: themeConfig.panelBg,
        border: `3.5px solid ${themeConfig.borderColor}`,
        fontFamily: themeConfig.fontFamily,
      }}
    >
      {/* Top Close Icon */}
      <div className="flex justify-end w-full mb-2">
        <button
          onClick={onClose}
          type="button"
          className="hover:scale-110 transition-all p-1 cursor-pointer shrink-0 -mt-2 -mr-2"
          style={{ color: themeConfig.closeBtnColor }}
          aria-label="Close rate details"
        >
          <X className="w-8 h-8 stroke-[3.5]" />
        </button>
      </div>

      {/* Top Section: Cancellation & Schedule */}
      <div className="space-y-4 mb-6" style={{ fontFamily: themeConfig.fontFamily }}>
        <div>
          <span
            className="font-bold text-sm sm:text-base uppercase tracking-wider block leading-tight"
            style={{ color: themeConfig.textPrimary }}
          >
            {cancellationHeader}
          </span>
          {cancellationSub && (
            <span
              className="text-xs mt-0.5 block"
              style={{ color: themeConfig.textSecondary }}
            >
              {cancellationSub}
            </span>
          )}
        </div>

        <div>
          <span
            className="text-sm sm:text-base block leading-tight"
            style={{ color: themeConfig.textPrimary }}
          >
            {depositNote}
          </span>
        </div>

        <div>
          <span
            className="text-sm sm:text-base block leading-tight"
            style={{ color: themeConfig.textSecondary }}
          >
            Remaining balance
          </span>
          <span
            className="font-bold text-sm sm:text-base block mt-0.5"
            style={{ color: themeConfig.textPrimary }}
          >
            {remainingNote}
          </span>
        </div>
      </div>

      {/* Embedded Ticket Box (Financial Breakdown Only) */}
      <div
        className="rounded-[24px] p-6 sm:p-7 shadow-xs mb-8 transition-colors duration-300"
        style={{
          backgroundColor: themeConfig.ticketBg,
          border: `1.5px solid ${themeConfig.ticketBorder}`,
          fontFamily: themeConfig.fontFamily,
        }}
      >
        <div className="space-y-3.5">
          <div className="flex justify-between items-baseline gap-2">
            <div className="flex flex-col">
              <span
                className="font-bold text-xs uppercase tracking-wider"
                style={{ color: themeConfig.textPrimary }}
              >
                NIGHTLY AVERAGE RATE
              </span>
              <span
                className="text-[9px] uppercase tracking-tight"
                style={{ color: themeConfig.textSecondary }}
              >
                EXCLUDING TAXES & FEES
              </span>
            </div>
            <span
              className="font-medium text-sm sm:text-base"
              style={{ color: themeConfig.textPrimary }}
            >
              ${nightlyRate}
            </span>
          </div>

          <div className="flex justify-between items-baseline gap-2">
            <div className="flex flex-col">
              <span
                className="font-bold text-xs uppercase tracking-wider"
                style={{ color: themeConfig.textPrimary }}
              >
                STAY TOTAL
              </span>
              <span
                className="text-[9px] uppercase tracking-tight"
                style={{ color: themeConfig.textSecondary }}
              >
                EXCLUDING TAXES & FEES
              </span>
            </div>
            <span
              className="font-medium text-sm sm:text-base"
              style={{ color: themeConfig.textPrimary }}
            >
              ${stayTotal}
            </span>
          </div>

          <div className="flex justify-between items-baseline gap-2">
            <span
              className="font-bold text-xs uppercase tracking-wider"
              style={{ color: themeConfig.textPrimary }}
            >
              TAXES & FEES
            </span>
            <span
              className="font-medium text-sm sm:text-base"
              style={{ color: themeConfig.textPrimary }}
            >
              ${taxesAndFees}
            </span>
          </div>

          <div
            className="flex justify-between items-baseline gap-2 pt-1 border-t"
            style={{ borderColor: themeConfig.ticketBorder }}
          >
            <div className="flex flex-col">
              <span
                className="font-bold text-xs sm:text-sm uppercase tracking-wider"
                style={{ color: themeConfig.textPrimary }}
              >
                TOTAL STAY
              </span>
              <span
                className="text-[9px] uppercase tracking-tight"
                style={{ color: themeConfig.textSecondary }}
              >
                INCLUDING TAXES & FEES
              </span>
            </div>
            <span
              className="font-bold text-sm sm:text-base"
              style={{ color: themeConfig.textPrimary }}
            >
              ${totalStay}
            </span>
          </div>

          <div
            className="flex justify-between items-baseline gap-2 pt-1"
            style={{ color: themeConfig.accentColor }}
          >
            <span className="font-bold text-xs sm:text-sm uppercase tracking-wider">
              DUE AT BOOKING
            </span>
            <span className="font-bold text-sm sm:text-base">
              ${dueAtBooking}
            </span>
          </div>

          <div
            className="flex justify-between items-baseline gap-2 pt-1 border-t"
            style={{ borderColor: themeConfig.ticketBorder }}
          >
            <span
              className="font-medium text-xs sm:text-sm uppercase tracking-wider"
              style={{ color: themeConfig.textSecondary }}
            >
              REMAINING
            </span>
            <span
              className="font-medium text-sm sm:text-base"
              style={{ color: themeConfig.textPrimary }}
            >
              ${remaining}
            </span>
          </div>
        </div>
      </div>

      {/* Policy Disclaimer in Editorial Font at Bottom */}
      <p
        className="text-xs sm:text-[13px] leading-relaxed text-left px-1 mt-auto"
        style={{
          color: themeConfig.textSecondary,
          fontFamily: themeConfig.policyFont,
        }}
      >
        {policyText}
      </p>
    </div>
  );
};
