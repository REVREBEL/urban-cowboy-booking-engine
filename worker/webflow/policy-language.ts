import { json, type Env } from "../mews/_lib.ts";
import type { PolicyLanguage } from "../../src/types/policy-language.ts";

type Item = {
  id?: string;
  isArchived?: boolean;
  isDraft?: boolean;
  fieldData?: Record<string, unknown>;
};
const WEBFLOW_API = "https://api.webflow.com/v2";
const text = (value: unknown) => typeof value === "string" ? value.trim() : "";

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

export function normalizeWebflowPolicyLanguage(item: Item): Partial<PolicyLanguage> {
  if (item.isDraft || item.isArchived) return {};
  const fields = item.fieldData ?? {};
  const result: Partial<PolicyLanguage> = {};
  for (const [key, slug] of Object.entries(FIELDS) as Array<[keyof PolicyLanguage, string]>) {
    const value = text(fields[slug]);
    if (value) result[key] = value;
  }
  return result;
}

export async function onRequestGet({ env }: { env: Env }): Promise<Response> {
  const collectionId = env.WEBFLOW_CONTENT_SETTINGS_COLLECTION_ID;
  const itemId = env.WEBFLOW_POLICY_LANGUAGE_ITEM_ID;
  if (!env.WEBFLOW_CMS_API_TOKEN || !collectionId || !itemId) {
    return json({ language: {} }, 200, "no-store");
  }
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);
  try {
    // Read the single published item, not staged/draft editing content.
    const url = `${WEBFLOW_API}/collections/${encodeURIComponent(collectionId)}/items/${encodeURIComponent(itemId)}/live`;
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${env.WEBFLOW_CMS_API_TOKEN}`,
        Accept: "application/json",
      },
      signal: controller.signal,
    });
    if (!response.ok) throw new Error(`webflow_${response.status}`);
    const item = await response.json<Item>();
    if (item.id !== itemId) throw new Error("webflow_policy_item_mismatch");
    return json({ language: normalizeWebflowPolicyLanguage(item) }, 200, "public, max-age=60, s-maxage=300");
  } catch (error) {
    console.warn("[webflow policy-language] published content unavailable", error instanceof Error ? error.message : "unknown");
    return json({ language: {} }, 200, "no-store");
  } finally {
    clearTimeout(timeout);
  }
}
