// COW-70: the generated coverage matrix must map stories to real docs pages.
import assert from "node:assert/strict";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import test from "node:test";

const root = new URL("../", import.meta.url);
const read = (path) => readFileSync(new URL(path, root), "utf8");

// Run the freshness check first: the deterministic test below invokes the
// generator in write mode, which would otherwise hide stale checked-in files.
test("checked-in inventory passes the docs CI freshness check", () => {
  const check = spawnSync(process.execPath, ["scripts/fumadocs/inventory-stories.mjs", "--check"], {
    cwd: new URL("..", import.meta.url), encoding: "utf8",
  });
  assert.equal(check.status, 0, check.stderr || check.stdout);
});

test("inventory generation is deterministic and maps existing pages unambiguously", () => {
  const run = spawnSync(process.execPath, ["scripts/fumadocs/inventory-stories.mjs"], {
    cwd: new URL("..", import.meta.url), encoding: "utf8",
  });
  assert.equal(run.status, 0, run.stderr);

  const first = read("docs/component-library/coverage-matrix.json");
  const again = spawnSync(process.execPath, ["scripts/fumadocs/inventory-stories.mjs"], {
    cwd: new URL("..", import.meta.url), encoding: "utf8",
  });
  assert.equal(again.status, 0, again.stderr);
  assert.equal(first, read("docs/component-library/coverage-matrix.json"));

  const matrix = JSON.parse(first);
  const byComponent = (name) => matrix.components.filter((entry) => entry.component === name);
  const preference = byComponent("PreferenceIconButton").find((entry) => entry.status === "documented");
  assert.ok(preference, "PreferenceIconButton story maps to its existing page");
  assert.equal(preference.docsPage, "docs-app/content/docs/components/preference-icon-button.mdx");
  const expectedPaths = {
    Pill: "docs-app/content/docs/components/pill.mdx",
    Button: "docs-app/content/docs/components/button.mdx",
    Switch: "docs-app/content/docs/components/switch.mdx",
    PreferenceIconButton: "docs-app/content/docs/components/preference-icon-button.mdx",
    DogToggleButton: "docs-app/content/docs/components/dog-toggle-button.mdx",
    FindYourStayTravelPartyButton: "docs-app/content/docs/components/travel-party-button.mdx",
    SearchButton: "docs-app/content/docs/components/search-button.mdx",
    BuildingIcon: "docs-app/content/docs/components/building-icon.mdx",
    AmenityIcons: "docs-app/content/docs/components/amenity-icons.mdx",
    ConfigurableRateCard: "docs-app/content/docs/components/configurable-rate-card.mdx",
    Photo: "docs-app/content/docs/components/photo.mdx",
    "Photo Tour Arrow": "docs-app/content/docs/components/photo-tour-arrow.mdx",
    "Room Photo Tour": "docs-app/content/docs/components/room-photo-tour.mdx",
    "Disappear for a While": "docs-app/content/docs/components/arrival.mdx",
    Extras: "docs-app/content/docs/components/journey-extras.mdx",
    "Stay Journal": "docs-app/content/docs/components/stay-journal.mdx",
    Rooms: "docs-app/content/docs/components/journey-rooms.mdx",
    HelpMeChooseModal: "docs-app/content/docs/components/help-me-choose-modal.mdx",
    MatchOrBrowseScreen: "docs-app/content/docs/components/match-or-browse-screen.mdx",
    RoomMatcherPage: "docs-app/content/docs/components/room-matcher-page.mdx",
    RoomMatcherProgress: "docs-app/content/docs/components/matcher-progress.mdx",
    MatchBenefitsCard: "docs-app/content/docs/components/match-benefits-card.mdx",
    DateRangePicker: "docs-app/content/docs/components/date-range-picker.mdx",
    PhoneInput: "docs-app/content/docs/components/phone-input.mdx",
    EmptyState: "docs-app/content/docs/components/empty-state.mdx",
    ErrorState: "docs-app/content/docs/components/error-state.mdx",
    LoadingState: "docs-app/content/docs/components/loading-state.mdx",
    StepLayout: "docs-app/content/docs/components/step-layout.mdx",
    StepProgress: "docs-app/content/docs/components/step-progress.mdx",
    ProgressBar: "docs-app/content/docs/components/progress-bar.mdx",
    ProgressStep: "docs-app/content/docs/components/progress-step.mdx",
    SearchBar: "docs-app/content/docs/components/search-bar.mdx",
    SearchBarExpanded: "docs-app/content/docs/components/search-bar.mdx",
    SearchBarGuestDropdown: "docs-app/content/docs/components/search-dropdowns.mdx",
    SearchBarLocationDropdown: "docs-app/content/docs/components/search-dropdowns.mdx",
    SearchBarPromoDropdown: "docs-app/content/docs/components/search-dropdowns.mdx",
    Header: "docs-app/content/docs/components/booking-chrome.mdx",
    ContactBar: "docs-app/content/docs/components/booking-chrome.mdx",
    Conversion: "docs-app/content/docs/components/conversion-badges.mdx",
    UpsellCard: "docs-app/content/docs/components/extras-upsell.mdx",
    RoomsListCard: "docs-app/content/docs/components/room-list-card.mdx",
  };
  for (const [name, page] of Object.entries(expectedPaths)) {
    const documented = byComponent(name).find((entry) => entry.status === "documented");
    assert.ok(documented, `${name} documented`);
    assert.equal(documented.docsPage, page, `${name} maps to its real page`);
  }

  for (const entry of matrix.components) {
    if (entry.status === "documented") {
      assert.ok(existsSync(new URL(entry.docsPage, root)), `${entry.component} page exists: ${entry.docsPage}`);
    }
    if (entry.status === "excluded") assert.equal(entry.docsPage, null);
  }

  const planned = matrix.components
    .filter((entry) => entry.status === "planned")
    .map((entry) => entry.docsPage);
  assert.equal(new Set(planned).size, planned.length, "planned page paths are unique");
});

test("every undocumented production candidate has an explicit triage decision", () => {
  const matrix = JSON.parse(read("docs/component-library/coverage-matrix.json"));
  const candidates = matrix.undocumentedProductionCandidates;
  assert.ok(candidates.length > 0, "candidate list is present");
  for (const candidate of candidates) {
    assert.ok(candidate.name && candidate.source, `candidate identity ${JSON.stringify(candidate)}`);
    assert.ok(
      ["deferred", "excluded", "documented", "family-covered"].includes(candidate.triage?.category),
      `triage category for ${candidate.name}`,
    );
    assert.ok((candidate.triage?.rationale ?? "").length > 20, `triage rationale for ${candidate.name}`);
  }
  const summary = matrix.totals.candidateTriage;
  assert.equal(
    summary.deferred + summary.excluded + summary.documented + summary.familyCovered,
    candidates.length,
    "triage summary covers every candidate",
  );
  assert.equal(summary.deferred, 0, "no production candidate is left deferred");
});

test("inventory check rejects documented pages missing from the component index", () => {
  const metaUrl = new URL("../docs-app/content/docs/components/meta.json", import.meta.url);
  const original = readFileSync(metaUrl, "utf8");
  const meta = JSON.parse(original);
  try {
    writeFileSync(metaUrl, JSON.stringify({
      ...meta, pages: meta.pages.filter((slug) => slug !== "button"),
    }, null, 2) + "\n");
    const check = spawnSync(process.execPath, ["scripts/fumadocs/inventory-stories.mjs", "--check"], {
      cwd: new URL("..", import.meta.url), encoding: "utf8",
    });
    assert.equal(check.status, 1);
    assert.match(check.stderr, /not listed in components\/meta\.json/);
  } finally {
    writeFileSync(metaUrl, original);
  }
  const restored = spawnSync(process.execPath, ["scripts/fumadocs/inventory-stories.mjs", "--check"], {
    cwd: new URL("..", import.meta.url), encoding: "utf8",
  });
  assert.equal(restored.status, 0, restored.stderr);
});
