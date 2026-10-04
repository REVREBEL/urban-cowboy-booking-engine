import { useEffect } from "react";
import { BookingProvider, useBooking, type Step } from "./state/booking";
import { Brand } from "@/components/brand/brand";
import { BookingHeader } from "@/components/booking/chrome/header";
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
import { IconLeaf } from "@/components/icons/cowboy-icons";
import { t } from "./i18n";
import { getLang, setLangAndReload, type Lang } from "./lib/lang";

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

      <Footer />
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

function Footer() {
  return (
    <footer className="border-t border-ink/10 bg-teal-deep text-cream/80">
      <div className="booking-shell flex flex-col gap-4 py-8 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Brand className="text-cream" />
          <p className="mt-2 max-w-sm text-sm text-cream/60">{t("footer.tagline")}</p>
        </div>
        <div className="space-y-2.5 text-sm sm:text-right">
          <LangSwitcher />
          <p className="inline-flex items-center gap-1.5 text-cream/60">
            <IconLeaf className="h-4 w-4 text-creole-soft" /> {t("footer.securePayment")}
          </p>
          <p className="text-cream/60">{t("footer.developedBy")}</p>
        </div>
      </div>
    </footer>
  );
}

// Sélecteur de langue FR / EN : met à jour ?lang= et recharge (re-localise UI + Mews).
function LangSwitcher() {
  const active = getLang();
  const opts: { code: Lang; label: string }[] = [
    { code: "en", label: "EN" },
    { code: "fr", label: "FR" },
  ];
  return (
    <div className="flex items-center gap-1.5 sm:justify-end" role="group" aria-label={t("footer.language")}>
      {opts.map((o) => {
        const on = o.code === active;
        return (
          <button
            key={o.code}
            type="button"
            onClick={() => setLangAndReload(o.code)}
            aria-pressed={on}
            className={`rounded-full px-2.5 py-1 text-xs font-semibold transition ${
              on ? "bg-cream text-teal-deep" : "text-cream/60 hover:bg-cream/10 hover:text-cream"
            }`}
          >
            {o.label}
          </button>
        );
      })}
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
