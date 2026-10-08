import { useEffect } from "react";
import { BookingProvider, useBooking, type Step } from "./state/booking";
import { BookingHeader } from "@/components/booking/chrome/header";
import { BookingFooter } from "@/components/booking/chrome/footer";
import { DevPanel } from "@/components/dev/dev-panel";
import { Banner } from "@/components/ui/banner";
import { ContactBar } from "@/components/booking/chrome/contact-bar";
import { Dates } from "./steps/Dates";
import { Results } from "./steps/Results";
import { Rates } from "./steps/Rates";
import { Guest } from "./steps/Guest";
import { Upgrade } from "./steps/Upgrade";
import { Extras } from "./steps/Extras";
import { Payment } from "./steps/Payment";
import { Confirmation } from "./steps/Confirmation";
import { t } from "./i18n";

const PROGRESS_NUMBER: Record<Step, number> = {
  dates: 1,
  results: 2,
  rates: 2,
  guest: 3,
  upgrade: 3,
  extras: 4,
  payment: 5,
  confirmation: 6,
};

const STEP_COMPONENTS: Record<Step, () => JSX.Element | null> = {
  dates: Dates,
  results: Results,
  rates: Rates,
  guest: Guest,
  upgrade: Upgrade,
  extras: Extras,
  payment: Payment,
  confirmation: Confirmation,
};

function Shell() {
  const { step, hotelError, reloadHotel, resetAll, goTo, hydrating } = useBooking();
  const StepView = STEP_COMPONENTS[step];

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [step]);

  // Titre d'onglet dans la langue courante (l'index.html est statique en FR).
  useEffect(() => {
    document.title = t("meta.title");
  }, []);

  return (
    <div className="flex min-h-dvh flex-col bg-cream">
      <BookingHeader
        step={step}
        onNavigate={goTo}
        onHome={() => {
          resetAll();
          goTo("dates");
        }}
        canNavigate={(target) => PROGRESS_NUMBER[target] < PROGRESS_NUMBER[step]}
      />

      {hotelError && (
        <Banner
          color="whiskey-sour"
          actionLabel="Try again"
          onAction={reloadHotel}
        >
          Unable to load the hotel configuration.
        </Banner>
      )}

      <main className="flex-1">
        {hydrating ? <HydrateLoader /> : <StepView />}
      </main>

      <BookingFooter />
      <ContactBar />
      {import.meta.env.DEV && <DevPanel />}
    </div>
  );
}

// Écran d'attente pendant la réhydratation d'un lien profond partagé.
function HydrateLoader() {
  return (
    <div className="grid min-h-[60vh] place-items-center px-5">
      <div className="flex flex-col items-center gap-4 text-center">
        <span className="h-9 w-9 animate-spin rounded-full border-2 border-turquoise/25 border-t-turquoise" />
        <p className="text-sm text-ink/60">{t("common.restoring")}</p>
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
