import type { ShapedRoom } from "../types/mews";
import { roomTypeGroupSupportsMinimalDistractions } from "../data/roomTypeGroups.ts";
import type {
  MatchInterest,
  RecommendationPreferences,
  RoomMerchandising,
} from "../types/merchandising";

export type RecommendationSearchContext = {
  children: number;
  infants: number;
  dogRequested?: boolean;
};

export function interestScore(
  merchandising: RoomMerchandising,
  interest: MatchInterest,
): number {
  const configured = merchandising.interestScores[interest];
  if (configured != null) return configured;

  if (interest === "spaces-for-connection") {
    return merchandising.features.separateLivingRoom ? 5 : 0;
  }

  if (interest === "spaces-to-gather") {
    return merchandising.features.fullKitchen ? 5 : 0;
  }

  if (interest === "minimal-distractions") {
    return roomTypeGroupSupportsMinimalDistractions(merchandising.roomTypeGroupKey) ? 5 : 0;
  }

  return 0;
}

// Optimized: replaces array allocations (.filter().map().reduce()) during room ranking
// with direct property lookups on the 1-2 requested interests.
function priorityScore(
  merchandising: RoomMerchandising,
  interests: [MatchInterest, MatchInterest?],
): number {
  let sum = merchandising.interestPriority[interests[0]] ?? 99;
  if (interests[1]) {
    sum += merchandising.interestPriority[interests[1]] ?? 99;
  }
  return sum;
}

export function isRoomRecommendationEligible(
  room: ShapedRoom,
  preferences: RecommendationPreferences | null,
  search: RecommendationSearchContext,
): boolean {
  const merchandising = room.merchandising;

  // Mews occupancy handles physical capacity. This layer handles property-specific
  // merchandising restrictions that the quiz must not override.
  if (merchandising?.agePolicy === "adultsOnly21" && (search.children > 0 || search.infants > 0)) {
    return false;
  }

  if (preferences?.dog || search.dogRequested) {
    // "Dog = yes" is a hard eligibility constraint. Unknown is intentionally not
    // treated as dog-friendly until the property/CRS confirms it.
    if (!merchandising || merchandising.dogPolicy !== "allowed") return false;
  }

  return true;
}

export function recommendationScore(
  room: ShapedRoom,
  preferences: RecommendationPreferences,
): number {
  const merchandising = room.merchandising;
  if (!merchandising) return Number.NEGATIVE_INFINITY;

  const [primary, secondary] = preferences.interests;
  const primaryFit = interestScore(merchandising, primary);
  const partyFit = merchandising.partyScores[preferences.party] ?? 0;

  let score = primaryFit * 10 + partyFit * 2;

  if (secondary) {
    const secondaryFit = interestScore(merchandising, secondary);
    score += secondaryFit * 10;

    const high = Math.max(primaryFit, secondaryFit);
    const low = Math.min(primaryFit, secondaryFit);
    if (primaryFit >= 4 && secondaryFit >= 4) score += 50;
    else if (high >= 4 && low >= 2) score += 20;
  }

  return score;
}

export function rankRecommendedRooms(
  rooms: ShapedRoom[],
  preferences: RecommendationPreferences | null,
  search: RecommendationSearchContext,
): ShapedRoom[] {
  const eligible = rooms.filter((room) =>
    isRoomRecommendationEligible(room, preferences, search),
  );

  if (!preferences) return eligible;

  const count = eligible.length;
  if (count <= 1) return eligible;

  // Cache comparisons before sorting indices while preserving fractional priorities.
  const scores = new Float64Array(count);
  const priorities = new Float64Array(count);
  const prices = new Float64Array(count);
  const indices = new Int32Array(count);

  for (let i = 0; i < count; i++) {
    const room = eligible[i];
    scores[i] = recommendationScore(room, preferences);
    priorities[i] = room.merchandising
      ? priorityScore(room.merchandising, preferences.interests)
      : 999;
    prices[i] = room.fromGross ?? Number.POSITIVE_INFINITY;
    indices[i] = i;
  }

  // Sort indices using the same score, priority, price, and stable-index tie breaks.
  const sortedIndices = Array.from(indices);
  sortedIndices.sort((iA, iB) => {
    if (scores[iA] !== scores[iB]) return scores[iB] - scores[iA];
    if (priorities[iA] !== priorities[iB]) return priorities[iA] - priorities[iB];
    if (prices[iA] !== prices[iB]) return prices[iA] - prices[iB];

    return iA - iB;
  });

  const result = new Array<ShapedRoom>(count);
  for (let i = 0; i < count; i++) {
    result[i] = eligible[sortedIndices[i]];
  }
  return result;
}
