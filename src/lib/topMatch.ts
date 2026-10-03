import type {
  MatchInterest,
  PartyType,
  RecommendationPreferences,
  RoomFeatures,
  RoomMerchandising,
} from "../types/merchandising";
import { PREFERENCE_LABELS } from "@/data/findYourStayPreferences";

export type Season = "winter" | "spring" | "summer" | "fall";

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

export const INTEREST_LABELS = PREFERENCE_LABELS;

const PARTY_FRAMING: Record<PartyType, { plain: string; dog: string }> = {
  partner: { plain: "a couple's stay", dog: "a couple's stay with your dog" },
  friends: { plain: "a friends' getaway", dog: "a friends' getaway with your dog along for the ride" },
  family: { plain: "a family trip", dog: "a family stay with room for the dog too" },
  solo: { plain: "a solo stay", dog: "a solo stay with your dog" },
};

const PARTY_BENEFITS: Record<PartyType, string> = {
  partner: "Its scale and atmosphere work especially well for two.",
  friends: "It gives friends an easy home base between meals, drinks, and time outdoors.",
  family: "It offers a comfortable base for sharing a Catskills stay as a family.",
  solo: "It is a comfortable base for a quieter, self-directed stay.",
};

const INTEREST_BENEFITS: Record<MatchInterest, string> = {
  "iconic-tub": "The signature indoor soaking tub puts the classic Cowboy bathing ritual front and center.",
  "bathe-outside": "The outdoor soaking setup makes this one of the strongest ways to bathe among the trees.",
  "my-own-place": "This accommodation gives you a more private, independent way to stay.",
  "near-everything": "This room keeps you close to the Lodge, the social heart of the Cowboy.",
  "simple-cozy": "This room keeps things easy, comfortable, and unfussy.",
  "mountain-views": "The setting and confirmed view keep the stay connected to the Catskills landscape.",
  "bringing-my-people": "This room is a strong fit when the stay is about bringing friends or family together.",
};

const FALLBACK_INTEREST_COPY: Record<MatchInterest, string> = {
  "iconic-tub": "It is the strongest available overall match, though it does not claim an indoor soaking tub.",
  "bathe-outside": "It is the strongest available overall match, though it does not claim an outdoor soaking setup.",
  "my-own-place": "It is the strongest available overall match, without implying a fully standalone stay.",
  "near-everything": "It is the strongest available overall match, without claiming a Lodge location.",
  "simple-cozy": "It is the strongest available overall match, without overstating the room's size or price point.",
  "mountain-views": "It is the strongest available overall match, without promising a room-specific view.",
  "bringing-my-people": "It is the strongest available overall match, without overstating its group-stay fit.",
};

const DOG_BENEFIT = "It is also confirmed as a dog-friendly choice, so your dog can come along for the stay.";

export function seasonForDate(checkIn: string): Season {
  const month = Number(checkIn.slice(5, 7));
  if (month === 12 || month <= 2) return "winter";
  if (month <= 5) return "spring";
  if (month <= 8) return "summer";
  return "fall";
}

function supportsInterest(
  metadata: RoomMerchandising | null,
  interest: MatchInterest,
): boolean {
  const features = metadata?.features ?? EMPTY_FEATURES;

  if (interest === "near-everything") {
    return metadata?.roomTypeGroupKey === "lodge";
  }

  if (interest === "bringing-my-people") {
    return Math.max(
      metadata?.partyScores.friends ?? 0,
      metadata?.partyScores.family ?? 0,
    ) >= 4;
  }

  return {
    "iconic-tub": features.indoorTub,
    "bathe-outside": features.outdoorSoak,
    "my-own-place": features.ownPlace,
    "simple-cozy": features.simpleCozy,
    "mountain-views": features.scenicView,
  }[interest] === true;
}

function seasonalBenefit(season: Season, features: RoomFeatures): string {
  if (season === "winter") {
    if (features.heatedFloors) return "In winter, the confirmed heated floors make cold mornings easier.";
    if (features.fireplace) return "In winter, the confirmed fireplace gives the room a warm place to return to.";
    if (features.outdoorSoak) return "In winter, the contrast between crisp mountain air and the outdoor soak comes into its own.";
    if (features.indoorTub) return "In winter, the indoor soak offers a restorative return from the cold.";
    return "Winter in the Catskills brings a slower pace and a restorative change of scenery.";
  }
  if (season === "spring") {
    if (features.privateDeck) return "In spring, the confirmed private deck makes it easier to take in the returning fresh air.";
    return "Spring brings fresh air, waking trees, and an easy shoulder-season pace to the Catskills.";
  }
  if (season === "summer") {
    if (features.outdoorSoak) return "In summer, the confirmed outdoor soak keeps the bathing ritual in the open air.";
    if (features.privateDeck) return "In summer, the confirmed private deck makes the most of the mountain air.";
    return "Summer brings long days and more time outside across the Catskills.";
  }
  if (features.scenicView) return "In fall, the confirmed view makes the surrounding foliage part of the stay.";
  if (features.outdoorSoak) return "In fall, the confirmed outdoor soak pairs naturally with crisp mountain air.";
  if (features.fireplace) return "In fall, the confirmed fireplace suits the return of cooler Catskills evenings.";
  return "Fall brings crisp air and foliage across the Catskills landscape.";
}

function interestList(interests: [MatchInterest, MatchInterest?]): string {
  return interests[1]
    ? `${INTEREST_LABELS[interests[0]]} and ${INTEREST_LABELS[interests[1]]}`
    : INTEREST_LABELS[interests[0]];
}

const EMPTY_FEATURES: RoomFeatures = {};

export function buildTopMatchCopy(
  roomName: string,
  preferences: RecommendationPreferences,
  checkIn: string,
  metadata: RoomMerchandising | null,
): TopMatchCopy {
  const [primary, secondary] = preferences.interests;
  const features = metadata?.features ?? EMPTY_FEATURES;
  const primaryMatch = supportsInterest(metadata, primary);
  const secondaryMatch = secondary ? supportsInterest(metadata, secondary) : false;
  const reasonInterest = primaryMatch ? primary : secondaryMatch && secondary ? secondary : null;
  const reason = reasonInterest
    ? metadata?.matchReasons[reasonInterest] ?? INTEREST_BENEFITS[reasonInterest].toLocaleLowerCase()
    : "being the strongest available overall recommendation for these dates";
  const dogEligible = preferences.dog && metadata?.dogPolicy === "allowed";
  const partySummary = PARTY_FRAMING[preferences.party][dogEligible ? "dog" : "plain"];
  const season = seasonForDate(checkIn);

  const benefits: string[] = [primaryMatch ? INTEREST_BENEFITS[primary] : FALLBACK_INTEREST_COPY[primary]];
  if (secondary) {
    benefits.push(secondaryMatch ? INTEREST_BENEFITS[secondary] : FALLBACK_INTEREST_COPY[secondary]);
  }
  if (dogEligible) benefits.push(DOG_BENEFIT);
  else benefits.push(PARTY_BENEFITS[preferences.party]);
  benefits.push(seasonalBenefit(season, features));

  return {
    match_badge: "YOUR TOP MATCH",
    room_type: roomName,
    party_summary: partySummary,
    interest_summary: interestList(preferences.interests),
    top_match_reason: reason,
    benefit_1: benefits[0],
    benefit_2: benefits[1],
    benefit_3: benefits[benefits.length - 1],
    season_label: season,
    alternate_match_heading: "Want another take on this stay? Explore the other matches below.",
  };
}

export function parseRecommendationPreferences(
  search: string,
  fallback: { adults: number; children: number },
): RecommendationPreferences | null {
  const params = new URLSearchParams(search);
  const validInterests: MatchInterest[] = [
    "iconic-tub",
    "bathe-outside",
    "my-own-place",
    "near-everything",
    "simple-cozy",
    "mountain-views",
    "bringing-my-people",
  ];
  const primaryRaw = params.get("interest") as MatchInterest | null;

  // No explicit interest means the guest is browsing normally, not using the matcher.
  // In that case keep the standard availability/price order rather than inventing a
  // preference from the room name.
  if (!primaryRaw || !validInterests.includes(primaryRaw)) return null;

  const partyRaw = params.get("party") as PartyType | null;
  const validParties: PartyType[] = ["partner", "friends", "family", "solo"];
  const party = validParties.includes(partyRaw as PartyType)
    ? (partyRaw as PartyType)
    : fallback.children > 0
      ? "family"
      : fallback.adults <= 1
        ? "solo"
        : fallback.adults === 2
          ? "partner"
          : "friends";

  const secondaryRaw = params.get("interest2") as MatchInterest | null;
  const secondary: MatchInterest | undefined =
    secondaryRaw && validInterests.includes(secondaryRaw) && secondaryRaw !== primaryRaw
      ? secondaryRaw
      : undefined;

  return {
    party,
    dog: params.get("dog") === "yes" || params.get("dog") === "1",
    interests: [primaryRaw, secondary],
  };
}

export type { MatchInterest, PartyType, RecommendationPreferences, RoomMerchandising };
