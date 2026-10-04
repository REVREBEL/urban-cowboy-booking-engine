import type { RoomTypeGroupDefinition, RoomTypeGroupKey } from "@/types/accommodations";

/**
 * Canonical Room Type Group registry.
 *
 * Mews does not provide this hierarchy. These groups organize Mews Room Types
 * into the higher-level Catskills lodging experience.
 *
 * Registry order is the canonical guest-facing presentation order.
 * distanceFromLodgeFeet is independent metadata calculated from the property
 * KML coordinates, using The Main Lodge as origin.
 *
 * coreProximity and privacyLevel are Cowboy-owned merchandising attributes.
 * They describe the setting of the group, not a physical amenity of a room.
 */
export const ROOM_TYPE_GROUPS: readonly RoomTypeGroupDefinition[] = [
  {
    key: "alpine",
    name: "Alpine Haus",
    sectionStatus: "designed",
    distanceFromLodgeFeet: 288,
    coreProximity: "near-core",
    privacyLevel: "standard",
  },
  {
    key: "walden",
    name: "Walden Haus",
    sectionStatus: "designed",
    distanceFromLodgeFeet: 156,
    coreProximity: "near-core",
    privacyLevel: "standard",
  },
  {
    key: "lodge",
    name: "The Lodge",
    sectionStatus: "designed",
    distanceFromLodgeFeet: 0,
    coreProximity: "core",
    privacyLevel: "standard",
  },
  {
    key: "forest-house",
    name: "Forest House",
    sectionStatus: "designed",
    distanceFromLodgeFeet: 1668,
    coreProximity: "away-from-core",
    privacyLevel: "enhanced",
  },
  {
    key: "cabin",
    name: "The Cabin",
    sectionStatus: "designed",
    distanceFromLodgeFeet: 183,
    coreProximity: "near-core",
    privacyLevel: "standard",
  },
  {
    key: "chalet",
    name: "Chalet",
    sectionStatus: "designed",
    distanceFromLodgeFeet: 162,
    coreProximity: "near-core",
    privacyLevel: "standard",
  },
  {
    key: "opas",
    name: "Opa's Cabin",
    sectionStatus: "designed",
    distanceFromLodgeFeet: 1844,
    coreProximity: "away-from-core",
    privacyLevel: "enhanced",
  },
  {
    key: "slide-mountain",
    name: "Slide Mountain Haus",
    sectionStatus: "designed",
    distanceFromLodgeFeet: 1323,
    coreProximity: "away-from-core",
    privacyLevel: "enhanced",
  },
  {
    key: "mountain-view",
    name: "Mountain View Haus",
    sectionStatus: "designed",
    distanceFromLodgeFeet: 1262,
    coreProximity: "away-from-core",
    privacyLevel: "enhanced",
  },
] as const;

export const ROOM_TYPE_GROUP_BY_KEY = new Map(
  ROOM_TYPE_GROUPS.map((group) => [group.key, group] as const),
);

export const MINIMAL_DISTRACTIONS_DISTANCE_FEET = 1000;

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
    !!group &&
    group.distanceFromLodgeFeet >= MINIMAL_DISTRACTIONS_DISTANCE_FEET &&
    group.coreProximity === "away-from-core" &&
    group.privacyLevel === "enhanced"
  );
}
