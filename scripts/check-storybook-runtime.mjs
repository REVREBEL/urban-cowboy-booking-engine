#!/usr/bin/env node
/**
 * Browser smoke test for the compiled Storybook, ahead of Chromatic.
 * Compile time is not render time: a story can build successfully and still
 * throw during React mounting (for example, a missing context provider).
 *
 * npm run build-storybook && npm run test:storybook:runtime
 */
import { spawn } from "node:child_process";
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { chromium } from "playwright";

const staticDir = resolve("storybook-static");
const reportDir = resolve("storybook-runtime-report");
const port = Number(process.env.STORYBOOK_SMOKE_PORT || 6020);
const origin = `http://127.0.0.1:${port}`;
const concurrency = Math.max(1, Math.min(6, Number(process.env.STORYBOOK_SMOKE_WORKERS || 3)));
const storyTimeout = Number(process.env.STORYBOOK_SMOKE_TIMEOUT_MS || 15000);

if (!existsSync(resolve(staticDir, "index.json"))) {
  console.error("Storybook index.json missing. Run npm run build-storybook first.");
  process.exit(1);
}

mkdirSync(reportDir, { recursive: true });
const server = spawn("python3", ["-m", "http.server", String(port), "--bind", "127.0.0.1", "--directory", staticDir], { stdio: "ignore" });

const sleep = (ms) => new Promise((resolveDelay) => setTimeout(resolveDelay, ms));
const unique = (messages) => [...new Set(messages)].filter(Boolean);
const safeName = (id) => id.replace(/[^a-z0-9_-]/gi, "_");

async function waitForServer() {
  for (let attempt = 0; attempt < 80; attempt++) {
    if (server.exitCode !== null) throw new Error("Storybook HTTP server exited early");
    try {
      const response = await fetch(`${origin}/index.json`);
      if (response.ok) return response.json();
    } catch { /* Server startup. */ }
    await sleep(150);
  }
  throw new Error("Timed out starting Storybook HTTP server");
}

function storyEntries(index) {
  const entries = Object.values(index.entries || index.v || {});
  return entries.filter((entry) => entry.type === "story" && entry.id)
    .sort((a, b) => a.id.localeCompare(b.id));
}

async function run() {
  let browser;
  let failures = [];
  let checked = 0;
  try {
    const index = await waitForServer();
    const entries = storyEntries(index);
    if (!entries.length) throw new Error("No stories found in Storybook index.json");
    console.log(`Rendering ${entries.length} stories in Chromium (${concurrency} workers)`);

    browser = await chromium.launch({ headless: true });
    let next = 0;

    await Promise.all(Array.from({ length: concurrency }, async () => {
      const context = await browser.newContext({
        viewport: { width: 1280, height: 800 },
        reducedMotion: "reduce",
        serviceWorkers: "block",
      });
      // Browser smoke tests must not call live Mews or Webflow services.
      // Return minimal deterministic data so stories can mount independently.
      await context.route("**/api/**", async (route) => {
        const path = new URL(route.request().url()).pathname;
        const body = path.includes("/api/mews/hotel")
          ? null
          : { locations: {}, buildings: {}, cards: [], language: {}, dates: {}, amenities: {}, reviews: {} };
        await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(body) });
      });

      try {
        while (true) {
          const position = next++;
          if (position >= entries.length) break;
          const entry = entries[position];
          const page = await context.newPage();
          const errors = [];
          page.on("pageerror", (error) => errors.push(`Uncaught: ${error.message}\n${error.stack || ""}`));
          page.on("console", (message) => {
            if (message.type() === "error") errors.push(`Console: ${message.text()}`);
          });
          try {
            await page.goto(`${origin}/iframe.html?id=${encodeURIComponent(entry.id)}&viewMode=story`, {
              waitUntil: "domcontentloaded",
              timeout: storyTimeout,
            });
            await page.waitForFunction(() => {
              const root = document.querySelector("#storybook-root");
              return Boolean(root && root.childNodes.length > 0);
            }, undefined, { timeout: storyTimeout });
            // Allow effects and post-render promise rejections to surface.
            await page.waitForTimeout(350);
          } catch (error) {
            errors.push(`Render: ${error instanceof Error ? error.message : String(error)}`);
          }

          const issues = unique(errors);
          if (issues.length) {
            failures.push({ id: entry.id, title: entry.title, name: entry.name, issues });
            try {
              await page.screenshot({
                path: resolve(reportDir, `${safeName(entry.id)}.png`),
                fullPage: true,
                timeout: 5000,
              });
            } catch { /* Preserve the original error when screenshotting fails. */ }
            console.error(`FAIL ${entry.id}: ${issues[0].split("\n")[0]}`);
          }
          checked++;
          await page.close();
        }
      } finally {
        await context.close();
      }
    }));

    const report = { checked, failed: failures.length, failures };
    writeFileSync(resolve(reportDir, "results.json"), JSON.stringify(report, null, 2) + "\n");
    console.log(`Storybook runtime: ${checked} rendered, ${failures.length} failed`);
    if (failures.length) {
      for (const failure of failures.slice(0, 30)) {
        console.error(`\n[${failure.id}]\n${failure.issues.join("\n")}`);
      }
      if (failures.length > 30) console.error(`... and ${failures.length - 30} more. See results.json artifact.`);
      process.exitCode = 1;
    }
  } finally {
    await browser?.close();
    server.kill("SIGTERM");
  }
}

run().catch((error) => {
  console.error(error);
  server.kill("SIGTERM");
  process.exitCode = 1;
});
