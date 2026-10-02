import type { RoomTypeGroupKey } from "./accommodations";

export type PartyType = "partner" | "friends" | "family" | "solo";
export type MatchInterest = "iconTub" | "outdoorSoak" | "ownPlace" | "scenic" | "simpleCozy";
export type DogPolicy = "allowed" | "notAllowed" | "unknown";
export type AgePolicy = "adultsOnly21" | "adult21Required" | "none";

export type RecommendationPreferences = {
  party: PartyType;
  dog: boolean;
  interests: [MatchInterest, MatchInterest?];
};

export type RoomFeatureKey =
  | "indoorTub"
  | "outdoorSoak"
  | "privateDeck"
  | "scenicView"
  | "ownPlace"
  | "simpleCozy"
  | "heatedFloors"
  | "fireplace"
  | "fullKitchen";

export type RoomFeatures = Partial<Record<RoomFeatureKey, boolean>>;

export interface RoomMerchandising {
  key: string;
  /**
   * Durable Mews RoomCategoryId bindings.
   *
   * Mews calls lodging Room Types "Space Categories" and exposes this value as
   * RoomCategoryId. Inside our hotel domain we call it a Room Type ID.
   */
  mewsRoomTypeId: string;
  /**
   * Transitional name aliases only. UUID matching is authoritative.
   */
  legacyNames: string[];
  /**
   * Our higher-level Room Type Group. Mews has no equivalent hierarchy.
   * Examples: alpine, walden, lodge, forest-house.
   */
  roomTypeGroupKey: RoomTypeGroupKey;
  /** Curated guest-facing subheadline used by the approved room-list card. */
  cardTagline?: string;
  dogPolicy: DogPolicy;
  agePolicy: AgePolicy;
  partyScores: Record<PartyType, number>;
  interestScores: Record<MatchInterest, number>;
  interestPriority: Partial<Record<MatchInterest, number>>;
  features: RoomFeatures;
  matchReasons: Partial<Record<MatchInterest, string>>;
}

export type MerchandisingBindingSource = "mewsRoomTypeId" | "legacyName";

export interface ResolvedRoomMerchandising {
  merchandising: RoomMerchandising;
  source: MerchandisingBindingSource;
}
