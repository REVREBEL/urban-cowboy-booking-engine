import type { ShapedRoom } from "../types/mews";
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

function interestScore(merchandising: RoomMerchandising, interest: MatchInterest): number {
  if (interest === "social") {
    return Math.max(
      merchandising.interestScores.social ?? 0,
      merchandising.features.fullKitchen ? 5 : 0,
      merchandising.partyScores.friends ?? 0,
      merchandising.partyScores.family ?? 0,
    );
  }
  return merchandising.interestScores[interest] ?? 0;
}

function priorityScore(
  merchandising: RoomMerchandising,
  interests: [MatchInterest, MatchInterest?],
): number {
  const values = interests
    .filter((interest): interest is MatchInterest => !!interest)
    .map((interest) => merchandising.interestPriority[interest] ?? 99);
  return values.reduce((sum, value) => sum + value, 0);
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

  return eligible
    .map((room, index) => ({
      room,
      index,
      score: recommendationScore(room, preferences),
      priority: room.merchandising
        ? priorityScore(room.merchandising, preferences.interests)
        : 999,
    }))
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      if (a.priority !== b.priority) return a.priority - b.priority;

      const aPrice = a.room.fromGross ?? Number.POSITIVE_INFINITY;
      const bPrice = b.room.fromGross ?? Number.POSITIVE_INFINITY;
      if (aPrice !== bPrice) return aPrice - bPrice;

      return a.index - b.index;
    })
    .map(({ room }) => room);
}
