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

export interface RoomTypeGroupDefinition {
  key: RoomTypeGroupKey;
  name: string;
  sectionStatus: RoomTypeGroupSectionStatus;
}
