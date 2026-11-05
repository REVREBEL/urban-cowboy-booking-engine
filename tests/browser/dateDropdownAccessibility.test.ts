import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { chromium } from "playwright";
import { createServer } from "vite";

test("Dates dropdown focus and Escape interactions", { timeout: 45000 }, async (t) => {
  const server = await createServer({ server: { host: "127.0.0.1", port: 0, strictPort: false } });
  let browser;
  try {
    await server.listen();
    const address = server.httpServer?.address();
    assert.ok(address && typeof address === "object");
    browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();
    page.setDefaultTimeout(7000);
    await page.goto(`http://127.0.0.1:${address.port}/tests/fixtures/date-dropdown.html`);
    const when = page.getByRole("button", { name: /When/i });
    const guests = page.getByRole("button", { name: /Guests/i });
    const property = page.getByRole("button", { name: /Property/i });
    const datesDialog = page.getByRole("dialog", { name: "Select dates of stay" });

    await t.test("focus enters the dialog and Escape restores the exact trigger", async () => {
      await when.click();
      await datesDialog.waitFor({ state: "visible" });
      assert.equal(await datesDialog.evaluate(el => el === document.activeElement), true);
      await page.keyboard.press("Escape");
      await datesDialog.waitFor({ state: "hidden" });
      assert.equal(await when.evaluate(el => el === document.activeElement), true);
    });

    await t.test("Close button restores focus to When", async () => {
      await when.click();
      await datesDialog.waitFor({ state: "visible" });
      await page.getByRole("button", { name: "Close date picker" }).click();
      await datesDialog.waitFor({ state: "hidden" });
      assert.equal(await when.evaluate(el => el === document.activeElement), true);
    });

    await t.test("switching to Guests never steals focus back to When", async () => {
      await when.click();
      await datesDialog.waitFor({ state: "visible" });
      await guests.click();
      await datesDialog.waitFor({ state: "hidden" });
      await page.getByRole("dialog", { name: "Guest selection" }).waitFor({ state: "visible" });
      assert.equal(await when.evaluate(el => el === document.activeElement), false);
      await guests.click();
    });

    await t.test("Escape from a different search button closes Dates without stealing focus", async () => {
      await when.click();
      await datesDialog.waitFor({ state: "visible" });
      await property.focus();
      await page.keyboard.press("Escape");
      await datesDialog.waitFor({ state: "hidden" });
      assert.equal(await property.evaluate(el => el === document.activeElement), true);
    });

    await t.test("production Dates and PhotoArrival pass an explicit trigger ref", () => {
      for (const path of ["src/steps/Dates.tsx", "src/journey/PhotoArrival.tsx"]) {
        const source = readFileSync(path, "utf8");
        assert.match(source, /dateTriggerRef=\{datesTriggerRef\}/);
        assert.match(source, /triggerRef=\{datesTriggerRef\}/);
      }
    });
  } finally {
    await browser?.close();
    await server.close();
  }
});
