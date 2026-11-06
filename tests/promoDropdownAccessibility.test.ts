import assert from "node:assert/strict";
import test from "node:test";
import detectPort from "detect-port";
import { chromium, type Browser, type Page } from "playwright";
import { createServer, type ViteDevServer } from "vite";

test("Promo dropdown mounted keyboard and focus interactions", async (t) => {
  let server: ViteDevServer;
  let browser: Browser | undefined;
  let page: Page;

  const port = await detectPort(0);
  server = await createServer({ server: { port } });
  await server.listen();

  t.after(async () => {
    await browser?.close();
    await server?.close();
  });

  browser = await chromium.launch({ headless: true });
  page = await browser.newPage({ viewport: { width: 1280, height: 800 } });

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

    await page.waitForFunction(
      (button) => document.activeElement === button,
      await promoButton().elementHandle(),
    );
    const triggerFocused = await promoButton().evaluate(
      (button) => document.activeElement === button,
    );
    assert.equal(triggerFocused, true, "Focus should return to the Promo trigger itself");
  });

  await t.test("3. Apply closes and restores focus to the Promo trigger", async () => {
    await promoButton().click();
    await promoDialog().waitFor({ state: "visible" });

    await page.locator('input[placeholder="Promo/Group Code"]').fill("  TESTCODE  ");
    await page.locator('button[aria-label="Apply promo code"]').click();
    await promoDialog().waitFor({ state: "hidden" });

    await page.waitForFunction(
      (button) => document.activeElement === button,
      await promoButton().elementHandle(),
    );
    const triggerFocused = await promoButton().evaluate(
      (button) => document.activeElement === button,
    );
    assert.equal(triggerFocused, true, "Apply dismissal should restore Promo trigger focus");
  });

  await t.test("4. Switching sections does not steal focus back to Promo", async () => {
    await promoButton().click();
    await promoDialog().waitFor({ state: "visible" });

    assert.equal(
      await page.locator('input[placeholder="Promo/Group Code"]').inputValue(),
      "TESTCODE",
      "Apply should persist the normalized promo value",
    );

    const guestsButton = page.locator('button:has-text("Guests")').first();
    await guestsButton.click();
    await promoDialog().waitFor({ state: "hidden" });

    const guestsDialog = page.locator('div[role="dialog"][aria-label="Guest selection"]');
    await guestsDialog.waitFor({ state: "visible" });

    const promoStoleFocus = await promoButton().evaluate(
      (button) => document.activeElement === button,
    );
    assert.equal(promoStoleFocus, false, "Promo must not steal focus when switching sections");

    await page.keyboard.press("Escape");
    await guestsDialog.waitFor({ state: "hidden" });
    await page.waitForFunction(
      (button) => document.activeElement === button,
      await guestsButton.elementHandle(),
    );
    assert.equal(
      await guestsButton.evaluate((button) => document.activeElement === button),
      true,
      "Guests dismissal should restore focus to the Guests trigger",
    );
  });

  await t.test("5. Escape does not steal focus from a real external control", async () => {
    await promoButton().click();
    await promoDialog().waitFor({ state: "visible" });

    const propertyButton = page.locator('button:has-text("Property")').first();
    await propertyButton.focus();
    await page.keyboard.press("Escape");
    await promoDialog().waitFor({ state: "hidden" });

    assert.equal(
      await propertyButton.evaluate((button) => document.activeElement === button),
      true,
      "Escape should preserve deliberate focus outside Promo",
    );
  });

  await t.test("6. Escape restores Promo trigger when verification has lost focus to body", async () => {
    await promoButton().click();
    await promoDialog().waitFor({ state: "visible" });

    await page.evaluate(() => {
      (document.activeElement as HTMLElement | null)?.blur();
    });
    assert.equal(
      await page.evaluate(() => document.activeElement === document.body),
      true,
      "Test setup should leave focus on body",
    );

    await page.keyboard.press("Escape");
    await promoDialog().waitFor({ state: "hidden" });
    await page.waitForFunction(
      (button) => document.activeElement === button,
      await promoButton().elementHandle(),
    );
    assert.equal(
      await promoButton().evaluate((button) => document.activeElement === button),
      true,
      "Escape should recover focus to Promo after focus is lost",
    );
  });

  await t.test("7. Escape aborts pending verification, restores focus, and blocks stale dismissal", async () => {
    await page.goto(`http://localhost:${port}/tests/fixtures/promoDropdownHarness.html`);
    await page.waitForLoadState("networkidle");

    const trigger = page.locator('button:has-text("Promo")');
    await trigger.click();

    const dialog = page.locator('div[role="dialog"][aria-label="Promo code entry"]');
    await dialog.waitFor({ state: "visible" });
    await page.locator('button[aria-label="Apply promo code"]').click();

    await page.evaluate(() => {
      (document.activeElement as HTMLElement | null)?.blur();
    });
    assert.equal(
      await page.evaluate(() => document.activeElement === document.body),
      true,
      "Pending verification setup should leave focus on body",
    );

    await page.keyboard.press("Escape");
    await dialog.waitFor({ state: "hidden" });

    await page.waitForFunction(
      () => document.querySelector('[data-testid="aborted"]')?.textContent === "true",
    );
    assert.equal(
      await page.locator('[data-testid="aborted"]').textContent(),
      "true",
      "Escape should abort the pending apply signal",
    );
    await page.waitForFunction(
      (button) => document.activeElement === button,
      await trigger.elementHandle(),
    );

    // Reopen immediately. The old apply promise deliberately ignores abort and
    // resolves later; the stale request guard must not close this new session.
    await trigger.click();
    await dialog.waitFor({ state: "visible" });

    await page.waitForFunction(
      () => document.querySelector('[data-testid="completed"]')?.textContent === "true",
    );
    await page.waitForTimeout(50);

    assert.equal(
      await dialog.isVisible(),
      true,
      "Late completion from the aborted apply must not close the reopened Promo dialog",
    );
    assert.equal(
      await page.locator('[data-testid="close-count"]').textContent(),
      "1",
      "Only the Escape dismissal should have invoked onClose",
    );
  });
});
