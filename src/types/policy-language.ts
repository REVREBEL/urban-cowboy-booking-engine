/** Published Webflow Content Settings / policy-language editorial copy. */
export interface PolicyLanguage {
  refundableLanguage: string;
  refundableLanguageSubTitle: string;
  partiallyRefundableLanguage: string;
  partiallyRefundableLanguageSubTitle: string;
  nonRefundableLanguage: string;
  nonRefundableLanguageSubTitle: string;
  atTimeOfBooking: string;
  atTimeOfBookingSubTitle: string;
  nextDueDate: string;
  nextDueDateSubTitle: string;
}

export const DEFAULT_POLICY_LANGUAGE: PolicyLanguage = {
  refundableLanguage: "Full refund",
  refundableLanguageSubTitle: "Cancel and get your deposit back",
  partiallyRefundableLanguage: "Deposit kept",
  partiallyRefundableLanguageSubTitle: "Cancellation fee applies",
  nonRefundableLanguage: "Nothing back",
  nonRefundableLanguageSubTitle: "Stay is fully paid and locked",
  atTimeOfBooking: "Due today",
  atTimeOfBookingSubTitle: "Amount charged once confirmed",
  nextDueDate: "Final payment",
  nextDueDateSubTitle: "Remaining amount due",
};

/** Empty CMS fields fall back independently, never blank an existing label. */
export function resolvePolicyLanguage(values?: Partial<PolicyLanguage> | null): PolicyLanguage {
  const result = { ...DEFAULT_POLICY_LANGUAGE };
  if (!values) return result;
  for (const key of Object.keys(result) as (keyof PolicyLanguage)[]) {
    const value = values[key]?.trim();
    if (value) result[key] = value;
  }
  return result;
}
