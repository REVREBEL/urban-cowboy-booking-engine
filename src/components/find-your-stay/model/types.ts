export type PartyType = 'partner' | 'friends' | 'family' | 'solo';

export type MatchInterest =
  | 'iconTub'
  | 'outdoorSoak'
  | 'ownPlace'
  | 'scenic'
  | 'simpleCozy'
  | 'social';

export type Season = 'winter' | 'spring' | 'summer' | 'fall';

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
  | 'Alpine'
  | 'Walden'
  | 'Lodge'
  | 'Forest House'
  | 'Cabin'
  | 'Chalet'
  | "Opa's";

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
  matchScores: Record<string, number>;
};

export type RateOffer = {
  id: string;
  roomId: string;
  name: string;
  variant:
    | 'ride-easy'
    | 'plan-ahead'
    | 'sunup'
    | 'stay-a-while'
    | 'outfit';
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

export type BookingState = {
  property?: string;
  checkIn: string;
  checkOut: string;
  adults: number;
  children: number;
  infants?: number;
  promoCode?: string;
  recommendationPreferences?: RecommendationPreferences;
  selectedRoomId?: string;
  selectedRoom?: RoomProduct;
  selectedRateId?: string;
  selectedRate?: RateOffer;
};

export type BookingView =
  | 'availability'
  | 'find-your-stay'
  | 'help-me-choose'
  | 'match-results'
  | 'all-rooms'
  | 'room-detail'
  | 'rate-selection'
  | 'details'
  | 'extras'
  | 'pay';

export type BookingAction =
  | { type: 'SET_DATES'; checkIn: string; checkOut: string }
  | { type: 'SET_GUESTS'; adults: number; children: number; infants?: number }
  | { type: 'SET_PROMO'; promoCode: string }
  | { type: 'SET_PREFERENCES'; preferences: RecommendationPreferences }
  | { type: 'SELECT_ROOM'; room: RoomProduct }
  | { type: 'SELECT_RATE'; rate: RateOffer }
  | { type: 'CLEAR_ROOM' }
  | { type: 'CLEAR_RATE' }
  | { type: 'RESET' };
