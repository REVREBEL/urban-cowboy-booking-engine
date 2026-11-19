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
};
for (const [page, markers] of Object.entries(markersByPage)) {
  for (const marker of markers) {
    if (!htmlByPage.get(page).includes(marker)) fail(`missing rendered marker "${marker}" on ${page}`);
  }
}
if (!html.includes("View source")) fail("missing rendered marker: View source");
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
