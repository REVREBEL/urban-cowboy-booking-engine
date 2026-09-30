import React from 'react';
import { BookingStep } from '../types';
import { ProgressBar, type ProgressStepData } from '../features/find-your-stay/components/progress/ProgressBar';
import { ProgressStep, type ProgressStepState } from '../features/find-your-stay/components/progress/ProgressStep';

interface HeaderProps {
  currentStep: BookingStep;
  onStepChange: (step: BookingStep) => void;
  canNavigateToStep: (step: BookingStep) => boolean;
}

export const Header: React.FC<HeaderProps> = ({
  currentStep,
  onStepChange,
  canNavigateToStep
}) => {
  const steps: ProgressStepData[] = [
    { step: 1, label: 'Stay' },
    { step: 2, label: 'Room' },
    { step: 3, label: 'Details' },
    { step: 4, label: 'Extras' },
    { step: 5, label: 'Pay' }
  ];

  const progressSlots = Object.fromEntries(
    steps.map((item) => {
      const state: ProgressStepState = item.step < currentStep ? 'complete' : item.step === currentStep ? 'current' : 'default';
      const canNavigate = canNavigateToStep(item.step as BookingStep);
      return [
        item.step,
        <ProgressStep
          key={item.step}
          step={item.step}
          label={item.label}
          state={state}
          disabled={!canNavigate}
          onClick={(step) => onStepChange(step as BookingStep)}
        />
      ];
    })
  );

  return (
    <header className="sticky top-0 z-40 w-full bg-[#EBE8E0]/95 backdrop-blur-md border-b border-[#4E332D]/10">
      <div className="booking-shell">
        {/* Top bar */}
        <div className="flex h-16 w-full items-center justify-between sm:h-[67px]">
          {/* Logo */}
          <button
            onClick={() => onStepChange(1)}
            className="flex items-center group text-left cursor-pointer focus:outline-none py-1"
            aria-label="Cowboy Home"
          >
            <img
              src="/assets/logos/cowboy.svg"
              alt="Cowboy"
              className="h-6 sm:h-7 w-auto object-contain transition-transform duration-200 group-hover:scale-[1.03] select-none"
            />
          </button>

          <div className="hidden items-center rounded-full border border-[#D1C9BE] bg-[#FAF9F9] px-1.5 shadow-xs md:flex">
            <ProgressBar currentStep={currentStep} steps={steps} slots={progressSlots} />
          </div>

          {/* Best Rate Guaranteed Badge */}
          <div className="flex items-center gap-1.5 text-[#4E332D] border-b sm:border-b-0 border-[#4E332D]/20 pb-0.5">
            <img
              src="/assets/badges/sheriff-badge.svg"
              alt="Sheriff Badge"
              className="w-4 h-4 object-contain select-none"
            />
            <span className="font-woodblock text-[11px] sm:text-xs tracking-wider uppercase font-semibold text-[#4E332D]">
              Best Price Guaranteed
            </span>
          </div>
        </div>

        <div className="flex items-center overflow-x-auto border-t border-[#4E332D]/10 py-2 md:hidden hide-scrollbar">
          <ProgressBar currentStep={currentStep} steps={steps} slots={progressSlots} className="mx-auto" />
        </div>
      </div>
    </header>
  );
};
