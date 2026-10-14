import { useEffect, useState } from "react";
import { isStudioRoute } from "./studio/runtime";
import { StudioController } from "./studio/StudioController";
import { currentStudioLayout, setStudioDefaultLayout, type RoomResultsLayout } from "./studio/roomLayout";
import { api } from "./lib/api";
import { PhotoArrival } from "./journey/PhotoArrival";
import { PhotoJourneyHeader } from "./journey/PhotoJourneyHeader";
import { PhotoRateStep } from "./journey/PhotoRateStep";
import { PhotoReviewGuest } from "./journey/PhotoReviewGuest";
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

const SHOW_API_DEBUGGER =
  import.meta.env.DEV || import.meta.env.VITE_SHOW_API_DEBUGGER === "true";

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
const STEP_COMPONENTS: Record<Step, () => React.JSX.Element | null> = {
  dates: Dates,
  results: () => <Results />,
  rates: Rates,
  guest: Guest,
  upgrade: Upgrade,
  extras: Extras,
  payment: Payment,
  confirmation: Confirmation,
};

function Shell({ layout }: { layout: RoomResultsLayout }) {
  const { step, hotelError, reloadHotel, resetAll, goTo, hydrating } = useBooking();
  const StepView = STEP_COMPONENTS[step];
  // The Photo experience owns its chrome and step bar for the full journey.
  const photoJourney = layout === "photo";

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [step]);

  // Titre d'onglet dans la langue courante (l'index.html est statique en FR).
  useEffect(() => {
    document.title = t("meta.title");
  }, []);

  return (
    <div className={photoJourney ? "photo-journey flex min-h-dvh flex-col bg-j-night font-j-body text-j-paper" : "flex min-h-dvh flex-col bg-background px-4 sm:px-6 lg:px-8"}>
      {photoJourney && <PhotoJourneyHeader />}
      {!photoJourney && <BookingHeader
        step={step}
        onNavigate={goTo}
        onHome={() => {
          resetAll();
          goTo("dates");
        }}
        canNavigate={(target) => PROGRESS_NUMBER[target] < PROGRESS_NUMBER[step]}
      />}

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
        {hydrating ? <HydrateLoader /> :
          photoJourney && step === "dates" ? <PhotoArrival /> :
          step === "results" ? <Results roomLayout={layout} /> :
          photoJourney && step === "rates" ? <PhotoRateStep /> :
          photoJourney && step === "extras" ? <Extras photoMode /> :
          photoJourney && step === "guest" ? <PhotoReviewGuest /> :
          photoJourney && (step === "payment" || step === "upgrade") ?
            <div className="min-h-dvh bg-paper pt-20 text-smoke"><StepView /></div> :
          <StepView />}
      </main>

      {!photoJourney && <BookingFooter />}
      {!photoJourney && <ContactBar />}
      {SHOW_API_DEBUGGER && !isStudioRoute() && <DevPanel />}
      {isStudioRoute() && <StudioController />}
    </div>
  );
}

// Écran d'attente pendant la réhydratation d'un lien profond partagé.
function HydrateLoader() {
  return (
    <div className="grid min-h-[60vh] place-items-center px-5">
      <div className="flex flex-col items-center gap-4 text-center">
        <span className="h-9 w-9 animate-spin rounded-full border-2 border-turquoise/25 border-t-turquoise" />
        <p className="text-sm text-smoke/60">{t("common.restoring")}</p>
      </div>
    </div>
  );
}

export default function App() {
  const studio = isStudioRoute();
  const [allowed, setAllowed] = useState<boolean | null>(studio ? null : true);
  const [layout, setLayout] = useState<RoomResultsLayout | null>(null);
  useEffect(() => {
    if (!studio) {
      let active = true;
      void api.locations().then((locations) => {
        if (active) setLayout(locations.hotel?.productionLayout === "photo" ? "photo" : "card");
      }).catch(() => { if (active) setLayout("card"); });
      return () => { active = false; };
    }
    const controller = new AbortController();
    fetch("/api/studio/config?property=hotel", { cache: "no-store", signal: controller.signal })
      .then((response) => response.ok ? response.json() : null)
      .then((data) => {
        const preferred = data?.demoLayout === "photo" ? "photo" : "card";
        setStudioDefaultLayout(preferred);
        setLayout(currentStudioLayout());
        setAllowed(data?.enabled === true);
      })
      .catch(() => setAllowed(false));
    return () => controller.abort();
  }, [studio]);
  useEffect(() => {
    if (!studio) return;
    const update = () => setLayout(currentStudioLayout());
    window.addEventListener("studio-room-layout-change", update);
    return () => window.removeEventListener("studio-room-layout-change", update);
  }, [studio]);
  if (allowed === null || layout === null) return <div className="grid min-h-screen place-items-center">Loading booking configuration…</div>;
  if (!allowed) return <main className="grid min-h-screen place-items-center p-8"><p>Booking Studio is disabled for this location.</p></main>;
  return <BookingProvider><Shell layout={layout} /></BookingProvider>;
}
