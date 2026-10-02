import type { RoomTypeGroupDefinition, RoomTypeGroupKey } from "@/types/accommodations";

/**
 * Canonical Room Type Group registry.
 *
 * Mews does not provide this hierarchy. These groups organize Mews Room Types
 * into the higher-level Catskills lodging experience.
 *
 * Rich editorial content for the three completed group sections still lives in
 * hotelData.ts temporarily. That content can move to Webflow CMS without changing
 * these stable keys.
 */
export const ROOM_TYPE_GROUPS: readonly RoomTypeGroupDefinition[] = [
  { key: "alpine", name: "Alpine Haus", sectionStatus: "designed" },
  { key: "walden", name: "Walden Haus", sectionStatus: "designed" },
  { key: "lodge", name: "The Lodge", sectionStatus: "designed" },
  { key: "forest-house", name: "Forest House", sectionStatus: "pending" },
  { key: "cabin", name: "Cabin", sectionStatus: "pending" },
  { key: "chalet", name: "Chalet", sectionStatus: "pending" },
  { key: "opas", name: "Opa's", sectionStatus: "pending" },
  { key: "slide-mountain", name: "Slide Mountain Haus", sectionStatus: "pending" },
  { key: "mountain-view", name: "Mountain View Haus", sectionStatus: "pending" },
] as const;

export const ROOM_TYPE_GROUP_BY_KEY = new Map(
  ROOM_TYPE_GROUPS.map((group) => [group.key, group] as const),
);

export function roomTypeGroupName(key: string | null | undefined): string {
  if (!key) return "Catskills";
  return ROOM_TYPE_GROUP_BY_KEY.get(key as RoomTypeGroupKey)?.name ?? key;
}
