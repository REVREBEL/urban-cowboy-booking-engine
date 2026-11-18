/** Guest client for the flagged D1 site-settings read (COW-68). */

import { parseSiteSettings, type SiteSettings } from "../types/site-settings.ts";

export interface SiteSettingsResponse {
  settings: SiteSettings;
  source: string;
  itemId?: string;
}

/**
 * Returns settings only when the Worker explicitly reports a published D1
 * source. Any other flag/error keeps the Webflow path in control.
 */
export async function fetchPublishedSiteSettings(signal?: AbortSignal): Promise<SiteSettingsResponse | null> {
  try {
    const response = await fetch("/api/content/site-settings", {
      headers: { accept: "application/json" },
      cache: "no-store",
      signal,
    });
    if (!response.ok) return null;
    const body = await response.json() as Partial<SiteSettingsResponse>;
    if (body.source !== "d1") return null;
    const settings = parseSiteSettings(body.settings);
    return settings ? { settings, source: "d1", itemId: body.itemId } : null;
  } catch {
    return null;
  }
}
