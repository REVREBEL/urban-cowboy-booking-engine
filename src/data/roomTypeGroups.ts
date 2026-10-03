import type { RoomTypeGroupDefinition, RoomTypeGroupKey } from "@/types/accommodations";

/**
 * Canonical Room Type Group registry.
 *
 * Mews does not provide this hierarchy. These groups organize Mews Room Types
 * into the higher-level Catskills lodging experience.
 *
 * coreProximity and privacyLevel are Cowboy-owned merchandising attributes.
 * They intentionally live at the Room Type Group layer because they describe
 * the setting of the group, not a physical amenity of an individual room.
 */
export const ROOM_TYPE_GROUPS: readonly RoomTypeGroupDefinition[] = [
  {
    key: "alpine",
    name: "Alpine Haus",
    sectionStatus: "designed",
    coreProximity: "near-core",
    privacyLevel: "standard",
  },
  {
    key: "walden",
    name: "Walden Haus",
    sectionStatus: "designed",
    coreProximity: "away-from-core",
    privacyLevel: "enhanced",
  },
  {
    key: "lodge",
    name: "The Lodge",
    sectionStatus: "designed",
    coreProximity: "core",
    privacyLevel: "standard",
  },
  {
    key: "forest-house",
    name: "Forest House",
    sectionStatus: "pending",
    coreProximity: "unknown",
    privacyLevel: "unknown",
  },
  {
    key: "cabin",
    name: "Cabin",
    sectionStatus: "pending",
    coreProximity: "away-from-core",
    privacyLevel: "enhanced",
  },
  {
    key: "chalet",
    name: "Chalet",
    sectionStatus: "pending",
    coreProximity: "away-from-core",
    privacyLevel: "enhanced",
  },
  {
    key: "opas",
    name: "Opa's",
    sectionStatus: "pending",
    coreProximity: "away-from-core",
    privacyLevel: "enhanced",
  },
  {
    key: "slide-mountain",
    name: "Slide Mountain Haus",
    sectionStatus: "pending",
    coreProximity: "away-from-core",
    privacyLevel: "enhanced",
  },
  {
    key: "mountain-view",
    name: "Mountain View Haus",
    sectionStatus: "pending",
    coreProximity: "away-from-core",
    privacyLevel: "enhanced",
  },
] as const;

export const ROOM_TYPE_GROUP_BY_KEY = new Map(
  ROOM_TYPE_GROUPS.map((group) => [group.key, group] as const),
);

export function roomTypeGroupName(key: string | null | undefined): string {
  if (!key) return "Catskills";
  return ROOM_TYPE_GROUP_BY_KEY.get(key as RoomTypeGroupKey)?.name ?? key;
}

export function roomTypeGroupSupportsMinimalDistractions(
  key: string | null | undefined,
): boolean {
  if (!key) return false;
  const group = ROOM_TYPE_GROUP_BY_KEY.get(key as RoomTypeGroupKey);
  return (
    group?.coreProximity === "away-from-core" &&
    group.privacyLevel === "enhanced"
  );
}
