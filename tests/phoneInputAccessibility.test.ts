import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";

const file = (path: string) =>
  readFileSync(new URL(`../src/${path}`, import.meta.url), "utf8");

test("PhoneInput exposes explicit names and keyboard focus for both controls", () => {
  const phone = file("components/forms/phone-input.tsx");
  const i18n = file("i18n.ts");

  assert.match(phone, /aria-label=\{t\("phone\.countryCode"\)\}/);
  assert.match(phone, /aria-label=\{t\("phone\.number"\)\}/);
  assert.match(phone, /focus-visible:ring-2/);
  assert.match(i18n, /"phone\.number": \{ fr: "Numéro de téléphone", en: "Phone number" \}/);
});
