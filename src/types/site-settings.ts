/** Typed property-scoped site settings (COW-68). */
import { z } from "zod";

export const SITE_SETTINGS_KIND = "site_settings";
export const SITE_SETTINGS_SLUG = "site-settings";
export const PRODUCTION_PHOTO_LAYOUT_OPTION = "f4859a16a8556038b0f026679aaa6a02";
export const DEMO_PHOTO_LAYOUT_OPTION = "2142905a00c88401810632b026107cf2";

export const layoutSchema = z.enum(["card", "photo"]);
export const siteSettingsSchema = z.object({
  productionLayout: layoutSchema,
  demoLayout: layoutSchema,
  enableDemoEngine: z.boolean(),
  enableEventDatesQuickSelection: z.boolean(),
  enableFeatureSection: z.boolean(),
});
export type SiteSettings = z.infer<typeof siteSettingsSchema>;

/** Guest-safe defaults: the current legacy behavior (Card, Studio off). */
export const DEFAULT_SITE_SETTINGS: SiteSettings = Object.freeze({
  productionLayout: "card",
  demoLayout: "card",
  enableDemoEngine: false,
  enableEventDatesQuickSelection: false,
  enableFeatureSection: false,
});

/** Validates a stored payload; incomplete data is never silently patched. */
export function parseSiteSettings(value: unknown): SiteSettings | null {
  const result = siteSettingsSchema.safeParse(value);
  return result.success ? result.data : null;
}

/** Mirrors the published Webflow field semantics exactly. */
export function siteSettingsFromWebflow(fields: Record<string, unknown>): SiteSettings | null {
  const required = [
    "production-layout", "demo-layout", "enable-demo-engine",
    "enable-event-dates-quick-selection", "enable-feature-section",
  ];
  if (required.some((key) => !(key in fields))) return null;
  const candidate = {
    productionLayout: fields["production-layout"] === PRODUCTION_PHOTO_LAYOUT_OPTION ? "photo" : "card",
    demoLayout: fields["demo-layout"] === DEMO_PHOTO_LAYOUT_OPTION ? "photo" : "card",
    enableDemoEngine: fields["enable-demo-engine"] === true,
    enableEventDatesQuickSelection: fields["enable-event-dates-quick-selection"] === true,
    enableFeatureSection: fields["enable-feature-section"] === true,
  };
  return parseSiteSettings(candidate);
}
