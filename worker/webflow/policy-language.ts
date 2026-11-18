import { json, type Env } from "../mews/_lib.ts";
import { normalizePolicyLanguage, type PolicySourceItem } from "../policy-language.ts";

type Item = PolicySourceItem & { id?: string };
const WEBFLOW_API = "https://api.webflow.com/v2";

/** Kept as the public Webflow-facing name; normalization is shared with D1. */
export const normalizeWebflowPolicyLanguage = normalizePolicyLanguage;

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
