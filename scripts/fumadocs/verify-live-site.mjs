#!/usr/bin/env node
// COW-85 M4: verify the ACTUAL published Fumadocs site, not the local export.
// Playwright checks desktop/mobile pages, deep-link refresh, static search,
// assets, console/network errors and representative interactive demos.
import { chromium } from "@playwright/test";
import { brokenImages as findBrokenImages, recordCheck, requireControl } from "./live-check-core.mjs";

const BASE = (process.env.DOCS_LIVE_URL ?? "https://revrebel.github.io/urban-cowboy-booking-engine/")
  .replace(/\/?$/, "/");
const REPORT = process.env.DOCS_LIVE_REPORT ?? null;

const pages = [
  { path: "", marker: "Urban Cowboy Component Library" },
  { path: "components/search-bar/", marker: "SearchBar" },
  { path: "components/search-dropdowns/", marker: "Search dropdowns" },
  { path: "components/booking-chrome/", marker: "Booking chrome" },
  { path: "components/conversion-badges/", marker: "Conversion badges" },
  { path: "components/extras-upsell/", marker: "Extras upsell" },
  { path: "components/room-list-card/", marker: "Room list card" },
  { path: "components/focus-amenity/", marker: "Focus amenity family" },
  { path: "components/rate-offers/", marker: "Rate offers" },
  { path: "components/booking-summary/", marker: "Booking summary" },
  { path: "components/booking-details/", marker: "Booking details" },
];

const viewports = [
  { name: "desktop", width: 1280, height: 900 },
  { name: "mobile", width: 375, height: 812 },
];

const failures = [];
const record = (section, ok, detail) => recordCheck(failures, section, ok, detail);

const browser = await chromium.launch({ headless: true });
const report = {
  checkedAt: new Date().toISOString(),
  url: BASE,
  viewports: viewports.map((v) => v.name),
  pages: [],
  search: {},
  demos: {},
  https: {},
  failures,
};

for (const viewport of viewports) {
  const context = await browser.newContext({ viewport: { width: viewport.width, height: viewport.height } });
  const page = await context.newPage();
  const consoleErrors = [];
  const badResponses = [];
  page.on("console", (message) => {
    if (message.type() === "error") consoleErrors.push(message.text().slice(0, 200));
  });
  page.on("pageerror", (error) => consoleErrors.push(String(error).slice(0, 200)));
  page.on("response", (response) => {
    if (response.status() >= 400) badResponses.push(`${response.status()} ${response.url()}`);
  });

  for (const entry of pages) {
    const url = new URL(entry.path, BASE).href;
    const response = await page.goto(url, { waitUntil: "networkidle" });
    const body = await page.locator("body").innerText();
    const markerOk = body.includes(entry.marker);
    // Refreshable deep link: reloading must land on the same URL and still render.
    await page.reload({ waitUntil: "networkidle" });
    const deepLinkOk = page.url() === url && (await page.locator("body").innerText()).includes(entry.marker);
    const images = await page.locator("img").evaluateAll((nodes) =>
      nodes.map((node) => ({ src: node.getAttribute("src"), ok: node.complete && node.naturalWidth > 0 })),
    );
    const broken = findBrokenImages(images);

    report.pages.push({
      viewport: viewport.name,
      path: entry.path || "/",
      status: response?.status() ?? 0,
      marker: record(`${viewport.name}/${entry.path || "root"}`, markerOk, `missing marker ${entry.marker}`),
      deepLink: record(`${viewport.name}/${entry.path || "root"} refresh`, deepLinkOk, "deep link did not survive refresh"),
      brokenImages: broken,
    });
    record(`${viewport.name}/${entry.path || "root"} images`, broken.length === 0,
      `broken images: ${broken.slice(0, 3).join(", ")}`);
    record(`${viewport.name}/${entry.path || "root"}`, (response?.status() ?? 0) === 200, `HTTP ${response?.status()}`);
  }

  if (viewport.name === "desktop") {
    await page.goto(BASE, { waitUntil: "networkidle" });
    await page.locator("button").filter({ hasText: "Search" }).first().click();
    await page.getByRole("combobox", { name: "Search" }).fill("Focus");
    await page.waitForTimeout(700);
    const option = page.locator('[id="fd-search-option-/components/focus-amenity/"]');
    const optionPresent = requireControl(await option.count(), "focus-amenity search result");
    report.search = {
      indexResult: record("search", optionPresent.ok, optionPresent.detail),
    };
    if (optionPresent.ok) {
      await option.click();
      await page.waitForTimeout(700);
      report.search.navigate = record(
        "search navigation",
        page.url().includes("/components/focus-amenity/"),
        `landed on ${page.url()}`,
      );
    } else {
      report.search.navigate = record("search navigation", false, "no result to navigate to");
    }

    await page.goto(new URL("components/focus-amenity/", BASE).href, { waitUntil: "networkidle" });
    const railToggle = page.getByRole("button", { name: "Toggle amenity rail" });
    const railPresent = requireControl(await railToggle.count(), "amenity rail toggle");
    report.demos.amenityRail = record("amenity rail control", railPresent.ok, railPresent.detail);
    if (railPresent.ok) {
      await railToggle.click();
      report.demos.amenityRailState = record(
        "amenity rail toggle",
        (await page.locator('[role="status"]').filter({ hasText: "Rail open" }).count()) > 0,
        "rail state did not change",
      );
    }

    await page.goto(new URL("components/rate-offers/", BASE).href, { waitUntil: "networkidle" });
    // The last close control belongs to the SidePanelDemo; earlier ones are
    // embedded in the rate card/configurable offer demos.
    const close = page.getByRole("button", { name: "Close rate details" }).last();
    const closePresent = requireControl(await close.count(), "rate panel close");
    report.demos.ratePanelClose = record("rate panel close control", closePresent.ok, closePresent.detail);
    if (closePresent.ok) {
      // The close control sits inside a layered card; force the docs-only click.
      await close.click({ force: true });
      report.demos.ratePanel = record(
        "rate panel close/reopen",
        (await page.getByRole("button", { name: "Reopen side panel" }).count()) > 0,
        "reopen control not visible after close",
      );
    }
  }

  report[`console_${viewport.name}`] = consoleErrors;
  report[`bad_responses_${viewport.name}`] = badResponses;
  record(`console/${viewport.name}`, consoleErrors.length === 0, consoleErrors.slice(0, 3).join(" | "));
  record(`network/${viewport.name}`, badResponses.length === 0, badResponses.slice(0, 3).join(" | "));
  await context.close();
}

await browser.close();

// The custom domain currently redirects to http and presents a *.github.io cert.
try {
  const response = await fetch("https://resource-hub.revrebel.io/urban-cowboy-booking-engine/", { redirect: "manual" });
  report.https = { status: response.status, url: response.url };
} catch (error) {
  report.https = { error: String(error) };
}

console.log(JSON.stringify(report, null, 2));
if (REPORT) {
  const { writeFileSync } = await import("node:fs");
  writeFileSync(REPORT, JSON.stringify(report, null, 2) + "\n");
}
console.log(failures.length ? `LIVE VERIFICATION FAILED (${failures.length})` : "LIVE VERIFICATION PASSED");
process.exit(failures.length ? 1 : 0);
