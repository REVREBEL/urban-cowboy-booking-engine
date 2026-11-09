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

test("production rate cards render live milestones and CMS language through Figma components", () => {
  const tray = source("src/components/rates/FigmaProductionRateTray.tsx");
  const presentation = source("src/components/rates/FigmaRateComponents.tsx");
  assert.match(tray, /timelineForRate\(rate, config, checkIn\)/);
  assert.match(tray, /phaseHeading\(timeline.currentPhase, language\)/);
  assert.match(tray, /language=\{language\}/);
  assert.match(presentation, /timeline.phases.map/);
  assert.match(presentation, /dateTime=\{phase.start\}/);
  assert.match(presentation, /language\?\.refundableLanguage/);
  assert.match(presentation, /language\?\.partiallyRefundableLanguage/);
  assert.match(presentation, /language\?\.nonRefundableLanguage/);
  assert.match(presentation, /language\?\.atTimeOfBookingSubTitle/);
  assert.match(presentation, /language\?\.nextDueDateSubTitle/);
  assert.match(source("worker/index.ts"), /return policyLanguage\(\{ env \}\)/);
  for (const path of ["src/journey/PhotoRateStep.tsx", "src/steps/Rates.tsx"]) {
    assert.match(source(path), /policyLanguage=\{policyLanguage\}/);
  }
});
