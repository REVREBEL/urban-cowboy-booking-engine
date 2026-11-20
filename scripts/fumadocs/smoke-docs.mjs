#!/usr/bin/env node
// COW-69 static docs smoke checks. Fails the build if required pages, assets,
// component markers or safety constraints are missing from the export.
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { resolveDocsBasePath } from "./base-path.mjs";

const out = process.argv[2] ?? "docs-app/out";
const pages = [
  "index.html",
  "components/pill/index.html",
  "components/button/index.html",
  "components/switch/index.html",
  "components/preference-icon-button/index.html",
  "components/dog-toggle-button/index.html",
  "components/travel-party-button/index.html",
  "components/search-button/index.html",
  "components/building-icon/index.html",
  "components/amenity-icons/index.html",
  "components/configurable-rate-card/index.html",
  "components/photo/index.html",
  "components/photo-tour-arrow/index.html",
  "components/room-photo-tour/index.html",
  "components/arrival/index.html",
  "components/journey-extras/index.html",
  "components/stay-journal/index.html",
  "components/journey-rooms/index.html",
  "components/help-me-choose-modal/index.html",
  "components/match-or-browse-screen/index.html",
  "components/room-matcher-page/index.html",
  "components/matcher-progress/index.html",
  "components/match-benefits-card/index.html",
  "components/date-range-picker/index.html",
  "components/phone-input/index.html",
  "components/empty-state/index.html",
  "components/error-state/index.html",
  "components/loading-state/index.html",
  "components/step-layout/index.html",
  "components/step-progress/index.html",
  "components/progress-bar/index.html",
  "components/progress-step/index.html",
];
const forbidden = [
  /api\.mews\.com/i,
  /CLOUDFLARE_API_TOKEN/,
  /ADMIN_TOKEN/,
  /WEBFLOW_CMS_API_TOKEN/,
  /Bearer\s+[A-Za-z0-9._-]{16,}/,
];

function fail(message) {
  console.error(`docs smoke failed: ${message}`);
  process.exit(1);
}

if (!existsSync(out)) fail(`missing static output ${out}`);
for (const page of pages) {
  const path = join(out, page);
  if (!existsSync(path)) fail(`missing page ${page}`);
  if (statSync(path).size < 1000) fail(`page too small ${page}`);
}
const htmlByPage = new Map(pages.map((page) => [page, readFileSync(join(out, page), "utf8")]));
const html = [...htmlByPage.values()].join("\n");
const markersByPage = {
  "index.html": ["Urban Cowboy Component Library"],
  "components/pill/index.html": ["Dogs allowed"],
  "components/button/index.html": ["Book Your Stay"],
  "components/switch/index.html": ["Dog Friendly Room (+ $75)"],
  "components/preference-icon-button/index.html": ["Your Own Hideaway"],
  "components/dog-toggle-button/index.html": ["Bringing the dog"],
  "components/travel-party-button/index.html": ["Just the two of us"],
  "components/search-button/index.html": ["icon-circle"],
  "components/building-icon/index.html": ["MountianViewHaus"],
  "components/amenity-icons/index.html": ["outdoor-tub"],
  "components/configurable-rate-card/index.html": ["STAY AWHILE"],
  "components/photo/index.html": ["Missing source"],
  "components/photo-tour-arrow/index.html": ["Inline chevrons"],
  "components/room-photo-tour/index.html": ["Alpine Bathing Suite"],
  "components/arrival/index.html": ["Match me with a room", "assets/icons/icons-simple/hammock.svg"],
  "components/journey-extras/index.html": ["Estonian Sauna Session"],
  "components/stay-journal/index.html": ["No journal action"],
  "components/journey-rooms/index.html": ["No room action"],
  "components/help-me-choose-modal/index.html": ["Help"],
  "components/match-or-browse-screen/index.html": ["browse"],
  "components/room-matcher-page/index.html": ["Step 1"],
  "components/matcher-progress/index.html": ["Step 1"],
  "components/match-benefits-card/index.html": ["Private soaking tub"],
  "components/date-range-picker/index.html": ["Selected:"],
  "components/phone-input/index.html": ["valid E.164"],
  "components/empty-state/index.html": ["Nothing available for these dates"],
  "components/error-state/index.html": ["Something went wrong"],
  "components/loading-state/index.html": ["Finding your stay"],
  "components/step-layout/index.html": ["Select Accommodations"],
  "components/step-progress/index.html": ["Rooms"],
  "components/progress-bar/index.html": ["Room"],
  "components/progress-step/index.html": ["Stepper"],
};
for (const [page, markers] of Object.entries(markersByPage)) {
  for (const marker of markers) {
    if (!htmlByPage.get(page).includes(marker)) fail(`missing rendered marker "${marker}" on ${page}`);
  }
}
if (!html.includes("View source")) fail("missing rendered marker: View source");
const searchIndex = join(out, "search-index.json");
if (!existsSync(searchIndex)) fail("missing static search index");
const searchData = JSON.parse(readFileSync(searchIndex, "utf8"));
if (searchData.type !== "simple" || (searchData.docs?.count ?? 0) < 30) {
  fail("static search index does not cover the catalog");
}
if (!html.includes(`${resolveDocsBasePath()}/search-index.json`)) {
  fail("static search index is not referenced under the base path");
}
for (const pattern of forbidden) {
  if (pattern.test(html)) fail(`forbidden content in static HTML: ${pattern}`);
}
const staticRoot = join(out, "_next", "static");
if (!existsSync(staticRoot) || readdirSync(staticRoot).length === 0) fail("missing static assets");
const basePath = resolveDocsBasePath();
if (basePath && !html.includes(`${basePath}/_next/static/`)) {
  fail(`static assets are missing base path ${basePath}`);
}
console.log(`docs smoke passed: ${pages.length} pages, static assets present`);
