// ProgressStep.tsx
import React, { useState } from 'react';

export type ProgressStepState = 'default' | 'current' | 'complete';

export interface ProgressStepItem {
  /** Step number identifier (1-indexed) */
  step: number;
  /** Display label text (e.g., 'Stay', 'Room', 'Guest') */
  label: string;
  /** State of the step */
  state?: ProgressStepState;
  /** Optional custom ID */
  id?: string;
}

export interface ProgressStepProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'onClick'> {
  /** Numeric step index displayed inside the circle */
  step: number;
  /** Step label text placed beside the step circle */
  label: string;
  /** State variant token: 'default' | 'current' | 'complete' */
  state?: ProgressStepState;
  /** Optional click or navigation handler supporting async promises */
  onClick?: (step: number) => Promise<void> | void;
  /** Whether to render a mini checkmark icon on complete instead of the number */
  showCheckOnComplete?: boolean;
  /** External loading indicator */
  isLoading?: boolean;
  /** Disabled state */
  disabled?: boolean;
  /** Container class name */
  className?: string;
}

/**
 * Color and styling resolver matching ProgressStep.txt tokens
 */
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
      console.error(`ProgressStep step ${step} transition failed:`, error);
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
      className={`group relative inline-flex items-center justify-center select-none transition-all duration-200 box-border ${
        isInteractive && !isInteractiveDisabled
          ? 'cursor-pointer hover:opacity-90 active:scale-[0.97]'
          : isBusy
          ? 'cursor-wait'
          : 'cursor-default'
      } ${disabled ? 'opacity-40' : ''} ${className}`}
      style={{
        minWidth: '56px',
        height: '25px',
        padding: '4px 8px 4px 6px',
        gap: '4px',
        borderRadius: '9999px',
        backgroundColor: colors.containerBg,
        border:
          state === 'default' ? `1px solid ${colors.containerBorder}` : 'none',
        ...style,
      }}
      {...buttonProps}
    >
      {/* Loading Overlay */}
      {isBusy ? (
        <div className="flex items-center justify-center gap-1 h-[16px]">
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
        <div className="flex items-center justify-center gap-1 h-[16px]">
          {/* Step Number Circle (16px x 16px) */}
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
                  lineHeight: 1,
                  color: colors.circleText,
                }}
              >
                {step}
              </span>
            )}
          </div>

          {/* Step Label (Identical 16px height, locked to middle vertical) */}
          <div
            className="flex items-center select-none truncate capitalize"
            style={{
              height: '16px',
            }}
          >
            <span
              className="tracking-[0.2px] select-none leading-none inline-flex items-center"
              style={{
                fontFamily: "'Brothers OT', 'League Spartan', sans-serif",
                fontSize: '11px',
                lineHeight: 1,
                color: colors.labelText,
              }}
            >
              {label}
            </span>
          </div>
        </div>
      )}
    </button>
  );
};

export interface ProgressStepperProps {
  /** Array of step items */
  steps: Array<{ step: number; label: string }>;
  /** Current active step number (1-based index) */
  currentStep: number;
  /** Callback fired when user clicks a step */
  onStepChange?: (step: number) => Promise<void> | void;
  /** Whether to show a checkmark for completed steps */
  showCheckOnComplete?: boolean;
  /** Global disabled state */
  disabled?: boolean;
  /** Container class name */
  className?: string;
}

export const ProgressStepper: React.FC<ProgressStepperProps> = ({
  steps,
  currentStep,
  onStepChange,
  showCheckOnComplete = false,
  disabled = false,
  className = '',
}) => {
  return (
    <nav
      aria-label="Progress"
      className={`flex items-center gap-2 flex-wrap ${className}`}
    >
      {steps.map((item) => {
        let stepState: ProgressStepState = 'default';
        if (item.step < currentStep) {
          stepState = 'complete';
        } else if (item.step === currentStep) {
          stepState = 'current';
        }

        return (
          <ProgressStep
            key={`step-${item.step}`}
            step={item.step}
            label={item.label}
            state={stepState}
            showCheckOnComplete={showCheckOnComplete}
            onClick={onStepChange}
            disabled={disabled}
          />
        );
      })}
    </nav>
  );
};

export default function App() {
  const [activeStep, setActiveStep] = useState<number>(2);
  const [asyncMode, setAsyncMode] = useState<boolean>(true);
  const [showCheck, setShowCheck] = useState<boolean>(false);
  const [feedback, setFeedback] = useState<string | null>(
    'Current active step: 2 (Room)'
  );

  const bookingSteps = [
    { step: 1, label: 'Stay' },
    { step: 2, label: 'Room' },
    { step: 3, label: 'Party' },
    { step: 4, label: 'Review' },
  ];

  const handleStepClick = async (stepNumber: number) => {
    setFeedback(null);

    if (asyncMode) {
      // Simulate network transition delay per SKILL.md
      await new Promise((resolve) => setTimeout(resolve, 500));
    }

    setActiveStep(stepNumber);
    const target = bookingSteps.find((s) => s.step === stepNumber);
    setFeedback(`Navigated to Step ${stepNumber} (${target?.label})`);
  };

  const handleNext = () => {
    if (activeStep < bookingSteps.length) {
      handleStepClick(activeStep + 1);
    }
  };

  const handlePrev = () => {
    if (activeStep > 1) {
      handleStepClick(activeStep - 1);
    }
  };

  return (
    <div className="min-h-screen bg-[#1E2420] text-[#EBE8E0] py-12 px-6 flex flex-col items-center">
      {/* Header Lockup */}
      <div className="w-full max-w-2xl flex flex-col items-center text-center gap-4 mb-8">
        <h1
          className="text-3xl font-bold uppercase tracking-[2px]"
          style={{ fontFamily: "'Brothers OT', 'League Spartan', sans-serif" }}
        >
          Progress Step Component
        </h1>
        <p className="text-sm text-[#EBE8E0]/70 max-w-md">
          Compact Western progress pill badge conforming to{' '}
          <code className="text-amber-200 font-mono">ProgressStep.txt</code> and{' '}
          <code className="text-amber-200 font-mono">SKILL.md</code>.
        </p>

        {/* Interactive Controls Bar */}
        <div className="flex flex-wrap items-center justify-center gap-4 bg-black/25 p-3 rounded-2xl border border-white/10 mt-2">
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase font-semibold text-[#EBE8E0]/60">
              Flow Control:
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
              disabled={activeStep === bookingSteps.length}
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
            Async Delay (500ms)
          </label>

          <label className="flex items-center gap-2 cursor-pointer select-none text-xs uppercase font-semibold text-[#EBE8E0]/80 ml-2">
            <input
              type="checkbox"
              checked={showCheck}
              onChange={(e) => setShowCheck(e.target.checked)}
              className="rounded accent-[#9A5636]"
            />
            Checkmark Icon on Complete
          </label>
        </div>

        {feedback && (
          <div className="text-xs font-semibold text-amber-200 bg-amber-950/80 border border-amber-700/60 px-4 py-1.5 rounded-full shadow-md">
            {feedback}
          </div>
        )}
      </div>

      {/* Main Interactive Stage */}
      <div className="w-full max-w-2xl p-10 rounded-[35px] bg-[#2E332F] border-2 border-white/10 shadow-2xl flex flex-col items-center gap-10">
        {/* Section 1: All 3 States from PDF */}
        <div className="w-full flex flex-col items-center gap-4">
          <span className="text-xs uppercase font-bold tracking-widest text-[#EBE8E0]/60">
            Figma Component States (56px × 25px)
          </span>

          <div className="flex flex-wrap items-center justify-center gap-6 p-6 rounded-2xl bg-black/20 border border-white/5">
            {/* Default State */}
            <div className="flex flex-col items-center gap-2">
              <span className="text-[10px] uppercase tracking-wider font-mono text-[#EBE8E0]/50">
                Default (Upcoming)
              </span>
              <ProgressStep step={1} label="Stay" state="default" />
            </div>

            {/* Current State */}
            <div className="flex flex-col items-center gap-2">
              <span className="text-[10px] uppercase tracking-wider font-mono text-[#EBE8E0]/50">
                Current (Active)
              </span>
              <ProgressStep step={1} label="Stay" state="current" />
            </div>

            {/* Complete State */}
            <div className="flex flex-col items-center gap-2">
              <span className="text-[10px] uppercase tracking-wider font-mono text-[#EBE8E0]/50">
                Complete (Finished)
              </span>
              <ProgressStep
                step={1}
                label="Stay"
                state="complete"
                showCheckOnComplete={showCheck}
              />
            </div>
          </div>
        </div>

        {/* Section 2: Complete Interactive Booking Stepper */}
        <div className="w-full flex flex-col items-center gap-4 pt-6 border-t border-white/10">
          <span className="text-xs uppercase font-bold tracking-widest text-[#EBE8E0]/60">
            Interactive Multi-Step Booking Bar
          </span>

          <div className="p-6 rounded-2xl bg-black/20 border border-white/5 flex flex-col items-center gap-4">
            <ProgressStepper
              steps={bookingSteps}
              currentStep={activeStep}
              onStepChange={handleStepClick}
              showCheckOnComplete={showCheck}
            />
            <span className="text-[11px] text-[#EBE8E0]/50 text-center">
              Click any step badge above to trigger an async transition with double-click protection
            </span>
          </div>
        </div>

        {/* Section 3: Token Spec Inspection */}
        <div className="w-full grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 border-t border-white/10 text-xs">
          <div className="p-3.5 rounded-xl bg-black/20 border border-white/5 flex flex-col gap-1 font-mono text-[11px]">
            <span className="font-bold uppercase text-[#EBE8E0]">State: Default</span>
            <span className="text-[#EBE8E0]/70">Bg: Transparent</span>
            <span className="text-[#EBE8E0]/70">Text: #767470</span>
            <span className="text-[#EBE8E0]/70">Circle: 16px (border #EBE8E0)</span>
          </div>

          <div className="p-3.5 rounded-xl bg-black/20 border border-white/5 flex flex-col gap-1 font-mono text-[11px]">
            <span className="font-bold uppercase text-amber-200">State: Current</span>
            <span className="text-[#EBE8E0]/70">Bg: #9A5636 (Copper)</span>
            <span className="text-[#EBE8E0]/70">Text: #EBE8E0</span>
            <span className="text-[#EBE8E0]/70">Circle: 16px (border #EBE8E0)</span>
          </div>

          <div className="p-3.5 rounded-xl bg-black/20 border border-white/5 flex flex-col gap-1 font-mono text-[11px]">
            <span className="font-bold uppercase text-orange-300">State: Complete</span>
            <span className="text-[#EBE8E0]/70">Bg: #4E332D (Umber)</span>
            <span className="text-[#EBE8E0]/70">Text: #EBE8E0</span>
            <span className="text-[#EBE8E0]/70">Circle: 16px (border #EBE8E0)</span>
          </div>
        </div>
      </div>
    </div>
  );
}