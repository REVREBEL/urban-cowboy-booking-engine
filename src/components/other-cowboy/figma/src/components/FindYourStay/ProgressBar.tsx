// ProgressBar.tsx
import React, { useState } from 'react';

export type ProgressStepState = 'default' | 'current' | 'complete';

export interface ProgressStepData {
  /** 1-based step index */
  step: number;
  /** Display label for the step (e.g. 'Stay', 'Room') */
  label: string;
  /** Optional state override for this step */
  state?: ProgressStepState;
  /** Optional identifier */
  id?: string;
}

export interface ProgressStepProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'onClick'> {
  /** Numeric step index */
  step: number;
  /** Step label text */
  label: string;
  /** Step visual state */
  state?: ProgressStepState;
  /** Click handler supporting sync or async actions */
  onClick?: (step: number) => Promise<void> | void;
  /** Render mini checkmark icon when complete */
  showCheckOnComplete?: boolean;
  /** External loading indicator */
  isLoading?: boolean;
  /** Disabled state */
  disabled?: boolean;
  /** Custom class name */
  className?: string;
  /** Custom container styles */
  style?: React.CSSProperties;
}

export interface ProgressBarProps {
  /** Active step index (1-based, e.g., 1 for Stay, 2 for Room) */
  currentStep?: number;
  /** Custom step items (defaults to the 5 standard booking steps) */
  steps?: ProgressStepData[];
  /** Callback fired when user clicks a step */
  onStepChange?: (step: number) => Promise<void> | void;
  /** Custom slot overrides indexed by step number (e.g., { 3: <CustomDetailsBadge /> }) */
  slots?: Record<number, React.ReactNode>;
  /** Optional render prop to customize step rendering with default fallback */
  renderStep?: (
    stepData: ProgressStepData,
    resolvedState: ProgressStepState,
    defaultNode: React.ReactNode
  ) => React.ReactNode;
  /** Show checkmark icon in place of number on completed steps */
  showCheckOnComplete?: boolean;
  /** External loading state for the entire bar */
  isLoading?: boolean;
  /** Global disabled state */
  disabled?: boolean;
  /** Container class name */
  className?: string;
  /** Container inline styles */
  style?: React.CSSProperties;
}

export const DEFAULT_BOOKING_STEPS: ProgressStepData[] = [
  { step: 1, label: 'Stay' },
  { step: 2, label: 'Room' },
  { step: 3, label: 'Details' },
  { step: 4, label: 'Extras' },
  { step: 5, label: 'Pay' },
];

const getStepStyle = (state: ProgressStepState) => {
  switch (state) {
    case 'current':
      return {
        containerBg: '#9A5636',
        containerBorder: 'transparent',
        circleBorder: '#EBE8E0',
        circleText: '#EBE8E0',
        labelText: '#EBE8E0',
      };
    case 'complete':
      return {
        containerBg: '#4E332D',
        containerBorder: 'transparent',
        circleBorder: '#EBE8E0',
        circleText: '#EBE8E0',
        labelText: '#EBE8E0',
      };
    case 'default':
    default:
      return {
        containerBg: 'transparent',
        containerBorder: 'rgba(235, 232, 224, 0.25)',
        circleBorder: 'rgba(235, 232, 224, 0.4)',
        circleText: '#767470',
        labelText: '#767470',
      };
  }
};

const CheckIcon: React.FC<{ size?: number; color?: string }> = ({
  size = 8,
  color = 'currentColor',
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 12 12"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="flex-shrink-0"
    aria-hidden="true"
  >
    <path
      d="M2.5 6.5L4.5 8.5L9.5 3.5"
      stroke={color}
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export const ProgressStep: React.FC<ProgressStepProps> = ({
  step,
  label,
  state = 'default',
  onClick,
  showCheckOnComplete = false,
  isLoading: externalLoading = false,
  disabled = false,
  className = '',
  style = {},
  ...buttonProps
}) => {
  const [internalLoading, setInternalLoading] = useState(false);
  const isBusy = externalLoading || internalLoading;
  const isInteractiveDisabled = disabled || isBusy;
  const isInteractive = Boolean(onClick);

  const colors = getStepStyle(state);

  const handleClick = async () => {
    if (isInteractiveDisabled || !onClick) return;

    try {
      const result = onClick(step);
      if (result instanceof Promise) {
        setInternalLoading(true);
        await result;
      }
    } catch (error) {
      console.error(`Step transition to ${step} failed:`, error);
    } finally {
      setInternalLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={isInteractive ? handleClick : undefined}
      disabled={isInteractiveDisabled}
      aria-current={state === 'current' ? 'step' : undefined}
      aria-busy={isBusy}
      aria-label={`Step ${step}: ${label} (${state})`}
      className={`group relative inline-flex items-center justify-center select-none transition-all duration-200 box-border w-fit flex-shrink-0 ${
        isInteractive && !isInteractiveDisabled
          ? 'cursor-pointer hover:opacity-90 active:scale-[0.97]'
          : isBusy
          ? 'cursor-wait'
          : 'cursor-default'
      } ${disabled ? 'opacity-40 cursor-not-allowed' : ''} ${className}`}
      style={{
        height: '25px',
        padding: '4px 8px 4px 6px',
        gap: '4px',
        borderRadius: '9999px',
        backgroundColor: colors.containerBg,
        border: `1px solid ${
          state === 'default' ? colors.containerBorder : 'transparent'
        }`,
        ...style,
      }}
      {...buttonProps}
    >
      {isBusy ? (
        <div className="flex items-center justify-center h-[16px] px-2">
          <svg
            className="animate-spin h-3 w-3 text-current"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
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
              d="M4 12a8 8 0 018-8v8H4z"
            />
          </svg>
        </div>
      ) : (
        <>
          {/* Step Number Circle (16px x 16px, vertically centered) */}
          <div
            className="flex-shrink-0 flex items-center justify-center box-border transition-colors duration-200"
            style={{
              width: '16px',
              height: '16px',
              border: `1px solid ${colors.circleBorder}`,
              borderRadius: '9999px',
            }}
          >
            {state === 'complete' && showCheckOnComplete ? (
              <CheckIcon size={8} color={colors.circleText} />
            ) : (
              <span
                className="select-none flex items-center justify-center leading-none text-center"
                style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: '9px',
                  lineHeight: '1',
                  color: colors.circleText,
                }}
              >
                {step}
              </span>
            )}
          </div>

          {/* Step Label: matching 16px flex height aligned on center axis */}
          <span
            className="select-none capitalize tracking-[0.2px] flex items-center justify-center leading-none"
            style={{
              height: '16px',
              fontFamily: "'Brothers OT', 'League Spartan', sans-serif",
              fontSize: '11px',
              color: colors.labelText,
            }}
          >
            {label}
          </span>
        </>
      )}
    </button>
  );
};

const ProgressSlashSeparator: React.FC<{ className?: string }> = ({
  className = '',
}) => (
  <span
    aria-hidden="true"
    className={`select-none inline-flex items-center justify-center flex-shrink-0 mx-[15px] ${className}`}
    style={{
      width: '3px',
      height: '17px',
      fontFamily: "'Uchen', 'Noto Serif Tibetan', Georgia, serif",
      fontSize: '11px',
      lineHeight: '16px',
      color: '#CCC7BB',
    }}
  >
    /
  </span>
);

export const ProgressBar: React.FC<ProgressBarProps> = ({
  currentStep = 1,
  steps = DEFAULT_BOOKING_STEPS,
  onStepChange,
  slots = {},
  renderStep,
  showCheckOnComplete = false,
  isLoading = false,
  disabled = false,
  className = '',
  style = {},
}) => {
  return (
    <nav
      aria-label="Booking progress"
      className={`relative inline-flex items-center box-border select-none max-w-full overflow-x-auto ${className}`}
      style={{
        minHeight: '31px',
        padding: '3px 0px',
        ...style,
      }}
    >
      <ol className="inline-flex items-center p-0 m-0 list-none">
        {steps.map((item, index) => {
          let resolvedState: ProgressStepState = 'default';
          if (item.state) {
            resolvedState = item.state;
          } else if (item.step < currentStep) {
            resolvedState = 'complete';
          } else if (item.step === currentStep) {
            resolvedState = 'current';
          }

          const customSlot = slots[item.step];

          const defaultNode = (
            <ProgressStep
              step={item.step}
              label={item.label}
              state={resolvedState}
              onClick={onStepChange}
              showCheckOnComplete={showCheckOnComplete}
              isLoading={isLoading}
              disabled={disabled}
            />
          );

          const stepContent = renderStep
            ? renderStep(item, resolvedState, defaultNode)
            : customSlot || defaultNode;

          const isLastStep = index === steps.length - 1;

          return (
            <li
              key={`step-slot-${item.step}`}
              className="inline-flex items-center flex-shrink-0"
            >
              {/* Slot Area: Hugs the inserted component allowing dynamic width expansion */}
              <div className="inline-flex items-center justify-center flex-shrink-0 w-fit">
                {stepContent}
              </div>

              {/* Slash Separator Delimiter with uniform 15px clearance */}
              {!isLastStep && <ProgressSlashSeparator />}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

export default function App() {
  const [activeStep, setActiveStep] = useState<number>(2);
  const [asyncMode, setAsyncMode] = useState<boolean>(true);
  const [showCheck, setShowCheck] = useState<boolean>(false);
  const [useCustomSlot, setUseCustomSlot] = useState<boolean>(false);
  const [feedback, setFeedback] = useState<string | null>(
    'Current active step: 2 (Room)'
  );

  const handleStepTransition = async (nextStep: number) => {
    setFeedback(null);

    if (asyncMode) {
      await new Promise((resolve) => setTimeout(resolve, 550));
    }

    setActiveStep(nextStep);
    const target = DEFAULT_BOOKING_STEPS.find((s) => s.step === nextStep);
    setFeedback(`Transitioned to Step ${nextStep} (${target?.label})`);
  };

  const handleNext = () => {
    if (activeStep < DEFAULT_BOOKING_STEPS.length) {
      handleStepTransition(activeStep + 1);
    }
  };

  const handlePrev = () => {
    if (activeStep > 1) {
      handleStepTransition(activeStep - 1);
    }
  };

  return (
    <div className="min-h-screen bg-[#1E2420] text-[#EBE8E0] py-12 px-6 flex flex-col items-center">
      {/* Header Lockup */}
      <div className="w-full max-w-3xl flex flex-col items-center text-center gap-4 mb-8">
        <h1
          className="text-3xl font-bold uppercase tracking-[2px]"
          style={{ fontFamily: "'Brothers OT', 'League Spartan', sans-serif" }}
        >
          Progress Bar Component
        </h1>
        <p className="text-sm text-[#EBE8E0]/70 max-w-lg">
          Booking step bar with hug-content slots and optical baseline centering.
        </p>

        {/* Interactive Controls Bar */}
        <div className="flex flex-wrap items-center justify-center gap-4 bg-black/25 p-3.5 rounded-2xl border border-white/10 mt-2">
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase font-semibold text-[#EBE8E0]/60">
              Navigation:
            </span>
            <button
              type="button"
              onClick={handlePrev}
              disabled={activeStep === 1}
              className="px-3 py-1 text-xs rounded-full uppercase font-bold text-[#EBE8E0] border border-white/20 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              Previous
            </button>
            <button
              type="button"
              onClick={handleNext}
              disabled={activeStep === DEFAULT_BOOKING_STEPS.length}
              className="px-3 py-1 text-xs rounded-full uppercase font-bold text-[#EBE8E0] border border-white/20 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              Next Step
            </button>
          </div>

          <label className="flex items-center gap-2 cursor-pointer select-none text-xs uppercase font-semibold text-[#EBE8E0]/80 ml-2">
            <input
              type="checkbox"
              checked={asyncMode}
              onChange={(e) => setAsyncMode(e.target.checked)}
              className="rounded accent-[#9A5636]"
            />
            Async Delay (550ms)
          </label>

          <label className="flex items-center gap-2 cursor-pointer select-none text-xs uppercase font-semibold text-[#EBE8E0]/80 ml-2">
            <input
              type="checkbox"
              checked={showCheck}
              onChange={(e) => setShowCheck(e.target.checked)}
              className="rounded accent-[#9A5636]"
            />
            Checkmark on Complete
          </label>

          <label className="flex items-center gap-2 cursor-pointer select-none text-xs uppercase font-semibold text-[#EBE8E0]/80 ml-2">
            <input
              type="checkbox"
              checked={useCustomSlot}
              onChange={(e) => setUseCustomSlot(e.target.checked)}
              className="rounded accent-[#9A5636]"
            />
            Inject Custom Slot on Step 3
          </label>
        </div>

        {feedback && (
          <div className="text-xs font-semibold text-amber-200 bg-amber-950/80 border border-amber-700/60 px-4 py-1.5 rounded-full shadow-md">
            {feedback}
          </div>
        )}
      </div>

      {/* Main Interactive Stage */}
      <div className="w-full max-w-3xl p-10 rounded-[35px] bg-[#2E332F] border-2 border-white/10 shadow-2xl flex flex-col items-center gap-10">
        {/* Live Hugging Progress Bar */}
        <div className="w-full flex flex-col items-center gap-4">
          <span className="text-xs uppercase font-bold tracking-widest text-[#EBE8E0]/60">
            Auto-Layout Hugging Progress Bar
          </span>

          <div className="w-full flex justify-center p-6 rounded-2xl bg-black/30 border border-white/5 overflow-x-auto">
            <ProgressBar
              currentStep={activeStep}
              onStepChange={handleStepTransition}
              showCheckOnComplete={showCheck}
              slots={
                useCustomSlot
                  ? {
                      3: (
                        <div
                          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#69253A] border border-[#F2AAA9]/40 text-[#EBE8E0] text-[10px] font-bold uppercase tracking-wider shadow-sm animate-pulse flex-shrink-0"
                          title="Custom Slot Injected into Step 3"
                        >
                          <span>★</span>
                          <span>VIP Reservation Details</span>
                        </div>
                      ),
                    }
                  : undefined
              }
            />
          </div>

          <span className="text-[11px] text-[#EBE8E0]/50 text-center">
            Pills expand naturally based on character count while maintaining consistent 10px margins around each slash separator.
          </span>
        </div>

        {/* Multi-Step Showcase */}
        <div className="w-full flex flex-col items-center gap-4 pt-6 border-t border-white/10">
          <span className="text-xs uppercase font-bold tracking-widest text-[#EBE8E0]/60">
            Flow Simulation Across Steps
          </span>

          <div className="w-full flex flex-col gap-4">
            {[1, 3, 5].map((demoStep) => (
              <div
                key={`demo-${demoStep}`}
                className="p-4 rounded-xl bg-black/20 border border-white/5 flex flex-col sm:flex-row items-center justify-between gap-3 overflow-x-auto"
              >
                <span className="text-xs font-mono text-[#EBE8E0]/70 uppercase flex-shrink-0">
                  Active at Step {demoStep}:
                </span>
                <ProgressBar
                  currentStep={demoStep}
                  showCheckOnComplete={showCheck}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}