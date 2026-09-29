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
   * Durable Mews RoomCategoryId bindings. Add production UUIDs here as they are
   * confirmed. Runtime logic always prefers these over legacy-name migration aliases.
   */
  categoryIds: string[];
  /**
   * Transitional migration aliases only. These keep the current room catalogue
   * functional until every production RoomCategoryId is captured.
   */
  legacyNames: string[];
  family: string;
  dogPolicy: DogPolicy;
  agePolicy: AgePolicy;
  partyScores: Record<PartyType, number>;
  interestScores: Record<MatchInterest, number>;
  interestPriority: Partial<Record<MatchInterest, number>>;
  features: RoomFeatures;
  matchReasons: Partial<Record<MatchInterest, string>>;
}

export type MerchandisingBindingSource = "categoryId" | "legacyName";

export interface ResolvedRoomMerchandising {
  merchandising: RoomMerchandising;
  source: MerchandisingBindingSource;
}
