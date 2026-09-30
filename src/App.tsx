import { useEffect } from "react";
import { BookingProvider, useBooking, type Step } from "./state/booking";
import { DevPanel } from "@/components/dev/dev-panel";
import { ContactBar } from "@/components/booking/chrome/contact-bar";
import { StudioHeader } from "@/components/studio-booking/StudioHeader";
import { StudioFooter } from "@/components/studio-booking/StudioFooter";
import { StudioDates } from "./steps/StudioDates";
import { StudioResults } from "./steps/StudioResults";
import { StudioGuest } from "./steps/StudioGuest";
import { StudioUpgrade } from "./steps/StudioUpgrade";
import { StudioExtras } from "./steps/StudioExtras";
import { StudioPayment } from "./steps/StudioPayment";
import { Confirmation } from "./steps/Confirmation";
import { t } from "./i18n";

const STEP_COMPONENTS: Record<Step, () => JSX.Element | null> = {
  dates: StudioDates,
  results: StudioResults,
  guest: StudioGuest,
  upgrade: StudioUpgrade,
  extras: StudioExtras,
  payment: StudioPayment,
  confirmation: Confirmation,
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

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [step]);

  useEffect(() => {
    document.title = t("meta.title");
  }, []);

  function canNavigate(target: Step) {
    if (target === "dates") return true;
    if (target === "results") return Boolean(checkIn && checkOut);
    if (target === "guest" || target === "upgrade" || target === "extras" || target === "payment") {
      return Boolean(selectedRoom && selectedRate);
    }
    return target === "confirmation" && step === "confirmation";
  }

  function navigate(target: Step) {
    if (canNavigate(target)) goTo(target);
  }

  function home() {
    resetAll();
    goTo("dates");
  }

  return (
    <div className="flex min-h-dvh flex-col bg-[#EBE8E0] text-[#4E332D]">
      <StudioHeader step={step} onNavigate={navigate} onHome={home} canNavigate={canNavigate} />

      {hotelError && (
        <div className="bg-amber-50 px-5 py-2 text-center text-sm text-amber-800">
          {t("hotelError.msg")}{" "}
          <button type="button" onClick={reloadHotel} className="font-semibold underline">
            {t("common.retry")}
          </button>
        </div>
      )}

      <main className="flex-1">
        {hydrating ? <HydrateLoader /> : <StepView />}
      </main>

      <StudioFooter />
      <ContactBar />
      {import.meta.env.DEV && <DevPanel />}
    </div>
  );
}

function HydrateLoader() {
  return (
    <div className="grid min-h-[60vh] place-items-center bg-[#EBE8E0] px-5">
      <div className="flex flex-col items-center gap-4 text-center">
        <span className="h-9 w-9 animate-spin rounded-full border-2 border-[#9A5636]/25 border-t-[#9A5636]" />
        <p className="font-editorial text-sm text-[#4E332D]/60">{t("common.restoring")}</p>
      </div>
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
