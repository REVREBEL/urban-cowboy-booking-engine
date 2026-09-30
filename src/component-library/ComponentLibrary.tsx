import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
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

import { DogToggleButton } from "@/features/booking/components/DogToggleButton";
import { MatchBenefitsCard } from "@/features/booking/components/MatchBenefitsCard";
import { PreferenceIconButton } from "@/features/booking/components/PreferenceIconButton";
import { StaySummary } from "@/features/booking/components/StaySummary";

import {
  BestRateGuaranteedLabel,
} from "@/features/find-your-stay/components/controls/BestRateGuaranteedLabel";
import {
  PropertyLocationGroup,
} from "@/features/find-your-stay/components/controls/PropertyLocationLabel";
import {
  TravelPartyGroup,
} from "@/features/find-your-stay/components/controls/FindYourStayTravelPartyButton";
import FindYourStay from "@/features/find-your-stay/components/flows/FindYourStay";
import HelpMeChoose from "@/features/find-your-stay/components/flows/HelpMeChoose";
import { ProgressBar } from "@/features/find-your-stay/components/progress/ProgressBar";
import { ProgressStep } from "@/features/find-your-stay/components/progress/ProgressStep";
import { SearchBar } from "@/features/find-your-stay/components/search/SearchBar";
import { SearchBarExpanded } from "@/features/find-your-stay/components/search/SearchBarExpanded";
import { SearchBarGuestDropdown } from "@/features/find-your-stay/components/search/SearchBarGuestsDropdown";
import { SearchBarLocationDropdown } from "@/features/find-your-stay/components/search/SearchBarLocationDropdown";
import { SearchBarPromoDropdown } from "@/features/find-your-stay/components/search/SearchBarPromoDropdown";
import { SearchButton } from "@/features/find-your-stay/components/search/SearchButton";

import { demoMatchRoom, demoStaySummary } from "./fixtures";

type SectionId =
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
  cream: "bg-[#ebe8e0]",
  white: "bg-white",
  forest: "bg-[#0e301a]",
  transparent: "bg-transparent",
};

const renderedPaths = new Set([
  "src/features/booking/components/DogToggleButton.tsx",
  "src/features/booking/components/MatchBenefitsCard.tsx",
  "src/features/booking/components/PreferenceIconButton.tsx",
  "src/features/booking/components/StaySummary.tsx",
  "src/features/find-your-stay/components/controls/BestRateGuaranteedLabel.tsx",
  "src/features/find-your-stay/components/controls/FindYourStayTravelPartyButton.tsx",
  "src/features/find-your-stay/components/controls/PropertyLocationLabel.tsx",
  "src/features/find-your-stay/components/flows/FindYourStay.tsx",
  "src/features/find-your-stay/components/flows/HelpMeChoose.tsx",
  "src/features/find-your-stay/components/progress/ProgressBar.tsx",
  "src/features/find-your-stay/components/progress/ProgressStep.tsx",
  "src/features/find-your-stay/components/search/SearchBar.tsx",
  "src/features/find-your-stay/components/search/SearchBarExpanded.tsx",
  "src/features/find-your-stay/components/search/SearchBarGuestsDropdown.tsx",
  "src/features/find-your-stay/components/search/SearchBarLocationDropdown.tsx",
  "src/features/find-your-stay/components/search/SearchBarPromoDropdown.tsx",
  "src/features/find-your-stay/components/search/SearchButton.tsx",
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

const componentModules = import.meta.glob([
  "../components/**/*.tsx",
  "../features/**/*.tsx",
]);

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
    <div className="mb-7 border-b border-[#4e332d]/15 pb-5">
      <p className="font-label text-[10px] uppercase tracking-[0.24em] text-[#9a5636]">
        {kicker}
      </p>
      <h2 className="mt-2 font-display text-4xl leading-none text-[#4e332d]">{title}</h2>
      <p className="mt-3 max-w-3xl text-sm leading-6 text-[#6f625d]">{body}</p>
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
    <article className="mb-8 overflow-hidden rounded-2xl border border-[#4e332d]/12 bg-white shadow-sm">
      <header className="flex flex-col gap-3 border-b border-[#4e332d]/10 px-5 py-4 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-label text-sm uppercase tracking-[0.08em] text-[#4e332d]">{title}</h3>
            <span className="rounded-full bg-[#0e301a]/8 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-[#0e301a]">
              live
            </span>
          </div>
          {description ? (
            <p className="mt-1 max-w-2xl text-xs leading-5 text-[#767470]">{description}</p>
          ) : null}
        </div>
        <a
          href={sourceUrl(path)}
          target="_blank"
          rel="noreferrer"
          className="font-label text-[10px] uppercase tracking-wider text-[#9a5636] underline-offset-4 hover:underline"
        >
          View source
        </a>
      </header>
      <div className={`overflow-auto ${surfaceClasses[surface]} ${tall ? "max-h-[760px]" : ""}`}>
        <div className="min-w-max p-6 md:p-8">{children}</div>
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
    <div className="sticky top-0 z-40 border-b border-[#4e332d]/10 bg-[#faf9f9]/95 px-4 py-3 backdrop-blur md:px-6">
      <div className="mx-auto flex max-w-[1500px] flex-wrap items-center justify-between gap-3">
        <div>
          <p className="font-label text-xs uppercase tracking-[0.18em] text-[#4e332d]">Component Library</p>
          <p className="text-[11px] text-[#767470]">Canonical components only · development surface</p>
        </div>
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-1 rounded-full border border-[#4e332d]/15 bg-white p-1">
            {widths.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => onWidth(item)}
                className={`rounded-full px-3 py-1.5 text-[10px] uppercase tracking-wide transition ${width === item ? "bg-[#4e332d] text-[#faf9f9]" : "text-[#4e332d] hover:bg-[#ebe8e0]"}`}
              >
                {item}
              </button>
            ))}
          </div>
          <select
            value={surface}
            onChange={(event) => onSurface(event.target.value as PreviewSurface)}
            className="h-8 rounded-full border border-[#4e332d]/15 bg-white px-3 text-[10px] uppercase tracking-wide text-[#4e332d]"
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

function FindControlsSection({ width, surface }: { width: PreviewWidth; surface: PreviewSurface }) {
  const [location, setLocation] = useState("catskills");
  const [party, setParty] = useState<string | null>("partner");

  return (
    <section id="find-controls" className="scroll-mt-24">
      <SectionHeader
        kicker="Find Your Stay"
        title="Controls"
        body="Small decision components used across the guided match and booking search experience."
      />

      <Preview
        title="BestRateGuaranteedLabel"
        path="src/features/find-your-stay/components/controls/BestRateGuaranteedLabel.tsx"
        surface={surface}
      >
        <WidthFrame width={width}>
          <div className="flex min-h-24 items-center justify-center">
            <BestRateGuaranteedLabel />
          </div>
        </WidthFrame>
      </Preview>

      <Preview
        title="PropertyLocationLabel / Group"
        path="src/features/find-your-stay/components/controls/PropertyLocationLabel.tsx"
        surface={surface}
      >
        <WidthFrame width={width}>
          <div className="flex min-h-44 items-center justify-center">
            <PropertyLocationGroup
              selectedLocation={location}
              onSelect={(next) => setLocation(String(next))}
            />
          </div>
        </WidthFrame>
      </Preview>

      <Preview
        title="FindYourStayTravelPartyButton"
        path="src/features/find-your-stay/components/controls/FindYourStayTravelPartyButton.tsx"
        surface={surface}
      >
        <WidthFrame width={width}>
          <div className="flex justify-center py-4">
            <TravelPartyGroup value={party} onChange={setParty} />
          </div>
        </WidthFrame>
      </Preview>
    </section>
  );
}

function FindSearchSection({ width, surface }: { width: PreviewWidth; surface: PreviewSurface }) {
  return (
    <section id="find-search" className="scroll-mt-24">
      <SectionHeader
        kicker="Find Your Stay"
        title="Search"
        body="Search controls are intentionally rendered at their native dimensions so overflow and breakpoint problems are obvious instead of hidden."
      />

      <Preview
        title="SearchButton"
        path="src/features/find-your-stay/components/search/SearchButton.tsx"
        surface={surface}
      >
        <WidthFrame width={width}>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <SearchButton variant="full-circle">Search</SearchButton>
            <SearchButton variant="icon-circle" />
            <SearchButton variant="full-square">Search</SearchButton>
            <SearchButton variant="icon-square" />
          </div>
        </WidthFrame>
      </Preview>

      <Preview
        title="SearchBar"
        path="src/features/find-your-stay/components/search/SearchBar.tsx"
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
        path="src/features/find-your-stay/components/search/SearchBarExpanded.tsx"
        surface={surface}
        description="Expanded search bar at its current production dimensions."
      >
        <WidthFrame width={width} centered={false}>
          <SearchBarExpanded />
        </WidthFrame>
      </Preview>

      <div className="grid gap-8 xl:grid-cols-3">
        <Preview
          title="Guests Dropdown"
          path="src/features/find-your-stay/components/search/SearchBarGuestsDropdown.tsx"
          surface={surface}
        >
          <SearchBarGuestDropdown />
        </Preview>
        <Preview
          title="Location Dropdown"
          path="src/features/find-your-stay/components/search/SearchBarLocationDropdown.tsx"
          surface={surface}
        >
          <SearchBarLocationDropdown />
        </Preview>
        <Preview
          title="Promo Dropdown"
          path="src/features/find-your-stay/components/search/SearchBarPromoDropdown.tsx"
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
    <section id="find-progress" className="scroll-mt-24">
      <SectionHeader
        kicker="Find Your Stay"
        title="Progress"
        body="Individual step states and the assembled booking progress control."
      />

      <Preview
        title="ProgressStep"
        path="src/features/find-your-stay/components/progress/ProgressStep.tsx"
        surface={surface}
      >
        <WidthFrame width={width}>
          <div className="flex flex-wrap items-center justify-center gap-3 bg-[#343833] p-6">
            <ProgressStep step={1} label="Stay" state="complete" showCheckOnComplete />
            <ProgressStep step={2} label="Room" state="current" />
            <ProgressStep step={3} label="Details" state="default" />
          </div>
        </WidthFrame>
      </Preview>

      <Preview
        title="ProgressBar"
        path="src/features/find-your-stay/components/progress/ProgressBar.tsx"
        surface="forest"
      >
        <WidthFrame width={width}>
          <div className="overflow-auto p-4">
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
    <section id="find-flows" className="scroll-mt-24">
      <SectionHeader
        kicker="Find Your Stay"
        title="Flows"
        body="Full-page components are shown inside a constrained scroll surface. These previews are intentionally interactive."
      />

      <Preview
        title="FindYourStay"
        path="src/features/find-your-stay/components/flows/FindYourStay.tsx"
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
        path="src/features/find-your-stay/components/flows/HelpMeChoose.tsx"
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

function BookingSection({ width, surface }: { width: PreviewWidth; surface: PreviewSurface }) {
  const [dog, setDog] = useState(false);
  const [preference, setPreference] = useState(false);

  return (
    <section id="booking" className="scroll-mt-24">
      <SectionHeader
        kicker="Booking"
        title="Booking Components"
        body="Retained booking components promoted from the evaluation branch into the canonical feature tree."
      />

      <Preview
        title="DogToggleButton"
        path="src/features/booking/components/DogToggleButton.tsx"
        surface={surface}
      >
        <WidthFrame width={width}>
          <div className="flex min-h-52 items-center justify-center">
            <DogToggleButton selected={dog} onToggle={() => setDog((value) => !value)} />
          </div>
        </WidthFrame>
      </Preview>

      <Preview
        title="PreferenceIconButton"
        path="src/features/booking/components/PreferenceIconButton.tsx"
        surface={surface}
      >
        <WidthFrame width={width}>
          <div className="flex min-h-64 items-center justify-center">
            <PreferenceIconButton
              id="bathe-outside"
              label="Outdoor Soak"
              description="A private cedar soaking tub outside among the trees."
              selected={preference}
              onToggle={() => setPreference((value) => !value)}
            />
          </div>
        </WidthFrame>
      </Preview>

      <div className="grid gap-8 xl:grid-cols-2">
        <Preview
          title="MatchBenefitsCard"
          path="src/features/booking/components/MatchBenefitsCard.tsx"
          surface="cream"
        >
          <div className="w-[448px]">
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
          path="src/features/booking/components/StaySummary.tsx"
          surface={surface}
        >
          <div className="w-[420px]">
            <StaySummary data={demoStaySummary} />
          </div>
        </Preview>
      </div>
    </section>
  );
}

function FeedbackSection({ width, surface }: { width: PreviewWidth; surface: PreviewSurface }) {
  return (
    <section id="feedback" className="scroll-mt-24">
      <SectionHeader
        kicker="Shared"
        title="Feedback States"
        body="Empty, error, and loading states used by the booking experience."
      />

      <div className="grid gap-8 xl:grid-cols-3">
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
    <section id="ui" className="scroll-mt-24">
      <SectionHeader
        kicker="Shared"
        title="UI Primitives"
        body="Representative live primitives from the retained Radix/shadcn layer. The full primitive inventory remains visible below."
      />

      <Preview
        title="Buttons + Badges"
        path="src/components/ui/button.tsx"
        surface={surface}
      >
        <WidthFrame width={width}>
          <div className="flex flex-wrap items-center gap-3">
            <Button>Default</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="destructive">Destructive</Button>
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
          <div className="grid max-w-xl gap-5">
            <Input placeholder="Promo code" />
            <label className="flex items-center gap-3 text-sm text-[#4e332d]">
              <Checkbox
                checked={checked}
                onCheckedChange={(value) => setChecked(value === true)}
              />
              Accessible room
            </label>
            <label className="flex items-center gap-3 text-sm text-[#4e332d]">
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
          <Card className="max-w-xl">
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
                <TabsContent value="details" className="pt-3 text-sm text-muted-foreground">
                  Private cedar soaking tub, forest deck, king bed.
                </TabsContent>
                <TabsContent value="rates" className="pt-3 text-sm text-muted-foreground">
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
  if (path.includes("/features/find-your-stay/")) return "Find Your Stay";
  if (path.includes("/features/booking/")) return "Booking";
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
    <section id="inventory" className="scroll-mt-24">
      <SectionHeader
        kicker="Canonical Tree"
        title="Full Component Inventory"
        body="Generated automatically from src/components and src/features. A Live badge means the component also has a visual preview above."
      />

      <div className="mb-5 grid gap-4 rounded-2xl border border-[#4e332d]/10 bg-white p-5 md:grid-cols-[1fr_auto] md:items-center">
        <Input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Filter by component or path…"
          className="max-w-xl"
        />
        <div className="flex gap-2 text-[10px] uppercase tracking-wider">
          <span className="rounded-full bg-[#4e332d] px-3 py-1.5 text-[#faf9f9]">
            {allComponentPaths.length} files
          </span>
          <span className="rounded-full bg-[#9a5636] px-3 py-1.5 text-white">
            {renderedCount} live previews
          </span>
        </div>
      </div>

      <div className="grid gap-5 xl:grid-cols-2">
        {Object.entries(groups)
          .sort(([a], [b]) => a.localeCompare(b))
          .map(([group, paths]) => (
            <div key={group} className="rounded-2xl border border-[#4e332d]/10 bg-white p-5">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="font-label text-xs uppercase tracking-[0.12em] text-[#4e332d]">{group}</h3>
                <span className="text-xs text-[#767470]">{paths.length}</span>
              </div>
              <div className="space-y-1.5">
                {paths.map((path) => (
                  <a
                    key={path}
                    href={sourceUrl(path)}
                    target="_blank"
                    rel="noreferrer"
                    className="group flex items-center justify-between gap-3 rounded-lg border border-transparent px-3 py-2 hover:border-[#4e332d]/10 hover:bg-[#ebe8e0]/50"
                  >
                    <code className="min-w-0 truncate text-[11px] text-[#5f514c]">{path.replace("src/", "")}</code>
                    <span
                      className={`shrink-0 rounded-full px-2 py-0.5 text-[8px] font-semibold uppercase tracking-wider ${renderedPaths.has(path) ? "bg-[#0e301a] text-white" : "bg-[#ebe8e0] text-[#767470]"}`}
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
    <div className="min-h-screen bg-[#f4f1ea] text-[#4e332d]">
      <Toolbar width={width} onWidth={setWidth} surface={surface} onSurface={setSurface} />

      <div className="mx-auto grid max-w-[1500px] gap-8 px-4 py-8 md:px-6 lg:grid-cols-[230px_minmax(0,1fr)]">
        <aside className="hidden lg:block">
          <div className="sticky top-24 rounded-2xl border border-[#4e332d]/10 bg-white p-4">
            <div className="mb-4 border-b border-[#4e332d]/10 pb-4">
              <p className="font-display text-2xl text-[#4e332d]">Urban Cowboy</p>
              <p className="mt-1 text-xs text-[#767470]">Booking Engine · Component Library</p>
            </div>
            <nav aria-label="Component sections" className="space-y-1">
              {sections.map((section) => (
                <a
                  key={section.id}
                  href={`#${section.id}`}
                  className="flex items-center justify-between rounded-lg px-3 py-2 text-xs text-[#5f514c] transition hover:bg-[#ebe8e0] hover:text-[#4e332d]"
                >
                  <span>{section.label}</span>
                  <span className="text-[#9a5636]">→</span>
                </a>
              ))}
            </nav>
          </div>
        </aside>

        <main className="min-w-0">
          <div className="mb-10 rounded-3xl bg-[#4e332d] px-6 py-10 text-[#ebe8e0] md:px-10">
            <p className="font-label text-[10px] uppercase tracking-[0.25em] text-[#f2aaa9]">Design Workshop</p>
            <h1 className="mt-3 max-w-4xl font-display text-5xl leading-[0.95] md:text-7xl">
              The component library, without the duplicate-component circus.
            </h1>
            <p className="mt-5 max-w-2xl text-sm leading-6 text-[#ebe8e0]/70">
              Every preview imports the real canonical source file. Use the viewport and background controls to stress-test the UI while you work through the revised booking experience.
            </p>
          </div>

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
