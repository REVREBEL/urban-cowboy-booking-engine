import React from 'react';
import { ProgressStep, type ProgressStepProps, type ProgressStepState } from './ProgressStep';

export interface ProgressStepData {
  step: number;
  label: string;
  state?: ProgressStepState;
  id?: string;
}

export interface ProgressBarProps {
  currentStep?: number;
  steps?: ProgressStepData[];
  onStepChange?: (step: number) => Promise<void> | void;
  slots?: Record<number, React.ReactNode>;
  renderStep?: (step: ProgressStepData, state: ProgressStepState, defaultNode: React.ReactNode) => React.ReactNode;
  showCheckOnComplete?: boolean;
  isLoading?: boolean;
  disabled?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

export const DEFAULT_BOOKING_STEPS: ProgressStepData[] = [
  { step: 1, label: 'Stay' },
  { step: 2, label: 'Room' },
  { step: 3, label: 'Details' },
  { step: 4, label: 'Extras' },
  { step: 5, label: 'Pay' }
];

const Separator = () => <span aria-hidden="true" className="mx-[15px] inline-flex h-[17px] w-[3px] shrink-0 items-center justify-center font-uchen text-[11px] text-[#CCC7BB]">/</span>;

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
  style
}) => (
  <nav aria-label="Booking progress" className={`relative inline-flex min-h-[31px] max-w-full select-none items-center overflow-x-auto py-[3px] ${className}`} style={style}>
    <ol className="m-0 inline-flex list-none items-center p-0">
      {steps.map((item, index) => {
        const state: ProgressStepState = item.state ?? (item.step < currentStep ? 'complete' : item.step === currentStep ? 'current' : 'default');
        const props: ProgressStepProps = { step: item.step, label: item.label, state, onClick: onStepChange, showCheckOnComplete, isLoading, disabled };
        const fallback = <ProgressStep {...props} />;
        const content = renderStep ? renderStep(item, state, fallback) : slots[item.step] ?? fallback;
        return (
          <li key={item.id ?? `step-slot-${item.step}`} className="inline-flex shrink-0 items-center">
            <div className="inline-flex w-fit shrink-0 items-center justify-center">{content}</div>
            {index < steps.length - 1 && <Separator />}
          </li>
        );
      })}
    </ol>
  </nav>
);
