/** Pure helpers for the admin Settings form (COW-68). */

import type { SiteSettings } from "../types/site-settings.ts";

export const SITE_SETTING_FIELDS: ReadonlyArray<{ key: keyof SiteSettings; label: string }> = [
  { key: "productionLayout", label: "Guest booking layout" },
  { key: "demoLayout", label: "Studio default layout" },
  { key: "enableDemoEngine", label: "Booking Studio enabled" },
  { key: "enableEventDatesQuickSelection", label: "Event date shortcuts" },
  { key: "enableFeatureSection", label: "Location feature stories" },
];

/** Publish must never release an older persisted revision over unsaved edits. */
export function hasUnsavedChanges(form: SiteSettings, working: SiteSettings | null): boolean {
  return !!working && SITE_SETTING_FIELDS.some(({ key }) => form[key] !== working[key]);
}
