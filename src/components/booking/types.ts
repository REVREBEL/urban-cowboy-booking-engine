import type { TopMatchCopy } from "../../lib/topMatch";

export type PartyType = "partner" | "friends" | "family" | "solo";

export type MatchInterest =
  | "iconTub"
  | "outdoorSoak"
  | "ownPlace"
  | "scenic"
  | "simpleCozy"
  | "social";

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
  | "Mountain View";

export type RoomProduct = {
  id: string;
  name: string;
  experience: RoomExperience;
  tagline: string;
  description: string;
  features: RoomFeatures;
  images: string[];
  thumbImage: string;
  startingFrom: number;
  available: boolean;
  matchScores?: Partial<Record<MatchInterest, number>>;
};

export type RateOffer = {
  id: string;
  roomId: string;
  name: string;
  variant:
    | "ride-easy"
    | "plan-ahead"
    | "sunup"
    | "stay-a-while"
    | "outfit";
  eyebrow: string;
  headline: string;
  description: string;
  nightlyRate: number;
  totalStay: number;
  cancellationPolicy: string;
  breakfastIncluded: boolean;
  minNights?: number;
  advanceDays?: number;
  memberOnly?: boolean;
  available: boolean;
  currency?: string;
};

export type RecommendationResult = {
  room: RoomProduct;
  score?: number;
  matchedInterests: MatchInterest[];
  explanation?: TopMatchCopy;
};

export type StaySelection = {
  checkIn: string;
  checkOut: string;
  adults: number;
  children: number;
  infants?: number;
  dog?: boolean;
  promoCode?: string;
};
