import React, { useState } from 'react';

export type ProgressStepState = 'default' | 'current' | 'complete';

export interface ProgressStepProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'onClick'> {
  step: number;
  label: string;
  state?: ProgressStepState;
  onClick?: (step: number) => Promise<void> | void;
  showCheckOnComplete?: boolean;
  isLoading?: boolean;
}

const COLORS: Record<ProgressStepState, { background: string; border: string; text: string }> = {
  current: { background: '#9A5636', border: '#EBE8E0', text: '#EBE8E0' },
  complete: { background: '#4E332D', border: '#EBE8E0', text: '#EBE8E0' },
  default: { background: 'transparent', border: '#CCC7BB', text: '#767470' }
};

const CheckIcon = () => (
  <svg width="8" height="8" viewBox="0 0 12 12" fill="none" aria-hidden="true">
    <path d="M2.5 6.5 4.5 8.5 9.5 3.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
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
  style,
  ...buttonProps
}) => {
  const [internalLoading, setInternalLoading] = useState(false);
  const isLoading = externalLoading || internalLoading;
  const colors = COLORS[state];

  const handleClick = async () => {
    if (!onClick || disabled || isLoading) return;
    const result = onClick(step);
    if (result instanceof Promise) {
      setInternalLoading(true);
      try {
        await result;
      } finally {
        setInternalLoading(false);
      }
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={disabled || isLoading}
      aria-current={state === 'current' ? 'step' : undefined}
      aria-busy={isLoading}
      aria-label={`Step ${step}: ${label} (${state})`}
      className={`inline-flex h-[25px] shrink-0 select-none items-center justify-center gap-1 rounded-full px-2 pl-1.5 font-brothers transition duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#9A5636] focus-visible:ring-offset-2 ${onClick && !disabled ? 'cursor-pointer hover:opacity-90 active:scale-[0.97]' : 'cursor-default'} disabled:cursor-not-allowed disabled:opacity-40 ${className}`}
      style={{ backgroundColor: colors.background, color: colors.text, border: state === 'default' ? '1px solid rgba(78,51,45,.18)' : '1px solid transparent', ...style }}
      {...buttonProps}
    >
      {isLoading ? (
        <span className="h-3 w-3 animate-spin rounded-full border border-current border-t-transparent" aria-hidden="true" />
      ) : (
        <>
          <span className="grid h-4 w-4 place-items-center rounded-full border text-[9px] leading-none" style={{ borderColor: colors.border }}>
            {state === 'complete' && showCheckOnComplete ? <CheckIcon /> : step}
          </span>
          <span className="inline-flex h-4 items-center text-[11px] capitalize leading-4 tracking-[0.2px]">{label}</span>
        </>
      )}
    </button>
  );
};
