import { useMemo, useState } from "react";

import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import EmptyState from "@/components/feedback/empty-state";
import ErrorState from "@/components/feedback/error-state";
import LoadingState from "@/components/feedback/loading-state";
import { BookingHeader } from "@/components/booking/chrome/header";
import { BookingFooter } from "@/components/booking/chrome/footer";
import { ContactBar } from "@/components/booking/chrome/contact-bar";

import { RoomDetailModal } from "@/components/rooms/RoomDetailModal";
import type { RoomType } from "@/types";
import { DogToggleButton } from "@/components/booking/discovery/DogToggleButton";
import { MatchBenefitsCard } from "@/components/booking/results/MatchBenefitsCard";
import { PreferenceIconButton } from "@/components/booking/discovery/PreferenceIconButton";
import { StaySummary } from "@/components/booking/summary/stay-summary";

import {
  BestRateGuaranteedLabel,
} from "@/components/booking/search/BestRateGuaranteedLabel";
import {
  PropertyLocationGroup,
} from "@/components/booking/search/PropertyLocationLabel";
import {
  TravelPartyGroup,
} from "@/components/booking/discovery/FindYourStayTravelPartyButton";
import FindYourStay from "@/steps/FindYourStay";
import HelpMeChoose from "@/steps/HelpMeChoose";
import { ProgressBar } from "@/components/booking/progress/ProgressBar";
import { ProgressStep } from "@/components/booking/progress/ProgressStep";
import { SearchBar } from "@/components/booking/search/SearchBar";
import { SearchBarExpanded } from "@/components/booking/search/SearchBarExpanded";
import { SearchBarGuestDropdown } from "@/components/booking/search/SearchBarGuestsDropdown";
import { SearchBarLocationDropdown } from "@/components/booking/search/SearchBarLocationDropdown";
import { SearchBarPromoDropdown } from "@/components/booking/search/SearchBarPromoDropdown";
import { SearchButton } from "@/components/booking/search/SearchButton";

import { demoMatchRoom, demoStaySummary } from "./fixtures";
import { FIND_YOUR_STAY_PREFERENCES } from "@/data/findYourStayPreferences";
import type { PreferenceId } from "@/types/booking-ui";

type SectionId =
  | "chrome"
  | "find-controls"
  | "find-search"
  | "find-progress"
  | "find-flows"
  | "booking"
  | "feedback"
  | "ui"
  | "inventory";

type PreviewWidth = "desktop" | "tablet" | "mobile" | "fluid";
type PreviewSurface = "cream" | "white" | "forest" | "transparent";

const sections: { id: SectionId; label: string; kicker: string }[] = [
  { id: "chrome", label: "Booking · Chrome", kicker: "Chrome" },
  { id: "find-controls", label: "Find Your Stay · Controls", kicker: "Controls" },
  { id: "find-search", label: "Find Your Stay · Search", kicker: "Search" },
  { id: "find-progress", label: "Find Your Stay · Progress", kicker: "Progress" },
  { id: "find-flows", label: "Find Your Stay · Flows", kicker: "Flows" },
  { id: "booking", label: "Booking", kicker: "Booking" },
  { id: "feedback", label: "Feedback", kicker: "Feedback" },
  { id: "ui", label: "UI Primitives", kicker: "UI" },
  { id: "inventory", label: "Full Inventory", kicker: "Inventory" },
];

const previewWidths: Record<PreviewWidth, string> = {
  desktop: "1180px",
  tablet: "820px",
  mobile: "390px",
  fluid: "100%",
};

const surfaceClasses: Record<PreviewSurface, string> = {
  cream: "bg-alpine-linen",
  white: "bg-white",
  forest: "bg-lake-forest",
  transparent: "bg-transparent",
};

const renderedPaths = new Set([
  "src/components/booking/chrome/header.tsx",
  "src/components/booking/chrome/footer.tsx",
  "src/components/booking/chrome/contact-bar.tsx",
  "src/components/booking/discovery/DogToggleButton.tsx",
  "src/components/booking/results/MatchBenefitsCard.tsx",
  "src/components/booking/discovery/PreferenceIconButton.tsx",
  "src/components/booking/summary/stay-summary.tsx",
  "src/components/booking/search/BestRateGuaranteedLabel.tsx",
  "src/components/booking/discovery/FindYourStayTravelPartyButton.tsx",
  "src/components/booking/search/PropertyLocationLabel.tsx",
  "src/steps/FindYourStay.tsx",
  "src/steps/HelpMeChoose.tsx",
  "src/components/booking/progress/ProgressBar.tsx",
  "src/components/booking/progress/ProgressStep.tsx",
  "src/components/booking/search/SearchBar.tsx",
  "src/components/booking/search/SearchBarExpanded.tsx",
  "src/components/booking/search/SearchBarGuestsDropdown.tsx",
  "src/components/booking/search/SearchBarLocationDropdown.tsx",
  "src/components/booking/search/SearchBarPromoDropdown.tsx",
  "src/components/booking/search/SearchButton.tsx",
  "src/components/feedback/empty-state.tsx",
  "src/components/feedback/error-state.tsx",
  "src/components/feedback/loading-state.tsx",
  "src/components/ui/badge.tsx",
  "src/components/ui/button.tsx",
  "src/components/ui/card.tsx",
  "src/components/ui/checkbox.tsx",
  "src/components/ui/input.tsx",
  "src/components/ui/switch.tsx",
  "src/components/ui/tabs.tsx",
]);

// Inventory needs file paths only. Use raw-source imports so this catalog does not
// dynamically import executable modules already loaded by its live previews.
const componentModules = import.meta.glob([
  "../components/**/*.tsx",
  "../steps/**/*.tsx",
  // Stored prototype pages are not production components and contain imports
  // for an abandoned Extras implementation. Keep the catalog on canonical UI.
  "!../components/booking/extras/AddonCard.tsx",
  "!../components/booking/extras/AddonCustomizerModal.tsx",
  "!../components/booking/summary/CheckoutStep.tsx",
  "!../components/booking/summary/ExtrasStep.tsx",
  "!../components/rates/RideEasySoloPage.tsx",
], { query: "?raw", import: "default" });

const allComponentPaths = Object.keys(componentModules)
  .map((path) => path.replace("../", "src/"))
  .sort((a, b) => a.localeCompare(b));

function sourceUrl(path: string) {
  return `https://github.com/REVREBEL/urban-cowboy-booking-engine/blob/main/${path}`;
}

function SectionHeader({
  kicker,
  title,
  body,
}: {
  kicker: string;
  title: string;
  body: string;
}) {
  return (
    <div
      className="
        mb-7 pb-5
        border-b border-cowboy-umber/15
      "
    >
      <p
        className="
          font-label text-[10px] text-copper uppercase tracking-[0.24em]
        "
      >
        {kicker}
      </p>
      <h2
        className="
          mt-2
          font-heading text-4xl text-cowboy-umber leading-none
        "
      >{title}</h2>
      <p
        className="
          max-w-3xl
          mt-3
          text-sm text--alpine-linen-900 leading-6
        "
      >{body}</p>
    </div>
  );
}

function Preview({
  title,
  path,
  children,
  surface = "cream",
  description,
  tall = false,
}: {
  title: string;
  path: string;
  children: React.ReactNode;
  surface?: PreviewSurface;
  description?: string;
  tall?: boolean;
}) {
  return (
    <article
      className="
        overflow-hidden
        mb-8
        bg-white
        rounded-2xl border border-cowboy-umber/12
        shadow-sm
      "
    >
      <header
        className="
          flex flex-col md:flex-row md:items-center md:justify-between
          px-5 py-4
          border-b border-cowboy-umber/10
          gap-3
        "
      >
        <div>
          <div
            className="
              flex items-center
              gap-2
            "
          >
            <h3
              className="
                font-label text-sm text-cowboy-umber uppercase tracking-[0.08em]
              "
            >{title}</h3>
            <span
              className="
                px-2 py-0.5
                text-[9px] text-lake-forest font-semibold uppercase
                tracking-wider
                bg-lake-forest/8
                rounded-full
              "
            >
              live
            </span>
          </div>
          {description ? (
            <p
              className="
                max-w-2xl
                mt-1
                text-xs text--alpine-linen-900 leading-5
              "
            >{description}</p>
          ) : null}
        </div>
        <a
          href={sourceUrl(path)}
          target="_blank"
          rel="noreferrer"
          className="
            font-label text-[10px] text-copper uppercase tracking-wider
            underline-offset-4 hover:underline
          "
        >
          View source
        </a>
      </header>
      <div className={`overflow-auto ${surfaceClasses[surface]} ${tall ? "max-h-190" : ""}`}>
        <div
          className="
            min-w-max
            p-6 md:p-8
          "
        >{children}</div>
      </div>
    </article>
  );
}

function WidthFrame({
  width,
  children,
  centered = true,
}: {
  width: PreviewWidth;
  children: React.ReactNode;
  centered?: boolean;
}) {
  return (
    <div
      className={centered ? "mx-auto" : ""}
      style={{ width: previewWidths[width], maxWidth: width === "fluid" ? "100%" : undefined }}
    >
      {children}
    </div>
  );
}

function Toolbar({
  width,
  onWidth,
  surface,
  onSurface,
}: {
  width: PreviewWidth;
  onWidth: (value: PreviewWidth) => void;
  surface: PreviewSurface;
  onSurface: (value: PreviewSurface) => void;
}) {
  const widths: PreviewWidth[] = ["desktop", "tablet", "mobile", "fluid"];
  const surfaces: PreviewSurface[] = ["cream", "white", "forest", "transparent"];

  return (
    <div
      className="
        sticky top-0 z-40
        px-4 md:px-6 py-3
        bg-paper/95
        border-b border-cowboy-umber/10
        backdrop-blur
      "
    >
      <div
        className="
          flex flex-wrap items-center justify-between
          max-w-375
          mx-auto
          gap-3
        "
      >
        <div>
          <p
            className="
              font-label text-xs text-cowboy-umber uppercase tracking-[0.18em]
            "
          >Component Library</p>
          <p
            className="
              text-[11px] text--alpine-linen-900
            "
          >Canonical components only · development surface</p>
        </div>
        <div
          className="
            flex flex-wrap items-center
            gap-4
          "
        >
          <div
            className="
              flex items-center
              p-1
              bg-white
              rounded-full border border-cowboy-umber/15
              gap-1
            "
          >
            {widths.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => onWidth(item)}
                className={`rounded-full px-3 py-1.5 text-[10px] uppercase tracking-wide transition ${width === item ? "bg-cowboy-umber text-paper" : "text-cowboy-umber hover:bg-alpine-linen"}`}
              >
                {item}
              </button>
            ))}
          </div>
          <select
            value={surface}
            onChange={(event) => onSurface(event.target.value as PreviewSurface)}
            className="h-8 rounded-full border border-cowboy-umber/15 bg-white px-3 text-[10px] uppercase tracking-wide text-cowboy-umber"
            aria-label="Preview background"
          >
            {surfaces.map((item) => (
              <option key={item} value={item}>{item} background</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}

function ChromeSection({ width }: { width: PreviewWidth }) {
  return (
    <section
      id="chrome"
      className="
        scroll-mt-24
      "
    >
      <SectionHeader
        kicker="Booking"
        title="Chrome"
        body="Global booking shell components used across the booking journey."
      />

      <Preview
        title="BookingHeader"
        path="src/components/booking/chrome/header.tsx"
        surface="cream"
      >
        <WidthFrame width={width} centered={false}>
          <BookingHeader
            step="results"
            onNavigate={() => undefined}
            onHome={() => undefined}
            canNavigate={() => true}
          />
        </WidthFrame>
      </Preview>

      <Preview
        title="BookingFooter"
        path="src/components/booking/chrome/footer.tsx"
        surface="cream"
      >
        <WidthFrame width={width} centered={false}>
          <BookingFooter />
        </WidthFrame>
      </Preview>

      <Preview
        title="ContactBar"
        path="src/components/booking/chrome/contact-bar.tsx"
        surface="cream"
        description="Rendered in preview mode so the floating contact control stays inside this component card."
      >
        <WidthFrame width={width}>
          <div
            className="
              relative overflow-hidden
              min-h-72
              bg-alpine-linen
              rounded-xl border border-cowboy-umber/10
            "
          >
            <ContactBar preview />
          </div>
        </WidthFrame>
      </Preview>
    </section>
  );
}

function FindControlsSection({ width, surface }: { width: PreviewWidth; surface: PreviewSurface }) {
  const [location, setLocation] = useState("catskills");
  const [party, setParty] = useState<string | null>("partner");

  return (
    <section
      id="find-controls"
      className="
        scroll-mt-24
      "
    >
      <SectionHeader
        kicker="Find Your Stay"
        title="Controls"
        body="Small decision components used across the guided match and booking search experience."
      />

      <Preview
        title="BestRateGuaranteedLabel"
        path="src/components/booking/search/BestRateGuaranteedLabel.tsx"
        surface={surface}
      >
        <WidthFrame width={width}>
          <div
            className="
              flex items-center justify-center
              min-h-24
            "
          >
            <BestRateGuaranteedLabel />
          </div>
        </WidthFrame>
      </Preview>

      <Preview
        title="PropertyLocationLabel / Group"
        path="src/components/booking/search/PropertyLocationLabel.tsx"
        surface={surface}
      >
        <WidthFrame width={width}>
          <div
            className="
              flex items-center justify-center
              min-h-44
            "
          >
            <PropertyLocationGroup
              selectedLocation={location}
              onSelect={(next) => setLocation(String(next))}
            />
          </div>
        </WidthFrame>
      </Preview>

      <Preview
        title="FindYourStayTravelPartyButton"
        path="src/components/booking/discovery/FindYourStayTravelPartyButton.tsx"
        surface={surface}
      >
        <WidthFrame width={width}>
          <div
            className="
              flex justify-center
              py-4
            "
          >
            <TravelPartyGroup value={party} onChange={setParty} />
          </div>
        </WidthFrame>
      </Preview>
    </section>
  );
}

function FindSearchSection({ width, surface }: { width: PreviewWidth; surface: PreviewSurface }) {
  return (
    <section
      id="find-search"
      className="
        scroll-mt-24
      "
    >
      <SectionHeader
        kicker="Find Your Stay"
        title="Search"
        body="Search controls are intentionally rendered at their native dimensions so overflow and breakpoint problems are obvious instead of hidden."
      />

      <Preview
        title="SearchButton"
        path="src/components/booking/search/SearchButton.tsx"
        surface={surface}
      >
        <WidthFrame width={width}>
          <div
            className="
              flex flex-wrap items-center justify-center
              gap-4
            "
          >
            <SearchButton variant="full-circle">Search</SearchButton>
            <SearchButton variant="icon-circle" />
            <SearchButton variant="full-square">Search</SearchButton>
            <SearchButton variant="icon-square" />
          </div>
        </WidthFrame>
      </Preview>

      <Preview
        title="SearchBar"
        path="src/components/booking/search/SearchBar.tsx"
        surface={surface}
        description="Compact search bar. Use the width controls above to reveal clipping and breakpoint behavior."
      >
        <WidthFrame width={width} centered={false}>
          <SearchBar
            dateValue="Oct 14 – Oct 17"
            guestValue="2 Guests"
            promoValue="Add code"
          />
        </WidthFrame>
      </Preview>

      <Preview
        title="SearchBarExpanded"
        path="src/components/booking/search/SearchBarExpanded.tsx"
        surface={surface}
        description="Expanded search bar at its current production dimensions."
      >
        <WidthFrame width={width} centered={false}>
          <SearchBarExpanded />
        </WidthFrame>
      </Preview>

      <div
        className="
          grid xl:grid-cols-3
          gap-8
        "
      >
        <Preview
          title="Guests Dropdown"
          path="src/components/booking/search/SearchBarGuestsDropdown.tsx"
          surface={surface}
        >
          <SearchBarGuestDropdown />
        </Preview>
        <Preview
          title="Location Dropdown"
          path="src/components/booking/search/SearchBarLocationDropdown.tsx"
          surface={surface}
        >
          <SearchBarLocationDropdown />
        </Preview>
        <Preview
          title="Promo Dropdown"
          path="src/components/booking/search/SearchBarPromoDropdown.tsx"
          surface={surface}
        >
          <SearchBarPromoDropdown />
        </Preview>
      </div>
    </section>
  );
}

function FindProgressSection({ width, surface }: { width: PreviewWidth; surface: PreviewSurface }) {
  const [step, setStep] = useState(2);

  return (
    <section
      id="find-progress"
      className="
        scroll-mt-24
      "
    >
      <SectionHeader
        kicker="Find Your Stay"
        title="Progress"
        body="Individual step states and the assembled booking progress control."
      />

      <Preview
        title="ProgressStep"
        path="src/components/booking/progress/ProgressStep.tsx"
        surface={surface}
      >
        <WidthFrame width={width}>
          <div
            className="
              flex flex-wrap items-center justify-center
              p-6
              bg-smoke
              gap-3
            "
          >
            <ProgressStep step={1} label="Stay" state="complete" showCheckOnComplete />
            <ProgressStep step={2} label="Room" state="current" />
            <ProgressStep step={3} label="Details" state="default" />
          </div>
        </WidthFrame>
      </Preview>

      <Preview
        title="ProgressBar"
        path="src/components/booking/progress/ProgressBar.tsx"
        surface="forest"
      >
        <WidthFrame width={width}>
          <div
            className="
              overflow-auto
              p-4
            "
          >
            <ProgressBar
              currentStep={step}
              showCheckOnComplete
              onStepChange={setStep}
            />
          </div>
        </WidthFrame>
      </Preview>
    </section>
  );
}

function FindFlowsSection({ width }: { width: PreviewWidth }) {
  return (
    <section
      id="find-flows"
      className="
        scroll-mt-24
      "
    >
      <SectionHeader
        kicker="Find Your Stay"
        title="Flows"
        body="Full-page components are shown inside a constrained scroll surface. These previews are intentionally interactive."
      />

      <Preview
        title="FindYourStay"
        path="src/steps/FindYourStay.tsx"
        surface="cream"
        tall
      >
        <WidthFrame width={width}>
          <FindYourStay
            checkIn="2026-10-14"
            checkOut="2026-10-17"
            adults={2}
            children={0}
            availableCount={7}
            onChangeSearch={() => undefined}
            onHelpMeChoose={() => undefined}
            onBrowseAll={() => undefined}
          />
        </WidthFrame>
      </Preview>

      <Preview
        title="HelpMeChoose"
        path="src/steps/HelpMeChoose.tsx"
        surface="forest"
        tall
      >
        <WidthFrame width={width}>
          <HelpMeChoose
            onBack={() => undefined}
            onSubmit={() => undefined}
          />
        </WidthFrame>
      </Preview>

    </section>
  );
}

const demoModalRoom: RoomType = {
  id: "alpine-bathing-suite",
  buildingId: "alpine",
  buildingName: "Alpine Haus",
  name: "Alpine Bathing Suite",
  eyebrow: "Building 01 · First Floor",
  tagline: "The Iconic Indoor Soak",
  description: "Freestanding clawfoot tub facing a picture window, radiant heated floors, and forest views.",
  longDescription: "Built into the hillside above the Lodge, Alpine is home to ten of the Cowboy’s most iconic rooms. Every suite pairs a freestanding clawfoot tub in front of a picture window, with the forest and mountains doing the decorating outside.",
  basePrice: 425,
  squareFeet: 430,
  bedType: "King Bed",
  maxGuests: 2,
  isDogFriendly: false,
  ageRestricted21: true,
  soakType: "clawfoot-window",
  soakHighlight: "Freestanding copper clawfoot tub in front of a forest picture window",
  images: [
    "https://images.unspl-alpine-linen.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200",
    "https://images.unspl-alpine-linen.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=1200",
  ],
  features: ["Clawfoot Soaking Tub", "Radiant Heated Floors", "Cast Iron Wood Stove", "Letter Writing Desk"],
  tags: ["indoor-soak", "picture-window", "21-plus"],
};

function BookingSection({ width, surface }: { width: PreviewWidth; surface: PreviewSurface }) {
  const [dog, setDog] = useState(false);
  const [selectedPreference, setSelectedPreference] = useState<PreferenceId | null>(null);

  return (
    <section
      id="booking"
      className="
        scroll-mt-24
      "
    >
      <SectionHeader
        kicker="Booking"
        title="Booking Components"
        body="Retained booking components promoted from the evaluation branch into the canonical feature tree."
      />

      <Preview
        title="RoomDetailModal"
        path="src/components/rooms/RoomDetailModal.tsx"
        surface="cream"
        tall
      >
        <WidthFrame width={width}>
          <div
            className="
              relative
              min-h-187.5 w-full
            "
          >
            <RoomDetailModal
              room={demoModalRoom}
              criteria={{
                property: "Urban Cowboy Catskills",
                checkIn: "2026-10-14",
                checkOut: "2026-10-17",
                nights: 3,
                guests: 2,
                rooms: 1,
              }}
              onClose={() => undefined}
              onProceedToRates={() => undefined}
            />
          </div>
        </WidthFrame>
      </Preview>

      <Preview
        title="DogToggleButton"
        path="src/components/booking/discovery/DogToggleButton.tsx"
        surface={surface}
      >
        <WidthFrame width={width}>
          <div
            className="
              flex items-center justify-center
              min-h-52
            "
          >
            <DogToggleButton selected={dog} onToggle={() => setDog((value) => !value)} />
          </div>
        </WidthFrame>
      </Preview>

      <Preview
        title="PreferenceIconButton"
        path="src/components/booking/discovery/PreferenceIconButton.tsx"
        surface={surface}
      >
        <WidthFrame width={width}>
          <div
            className="
              flex items-center justify-center
              min-h-64
            "
          >
            <div
              className="
                flex flex-wrap justify-center
                gap-3
              "
            >
              {FIND_YOUR_STAY_PREFERENCES.map((item) => (
                <PreferenceIconButton
                  key={item.id}
                  id={item.id}
                  label={item.label}
                  description={item.description}
                  selected={selectedPreference === item.id}
                  onToggle={() =>
                    setSelectedPreference((current) =>
                      current === item.id ? null : item.id,
                    )
                  }
                />
              ))}
            </div>
          </div>
        </WidthFrame>
      </Preview>

      <div
        className="
          grid xl:grid-cols-2
          gap-8
        "
      >
        <Preview
          title="MatchBenefitsCard"
          path="src/components/booking/results/MatchBenefitsCard.tsx"
          surface="cream"
        >
          <div
            className="
              w-md
            "
          >
            <MatchBenefitsCard
              room={demoMatchRoom}
              reasons={[
                "The private outdoor soak is exactly what you asked for.",
                "The deck and forest setting make the room especially strong for a two-person fall escape.",
              ]}
            />
          </div>
        </Preview>

        <Preview
          title="StaySummary"
          path="src/components/booking/summary/stay-summary.tsx"
          surface={surface}
        >
          <div
            className="
              w-105
            "
          >
            <StaySummary {...demoStaySummary} />
          </div>
        </Preview>
      </div>
    </section>
  );
}

function FeedbackSection({ width, surface }: { width: PreviewWidth; surface: PreviewSurface }) {
  return (
    <section
      id="feedback"
      className="
        scroll-mt-24
      "
    >
      <SectionHeader
        kicker="Shared"
        title="Feedback States"
        body="Empty, error, and loading states used by the booking experience."
      />

      <div
        className="
          grid xl:grid-cols-3
          gap-8
        "
      >
        <Preview
          title="EmptyState"
          path="src/components/feedback/empty-state.tsx"
          surface={surface}
        >
          <WidthFrame width={width}>
            <EmptyState
              heading="Nothing matches yet"
              body="Try another filter or browse all available rooms."
              action={{ label: "Browse All", onClick: () => undefined }}
            />
          </WidthFrame>
        </Preview>

        <Preview
          title="ErrorState"
          path="src/components/feedback/error-state.tsx"
          surface={surface}
        >
          <WidthFrame width={width}>
            <ErrorState onRetry={() => undefined} />
          </WidthFrame>
        </Preview>

        <Preview
          title="LoadingState"
          path="src/components/feedback/loading-state.tsx"
          surface={surface}
        >
          <WidthFrame width={width}>
            <LoadingState />
          </WidthFrame>
        </Preview>
      </div>
    </section>
  );
}

function UiSection({ width, surface }: { width: PreviewWidth; surface: PreviewSurface }) {
  const [checked, setChecked] = useState(true);
  const [switched, setSwitched] = useState(false);

  return (
    <section
      id="ui"
      className="
        scroll-mt-24
      "
    >
      <SectionHeader
        kicker="Shared"
        title="UI Primitives"
        body="Representative live primitives from the retained Radix/shadcn layer. The full primitive inventory remains visible below."
      />

      <Preview
        title="Typography"
        path="src/styles/index.css"
        surface={surface}
        description="Semantic typography variables used across the booking engine."
      >
        <WidthFrame width={width}>
          <div
            className="
              grid
              max-w-3xl
              text-cowboy-umber
              gap-5
            "
          >
            <div>
              <p
                className="
                  font-eyebrow text-xs uppercase tracking-[0.18em]
                "
              >Eyebrow · Bianco Sans</p>
              <h2
                className="
                  mt-1
                  font-heading text-4xl
                "
              >Heading · DesertRain</h2>
            </div>
            <p
              className="
                text-base
              "
            >Body · Uchen Regular. Built for the quieter reading moments between decisions.</p>
            <p
              className="
                font-label text-sm uppercase
              "
            >Label · Brothers</p>
            <Button variant="outline" colorScheme="dark">Button · Brothers</Button>
            <p
              className="
                font-number text-2xl
              "
            >$425.00 · Oct 14–17 · 2 Guests</p>
            <blockquote
              className="
                text-3xl
              "
            >Blockquote · Cedarville</blockquote>
          </div>
        </WidthFrame>
      </Preview>

      <Preview
        title="Buttons + Badges"
        path="src/components/ui/button.tsx"
        surface={surface}
      >
        <WidthFrame width={width}>
          <div
            className="
              flex flex-wrap items-center
              gap-3
            "
          >
            <Button variant="filled" colorScheme="dark">Dark Filled</Button>
            <Button variant="outline" colorScheme="dark">Dark Outline</Button>
            <Button variant="transparent" colorScheme="dark">Dark Transparent</Button>
            <Button variant="filled" colorScheme="light">Light Filled</Button>
            <Button variant="filled" colorScheme="bandana-red">Bandana Red</Button>
            <Badge>Top Match</Badge>
            <Badge variant="outline">21+</Badge>
            <Badge variant="secondary">Dog Friendly</Badge>
          </div>
        </WidthFrame>
      </Preview>

      <Preview
        title="Inputs + Selection Controls"
        path="src/components/ui/input.tsx"
        surface={surface}
      >
        <WidthFrame width={width}>
          <div
            className="
              grid
              max-w-xl
              gap-5
            "
          >
            <Input placeholder="Promo code" />
            <label
              className="
                flex items-center
                text-sm text-cowboy-umber
                gap-3
              "
            >
              <Checkbox
                checked={checked}
                onCheckedChange={(value) => setChecked(value === true)}
              />
              Accessible room
            </label>
            <label
              className="
                flex items-center
                text-sm text-cowboy-umber
                gap-3
              "
            >
              <Switch checked={switched} onCheckedChange={setSwitched} />
              Show dog-friendly rooms only
            </label>
          </div>
        </WidthFrame>
      </Preview>

      <Preview
        title="Card + Tabs"
        path="src/components/ui/card.tsx"
        surface={surface}
      >
        <WidthFrame width={width}>
          <Card
            className="
              max-w-xl
            "
          >
            <CardHeader>
              <CardTitle>Walden King</CardTitle>
              <CardDescription>Bathing outside among the trees.</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="details">
                <TabsList>
                  <TabsTrigger value="details">Details</TabsTrigger>
                  <TabsTrigger value="rates">Rates</TabsTrigger>
                </TabsList>
                <TabsContent
                  value="details"
                  className="
                    pt-3
                    text-sm text-muted-foreground
                  "
                >
                  Private cedar soaking tub, forest deck, king bed.
                </TabsContent>
                <TabsContent
                  value="rates"
                  className="
                    pt-3
                    text-sm text-muted-foreground
                  "
                >
                  Flexible and advance-purchase rate examples.
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </WidthFrame>
      </Preview>
    </section>
  );
}

function classify(path: string) {
  if (path.includes("/components/booking/search/")) return "Booking Search";
  if (path.includes("/components/booking/discovery/")) return "Booking Discovery";
  if (path.includes("/components/booking/progress/")) return "Booking Progress";
  if (path.includes("/components/booking/results/")) return "Booking Results";
  if (path.includes("/steps/")) return "Booking Steps";
  if (path.includes("/components/ui/")) return "UI";
  if (path.includes("/components/feedback/")) return "Feedback";
  if (path.includes("/components/icons/")) return "Icons";
  if (path.includes("/components/forms/")) return "Forms";
  if (path.includes("/components/media/")) return "Media";
  if (path.includes("/components/brand/")) return "Brand";
  return "Shared Components";
}

function InventorySection() {
  const [query, setQuery] = useState("");

  const groups = useMemo(() => {
    const needle = query.trim().toLowerCase();
    const filtered = needle
      ? allComponentPaths.filter((path) => path.toLowerCase().includes(needle))
      : allComponentPaths;

    return filtered.reduce<Record<string, string[]>>((acc, path) => {
      const key = classify(path);
      (acc[key] ??= []).push(path);
      return acc;
    }, {});
  }, [query]);

  const renderedCount = allComponentPaths.filter((path) => renderedPaths.has(path)).length;

  return (
    <section
      id="inventory"
      className="
        scroll-mt-24
      "
    >
      <SectionHeader
        kicker="Canonical Tree"
        title="Full Component Inventory"
        body="Generated automatically from src/components and src/steps. A Live badge means the component also has a visual preview above."
      />

      <div
        className="
          grid md:grid-cols-[1fr_auto] md:items-center
          mb-5 p-5
          bg-white
          rounded-2xl border border-cowboy-umber/10
          gap-4
        "
      >
        <Input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Filter by component or path…"
          className="max-w-xl"
        />
        <div
          className="
            flex
            text-[10px] uppercase tracking-wider
            gap-2
          "
        >
          <span
            className="
              px-3 py-1.5
              text-paper
              bg-cowboy-umber
              rounded-full
            "
          >
            {allComponentPaths.length} files
          </span>
          <span
            className="
              px-3 py-1.5
              text-white
              bg-copper
              rounded-full
            "
          >
            {renderedCount} live previews
          </span>
        </div>
      </div>

      <div
        className="
          grid xl:grid-cols-2
          gap-5
        "
      >
        {Object.entries(groups)
          .sort(([a], [b]) => a.localeCompare(b))
          .map(([group, paths]) => (
            <div
              key={group}
              className="
                p-5
                bg-white
                rounded-2xl border border-cowboy-umber/10
              "
            >
              <div
                className="
                  flex items-center justify-between
                  mb-4
                "
              >
                <h3
                  className="
                    font-label text-xs text-cowboy-umber uppercase
                    tracking-[0.12em]
                  "
                >{group}</h3>
                <span
                  className="
                    text-xs text--alpine-linen-900
                  "
                >{paths.length}</span>
              </div>
              <div
                className="
                  space-y-1.5
                "
              >
                {paths.map((path) => (
                  <a
                    key={path}
                    href={sourceUrl(path)}
                    target="_blank"
                    rel="noreferrer"
                    className="
                      flex items-center justify-between
                      px-3 py-2
                      hover:bg-alpine-linen/50
                      rounded-lg
                      border border-transparent hover:border-cowboy-umber/10
                      group gap-3
                    "
                  >
                    <code
                      className="
                        min-w-0
                        truncate text-[11px] text-cowboy-umber
                      "
                    >{path.replace("src/", "")}</code>
                    <span
                      className={`shrink-0 rounded-full px-2 py-0.5 text-[8px] font-semibold uppercase tracking-wider ${renderedPaths.has(path) ? "bg-lake-forest text-white" : "bg-alpine-linen text--alpine-linen-900"}`}
                    >
                      {renderedPaths.has(path) ? "Live" : "Inventory"}
                    </span>
                  </a>
                ))}
              </div>
            </div>
          ))}
      </div>
    </section>
  );
}

export default function ComponentLibrary() {
  const [width, setWidth] = useState<PreviewWidth>("desktop");
  const [surface, setSurface] = useState<PreviewSurface>("cream");

  return (
    <div
      className="
        min-h-screen
        text-cowboy-umber
        bg-alpine-linen-fade
      "
    >
      <Toolbar width={width} onWidth={setWidth} surface={surface} onSurface={setSurface} />

      <div
        className="
          grid lg:grid-cols-[230px_minmax(0,1fr)]
          max-w-375
          mx-auto px-4 md:px-6 py-8
          gap-8
        "
      >
        <aside
          className="
            hidden lg:block
          "
        >
          <div
            className="
              sticky top-24
              p-4
              bg-white
              rounded-2xl border border-cowboy-umber/10
            "
          >
            <div
              className="
                mb-4 pb-4
                border-b border-cowboy-umber/10
              "
            >
              <p
                className="
                  font-heading text-2xl text-cowboy-umber
                "
              >Urban Cowboy</p>
              <p
                className="
                  mt-1
                  text-xs text--alpine-linen-900
                "
              >Booking Engine · Component Library</p>
            </div>
            <nav
              aria-label="Component sections"
              className="
                space-y-1
              "
            >
              {sections.map((section) => (
                <a
                  key={section.id}
                  href={`#${section.id}`}
                  className="
                    flex items-center justify-between
                    px-3 py-2
                    text-xs text-cowboy-umber hover:text-cowboy-umber
                    hover:bg-alpine-linen
                    rounded-lg
                    transition
                  "
                >
                  <span>{section.label}</span>
                  <span
                    className="
                      text-copper
                    "
                  >→</span>
                </a>
              ))}
            </nav>
          </div>
        </aside>

        <main
          className="
            min-w-0
          "
        >
          <div
            className="
              mb-10 px-6 md:px-10 py-10
              text-alpine-linen
              bg-cowboy-umber
              rounded-3xl
            "
          >
            <p
              className="
                font-label text-[10px] text-nude-ember uppercase
                tracking-[0.25em]
              "
            >Design Workshop</p>
            <h1
              className="
                max-w-4xl
                mt-3
                font-heading text-5xl md:text-7xl leading-[0.95]
              "
            >
              The component library, without the duplicate-component circus.
            </h1>
            <p
              className="
                max-w-2xl
                mt-5
                text-sm text-alpine-linen/70 leading-6
              "
            >
              Every preview imports the real canonical source file. Use the viewport and background controls to stress-test the UI while you work through the revised booking experience.
            </p>
          </div>

          <ChromeSection width={width} />
          <FindControlsSection width={width} surface={surface} />
          <FindSearchSection width={width} surface={surface} />
          <FindProgressSection width={width} surface={surface} />
          <FindFlowsSection width={width} />
          <BookingSection width={width} surface={surface} />
          <FeedbackSection width={width} surface={surface} />
          <UiSection width={width} surface={surface} />
          <InventorySection />
        </main>
      </div>
    </div>
  );
}
