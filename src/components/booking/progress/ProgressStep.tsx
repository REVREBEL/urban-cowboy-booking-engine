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
        <div className="flex items-center justify-center gap-1 h-4">
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
        <div className="flex items-center justify-center gap-1 h-4">
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
                  fontFamily: "var(--font-number)",
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
                fontFamily: "var(--font-label)",
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
