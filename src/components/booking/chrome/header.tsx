import type { Step } from "@/state/booking";

type BookingHeaderProps = {
  step: Step;
  onNavigate: (step: Step) => void;
  onHome: () => void;
  canNavigate: (step: Step) => boolean;
};

const PROGRESS: Array<{ number: number; label: string; target: Step }> = [
  { number: 1, label: "Stay", target: "dates" },
  { number: 2, label: "Room", target: "results" },
  { number: 3, label: "Details", target: "guest" },
  { number: 4, label: "Extras", target: "extras" },
  { number: 5, label: "Pay", target: "payment" },
];

function currentNumber(step: Step): number {
  if (step === "dates") return 1;
  if (step === "results") return 2;
  if (step === "guest" || step === "upgrade") return 3;
  if (step === "extras") return 4;
  return 5;
}

export function BookingHeader({ step, onNavigate, onHome, canNavigate }: BookingHeaderProps) {
  const current = currentNumber(step);
  const showProgress = step !== "confirmation";

  return (
    <header className="sticky top-0 z-40 w-full border-b border-[#4E332D]/10 bg-[#EBE8E0]/95 backdrop-blur-md">
      <div className="booking-shell">
        <div className="flex h-16 w-full items-center justify-between gap-5 sm:h-[67px]">
          <button
            type="button"
            onClick={onHome}
            className="group flex items-center py-1 text-left focus:outline-none"
            aria-label="Cowboy home"
          >
            <img
              src="/assets/brand/logos/Cowboy.svg"
              alt="Cowboy"
              className="h-6 w-auto select-none object-contain transition-transform duration-200 group-hover:scale-[1.03] sm:h-7"
            />
          </button>

          {showProgress && (
            <nav
              aria-label="Booking progress"
              className="hidden items-center rounded-full border border-[#D1C9BE] bg-[#FAF9F9] px-3 py-1.5 shadow-sm md:flex"
            >
              {PROGRESS.map((item, index) => {
                const state = item.number < current ? "complete" : item.number === current ? "current" : "default";
                const disabled = !canNavigate(item.target);
                const circleClass =
                  state === "current"
                    ? "border-[#4E332D] bg-[#4E332D] text-[#EBE8E0]"
                    : state === "complete"
                      ? "border-[#9A5636] bg-[#9A5636] text-white"
                      : "border-[#B9B0A6] bg-transparent text-[#767470]";
                return (
                  <div key={item.number} className="flex items-center">
                    <button
                      type="button"
                      disabled={disabled}
                      onClick={() => onNavigate(item.target)}
                      aria-current={state === "current" ? "step" : undefined}
                      className="flex items-center gap-2 px-2 py-1 disabled:cursor-not-allowed disabled:opacity-35"
                    >
                      <span className={"grid h-6 w-6 place-items-center rounded-full border font-bianco text-[10px] font-bold " + circleClass}>
                        {state === "complete" ? "✓" : item.number}
                      </span>
                      <span className={"font-bianco text-[10px] font-bold uppercase tracking-[1.5px] " + (state === "current" ? "text-[#4E332D]" : "text-[#767470]")}>
                        {item.label}
                      </span>
                    </button>
                    {index < PROGRESS.length - 1 && <span className="mx-1 h-px w-5 bg-[#D1C9BE]" aria-hidden="true" />}
                  </div>
                );
              })}
            </nav>
          )}

          <div className="flex items-center gap-1.5 border-b border-[#4E332D]/20 pb-0.5 text-[#4E332D] sm:border-b-0">
            <img
              src="/assets/icons/ui/fi-sheriff-badge.svg"
              alt=""
              aria-hidden="true"
              className="h-4 w-4 select-none object-contain"
            />
            <span className="font-woodblock text-[11px] font-semibold uppercase tracking-wider sm:text-xs">
              Best Price Guaranteed
            </span>
          </div>
        </div>

        {showProgress && (
          <div className="flex items-center overflow-x-auto border-t border-[#4E332D]/10 py-2 md:hidden hide-scrollbar">
            <div className="mx-auto flex min-w-max items-center">
              {PROGRESS.map((item, index) => {
                const state = item.number < current ? "complete" : item.number === current ? "current" : "default";
                const disabled = !canNavigate(item.target);
                return (
                  <div key={item.number} className="flex items-center">
                    <button
                      type="button"
                      disabled={disabled}
                      onClick={() => onNavigate(item.target)}
                      className="flex items-center gap-1.5 px-2 disabled:opacity-35"
                    >
                      <span className={"grid h-5 w-5 place-items-center rounded-full border font-bianco text-[9px] font-bold " + (state === "current" ? "border-[#4E332D] bg-[#4E332D] text-white" : state === "complete" ? "border-[#9A5636] bg-[#9A5636] text-white" : "border-[#B9B0A6] text-[#767470]")}>
                        {state === "complete" ? "✓" : item.number}
                      </span>
                      <span className="font-bianco text-[9px] font-bold uppercase tracking-wider text-[#4E332D]">{item.label}</span>
                    </button>
                    {index < PROGRESS.length - 1 && <span className="h-px w-3 bg-[#D1C9BE]" />}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
