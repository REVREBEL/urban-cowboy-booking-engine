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
        fontFamily: "var(--font-label)",
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
                className="select-none inline-flex items-center justify-center text-center w-full h-full"
                style={{
                  fontFamily: "var(--font-number)",
                  fontSize: '9px',
                  lineHeight: '16px',
                  color: colors.circleText,
                }}
              >
                {step}
              </span>
            )}
          </div>

          {/* Step Label: matching 16px flex height aligned on center axis */}
          <span
            className="select-none capitalize tracking-[0.2px] inline-flex items-center justify-center h-[16px] text-center"
            style={{
              fontFamily: "var(--font-label)",
              fontSize: '11px',
              lineHeight: '16px',
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
      fontFamily: "var(--font-body)",
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
