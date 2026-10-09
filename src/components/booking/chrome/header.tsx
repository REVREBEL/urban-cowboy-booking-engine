import type { Step } from "@/state/booking";
import {
  ProgressBar,
  ProgressStep,
  type ProgressStepState,
} from "@/components/booking/progress/ProgressBar";

type BookingHeaderProps = {
  step: Step;
  onNavigate: (step: Step) => void;
  onHome: () => void;
  canNavigate: (step: Step) => boolean;
};

const PROGRESS: Array<{ step: number; label: string; target: Step }> = [
  { step: 1, label: "Stay", target: "dates" },
  { step: 2, label: "Room", target: "results" },
  { step: 3, label: "Details", target: "guest" },
  { step: 4, label: "Extras", target: "extras" },
  { step: 5, label: "Pay", target: "payment" },
];

const PROGRESS_STEPS = PROGRESS.map(({ step, label }) => ({ step, label }));

function currentNumber(step: Step): number {
  if (step === "dates") return 1;
  if (step === "results" || step === "rates") return 2;
  if (step === "guest" || step === "upgrade") return 3;
  if (step === "extras") return 4;
  return 5;
}

export function BookingHeader({ step, onNavigate, onHome, canNavigate }: BookingHeaderProps) {
  const current = currentNumber(step);
  const showProgress = step !== "confirmation";

  return (
    <header className="sticky top-0 z-40 w-full border-b border-foreground/10 bg-background/95 backdrop-blur-md">
      <div className="booking-shell">
        <div className="flex h-16 w-full items-center justify-between gap-5 sm:h-16.75">
          <button
            type="button"
            onClick={onHome}
            className="group flex items-center py-1 text-left focus:outline-none"
            aria-label="Cowboy home"
          >
            <img
              src="/assets/brand/logos/Cowboy.svg"
              alt="Cowboy"
              className="h-6 w-auto select-none text-foreground object-contain transition-transform duration-200 group-hover:scale-[1.03] sm:h-7"
            />
          </button>

          {showProgress && (
            <div className="hidden min-w-0 flex-1 justify-center md:flex">
              <ProgressBar
                currentStep={current}
                steps={PROGRESS_STEPS}
                showCheckOnComplete
                className="max-w-full"
                renderStep={(stepData, resolvedState: ProgressStepState) => {
                  const item = PROGRESS.find((candidate) => candidate.step === stepData.step);
                  if (!item) return null;

                  return (
                    <ProgressStep
                      step={stepData.step}
                      label={stepData.label}
                      state={resolvedState}
                      showCheckOnComplete
                      disabled={!canNavigate(item.target)}
                      onClick={() => onNavigate(item.target)}
                    />
                  );
                }}
              />
            </div>
          )}

          <div className="flex items-center gap-1.5 border-b border-foreground/20 pb-0.5 text-foreground sm:border-b-0">
            <img
              src="/assets/icons/ui/fi-sheriff-badge.svg"
              alt=""
              aria-hidden="true"
              className="h-4 w-4 select-none object-contain"
            />
            <span className="font-label text-[11px] font-semibold uppercase tracking-wider sm:text-xs">
              Best Price Guaranteed
            </span>
          </div>
        </div>

        {showProgress && (
          <div className="overflow-x-auto border-t border-foreground/10 py-2 md:hidden hide-scrollbar">
            <div className="mx-auto flex min-w-max justify-center">
              <ProgressBar
                currentStep={current}
                steps={PROGRESS_STEPS}
                showCheckOnComplete
                renderStep={(stepData, resolvedState: ProgressStepState) => {
                  const item = PROGRESS.find((candidate) => candidate.step === stepData.step);
                  if (!item) return null;

                  return (
                    <ProgressStep
                      step={stepData.step}
                      label={stepData.label}
                      state={resolvedState}
                      showCheckOnComplete
                      disabled={!canNavigate(item.target)}
                      onClick={() => onNavigate(item.target)}
                    />
                  );
                }}
              />
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
