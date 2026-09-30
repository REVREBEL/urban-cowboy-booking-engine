import { useEffect } from "react";
import { BookingProvider, useBooking, type Step } from "./state/booking";
import { ProgressBar, type ProgressStepData } from "@/features/find-your-stay/components/progress/ProgressBar";
import { ProgressStep, type ProgressStepState } from "@/features/find-your-stay/components/progress/ProgressStep";
import { DevPanel } from "@/components/dev/dev-panel";
import { ContactBar } from "@/components/booking/chrome/contact-bar";
import { Dates } from "./steps/Dates";
import { Results } from "./steps/Results";
import { Guest } from "./steps/Guest";
import { Upgrade } from "./steps/Upgrade";
import { Extras } from "./steps/Extras";
import { Payment } from "./steps/Payment";
import { Confirmation } from "./steps/Confirmation";
import { t } from "./i18n";
import { getLang, setLangAndReload, type Lang } from "./lib/lang";

const STEP_COMPONENTS: Record<Step, () => JSX.Element | null> = {
  dates: Dates,
  results: Results,
  guest: Guest,
  upgrade: Upgrade,
  extras: Extras,
  payment: Payment,
  confirmation: Confirmation,
};

const PROGRESS_STEPS: ProgressStepData[] = [
  { step: 1, label: "Stay" },
  { step: 2, label: "Room" },
  { step: 3, label: "Details" },
  { step: 4, label: "Extras" },
  { step: 5, label: "Pay" },
];

const STEP_NUMBER: Record<Step, number> = {
  dates: 1,
  results: 2,
  guest: 3,
  upgrade: 3,
  extras: 4,
  payment: 5,
  confirmation: 5,
};

const STEP_FOR_NUMBER: Record<number, Step> = {
  1: "dates",
  2: "results",
  3: "guest",
  4: "extras",
  5: "payment",
};

function Shell() {
  const {
    step,
    hotelError,
    reloadHotel,
    resetAll,
    goTo,
    hydrating,
    checkIn,
    checkOut,
    selectedRoom,
    selectedRate,
  } = useBooking();
  const StepView = STEP_COMPONENTS[step];
  const currentStep = STEP_NUMBER[step];
  const showProgress = step !== "confirmation";

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [step]);

  useEffect(() => {
    document.title = t("meta.title");
  }, []);

  function canNavigate(target: number) {
    if (target === 1) return true;
    if (target === 2) return Boolean(checkIn && checkOut);
    if (target >= 3) return Boolean(selectedRoom && selectedRate);
    return false;
  }

  const progressSlots = Object.fromEntries(
    PROGRESS_STEPS.map((item) => {
      const state: ProgressStepState =
        item.step < currentStep ? "complete" : item.step === currentStep ? "current" : "default";
      return [
        item.step,
        <ProgressStep
          key={item.step}
          step={item.step}
          label={item.label}
          state={state}
          disabled={!canNavigate(item.step)}
          onClick={(target) => {
            const next = STEP_FOR_NUMBER[target];
            if (next && canNavigate(target)) goTo(next);
          }}
        />,
      ];
    }),
  );

  return (
    <div className="flex min-h-dvh flex-col bg-[#EBE8E0] text-[#4E332D]">
      <header className="sticky top-0 z-40 w-full border-b border-[#4E332D]/10 bg-[#EBE8E0]/95 backdrop-blur-md">
        <div className="booking-shell">
          <div className="flex h-16 w-full items-center justify-between gap-5 sm:h-[67px]">
            <button
              type="button"
              onClick={() => {
                resetAll();
                goTo("dates");
              }}
              className="group flex items-center py-1 text-left focus:outline-none"
              aria-label={t("header.home")}
            >
              <img
                src="/assets/brand/logos/Cowboy.svg"
                alt="Cowboy"
                className="h-6 w-auto select-none object-contain transition-transform duration-200 group-hover:scale-[1.03] sm:h-7"
              />
            </button>

            {showProgress && (
              <div className="hidden items-center rounded-full border border-[#D1C9BE] bg-[#FAF9F9] px-1.5 shadow-sm md:flex">
                <ProgressBar currentStep={currentStep} steps={PROGRESS_STEPS} slots={progressSlots} />
              </div>
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
              <ProgressBar currentStep={currentStep} steps={PROGRESS_STEPS} slots={progressSlots} className="mx-auto" />
            </div>
          )}
        </div>
      </header>

      {hotelError && (
        <div className="bg-amber-50 px-5 py-2 text-center text-sm text-amber-800">
          {t("hotelError.msg")}{" "}
          <button type="button" onClick={reloadHotel} className="font-semibold underline">
            {t("common.retry")}
          </button>
        </div>
      )}

      <main className="flex-1">{hydrating ? <HydrateLoader /> : <StepView />}</main>

      <Footer />
      <ContactBar />
      {import.meta.env.DEV && <DevPanel />}
    </div>
  );
}

function HydrateLoader() {
  return (
    <div className="grid min-h-[60vh] place-items-center px-5">
      <div className="flex flex-col items-center gap-4 text-center">
        <span className="h-9 w-9 animate-spin rounded-full border-2 border-[#9A5636]/25 border-t-[#9A5636]" />
        <p className="font-editorial text-sm text-[#4E332D]/60">{t("common.restoring")}</p>
      </div>
    </div>
  );
}

function Footer() {
  return (
    <footer className="mt-20 w-full border-t-4 border-[#343833] bg-[#4E332D] pb-12 pt-14 text-[#EBE8E0]">
      <div className="booking-shell">
        <div className="flex flex-col items-center justify-between gap-8 border-b border-[#EBE8E0]/15 pb-10 text-center md:flex-row md:text-left">
          <img
            src="/assets/brand/logos/Urban Cowboy.svg"
            alt="Urban Cowboy"
            className="mx-auto h-10 w-auto select-none object-contain sm:h-12 md:mx-0"
          />

          <div className="flex flex-wrap items-center justify-center gap-6 font-woodblock text-xs uppercase tracking-widest text-[#EBE8E0]/80">
            <span>The Catskills (Big Indian, NY)</span>
            <span>·</span>
            <span>Nashville, TN</span>
            <span>·</span>
            <span>Denver, CO</span>
          </div>
        </div>

        <div className="flex flex-col items-center justify-between gap-5 pt-8 text-[11px] text-[#EBE8E0]/60 sm:flex-row">
          <span>© {new Date().getFullYear()} Urban Cowboy Lodge & Bathing Suites. All rights reserved.</span>
          <LangSwitcher />
          <div className="flex items-center gap-4 font-woodblock text-[10px] uppercase tracking-wider">
            <span>Privacy Policy</span>
            <span>·</span>
            <span>Terms & Conditions</span>
            <span>·</span>
            <span>Accessibility</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

function LangSwitcher() {
  const active = getLang();
  const options: Array<{ code: Lang; label: string }> = [
    { code: "fr", label: "FR" },
    { code: "en", label: "EN" },
  ];

  return (
    <div className="flex items-center gap-1.5" role="group" aria-label={t("footer.language")}>
      {options.map((option) => (
        <button
          key={option.code}
          type="button"
          onClick={() => setLangAndReload(option.code)}
          aria-pressed={active === option.code}
          className={
            "rounded-full border px-2.5 py-1 font-bianco text-[10px] font-bold transition " +
            (active === option.code
              ? "border-[#EBE8E0] bg-[#EBE8E0] text-[#4E332D]"
              : "border-[#EBE8E0]/30 text-[#EBE8E0]/70 hover:border-[#EBE8E0] hover:text-[#EBE8E0]")
          }
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

export default function App() {
  return (
    <BookingProvider>
      <Shell />
    </BookingProvider>
  );
}
