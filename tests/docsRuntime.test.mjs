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

test("building-icon mask assets resolve under the Pages base path", async () => {
  const server = await serve();
  const browser = await chromium.launch();
  const buildingResponses = [];
  try {
    const address = server.address();
    assert.ok(address && typeof address !== "string");
    const origin = `http://127.0.0.1:${address.port}`;
    const page = await browser.newPage();
    page.on("response", (response) => {
      if (response.url().includes("/assets/icons/buildings/")) buildingResponses.push(response);
    });

    await page.goto(`${origin}${basePath}/components/building-icon/`, { waitUntil: "networkidle" });
    const maskUrls = await page.waitForFunction(() => {
      const urls = [...new Set([...document.querySelectorAll('[role="img"] [aria-hidden="true"]')]
        .map((node) => {
          const style = getComputedStyle(node);
          const value = style.maskImage ?? style.WebkitMaskImage ?? "";
          const match = value.match(/url\("?([^")]+)"?\)/);
          return match?.[1] ?? null;
        })
        .filter(Boolean))];
      return urls.length >= 10 ? urls : null;
    });
    const urls = await maskUrls.jsonValue();
    const paths = urls.map((url) => new URL(url).pathname);
    assert.ok(
      paths.every((path) => path.startsWith(`${basePath}/assets/icons/buildings/`)),
      `base-path building masks: ${paths.join(", ")}`,
    );

    // `networkidle` in goto guarantees all mask requests settled, so the
    // captured responses must cover every URL found in the computed styles.
    const byUrl = new Map(buildingResponses.map((response) => [response.url(), response]));
    for (const path of paths) {
      const url = `${origin}${path}`;
      const response = byUrl.get(url);
      assert.ok(response, `mask asset requested ${url}`);
      assert.equal(response.status(), 200, `mask asset status ${url}`);
      assert.match(response.headers()["content-type"] ?? "", /image\/svg\+xml/, `mask content type ${url}`);
      const body = await response.body();
      assert.ok(body.length > 0, `mask body non-empty ${url}`);
      assert.match(body.toString("utf8"), /<svg[\s>]/, `mask is an SVG ${url}`);
    }
    assert.ok(buildingResponses.length > 0, "building assets were requested");
    assert.deepEqual(
      buildingResponses.filter((response) => response.status() >= 400).map((response) => response.url()),
      [],
    );
  } finally {
    await browser.close();
    await new Promise((done) => server.close(done));
  }
});

const docsAssetPages = [
  { page: "photo-tour-arrow", fragments: ["/assets/icons/ui/ui-arrow-"] },
  { page: "empty-state", fragments: ["/assets/icons/icons-simple/hammock.svg"] },
  {
    page: "match-benefits-card",
    fragments: ["/assets/labels/top_match.svg", "/assets/icons/ui/left_hand_pointing.svg"],
  },
  {
    page: "room-matcher-page",
    // Step 1 renders the dog-toggle artwork; step-2 illustrations are not in the initial view.
    fragments: ["/assets/icons/detailed/dog_friendly.svg"],
  },
];

test("COW-85 inline mask URLs are base-path prefixed and their assets are copied", async () => {
  const cases = [
    { page: "booking-chrome", asset: "assets/brand/logos/Cowboy.svg" },
    { page: "search-bar", asset: "assets/icons/ui/arrow-right.svg" },
    { page: "focus-amenity", asset: "assets/icons/badges/features/wifi_badge.svg" },
    { page: "booking-details", asset: "assets/decoration/backgrounds/background.png" },
  ];
  for (const { page: slug, asset } of cases) {
    const html = await readFile(join(out, "components", slug, "index.html"), "utf8");
    assert.ok(
      html.includes(`${basePath}/${asset}`),
      `${slug} inline URL uses the base path: ${asset}`,
    );
    assert.ok(!html.includes(`url(&quot;/${asset}`), `${slug} has no unprefixed inline URL: ${asset}`);
    assert.equal((await stat(join(out, asset))).isFile(), true, `${asset} copied into the export`);
  }
});

test("documented component images resolve under the Pages base path", async () => {
  const server = await serve();
  const browser = await chromium.launch();
  try {
    const address = server.address();
    assert.ok(address && typeof address !== "string");
    const origin = `http://127.0.0.1:${address.port}`;
    const page = await browser.newPage();
    const failedAssets = [];
    page.on("response", (response) => {
      if (response.url().includes("/assets/") && response.status() >= 400) {
        failedAssets.push(`${response.status()} ${response.url()}`);
      }
    });

    for (const { page: slug, fragments } of docsAssetPages) {
      await page.goto(`${origin}${basePath}/components/${slug}/`, { waitUntil: "networkidle" });
      const sources = await page.$$eval("img", (images) =>
        images.map((image) => image.getAttribute("src")).filter(Boolean));
      const relevant = sources.filter((src) => fragments.some((fragment) => src.includes(fragment)));
      assert.ok(relevant.length > 0, `${slug} rendered expected assets`);
      assert.ok(
        relevant.every((src) => src.startsWith(`${basePath}/assets/`)),
        `${slug} assets are base-path prefixed: ${relevant.join(", ")}`,
      );
      await page.waitForFunction((expected) => expected.every((fragment) =>
        [...document.querySelectorAll("img")].some((image) => {
          const src = image.getAttribute("src") ?? "";
          return src.includes(fragment) && image.complete && image.naturalWidth > 0;
        })), fragments);
    }
    assert.deepEqual(failedAssets, []);
  } finally {
    await browser.close();
    await new Promise((done) => server.close(done));
  }
});

test("static catalog search finds a documented component under the Pages base path", async () => {
  const server = await serve();
  const browser = await chromium.launch();
  try {
    const address = server.address();
    assert.ok(address && typeof address !== "string");
    const origin = `http://127.0.0.1:${address.port}`;
    const page = await browser.newPage();
    const indexResponses = [];
    page.on("response", (response) => {
      if (response.url().endsWith("/search-index.json")) indexResponses.push(response);
    });

    await page.goto(`${origin}${basePath}/components/button/`, { waitUntil: "networkidle" });
    await page.locator('button[data-search-full]').click();
    const dialog = page.locator('[role="dialog"]');
    await dialog.waitFor();
    const input = dialog.locator('input[type="text"], input:not([type])').first();
    await input.fill("dog");
    const result = page.locator('[role="dialog"] [role="option"][id*="dog-toggle-button"]');
    await result.waitFor();
    assert.match(await result.innerText(), /DogToggleButton/);

    // Activating the result must navigate to the base-path-prefixed deep link.
    await result.click();
    await page.waitForURL((url) => url.pathname === `${basePath}/components/dog-toggle-button/`);
    assert.ok(indexResponses.some((response) => response.status() === 200), "search index loaded");
  } finally {
    await browser.close();
    await new Promise((done) => server.close(done));
  }
});

const deepLinks = [
  { path: "/", heading: "Urban Cowboy Component Library" },
  { path: "/components/button/", heading: "Button" },
  { path: "/components/configurable-rate-card/", heading: "ConfigurableRateCard" },
  { path: "/components/room-photo-tour/", heading: "Room Photo Tour" },
  { path: "/components/date-range-picker/", heading: "Date Range Picker" },
];

test("documented deep links render at desktop and mobile widths", async () => {
  const server = await serve();
  const browser = await chromium.launch();
  try {
    const address = server.address();
    assert.ok(address && typeof address !== "string");
    const origin = `http://127.0.0.1:${address.port}`;
    for (const viewport of [{ width: 1280, height: 900 }, { width: 375, height: 812 }]) {
      const page = await browser.newPage({ viewport });
      const notFound = [];
      page.on("response", (response) => {
        if (response.status() === 404 && response.url().startsWith(origin)) notFound.push(response.url());
      });
      for (const { path, heading } of deepLinks) {
        const response = await page.goto(`${origin}${basePath}${path}`, { waitUntil: "networkidle" });
        assert.equal(response?.status(), 200, `${viewport.width}px ${path}`);
        await page.waitForFunction(
          (title) => [...document.querySelectorAll("h1")].some((node) => node.textContent?.includes(title)),
          heading,
        );
        const overflow = await page.evaluate(() =>
          document.documentElement.scrollWidth - document.documentElement.clientWidth);
        assert.ok(overflow <= 1, `${viewport.width}px ${path} has no horizontal overflow (${overflow}px)`);
      }
      assert.deepEqual(notFound, [], `${viewport.width}px no missing assets`);
      await page.close();
    }
  } finally {
    await browser.close();
    await new Promise((done) => server.close(done));
  }
});
