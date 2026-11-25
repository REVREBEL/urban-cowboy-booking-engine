import assert from "node:assert/strict";
import test from "node:test";
import detectPort from "detect-port";
import { chromium, type Browser, type Page } from "playwright";
import { createServer, type ViteDevServer } from "vite";

const hotelFixture = {
  ImageBaseUrl: "",
  Id: "fixture-hotel",
  Name: { en: "Urban Cowboy" },
  Description: null,
  DefaultCurrencyCode: "USD",
  RoomCategories: [],
  Products: [],
  PaymentGateway: null,
};

const cases: Array<{ name: string; slug: string; check: (page: Page) => Promise<void> }> = [
  {
    name: "rate selection",
    slug: "rate-selection",
    check: async (page) => {
      await page.getByTestId("rate-selection").waitFor();
      await page.getByText("Select a Rate", { exact: true }).waitFor();
      await page.getByText("Alpine Bathing Suite", { exact: true }).first().waitFor();
    },
  },
  {
    name: "production rate tray and details",
    slug: "production-rate-tray",
    check: async (page) => {
      await page.getByTestId("production-rate-tray").waitFor();
      await page.getByRole("button", { name: /view details/i }).first().click();
      const dialog = page.getByRole("dialog");
      await dialog.waitFor();
      await dialog.getByRole("heading", { name: /stay pricing/i }).waitFor();
      await dialog.getByRole("heading", { name: /policy & deposit timeline/i }).waitFor();
    },
  },
  {
    name: "room detail gallery",
    slug: "room-detail",
    check: async (page) => {
      const dialog = page.getByRole("dialog");
      await dialog.waitFor();
      await dialog.getByRole("heading", { name: "Alpine Bathing Suite" }).waitFor();
      await dialog.getByRole("button", { name: /next photo/i }).click();
      await dialog.getByText("Photo 2 of 2", { exact: true }).waitFor();
    },
  },
  {
    name: "building room list",
    slug: "rooms-list-building",
    check: async (page) => {
      await page.getByRole("heading", { name: "Alpine Haus", exact: true }).waitFor();
      await page.getByText("Alpine Bathing Suite", { exact: true }).first().waitFor();
    },
  },
  {
    name: "checkout shell, summary and footer",
    slug: "checkout",
    check: async (page) => {
      await page.getByRole("heading", { name: "Guest details" }).waitFor();
      await page.getByLabel("Fixture guest field").waitFor();
      await page.getByText(/All rights reserved/).waitFor();
    },
  },
  {
    name: "extras card and customizer",
    slug: "extras",
    check: async (page) => {
      await page.getByRole("button", { name: "Add Estonian Sauna Session to stay" }).click();
      const dialog = page.getByRole("dialog");
      await dialog.waitFor();
      await dialog.getByRole("heading", { name: "Estonian Sauna Session" }).waitFor();
    },
  },
  {
    name: "brand and woodcut artwork",
    slug: "brand",
    check: async (page) => {
      await page.getByTestId("brand-artwork").waitFor();
      await page.getByRole("img", { name: "Urban Cowboy" }).waitFor();
      await page.getByAltText("Copper Clawfoot Soaking Tub").waitFor();
      await page.locator('svg[aria-label="Bed icon"]').waitFor();
      const brokenImages = await page.locator("img").evaluateAll((images) =>
        images
          .filter((image) => !image.complete || image.naturalWidth === 0)
          .map((image) => image.getAttribute("src")),
      );
      assert.deepEqual(brokenImages, []);
    },
  },
];

test("production component runtime fixtures render without browser errors", async (t) => {
  const port = await detectPort(0);
  let server: ViteDevServer;
  let browser: Browser;

  server = await createServer({
    logLevel: "silent",
    cacheDir: "node_modules/.vite-production-component-runtime",
    server: { port },
  });
  await server.listen();
  browser = await chromium.launch({ headless: true });

  t.after(async () => {
    await browser?.close();
    await server?.close();
  });

  for (const runtimeCase of cases) {
    await t.test(runtimeCase.name, async () => {
      const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
      const errors: string[] = [];
      page.on("console", (message) => {
        if (message.type() === "error") errors.push(message.text());
      });
      page.on("pageerror", (error) => errors.push(error.message));
      await page.route("**/api/mews/hotel?*", (route) =>
        route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(hotelFixture) }),
      );
      await page.route("**/api/content/locations?*", (route) =>
        route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ locations: {} }) }),
      );

      try {
        await page.goto(`http://localhost:${port}/tests/fixtures/production-components.html?case=${runtimeCase.slug}`);
        await runtimeCase.check(page);
        assert.deepEqual(errors, [], `browser errors in ${runtimeCase.name}`);
      } catch (error) {
        const body = await page.locator("body").innerText().catch(() => "");
        throw new Error(`${runtimeCase.name} failed: ${error instanceof Error ? error.message : String(error)}\nBrowser errors: ${errors.join("\n") || "none"}\nPage text: ${body.slice(0, 2000)}`);
      } finally {
        await page.close();
      }
    });
  }
});
