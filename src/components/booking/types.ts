export type PartyType = "partner" | "friends" | "family" | "solo";

export type MatchInterest =
  | "iconTub"
  | "outdoorSoak"
  | "ownPlace"
  | "scenic"
  | "simpleCozy"
  | "social";

export type Season = "winter" | "spring" | "summer" | "fall";

export type RecommendationPreferences = {
  party: PartyType;
  dog: boolean;
  interests: [MatchInterest, MatchInterest?];
};

export type RoomFeatures = {
  dogFriendly?: boolean;
  adults21Plus?: boolean;
  heatedFloors?: boolean;
  fireplace?: boolean;
  outdoorSoak?: boolean;
  indoorTub?: boolean;
  privateDeck?: boolean;
  wrapAroundPorch?: boolean;
  scenicView?: boolean;
  ownPlace?: boolean;
  simpleCozy?: boolean;
  walkInShower?: boolean;
  castIronStove?: boolean;
  fullKitchen?: boolean;
  separateLivingRoom?: boolean;
  wetBar?: boolean;
  trailheadAccess?: boolean;
  esopusCreek?: boolean;
  familyFriendly?: boolean;
  den?: boolean;
  oneBed?: boolean;
  twoBeds?: boolean;
  sleeps?: number;
  beds?: string;
  sqft?: number;
};

export type RoomExperience =
  | "Alpine"
  | "Walden"
  | "Lodge"
  | "Forest House"
  | "Cabin"
  | "Chalet"
  | "Opa's"
  | "Slide Mountain"
  | "Mountain View"
  | string;

export type RoomProduct = {
  id: string;
  categoryId?: string;
  name: string;
  experience: RoomExperience;
  tagline: string;
  description: string;
  features: RoomFeatures;
  images: string[];
  thumbImage: string;
  startingFrom: number;
  currency?: string;
  available?: boolean;
};

export type RateOffer = {
  id: string;
  roomId: string;
  variant?: "ride-easy" | "plan-ahead" | "sunup" | "stay-a-while" | "outfit";
  name: string;
  eyebrow?: string;
  headline?: string;
  description?: string;
  nightlyRate?: number | null;
  totalStay?: number | null;
  currency?: string;
  cancellationPolicy?: string;
  paymentPolicy?: string;
  amountDueNow?: number | null;
  remainingBalance?: number | null;
  taxTotal?: number | null;
  breakfastIncluded?: boolean;
  minNights?: number;
  advanceDays?: number;
  memberOnly?: boolean;
  available?: boolean;
};

export type TopMatchCopy = {
  match_badge: string;
  room_type: string;
  party_summary: string;
  interest_summary: string;
  top_match_reason: string;
  benefit_1: string;
  benefit_2: string;
  benefit_3: string;
  season_label: Season;
  alternate_match_heading: string;
};

export type RecommendationResult = {
  room: RoomProduct;
  score?: number;
  matchedInterests: MatchInterest[];
  explanation?: TopMatchCopy;
};

export type StaySummaryData = {
  arrival: string;
  departure: string;
  adults: number;
  children: number;
  dog: boolean;
  roomName?: string | null;
  rateName?: string | null;
  nightlyRate?: number | null;
  nights?: number;
  total?: number | null;
  currency?: string;
};
