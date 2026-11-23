// COW-106: production layout follows published D1 settings when available.
import assert from "node:assert/strict";
import test from "node:test";
import { selectProductionLayout } from "../src/lib/siteSettingsClient.ts";
import { DEFAULT_SITE_SETTINGS } from "../src/types/site-settings.ts";

test("published D1 settings control the production layout", () => {
  const published = {
    settings: { ...DEFAULT_SITE_SETTINGS, productionLayout: "photo" as const },
    source: "d1",
    itemId: "settings-item",
  };
  assert.equal(selectProductionLayout(published, "card"), "photo");
  assert.equal(
    selectProductionLayout({ ...published, settings: { ...published.settings, productionLayout: "card" } }, "photo"),
    "card",
  );
});

test("an absent or non-D1 published source keeps the existing Webflow layout", () => {
  assert.equal(selectProductionLayout(null, "card"), "card");
  assert.equal(selectProductionLayout(null, "photo"), "photo");
});
