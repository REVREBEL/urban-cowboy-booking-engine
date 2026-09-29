import type { MatchInterest, PartyType } from "@/types/merchandising";
import type { TopMatchCopy } from "@/lib/topMatch";

export type RoomFeatureSet = {
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
  name: string;
  experience: RoomExperience;
  tagline: string;
  description: string;
  features: RoomFeatureSet;
  images: string[];
  thumbImage: string;
  startingFrom: number;
  available: boolean;
};

export type RateVariant =
  | "ride-easy"
  | "plan-ahead"
  | "sunup"
  | "stay-a-while"
  | "outfit"
  | string;

export type RateOffer = {
  id: string;
  roomId: string;
  name: string;
  variant: RateVariant;
  eyebrow?: string;
  headline?: string;
  description?: string;
  nightlyRate: number;
  totalStay: number;
  cancellationPolicy?: string;
  breakfastIncluded?: boolean;
  available?: boolean;
  currency?: string;
};

export type FindStayInterest = MatchInterest | "social";

export type RecommendationPreferences = {
  party: PartyType;
  dog: boolean;
  interests: [FindStayInterest, FindStayInterest?];
};

export type RecommendationResult = {
  room: RoomProduct;
  score?: number;
  matchedInterests: FindStayInterest[];
  explanation?: TopMatchCopy;
};

export type StaySearchSummary = {
  checkIn: string;
  checkOut: string;
  adults: number;
  children?: number;
};
