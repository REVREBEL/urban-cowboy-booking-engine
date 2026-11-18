#!/usr/bin/env node
// COW-69 static docs smoke checks. Fails the build if required pages, assets,
// component markers or safety constraints are missing from the export.
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

const out = process.argv[2] ?? "docs-app/out";
const pages = [
  "index.html",
  "components/pill/index.html",
  "components/preference-icon-button/index.html",
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
const html = pages.map((page) => readFileSync(join(out, page), "utf8")).join("\n");
for (const marker of ["Urban Cowboy Component Library", "Dogs allowed", "Your Own Hideaway", "View source"]) {
  if (!html.includes(marker)) fail(`missing rendered marker: ${marker}`);
}
for (const pattern of forbidden) {
  if (pattern.test(html)) fail(`forbidden content in static HTML: ${pattern}`);
}
const staticRoot = join(out, "_next", "static");
if (!existsSync(staticRoot) || readdirSync(staticRoot).length === 0) fail("missing static assets");
console.log(`docs smoke passed: ${pages.length} pages, static assets present`);
