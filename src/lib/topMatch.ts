export type PartyType = "partner" | "friends" | "family" | "solo";
export type MatchInterest = "iconTub" | "outdoorSoak" | "ownPlace" | "scenic" | "simpleCozy";
export type Season = "winter" | "spring" | "summer" | "fall";

export type RecommendationPreferences = {
  party: PartyType;
  dog: boolean;
  interests: [MatchInterest, MatchInterest?];
};

export type RoomFeatures = {
  dogFriendly?: boolean;
  heatedFloors?: boolean;
  fireplace?: boolean;
  outdoorSoak?: boolean;
  indoorTub?: boolean;
  privateDeck?: boolean;
  scenicView?: boolean;
  ownPlace?: boolean;
  simpleCozy?: boolean;
};

export type RoomMatchContent = {
  names: string[];
  matchReasons: Partial<Record<MatchInterest, string>>;
  features: RoomFeatures;
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

export const INTEREST_LABELS: Record<MatchInterest, string> = {
  iconTub: "Icon Tub",
  outdoorSoak: "Outdoor Soak",
  ownPlace: "My Own Place",
  scenic: "Scenic Views",
  simpleCozy: "Simple + Cozy",
};

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
  iconTub: "The signature indoor soaking tub puts the classic Cowboy bathing ritual front and center.",
  outdoorSoak: "The outdoor soaking setup makes this one of the strongest ways to bathe among the trees.",
  ownPlace: "This accommodation gives you a more private, independent way to stay.",
  scenic: "The setting and confirmed view keep the stay connected to the Catskills landscape.",
  simpleCozy: "This room keeps things easy, comfortable, and unfussy.",
};

const FALLBACK_INTEREST_COPY: Record<MatchInterest, string> = {
  iconTub: "It is the strongest available overall match, though it does not claim an indoor soaking tub.",
  outdoorSoak: "It is the strongest available overall match, though it does not claim an outdoor soaking setup.",
  ownPlace: "It is the strongest available overall match, without implying a fully standalone stay.",
  scenic: "It is the strongest available overall match, without promising a room-specific view.",
  simpleCozy: "It is the strongest available overall match, without overstating the room's size or price point.",
};

const DOG_BENEFIT = "It is also confirmed as a dog-friendly choice, so your dog can come along for the stay.";

// Structured merchandising facts. Keep claims conservative; an omitted feature is never inferred.
export const ROOM_MATCH_CONTENT: RoomMatchContent[] = [
  {
    names: ["Alpine Bathing Suite", "Alpine Bathing Suite with Den", "Alpine Penthouse Bathing Suite"],
    matchReasons: {
      iconTub: "its signature indoor soaking tub",
      scenic: "its elevated connection to the surrounding mountain landscape",
    },
    features: { dogFriendly: true, indoorTub: true, scenicView: true },
  },
  {
    names: ["Walden Forest Bathing Suite", "Walden Sunrise Bathing Suite"],
    matchReasons: {
      outdoorSoak: "its outdoor soaking setup among the trees",
      scenic: "its strong connection to the surrounding landscape",
    },
    features: { dogFriendly: true, outdoorSoak: true, scenicView: true },
  },
  {
    names: ["Walden Forest Bathing Suite with Den"],
    matchReasons: {
      outdoorSoak: "its outdoor soaking setup among the trees",
      scenic: "its strong connection to the surrounding landscape",
    },
    features: { outdoorSoak: true, scenicView: true },
  },
  {
    names: ["Walden King", "Forest House Queen", "Forest House King", "Lodge King", "Slide Mountain Haus Double Queen"],
    matchReasons: { simpleCozy: "its comfortable, easygoing room experience" },
    features: { simpleCozy: true },
  },
  {
    names: ["Cabin"],
    matchReasons: { iconTub: "its signature indoor tub", ownPlace: "its more independent cabin setting" },
    features: { dogFriendly: true, indoorTub: true, ownPlace: true },
  },
  {
    names: ["Chalet"],
    matchReasons: { outdoorSoak: "its outdoor soaking setup", ownPlace: "its standalone chalet setting" },
    features: { dogFriendly: true, outdoorSoak: true, ownPlace: true },
  },
  {
    names: ["Mountain View Haus 2 Bedroom", "Mountain View Haus 4 Bedroom"],
    matchReasons: { ownPlace: "its independent house setting", scenic: "its confirmed mountain-view setting" },
    features: { ownPlace: true, scenicView: true },
  },
  {
    names: ["Opa’s Cabin 2 Bedroom", "Opa's Cabin 2 Bedroom", "Opa’s Cabin 4 Bedroom", "Opa's Cabin 4 Bedroom"],
    matchReasons: { ownPlace: "its independent cabin setting" },
    features: { ownPlace: true },
  },
  {
    names: ["Slide Mountain Haus 5 Room", "Slide Mountain Haus 2 Bedroom"],
    matchReasons: { ownPlace: "its more independent house-style setup" },
    features: { ownPlace: true },
  },
  {
    names: ["Lodge Penthouse Suite", "Lodge 3 Bedroom Suite"],
    matchReasons: { iconTub: "its indoor soaking experience", scenic: "its elevated setting" },
    features: { dogFriendly: true, indoorTub: true, scenicView: true },
  },
  {
    names: ["Lodge 2 Bedroom"],
    matchReasons: { simpleCozy: "its comfortable shared-stay setup" },
    features: { dogFriendly: true, simpleCozy: true },
  },
];

function normalized(value: string): string {
  return value.trim().toLocaleLowerCase().replace(/[’]/g, "'");
}

export function roomMatchContent(roomName: string): RoomMatchContent {
  const key = normalized(roomName);
  return (
    ROOM_MATCH_CONTENT.find((entry) => entry.names.some((name) => normalized(name) === key)) ?? {
      names: [roomName],
      matchReasons: {},
      features: {},
    }
  );
}

export function seasonForDate(checkIn: string): Season {
  const month = Number(checkIn.slice(5, 7));
  if (month === 12 || month <= 2) return "winter";
  if (month <= 5) return "spring";
  if (month <= 8) return "summer";
  return "fall";
}

function supportsInterest(features: RoomFeatures, interest: MatchInterest): boolean {
  return {
    iconTub: features.indoorTub,
    outdoorSoak: features.outdoorSoak,
    ownPlace: features.ownPlace,
    scenic: features.scenicView,
    simpleCozy: features.simpleCozy,
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

export function buildTopMatchCopy(
  roomName: string,
  preferences: RecommendationPreferences,
  checkIn: string,
  metadata = roomMatchContent(roomName),
): TopMatchCopy {
  const [primary, secondary] = preferences.interests;
  const primaryMatch = supportsInterest(metadata.features, primary);
  const secondaryMatch = secondary ? supportsInterest(metadata.features, secondary) : false;
  const reasonInterest = primaryMatch ? primary : secondaryMatch && secondary ? secondary : null;
  const reason = reasonInterest
    ? metadata.matchReasons[reasonInterest] ?? INTEREST_BENEFITS[reasonInterest].toLocaleLowerCase()
    : "being the strongest available overall recommendation for these dates";
  const dogEligible = preferences.dog && metadata.features.dogFriendly === true;
  const partySummary = PARTY_FRAMING[preferences.party][dogEligible ? "dog" : "plain"];
  const season = seasonForDate(checkIn);

  const benefits: string[] = [primaryMatch ? INTEREST_BENEFITS[primary] : FALLBACK_INTEREST_COPY[primary]];
  if (secondary) {
    benefits.push(secondaryMatch ? INTEREST_BENEFITS[secondary] : FALLBACK_INTEREST_COPY[secondary]);
  }
  if (dogEligible) benefits.push(DOG_BENEFIT);
  else benefits.push(PARTY_BENEFITS[preferences.party]);
  benefits.push(seasonalBenefit(season, metadata.features));

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

export function inferredInterest(roomName: string): MatchInterest {
  const metadata = roomMatchContent(roomName);
  return (Object.keys(metadata.matchReasons)[0] as MatchInterest | undefined) ?? "simpleCozy";
}

export function parseRecommendationPreferences(
  search: string,
  fallback: { adults: number; children: number; roomName: string },
): RecommendationPreferences {
  const params = new URLSearchParams(search);
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
  const validInterests: MatchInterest[] = ["iconTub", "outdoorSoak", "ownPlace", "scenic", "simpleCozy"];
  const primaryRaw = params.get("interest") as MatchInterest | null;
  const secondaryRaw = params.get("interest2") as MatchInterest | null;
  const primary = validInterests.includes(primaryRaw as MatchInterest) ? (primaryRaw as MatchInterest) : inferredInterest(fallback.roomName);
  const secondary: MatchInterest | undefined =
    secondaryRaw && validInterests.includes(secondaryRaw) && secondaryRaw !== primary ? secondaryRaw : undefined;
  return { party, dog: params.get("dog") === "yes" || params.get("dog") === "1", interests: [primary, secondary] };
}
