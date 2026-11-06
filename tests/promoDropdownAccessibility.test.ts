import assert from "node:assert/strict";
import test from "node:test";
import detectPort from "detect-port";
import { chromium, type Browser, type Page } from "playwright";
import { createServer, type ViteDevServer } from "vite";

test("Promo dropdown mounted keyboard and focus interactions", async (t) => {
  let server: ViteDevServer;
  let browser: Browser;
  let page: Page;

  const port = await detectPort(0);
  server = await createServer({ server: { port } });
  await server.listen();
  browser = await chromium.launch({ headless: true });
  page = await browser.newPage({ viewport: { width: 1280, height: 800 } });

  t.after(async () => {
    await browser?.close();
    await server?.close();
  });

  await page.goto(`http://localhost:${port}/`);
  await page.waitForLoadState("networkidle");

  const promoButton = () => page.locator('button:has-text("Promo")').first();
  const promoDialog = () =>
    page.locator('div[role="dialog"][aria-label="Promo code entry"]');

  await t.test("1. Input focus and dialog focusability are applied on mount", async () => {
    await promoButton().click();
    const dialog = promoDialog();
    await dialog.waitFor({ state: "visible" });

    assert.equal(await dialog.getAttribute("tabindex"), "-1");
    const inputIsFocused = await page.evaluate(
      () =>
        document.activeElement ===
        document.querySelector('input[placeholder="Promo/Group Code"]'),
    );
    assert.equal(inputIsFocused, true, "Promo input should receive focus on mount");
  });

  await t.test("2. Escape restores focus to the actual Promo trigger", async () => {
    await page.keyboard.press("Escape");
    await promoDialog().waitFor({ state: "hidden" });

    const triggerFocused = await page.evaluate(
      () => document.activeElement?.textContent?.includes("Promo") ?? false,
    );
    assert.equal(triggerFocused, true, "Focus should return to the Promo trigger");
  });

  await t.test("3. Switching sections does not steal focus back to Promo", async () => {
    await promoButton().click();
    await promoDialog().waitFor({ state: "visible" });

    const guestsButton = page.locator('button:has-text("Guests")').first();
    await guestsButton.click();
    await promoDialog().waitFor({ state: "hidden" });

    const guestsDialog = page.locator('div[role="dialog"][aria-label="Guest selection"]');
    await guestsDialog.waitFor({ state: "visible" });

    const promoStoleFocus = await page.evaluate(
      () => document.activeElement?.textContent?.includes("Promo") ?? false,
    );
    assert.equal(promoStoleFocus, false, "Promo must not steal focus when switching sections");

    await page.keyboard.press("Escape");
    await guestsDialog.waitFor({ state: "hidden" });
  });

  await t.test("4. Escape closes even when focus has moved outside the dialog", async () => {
    await promoButton().click();
    await promoDialog().waitFor({ state: "visible" });

    await page.locator('button:has-text("Property")').first().focus();
    await page.keyboard.press("Escape");
    await promoDialog().waitFor({ state: "hidden" });

    assert.equal(await promoDialog().isVisible(), false);
  });
});
