import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { normalizeWebflowPolicyLanguage } from "../worker/webflow/policy-language.ts";
import { DEFAULT_POLICY_LANGUAGE, resolvePolicyLanguage } from "../src/types/policy-language.ts";

const source = (path: string) => readFileSync(new URL("../" + path, import.meta.url), "utf8");

test("Webflow policy-language slugs map to all ten presentation fields", () => {
  const language = normalizeWebflowPolicyLanguage({
    id: "example",
    isDraft: false,
    fieldData: {
      "refundable-language": "Free Cancellation",
      "refundable-language-sub-title": "100% Refundable",
      "partially-refundable-language": "Partially Refundable",
      "partially-refundable-language-sub-title": "Cancellation Fee Applies",
      "non-refundable-language": "Non-Refundable",
      "non-refundable-language-sub-title": "Stay Locked",
      "at-time-of-booking": "Due Today",
      "at-time-of-booking-sub-title": "Amount Charged Once Confirmed",
      "next-due-date": "Final Payment",
      "next-due-date-sub-title": "Remaining Amount Due",
    },
  });
  assert.deepEqual(language, {
    refundableLanguage: "Free Cancellation",
    refundableLanguageSubTitle: "100% Refundable",
    partiallyRefundableLanguage: "Partially Refundable",
    partiallyRefundableLanguageSubTitle: "Cancellation Fee Applies",
    nonRefundableLanguage: "Non-Refundable",
    nonRefundableLanguageSubTitle: "Stay Locked",
    atTimeOfBooking: "Due Today",
    atTimeOfBookingSubTitle: "Amount Charged Once Confirmed",
    nextDueDate: "Final Payment",
    nextDueDateSubTitle: "Remaining Amount Due",
  });
});

test("blank labels fall back independently and draft settings are ignored", () => {
  const labels = resolvePolicyLanguage(normalizeWebflowPolicyLanguage({
    isDraft: false,
    fieldData: {
      "refundable-language": "  ",
      "next-due-date": "  Final payment  ",
    },
  }));
  assert.equal(labels.refundableLanguage, DEFAULT_POLICY_LANGUAGE.refundableLanguage);
  assert.equal(labels.nextDueDate, "Final payment");
  assert.deepEqual(normalizeWebflowPolicyLanguage({
    isDraft: true,
    fieldData: { "refundable-language": "Unpublished content" },
  }), {});
});

test("production rate cards use dynamic milestone dates and CMS phase labels", () => {
  const tray = source("src/components/rates/ProductionRateTray.tsx");
  assert.match(tray, /timeline\.phases\.map/);
  assert.match(tray, /phaseHeading\(phase\.kind, language\)/);
  assert.match(tray, /dateTime=\{phase\.end\}/);
  assert.match(tray, /language\.atTimeOfBookingSubTitle/);
  assert.match(tray, /language\.nextDueDateSubTitle/);
  assert.match(source("worker/index.ts"), /return policyLanguage\(\{ env \}\)/);
  for (const path of ["src/journey/PhotoRateStep.tsx", "src/steps/Rates.tsx"]) {
    assert.match(source(path), /policyLanguage=\{policyLanguage\}/);
  }
});
