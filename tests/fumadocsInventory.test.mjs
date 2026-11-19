// COW-70: the generated coverage matrix must map stories to real docs pages.
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
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
