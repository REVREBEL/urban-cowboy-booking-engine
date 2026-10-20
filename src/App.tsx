import { lazy, Suspense, useEffect, useState } from "react";
import { isStudioRoute } from "./studio/runtime";
import { currentStudioLayout, setStudioDefaultLayout, type RoomResultsLayout } from "./studio/roomLayout";
import { api } from "./lib/api";
import { BookingProvider, useBooking, type Step } from "./state/booking";
import { BookingHeader } from "@/components/booking/chrome/header";
import { BookingFooter } from "@/components/booking/chrome/footer";
import { Banner } from "@/components/ui/banner";
import { ContactBar } from "@/components/booking/chrome/contact-bar";

import { t } from "./i18n";

const StudioController = lazy(() => import("./studio/StudioController").then((module) => ({ default: module.StudioController })));
const PhotoArrival = lazy(() => import("./journey/PhotoArrival").then((module) => ({ default: module.PhotoArrival })));
const PhotoJourneyHeader = lazy(() => import("./journey/PhotoJourneyHeader").then((module) => ({ default: module.PhotoJourneyHeader })));
const PhotoRateStep = lazy(() => import("./journey/PhotoRateStep").then((module) => ({ default: module.PhotoRateStep })));
const PhotoReviewGuest = lazy(() => import("./journey/PhotoReviewGuest").then((module) => ({ default: module.PhotoReviewGuest })));
const DevPanel = lazy(() => import("./components/dev/dev-panel").then((module) => ({ default: module.DevPanel })));
const Dates = lazy(() => import("./steps/Dates").then((module) => ({ default: module.Dates })));
const Results = lazy(() => import("./steps/Results").then((module) => ({ default: module.Results })));
const Rates = lazy(() => import("./steps/Rates").then((module) => ({ default: module.Rates })));
const Guest = lazy(() => import("./steps/Guest").then((module) => ({ default: module.Guest })));
const Upgrade = lazy(() => import("./steps/Upgrade").then((module) => ({ default: module.Upgrade })));
const Extras = lazy(() => import("./steps/Extras").then((module) => ({ default: module.Extras })));
const Payment = lazy(() => import("./steps/Payment").then((module) => ({ default: module.Payment })));
const Confirmation = lazy(() => import("./steps/Confirmation").then((module) => ({ default: module.Confirmation })));

const SHOW_API_DEBUGGER =
  import.meta.env.DEV || import.meta.env.VITE_SHOW_API_DEBUGGER === "true";
// The Studio is a development surface locally, but never expose the API log
// on production Studio URLs unless the developer explicitly enables it.
const SHOW_STUDIO_API_DEBUGGER =
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
const STEP_COMPONENTS: Record<Step, React.ComponentType> = {
  dates: Dates,
  results: Results,
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
    window.scrollTo({ top: 0, behavior: photoJourney ? "auto" : "smooth" });
  }, [step, photoJourney]);

  // Titre d'onglet dans la langue courante (l'index.html est statique en FR).
  useEffect(() => {
    document.title = t("meta.title");
  }, []);

  return (
    <div className={photoJourney ? "photo-journey flex min-h-dvh flex-col bg-smoke font-body text-paper" : "flex min-h-dvh flex-col bg-background px-4 sm:px-6 lg:px-8"}>
      {photoJourney && <Suspense fallback={null}><PhotoJourneyHeader /></Suspense>}
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
        <Suspense fallback={<HydrateLoader />}>
        {hydrating ? <HydrateLoader /> :
          photoJourney && step === "dates" ? <PhotoArrival /> :
          step === "results" ? <Results roomLayout={layout} /> :
          photoJourney && step === "rates" ? <PhotoRateStep /> :
          photoJourney && step === "extras" ? <Extras photoMode /> :
          photoJourney && step === "guest" ? <PhotoReviewGuest /> :
          photoJourney && (step === "payment" || step === "upgrade") ?
            <div className="min-h-dvh bg-paper pt-20 text-smoke"><StepView /></div> :
          <StepView />}
        </Suspense>
      </main>

      {!photoJourney && <BookingFooter />}
      {!photoJourney && <ContactBar />}
      {SHOW_API_DEBUGGER && (!isStudioRoute() || SHOW_STUDIO_API_DEBUGGER) && <Suspense fallback={null}><DevPanel /></Suspense>}
      {isStudioRoute() && <Suspense fallback={null}><StudioController /></Suspense>}
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
