import assert from "node:assert/strict";
import test from "node:test";
import detectPort from "detect-port";
import { chromium, type Browser, type Page } from "playwright";
import { createServer, type ViteDevServer } from "vite";

test("Date dropdown mounted keyboard and focus interactions", async (t) => {
  let server: ViteDevServer;
  let browser: Browser;
  let page: Page;
  let baseUrl: string;

  const port = await detectPort(0);
  server = await createServer({
    server: { port },
  });
  await server.listen();
  baseUrl = `http://localhost:${port}/`;
  browser = await chromium.launch({ headless: true });
  page = await browser.newPage({ viewport: { width: 1280, height: 800 } });

  t.after(async () => {
    await browser?.close();
    await server?.close();
  });

  await page.goto(baseUrl);
  await page.waitForLoadState("networkidle");

  await t.test("1. Focus enters the open date picker dialog on mount", async () => {
    const whenBtn = page.locator('button:has-text("When")').first();
    await whenBtn.click();

    const dialog = page.locator('div[role="dialog"][aria-label="Select dates of stay"]');
    await dialog.waitFor({ state: "visible" });

    const isFocused = await page.evaluate(
      () => document.activeElement === document.querySelector('div[role="dialog"][aria-label="Select dates of stay"]')
    );
    assert.equal(isFocused, true, "Dialog container should receive focus on mount");
  });

  await t.test("2. Correct trigger restoration on normal Escape dismissal", async () => {
    await page.keyboard.press("Escape");
    const dialog = page.locator('div[role="dialog"][aria-label="Select dates of stay"]');
    await dialog.waitFor({ state: "hidden" });

    const isTriggerFocused = await page.evaluate(
      () => document.activeElement && document.activeElement.textContent?.includes("When")
    );
    assert.equal(isTriggerFocused, true, "Focus should restore to When trigger button on Escape");
  });

  await t.test("3. Correct trigger restoration on normal Close button dismissal", async () => {
    const whenBtn = page.locator('button:has-text("When")').first();
    await whenBtn.click();

    const dialog = page.locator('div[role="dialog"][aria-label="Select dates of stay"]');
    await dialog.waitFor({ state: "visible" });

    const closeBtn = page.locator('button[aria-label="Close date picker"]');
    await closeBtn.click();
    await dialog.waitFor({ state: "hidden" });

    const isTriggerFocused = await page.evaluate(
      () => document.activeElement && document.activeElement.textContent?.includes("When")
    );
    assert.equal(isTriggerFocused, true, "Focus should restore to When trigger button after Close click");
  });

  await t.test("4. No focus stealing when switching to another dropdown", async () => {
    const whenBtn = page.locator('button:has-text("When")').first();
    await whenBtn.click();

    const dateDialog = page.locator('div[role="dialog"][aria-label="Select dates of stay"]');
    await dateDialog.waitFor({ state: "visible" });

    // Click Guests section while Dates is open
    const guestsBtn = page.locator('button:has-text("Guests")').first();
    await guestsBtn.click();

    await dateDialog.waitFor({ state: "hidden" });
    const guestsDialog = page.locator('div[role="dialog"][aria-label="Guest selection"]');
    await guestsDialog.waitFor({ state: "visible" });

    // Focus must NOT have been stolen back to the When button
    const isWhenStolen = await page.evaluate(
      () => Boolean(document.activeElement?.textContent?.includes("When"))
    );
    assert.equal(isWhenStolen, false, "Focus must not be stolen back to When trigger when switching to Guests");

    // Close guests dialog before next test
    await page.keyboard.press("Escape");
    await guestsDialog.waitFor({ state: "hidden" });
  });

  await t.test("5. Escape closes even when focus leaves the dialog", async () => {
    const whenBtn = page.locator('button:has-text("When")').first();
    await whenBtn.click();

    const dialog = page.locator('div[role="dialog"][aria-label="Select dates of stay"]');
    await dialog.waitFor({ state: "visible" });

    // Move focus to another element on the page (e.g. Property button) while date dialog remains open
    const propertyBtn = page.locator('button:has-text("Property")').first();
    await propertyBtn.focus();

    // Press Escape from outside the dialog
    await page.keyboard.press("Escape");
    await dialog.waitFor({ state: "hidden" });

    assert.equal(await dialog.isVisible(), false, "Date dialog should close on Escape even if focus moved outside");
  });
});
