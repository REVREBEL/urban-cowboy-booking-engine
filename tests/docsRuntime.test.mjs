// COW-70: verify documented components still load their assets after hydration
// when the Fumadocs export is served under the configured GitHub Pages base path.
import assert from "node:assert/strict";
import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { extname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";
import { chromium } from "playwright";
import { resolveDocsBasePath } from "../scripts/fumadocs/base-path.mjs";

const root = resolve(fileURLToPath(new URL("..", import.meta.url)));
const out = join(root, "docs-app", "out");
const basePath = resolveDocsBasePath();
const types = {
  ".html": "text/html; charset=utf-8",
  ".svg": "image/svg+xml",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json",
};

async function serve() {
  const server = createServer(async (req, res) => {
    const pathname = decodeURIComponent(new URL(req.url, "http://localhost").pathname);
    const relative = pathname.startsWith(basePath) ? pathname.slice(basePath.length) : pathname;
    let file = join(out, relative || "/");
    try {
      if ((await stat(file)).isDirectory()) file = join(file, "index.html");
      const body = await readFile(file);
      res.writeHead(200, { "content-type": types[extname(file)] ?? "application/octet-stream" });
      res.end(body);
    } catch {
      res.writeHead(404, { "content-type": "text/plain" });
      res.end("not found");
    }
  });
  await new Promise((done) => server.listen(0, "127.0.0.1", done));
  return server;
}

async function assertIconsLoaded(page) {
  await page.waitForFunction(() => {
    const images = [...document.querySelectorAll('button[aria-pressed] img')];
    return images.length === 2 && images.every((img) => img.complete && img.naturalWidth > 0);
  });
  const sources = await page.$$eval('button[aria-pressed] img', (images) =>
    images.map((img) => img.getAttribute("src")),
  );
  assert.ok(sources.every((src) => src?.startsWith(`${basePath}/assets/icons/`)), `base-path icon sources: ${sources.join(", ")}`);
}

test("dog-toggle icons load under the Pages base path before and after toggling", async () => {
  const server = await serve();
  const browser = await chromium.launch();
  const failedAssets = [];
  try {
    const address = server.address();
    assert.ok(address && typeof address !== "string");
    const origin = `http://127.0.0.1:${address.port}`;
    const page = await browser.newPage();
    page.on("response", (response) => {
      if (response.url().includes("dog_friendly.svg") && response.status() >= 400) {
        failedAssets.push(`${response.status()} ${response.url()}`);
      }
    });

    await page.goto(`${origin}${basePath}/components/dog-toggle-button/`, { waitUntil: "networkidle" });
    const button = page.locator("button[aria-pressed]").first();
    await button.waitFor();
    await assertIconsLoaded(page);
    assert.equal(await button.getAttribute("aria-pressed"), "false");

    await button.click();
    assert.equal(await button.getAttribute("aria-pressed"), "true");
    await assertIconsLoaded(page);
    assert.deepEqual(failedAssets, []);
  } finally {
    await browser.close();
    await new Promise((done) => server.close(done));
  }
});

test("building-icon mask assets use the Pages base path after hydration", async () => {
  const server = await serve();
  const browser = await chromium.launch();
  const failedAssets = [];
  try {
    const address = server.address();
    assert.ok(address && typeof address !== "string");
    const origin = `http://127.0.0.1:${address.port}`;
    const page = await browser.newPage();
    page.on("response", (response) => {
      if (response.url().includes("/assets/icons/buildings/") && response.status() >= 400) {
        failedAssets.push(`${response.status()} ${response.url()}`);
      }
    });

    await page.goto(`${origin}${basePath}/components/building-icon/`, { waitUntil: "networkidle" });
    const masks = await page.waitForFunction(() => {
      const values = [...document.querySelectorAll('[role="img"] [aria-hidden="true"]')]
        .map((node) => getComputedStyle(node).maskImage ?? getComputedStyle(node).WebkitMaskImage)
        .filter((value) => value && value !== "none");
      return values.length > 0 ? values : null;
    });
    const values = await masks.jsonValue();
    assert.ok(
      values.every((value) => value.includes(`${basePath}/assets/icons/buildings/`)),
      `base-path building masks: ${values.join(", ")}`,
    );
    assert.deepEqual(failedAssets, []);
  } finally {
    await browser.close();
    await new Promise((done) => server.close(done));
  }
});
