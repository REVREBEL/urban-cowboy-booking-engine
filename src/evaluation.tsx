import { Suspense, lazy, useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import { BookingProxy, UIProxy } from "./evaluation/proxyPreviews";
import "./index.css";

type Decision = "keep" | "maybe" | "drop";
type PreviewItem = {
  id: string;
  name: string;
  group: "FindYourStay" | "States" | "Booking" | "UI";
  path: string;
  load?: () => Promise<{ default: React.ComponentType }>;
  proxy?: "booking" | "ui";
};

function lazyModule(
  loader: () => Promise<Record<string, unknown>>,
  namedFallback?: string,
): () => Promise<{ default: React.ComponentType }> {
  return async () => {
    const mod = (await loader()) as Record<string, unknown>;
    const component =
      (mod.default as React.ComponentType | undefined) ??
      (namedFallback ? (mod[namedFallback] as React.ComponentType | undefined) : undefined);
    if (!component) {
      throw new Error(`No renderable export found${namedFallback ? ` (${namedFallback})` : ""}.`);
    }
    return { default: component };
  };
}

const PREVIEWS: PreviewItem[] = [
  {
    id: "best-rate-label",
    name: "Best Rate Guaranteed Label",
    group: "FindYourStay",
    path: "src/components/FindYourStay/BestRateGuaranteedLabel.tsx",
    load: lazyModule(
      () => import("./components/FindYourStay/BestRateGuaranteedLabel"),
      "BestRateGuaranteedLabel",
    ),
  },
  {
    id: "dog-toggle",
    name: "Dog Icon Toggle",
    group: "FindYourStay",
    path: "src/components/FindYourStay/DogIconToggleButton.tsx",
    load: lazyModule(
      () => import("./components/FindYourStay/DogIconToggleButton"),
      "DogIconToggleButton",
    ),
  },
  {
    id: "match-card",
    name: "Find Your Stay Match Card",
    group: "FindYourStay",
    path: "src/components/FindYourStay/FindYourStayMatchCard.tsx",
    load: lazyModule(
      () => import("./components/FindYourStay/FindYourStayMatchCard"),
      "FindYourStayMatchCard",
    ),
  },
  {
    id: "travel-party",
    name: "Travel Party Button",
    group: "FindYourStay",
    path: "src/components/FindYourStay/FindYourStayTravelPartyButton.tsx",
    load: lazyModule(
      () => import("./components/FindYourStay/FindYourStayTravelPartyButton"),
      "FindYourStayTravelPartyButton",
    ),
  },
  {
    id: "progress-bar",
    name: "Progress Bar",
    group: "FindYourStay",
    path: "src/components/FindYourStay/ProgressBar.tsx",
    load: lazyModule(() => import("./components/FindYourStay/ProgressBar"), "ProgressBar"),
  },
  {
    id: "progress-step",
    name: "Progress Step",
    group: "FindYourStay",
    path: "src/components/FindYourStay/ProgressStep.tsx",
    load: lazyModule(() => import("./components/FindYourStay/ProgressStep"), "ProgressStep"),
  },
  {
    id: "property-label",
    name: "Property Location Label",
    group: "FindYourStay",
    path: "src/components/FindYourStay/PropertyLocationLabel.tsx",
    load: lazyModule(
      () => import("./components/FindYourStay/PropertyLocationLabel"),
      "PropertyLocationLabel",
    ),
  },
  {
    id: "search-bar",
    name: "Search Bar",
    group: "FindYourStay",
    path: "src/components/FindYourStay/SearchBar.tsx",
    load: lazyModule(() => import("./components/FindYourStay/SearchBar"), "SearchBar"),
  },
  {
    id: "search-expanded",
    name: "Search Bar Expanded",
    group: "FindYourStay",
    path: "src/components/FindYourStay/SearchBarExpanded.tsx",
    load: lazyModule(
      () => import("./components/FindYourStay/SearchBarExpanded"),
      "SearchBarExpanded",
    ),
  },
  {
    id: "search-guests",
    name: "Search Guests Dropdown",
    group: "FindYourStay",
    path: "src/components/FindYourStay/SearchBarGuestsDropdown.tsx",
    load: lazyModule(
      () => import("./components/FindYourStay/SearchBarGuestsDropdown"),
      "SearchBarGuestDropdown",
    ),
  },
  {
    id: "search-location",
    name: "Search Location Dropdown",
    group: "FindYourStay",
    path: "src/components/FindYourStay/SearchBarLocationDropdown.tsx",
    load: lazyModule(
      () => import("./components/FindYourStay/SearchBarLocationDropdown"),
      "SearchBarLocationDropdown",
    ),
  },
  {
    id: "search-promo",
    name: "Search Promo Dropdown",
    group: "FindYourStay",
    path: "src/components/FindYourStay/SearchBarPromoDropdown.tsx",
    load: lazyModule(
      () => import("./components/FindYourStay/SearchBarPromoDropdown"),
      "SearchBarPromoDropdown",
    ),
  },
  {
    id: "search-button",
    name: "Search Button",
    group: "FindYourStay",
    path: "src/components/FindYourStay/SearchButton.tsx",
    load: lazyModule(() => import("./components/FindYourStay/SearchButton"), "SearchButton"),
  },
  {
    id: "empty-state",
    name: "Empty State",
    group: "States",
    path: "src/components/States/EmptyState.tsx",
    load: lazyModule(() => import("./components/States/EmptyState")),
  },
  {
    id: "error-state",
    name: "Error State",
    group: "States",
    path: "src/components/States/ErrorState.tsx",
    load: lazyModule(() => import("./components/States/ErrorState")),
  },
  {
    id: "loading-state",
    name: "Loading State",
    group: "States",
    path: "src/components/States/LoadingState.tsx",
    load: lazyModule(() => import("./components/States/LoadingState")),
  },
];

const BOOKING_FILES = [
  "BookingShell.tsx",
  "DogToggleButton.tsx",
  "MatchBenefitsCard.tsx",
  "PreferenceIconButton.tsx",
  "RateList.tsx",
  "RoomCard.tsx",
  "RoomDetailsFull.tsx",
  "RoomGallery.tsx",
  "SearchBar.tsx",
  "StaySummary.tsx",
];

const CONTEXTUAL_FIND_FILES = [
  "AllRoomsGrid.tsx",
  "FindYourStay.tsx",
  "HelpMeChoose.tsx",
  "MatchResults.tsx",
  "RoomCard.tsx",
  "RoomDrawer.tsx",
  "RoomFeatures.tsx",
  "TopMatchPanel.tsx",
];

const UI_FILES = [
  "Accordion.tsx", "Alert.tsx", "AlertDialog.tsx", "AspectRatio.tsx", "Avatar.tsx",
  "Badge.tsx", "Breadcrumb.tsx", "Button.tsx", "Calendar.tsx", "Card.tsx",
  "Carousel.tsx", "Chart.tsx", "Checkbox.tsx", "Collapsible.tsx", "Command.tsx",
  "ContextMenu.tsx", "Dialog.tsx", "Drawer.tsx", "DropdownMenu.tsx", "Form.tsx",
  "HoverCard.tsx", "Input.tsx", "InputOtp.tsx", "Label.tsx", "Menubar.tsx",
  "NavigationMenu.tsx", "Pagination.tsx", "Popover.tsx", "Progress.tsx",
  "PropertyPropertyLabel.tsx", "RadioGroup.tsx", "Resizable.tsx", "ScrollArea.tsx",
  "Select.tsx", "Separator.tsx", "Sheet.tsx", "Sidebar.tsx", "Skeleton.tsx",
  "Slider.tsx", "Sonner.tsx", "Switch.tsx", "Table.tsx", "Tabs.tsx",
  "Textarea.tsx", "Toggle.tsx", "ToggleGroup.tsx", "Tooltip.tsx",
];

const ALL_PREVIEWS: PreviewItem[] = [
  ...PREVIEWS,
  ...BOOKING_FILES.map((file) => ({
    id: `booking-${file.replace(/\.tsx$/, "").toLowerCase()}`,
    name: file.replace(/\.tsx$/, ""),
    group: "Booking" as const,
    path: `src/components/Booking/${file}`,
    proxy: "booking" as const,
  })),
  ...UI_FILES.map((file) => ({
    id: `ui-${file.replace(/\.tsx$/, "").toLowerCase()}`,
    name: file.replace(/\.tsx$/, ""),
    group: "UI" as const,
    path: `src/components/UI/${file}`,
    proxy: "ui" as const,
  })),
];

const DEFAULT_DECISIONS: Record<string, Decision> = Object.fromEntries(
  PREVIEWS.map((item) => [item.path, "keep" as Decision]),
);

const DECISION_KEY = "uc-component-evaluation-decisions";

function sourceUrl(path: string) {
  return `https://github.com/REVREBEL/urban-cowboy-booking-engine/blob/components-evaluation/${path}`;
}

function EvaluationApp() {
  const urlSelected = new URLSearchParams(window.location.search).get("component");
  const initial = ALL_PREVIEWS.find((item) => item.id === urlSelected)?.id ?? ALL_PREVIEWS[0].id;
  const [selectedId, setSelectedId] = useState(initial);
  const [query, setQuery] = useState("");
  const [inventoryOpen, setInventoryOpen] = useState(false);
  const [decisions, setDecisions] = useState<Record<string, Decision>>(() => {
    try {
      return {
        ...DEFAULT_DECISIONS,
        ...JSON.parse(localStorage.getItem(DECISION_KEY) || "{}"),
      };
    } catch {
      return {};
    }
  });

  const selected = ALL_PREVIEWS.find((item) => item.id === selectedId) ?? ALL_PREVIEWS[0];
  const Preview = useMemo(
    () => (selected.load ? lazy(selected.load) : null),
    [selected.id, selected.load],
  );

  const visible = ALL_PREVIEWS.filter((item) =>
    `${item.name} ${item.group} ${item.path}`.toLowerCase().includes(query.toLowerCase()),
  );

  useEffect(() => {
    const url = new URL(window.location.href);
    url.searchParams.set("component", selectedId);
    window.history.replaceState(null, "", url);
  }, [selectedId]);

  useEffect(() => {
    localStorage.setItem(DECISION_KEY, JSON.stringify(decisions));
  }, [decisions]);

  function decide(value: Decision) {
    setDecisions((current) => ({ ...current, [selected.path]: value }));
  }

  return (
    <div className="min-h-screen bg-[#ebe8e0] text-[#4e332d]">
      <header className="sticky top-0 z-[100] border-b border-[#4e332d]/15 bg-[#ebe8e0]/95 backdrop-blur">
        <div className="mx-auto flex max-w-[1600px] flex-wrap items-center justify-between gap-4 px-5 py-4">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#9a5636]">
              components-evaluation
            </p>
            <h1 className="text-xl font-semibold">Component Lab</h1>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-xs">
            {(["keep", "maybe", "drop"] as Decision[]).map((decision) => {
              const count = Object.values(decisions).filter((value) => value === decision).length;
              return (
                <span key={decision} className="rounded-full border border-[#4e332d]/20 bg-white/50 px-3 py-1">
                  {decision}: {count}
                </span>
              );
            })}
            <button
              type="button"
              onClick={() => setInventoryOpen((value) => !value)}
              className="rounded-full bg-[#4e332d] px-4 py-2 font-semibold text-[#ebe8e0]"
            >
              {inventoryOpen ? "Back to previews" : "View full inventory"}
            </button>
          </div>
        </div>
      </header>

      {inventoryOpen ? (
        <Inventory decisions={decisions} />
      ) : (
        <div className="mx-auto grid max-w-[1600px] lg:grid-cols-[300px_minmax(0,1fr)]">
          <aside className="border-r border-[#4e332d]/15 p-4 lg:sticky lg:top-[73px] lg:h-[calc(100vh-73px)] lg:overflow-y-auto">
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Filter components…"
              className="mb-4 w-full rounded-lg border border-[#4e332d]/20 bg-white/60 px-3 py-2 text-sm outline-none focus:border-[#9a5636]"
            />
            <div className="space-y-1">
              {visible.map((item) => {
                const active = item.id === selectedId;
                const decision = decisions[item.path];
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setSelectedId(item.id)}
                    className={`flex w-full items-center justify-between gap-3 rounded-lg px-3 py-2 text-left text-sm transition ${
                      active ? "bg-[#4e332d] text-[#ebe8e0]" : "hover:bg-white/50"
                    }`}
                  >
                    <span>
                      <span className="block font-medium">{item.name}</span>
                      <span className={`block text-[10px] uppercase tracking-wider ${active ? "opacity-60" : "opacity-45"}`}>
                        {item.group}
                      </span>
                    </span>
                    {decision && (
                      <span className={`rounded-full px-2 py-0.5 text-[9px] uppercase ${
                        active ? "bg-white/15" : "bg-[#4e332d]/10"
                      }`}>
                        {decision}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </aside>

          <main className="min-w-0 p-4 md:p-7">
            <div className="mb-4 flex flex-wrap items-start justify-between gap-4 rounded-xl border border-[#4e332d]/15 bg-white/45 p-4">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#9a5636]">
                    {selected.group}
                  </p>
                  <span className="rounded-full bg-[#4e332d]/10 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wider">
                    {selected.proxy ? "visual proxy" : "source render"}
                  </span>
                </div>
                <h2 className="mt-1 text-2xl font-semibold">{selected.name}</h2>
                <a
                  href={sourceUrl(selected.path)}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-1 block text-xs underline underline-offset-2 opacity-60 hover:opacity-100"
                >
                  {selected.path}
                </a>
              </div>
              <div className="flex items-center gap-2">
                {(["keep", "maybe", "drop"] as Decision[]).map((decision) => (
                  <button
                    key={decision}
                    type="button"
                    onClick={() => decide(decision)}
                    className={`rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-wider ${
                      decisions[selected.path] === decision
                        ? "border-[#4e332d] bg-[#4e332d] text-[#ebe8e0]"
                        : "border-[#4e332d]/25 bg-white/60"
                    }`}
                  >
                    {decision}
                  </button>
                ))}
              </div>
            </div>

            <div className="min-h-[720px] overflow-auto rounded-xl border border-[#4e332d]/15 bg-[#faf9f9] shadow-sm">
              {selected.proxy === "booking" ? (
                <BookingProxy component={selected.path.split("/").pop() ?? ""} />
              ) : selected.proxy === "ui" ? (
                <UIProxy component={selected.path.split("/").pop() ?? ""} />
              ) : Preview ? (
                <Suspense
                  fallback={
                    <div className="grid min-h-[720px] place-items-center text-sm opacity-50">
                      Loading preview…
                    </div>
                  }
                >
                  <Preview />
                </Suspense>
              ) : null}
            </div>
          </main>
        </div>
      )}
    </div>
  );
}

function Inventory({ decisions }: { decisions: Record<string, Decision> }) {
  const renderList = (
    title: string,
    base: string,
    files: string[],
    note: string,
    status: "preview" | "blocked" | "library",
  ) => (
    <section className="rounded-xl border border-[#4e332d]/15 bg-white/45 p-5">
      <div className="mb-4">
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="text-xl font-semibold">{title}</h2>
          <span className="rounded-full bg-[#4e332d]/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider">
            {files.length} files
          </span>
          <span className="rounded-full bg-[#9a5636]/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-[#9a5636]">
            {status === "preview" ? "previewable now" : status === "blocked" ? "needs adapter" : "UI library"}
          </span>
        </div>
        <p className="mt-2 max-w-4xl text-sm leading-relaxed opacity-65">{note}</p>
      </div>
      <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
        {files.map((file) => {
          const path = `${base}/${file}`;
          return (
            <a
              key={path}
              href={sourceUrl(path)}
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-between gap-3 rounded-lg border border-[#4e332d]/10 bg-[#faf9f9]/70 px-3 py-2 text-sm hover:border-[#9a5636]/50"
            >
              <span className="truncate">{file}</span>
              {decisions[path] && (
                <span className="rounded-full bg-[#4e332d]/10 px-2 py-0.5 text-[9px] uppercase">
                  {decisions[path]}
                </span>
              )}
            </a>
          );
        })}
      </div>
    </section>
  );

  return (
    <main className="mx-auto max-w-[1500px] space-y-5 p-5 md:p-8">
      <div className="rounded-xl border border-[#9a5636]/30 bg-[#9a5636]/10 p-5">
        <h2 className="font-semibold">What I found in the four folders</h2>
        <p className="mt-2 max-w-5xl text-sm leading-relaxed opacity-75">
          These are not one consistent component library. FindYourStay contains a mix of standalone
          Figma-style component demos and larger screens tied to a missing booking mock layer.
          Booking comes from a second architecture and references missing @/lib/booking modules,
          Lucide, TanStack Router and assets. UI is essentially a shadcn/Radix primitive library whose
          dependencies are not installed in this repo. States is the cleanest standalone set.
        </p>
      </div>

      {renderList(
        "FindYourStay",
        "src/components/FindYourStay",
        [
          ...PREVIEWS.filter((item) => item.group === "FindYourStay").map((item) =>
            item.path.split("/").pop() as string,
          ),
          ...CONTEXTUAL_FIND_FILES,
        ],
        "The standalone design components are available in the visual lab now. The larger page-level files need a small mock BookingContext/types adapter before they can render faithfully.",
        "preview",
      )}

      {renderList(
        "Booking",
        "src/components/Booking",
        BOOKING_FILES,
        "All ten Booking components now have faithful visual proxies in the lab. They preserve the structure and styling intent of the imported source while avoiding fake production wiring to the missing support library.",
        "preview",
      )}

      {renderList(
        "States",
        "src/components/States",
        ["EmptyState.tsx", "ErrorState.tsx", "LoadingState.tsx"],
        "These are self-contained and render directly in the visual lab.",
        "preview",
      )}

      {renderList(
        "UI",
        "src/components/UI",
        UI_FILES,
        "Every UI primitive now has a visual proxy in the lab. These are structure previews because the imported shadcn/Radix package set and design-token layer were not included with the folder.",
        "preview",
      )}
    </main>
  );
}

createRoot(document.getElementById("evaluation-root")!).render(<EvaluationApp />);
