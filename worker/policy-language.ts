// Shared policy-language normalization (COW-39).
// Both the Webflow handler and the D1 adapter map the same published source
// shape to the app's PolicyLanguage fields.
import type { PolicyLanguage } from "../src/types/policy-language.ts";

export interface PolicySourceItem {
  id?: unknown;
  isArchived?: unknown;
  isDraft?: unknown;
  fieldData?: Record<string, unknown>;
}

const FIELDS = {
  refundableLanguage: "refundable-language",
  refundableLanguageSubTitle: "refundable-language-sub-title",
  partiallyRefundableLanguage: "partially-refundable-language",
  partiallyRefundableLanguageSubTitle: "partially-refundable-language-sub-title",
  nonRefundableLanguage: "non-refundable-language",
  nonRefundableLanguageSubTitle: "non-refundable-language-sub-title",
  atTimeOfBooking: "at-time-of-booking",
  atTimeOfBookingSubTitle: "at-time-of-booking-sub-title",
  nextDueDate: "next-due-date",
  nextDueDateSubTitle: "next-due-date-sub-title",
} as const;

const text = (value: unknown): string => typeof value === "string" ? value.trim() : "";

export function normalizePolicyLanguage(item: PolicySourceItem): Partial<PolicyLanguage> {
  if (item.isDraft === true || item.isArchived === true) return {};
  // Webflow API nests fields; imported D1 revisions keep the flat source row.
  const fields = item.fieldData ?? (item as unknown as Record<string, unknown>);
  const result: Partial<PolicyLanguage> = {};
  for (const [key, slug] of Object.entries(FIELDS) as Array<[keyof PolicyLanguage, string]>) {
    const value = text(fields[slug]);
    if (value) result[key] = value;
  }
  return result;
}

export const POLICY_LANGUAGE_FIELDS = Object.keys(FIELDS) as (keyof PolicyLanguage)[];
