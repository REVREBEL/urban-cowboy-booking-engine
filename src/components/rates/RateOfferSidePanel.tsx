import * as React from 'react';
import { X } from 'lucide-react';
import { PolicyDisplay } from './policy_display';
import { Button, type ButtonColor } from '../ui/button';

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
  /** Optional fully resolved policy content; defaults to policyText. */
  policyDisplay?: React.ReactNode;
  onClose: () => void;
  onConfirm?: () => void;
  isSubmitting?: boolean;
  /** Optional explicit panel height for CMS artwork cards. */
  height?: number;
  /** Render as an independent surface instead of the docked card-side treatment. */
  standalone?: boolean;
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

const buttonColorForTheme = (theme: OfferCardTheme): ButtonColor => {
  switch (theme) {
    case 'outfit':
      return 'nude-ember';
    case 'sunup':
      return 'copper';
    case 'stay-while':
      return 'alpine-linen';
    case 'plan-ahead':
    case 'ride-easy':
    default:
      return 'smoke';
  }
};

const THEME_CONFIGS: Record<OfferCardTheme, ThemeStyles> = {
  'ride-easy': {
    panelBg: '#F2F2F2',
    borderColor: 'var(--color-smoke)',
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
    borderColor: 'var(--color-nude-ember)',
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
    borderColor: 'var(--color-copper)',
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
    borderColor: 'var(--alpine-linen)',
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
    borderColor: 'var(--color-smoke)',
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
  policyDisplay,
  onClose,
  onConfirm,
  isSubmitting = false,
  height,
  standalone = false,
}) => {
  const isCompact = variant === 'compact';
  const themeConfig = THEME_CONFIGS[theme] || THEME_CONFIGS['ride-easy'];

  if (standalone) {
    const formattedAmount = (value: number | string | undefined) =>
      typeof value === 'number' ? value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : value ?? '—';
    const line = (label: string, value: number | string | undefined, strong = false) => (
      <div className={`flex items-baseline justify-between gap-4 py-2 ${strong ? 'border-t pt-4 text-base font-bold' : 'text-sm'}`}
        style={{ borderColor: themeConfig.ticketBorder, color: themeConfig.textPrimary }}>
        <span className="font-label uppercase tracking-[0.12em]">{label}</span>
        <span className="font-number tabular-nums">{formattedAmount(value)}</span>
      </div>
    );
    return (
      <section
        className="relative flex max-h-[calc(100dvh-2rem)] min-h-0 w-full min-w-0 flex-col overflow-hidden rounded-[28px] border shadow-2xl sm:max-h-[calc(100dvh-4rem)]"
        style={{ backgroundColor: themeConfig.panelBg, borderColor: themeConfig.borderColor, color: themeConfig.textPrimary }}
        aria-label="Rate policy and deposit details"
      >
        <header className="flex shrink-0 items-center justify-between border-b px-6 py-4 sm:px-8"
          style={{ borderColor: themeConfig.ticketBorder }}>
          <h2 className="font-heading text-2xl uppercase leading-none">Rate Details</h2>
          <button type="button" onClick={onClose} aria-label="Close rate details"
            className="rounded-full p-2 transition-opacity hover:opacity-65 focus-visible:outline-2 focus-visible:outline-offset-2"
            style={{ color: themeConfig.closeBtnColor }}>
            <X className="h-6 w-6" />
          </button>
        </header>
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-5 sm:px-8 sm:py-6">
          <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
            <div className="min-w-0">
              <h3 className="mb-3 font-label text-xs uppercase tracking-[0.18em]">Policy information</h3>
              <div className="overflow-hidden rounded-2xl bg-[#F4F4F5] text-[#4e332d] [&>div]:max-w-none [&>div]:shadow-none">
                {policyDisplay ?? <PolicyDisplay text={policyText} />}
              </div>
              {policyText && <p className="mt-4 text-xs leading-relaxed opacity-80">{policyText}</p>}
            </div>
            <div className="min-w-0 rounded-2xl border p-5" style={{ backgroundColor: themeConfig.ticketBg, borderColor: themeConfig.ticketBorder }}>
              <h3 className="mb-3 font-label text-xs uppercase tracking-[0.18em]">Stay pricing</h3>
              {line('Nightly average', nightlyRate)}
              {line('Stay before taxes', stayTotal)}
              {line('Taxes & fees', taxesAndFees)}
              {line('Total stay', totalStay, true)}
              {line('Due at booking', dueAtBooking)}
              {line('Remaining balance', remaining)}
            </div>
          </div>
        </div>
        <footer className="shrink-0 border-t px-5 py-4 sm:px-8"
          style={{ backgroundColor: themeConfig.panelBg, borderColor: themeConfig.ticketBorder }}>
          <Button type="button" variant="filled" color={buttonColorForTheme(theme)}
            disabled={isSubmitting || !onConfirm} onClick={onConfirm}
            className="w-full sm:w-auto">
            CHOOSE THIS RATE
          </Button>
        </footer>
      </section>
    );
  }

  if (isCompact && policyDisplay) {
    return (
      <section
        className="relative box-border flex w-full min-w-0 flex-col rounded-r-[32px] border-2 p-5 shadow-xl"
        style={{
          width: "525px",
          maxWidth: "100%",
          height: height ? `${height}px` : "675px",
          backgroundColor: themeConfig.panelBg,
          borderColor: themeConfig.borderColor,
        }}
        aria-label="Rate policy and deposit details"
      >
        <button type="button" onClick={onClose} aria-label="Close rate details"
          className="absolute right-4 top-4 z-20 rounded-full p-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-current"
          style={{ color: themeConfig.closeBtnColor }}>
          <X className="h-5 w-5" />
        </button>
        <div className="flex min-h-0 flex-1 items-center justify-center overflow-y-auto pt-6">
          {policyDisplay}
        </div>
        <div className="flex justify-center pt-3">
          <Button type="button" variant="filled" color={buttonColorForTheme(theme)}
            onClick={onConfirm} disabled={isSubmitting || !onConfirm}>
            AGREE &amp; CONFIRM BOOKING
          </Button>
        </div>
      </section>
    );
  }

  if (isCompact) {
    // ================= COMPACT VARIANT (Active_Open.png) =================
    return (
      <div
        className="w-131.25 h-156.25 rounded-r-[45px] rounded-l-none p-6 sm:p-7 flex flex-col justify-between shadow-xl relative box-border transition-colors duration-300 shrink-0"
        style={{
          width: '525px',
          minWidth: '525px',
          height: height ? `${height}px` : '625px',
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
            className="hover:scale-110 transition-all p-1 cursor-pointer shrink-0 -mt-1 -mr-1 rounded-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-current"
            style={{ color: themeConfig.closeBtnColor }}
            aria-label="Close rate details"
          >
            <X className="w-8 h-8 stroke-[3.5]" />
          </button>
        </div>

        <>
        {/* Embedded Ticket Box with 2 Columns */}
        <div
          className="rounded-panel-xs px-5 shadow-xs mb-3 mx-auto flex items-center justify-center box-border transition-colors duration-300"
          style={{
            width: '465px',
            height: policyDisplay ? '220px' : '325px',
            paddingTop: '20px',
            paddingBottom: '20px',
            maxWidth: '100%',
            backgroundColor: themeConfig.ticketBg,
            border: `1.5px solid ${themeConfig.ticketBorder}`,
          }}
        >
          <div className="flex flex-row justify-between items-start gap-3 w-full">
            {!policyDisplay && (
              <>
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


              </>
            )}

            {/* Right Column: Financial Breakdown List (width: 225px, font-size: 18px) */}
            <div
              className="space-y-1.5 shrink-0"
              style={{
                width: policyDisplay ? '100%' : '225px',
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

          </>

        {/* Policy Disclaimer */}
        <div
          className="text-xs leading-relaxed text-center sm:text-left mb-3 px-1"
          style={{
            color: themeConfig.textSecondary,
            fontFamily: themeConfig.policyFont,
          }}
        >
          {policyDisplay ?? <PolicyDisplay text={policyText} />}
        </div>

        {/* Oval Pill CTA Button: AGREE & CONFIRM BOOKING */}
        <div className="w-full flex justify-center">
          <Button
            type="button"
            onClick={onConfirm}
            disabled={isSubmitting}
            isLoading={isSubmitting}
            variant="filled"
            color={buttonColorForTheme(theme)}
            size="large"
          >
            AGREE & CONFIRM BOOKING
          </Button>
        </div>
      </div>
    );
  }

  // ================= NORMAL VARIANT (Normal Active Open.png) =================
  return (
    <div
      className={
        standalone
          ? "w-132 h-200 rounded-[32px] p-6 sm:p-8 flex flex-col items-center justify-center gap-6 shadow-xl relative box-border transition-colors duration-300 shrink-0"
          : "w-132 h-200 rounded-r-[40px] rounded-l-none py-6 pr-6 pl-18 sm:py-8 sm:pr-8 sm:pl-20 lg:py-10 lg:pr-10 lg:pl-22 flex flex-col items-center justify-center gap-8 shadow-xl relative box-border transition-colors duration-300 shrink-0"
      }
      style={{
        width: '528px',
        minWidth: '528px',
        backgroundColor: themeConfig.panelBg,
        border: `3.5px solid ${themeConfig.borderColor}`,
        fontFamily: themeConfig.fontFamily,
        height: height ? `${height}px` : '800px',
      }}
    >
      {/* Top Close Icon */}
      <div className="absolute right-6 top-6 sm:right-8 sm:top-8 lg:right-10 lg:top-10 flex justify-end">
        <button
          onClick={onClose}
          type="button"
            className="hover:scale-110 transition-all p-1 cursor-pointer shrink-0 rounded-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-current"
          style={{ color: themeConfig.closeBtnColor }}
          aria-label="Close rate details"
        >
          <X className="w-8 h-8 stroke-[3.5]" />
        </button>
      </div>

      {policyDisplay ? (
        <div className="w-full">{policyDisplay}</div>
      ) : (
        <>
      {/* Top Section: Cancellation & Schedule */}
      <div className="w-full space-y-4" style={{ fontFamily: themeConfig.fontFamily }}>
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


        </>
      )}

      {/* Embedded Ticket Box (Financial Breakdown Only) */}
      <div
        className="w-full rounded-panel-sm p-6 sm:p-7 shadow-xs transition-colors duration-300"
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
      <div
        className="w-full text-xs sm:text-[13px] leading-relaxed text-left px-1"
        style={{
          color: themeConfig.textSecondary,
          fontFamily: themeConfig.policyFont,
        }}
      >
        {policyDisplay ?? <PolicyDisplay text={policyText} />}
      </div>
    </div>
  );
};
