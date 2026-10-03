/**
 * Canonical lodging-domain terminology.
 *
 * Mews transport terminology is translated at the integration/shaping boundary.
 * "Space" is intentionally reserved for non-lodging rentable/function areas.
 */

export type RoomInventoryKind = "physical-room" | "component-room";

export type RoomTypeGroupKey =
  | "alpine"
  | "walden"
  | "lodge"
  | "forest-house"
  | "cabin"
  | "chalet"
  | "opas"
  | "slide-mountain"
  | "mountain-view";

export type RoomTypeGroupSectionStatus = "designed" | "pending";

export type CoreProximity =
  | "core"
  | "near-core"
  | "away-from-core"
  | "unknown";

export type PrivacyLevel =
  | "standard"
  | "enhanced"
  | "unknown";

export interface RoomTypeGroupDefinition {
  key: RoomTypeGroupKey;
  name: string;
  sectionStatus: RoomTypeGroupSectionStatus;
  coreProximity: CoreProximity;
  privacyLevel: PrivacyLevel;
}
