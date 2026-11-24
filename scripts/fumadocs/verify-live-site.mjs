#!/usr/bin/env node
// COW-85 M4: verify the ACTUAL published Fumadocs site, not the local export.
// Playwright checks desktop/mobile pages, deep-link refresh, static search,
// assets, console/network errors and representative interactive demos.
import { chromium } from "@playwright/test";
import {
  brokenImages as findBrokenImages,
  checkFinalUrl,
  recordCheck,
  requireControl,
} from "./live-check-core.mjs";

// The GitHub Pages project URL redirects to the configured custom domain,
// which serves the docs at the root path. Strict mode uses the HTTPS canonical
// URL; the documented deviation mode uses HTTP until the cert is provisioned.
const DEFAULT_BASE = process.env.DOCS_ALLOW_HTTP === "1"
  ? "http://cowboy-components.revrebel.io/"
  : "https://cowboy-components.revrebel.io/";
const BASE = (process.env.DOCS_LIVE_URL ?? DEFAULT_BASE).replace(/\/?$/, "/");
const REPORT = process.env.DOCS_LIVE_REPORT ?? null;
// Default requires HTTPS end-to-end. Set only while the known custom-domain
// certificate issue is open; the deviation is recorded in the runbook.
const requireHttps = process.env.DOCS_ALLOW_HTTP !== "1";

const allPages = [
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

// Test-only filters keep failure-path integration tests fast; the default run
// always checks every page and both viewports.
const onlyPath = process.env.DOCS_LIVE_ONLY;
const pages = onlyPath === undefined
  ? allPages
  : allPages.filter((entry) => entry.path === onlyPath.replace(/^\//, ""));
const skipInteractions = process.env.DOCS_LIVE_SKIP_INTERACTIONS === "1";

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
  httpsPolicy: requireHttps ? "required" : "deviation-allowed (DOCS_ALLOW_HTTP=1)",
  pages: [],
  search: {},
  demos: {},
  styles: {},
  https: {},
  acceptedDeviations: [],
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
    let response;
    try {
      response = await page.goto(url, { waitUntil: "networkidle" });
    } catch (error) {
      // A TLS/certificate failure is a real verification failure, not a crash.
      record(`${viewport.name}/${entry.path || "root"} navigation`, false, String(error).slice(0, 200));
      continue;
    }
    const body = await page.locator("body").innerText();
    const markerOk = body.includes(entry.marker);
    // Refreshable deep link: reloading must land on the same URL and still render.
    let reloadError = null;
    try {
      await page.reload({ waitUntil: "networkidle" });
    } catch (error) {
      // A failed refresh is a failed deep-link check, not an unhandled crash.
      reloadError = String(error).slice(0, 200);
    }
    // The GitHub Pages URL redirects to the custom domain, so compare paths,
    // not origins, when checking that a deep link survives refresh.
    const expectedPath = new URL(url).pathname;
    const finalUrl = reloadError
      ? { ok: false, detail: `refresh failed: ${reloadError}` }
      : checkFinalUrl(page.url(), expectedPath, { requireHttps });
    const deepLinkOk = finalUrl.ok && (await page.locator("body").innerText()).includes(entry.marker);
    const images = await page.locator("img").evaluateAll((nodes) =>
      nodes.map((node) => ({ src: node.getAttribute("src"), ok: node.complete && node.naturalWidth > 0 })),
    );
    const broken = findBrokenImages(images);

    report.pages.push({
      viewport: viewport.name,
      path: entry.path || "/",
      status: response?.status() ?? 0,
      marker: record(`${viewport.name}/${entry.path || "root"}`, markerOk, `missing marker ${entry.marker}`),
      deepLink: record(`${viewport.name}/${entry.path || "root"} refresh`, deepLinkOk,
        finalUrl.ok ? "deep link marker missing after refresh" : finalUrl.detail),
      brokenImages: broken,
    });
    record(`${viewport.name}/${entry.path || "root"} images`, broken.length === 0,
      `broken images: ${broken.slice(0, 3).join(", ")}`);
    record(`${viewport.name}/${entry.path || "root"}`, (response?.status() ?? 0) === 200, `HTTP ${response?.status()}`);
  }

  if (viewport.name === "desktop" && !skipInteractions) {
   try {
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

    await page.goto(new URL("components/room-list-card/", BASE).href, { waitUntil: "networkidle" });
    const styles = await page.evaluate(() => {
      const value = (selector, property) => {
        const element = document.querySelector(selector);
        return element ? getComputedStyle(element)[property] : null;
      };
      return {
        tableHeaderAlign: value(".prose table th", "textAlign"),
        storyFrameGap: value(".docs-story-frame", "gap"),
        proseGap: value("article#nd-page .prose.flex-1", "gap"),
      };
    });
    report.styles = styles;
    record("table headers align left", styles.tableHeaderAlign === "left",
      `computed text-align: ${styles.tableHeaderAlign}`);
    record("story frame gap", styles.storyFrameGap === "16px",
      `computed gap: ${styles.storyFrameGap}`);
    record("prose gap", styles.proseGap === "16px",
      `computed gap: ${styles.proseGap}`);
   } catch (error) {
    record("desktop search/demo interactions", false, String(error).slice(0, 200));
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
  const response = await fetch("https://cowboy-components.revrebel.io/", { redirect: "manual" });
  report.https = { status: response.status, url: response.url };
} catch (error) {
  report.https = { error: String(error) };
}
if (report.https.error) {
  if (requireHttps) {
    record("custom domain HTTPS", false, report.https.error);
  } else {
    // Documented deviation: still recorded, just not counted as a failure.
    report.acceptedDeviations = [
      ...(report.acceptedDeviations ?? []),
      `custom domain HTTPS: ${report.https.error}`,
    ];
  }
}

console.log(JSON.stringify(report, null, 2));
if (REPORT) {
  const { writeFileSync } = await import("node:fs");
  writeFileSync(REPORT, JSON.stringify(report, null, 2) + "\n");
}
console.log(failures.length ? `LIVE VERIFICATION FAILED (${failures.length})` : "LIVE VERIFICATION PASSED");
process.exit(failures.length ? 1 : 0);
