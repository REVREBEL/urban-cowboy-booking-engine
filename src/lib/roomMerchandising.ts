import type {
  MatchInterest,
  ResolvedRoomMerchandising,
  RoomMerchandising,
} from "../types/merchandising";

type BaseRoomMerchandising = Omit<RoomMerchandising, "interestPriority">;

// Scores are copied from docs/match_logic.md. Feature flags are deliberately
// conservative and only represent facts we are willing to surface as guest-facing copy.
// categoryIds is intentionally empty until the exact production RoomCategoryId UUID is
// observed from Mews. Do not invent or copy unrelated Mews identifiers here.
const BASE_ROOMS: BaseRoomMerchandising[] = [
  {
    key: "alpine-bathing-suite",
    categoryIds: [],
    legacyNames: ["Alpine Bathing Suite"],
    family: "alpine",
    dogPolicy: "allowed",
    agePolicy: "adultsOnly21",
    partyScores: { partner: 5, friends: 3, family: 2, solo: 4 },
    interestScores: { iconTub: 5, outdoorSoak: 0, ownPlace: 0, scenic: 5, simpleCozy: 2 },
    features: { indoorTub: true, scenicView: true, privateDeck: true, heatedFloors: true },
    matchReasons: {
      iconTub: "its signature indoor soaking tub",
      scenic: "its mountain-and-forest outlook",
    },
  },
  {
    key: "alpine-bathing-suite-den",
    categoryIds: [],
    legacyNames: ["Alpine Bathing Suite with Den"],
    family: "alpine",
    dogPolicy: "allowed",
    agePolicy: "adultsOnly21",
    partyScores: { partner: 5, friends: 3, family: 2, solo: 3 },
    interestScores: { iconTub: 5, outdoorSoak: 0, ownPlace: 0, scenic: 5, simpleCozy: 1 },
    features: { indoorTub: true, scenicView: true, privateDeck: true, heatedFloors: true },
    matchReasons: {
      iconTub: "its signature indoor soaking tub",
      scenic: "its elevated mountain-and-forest views",
    },
  },
  {
    key: "alpine-penthouse-bathing-suite",
    categoryIds: [],
    legacyNames: ["Alpine Penthouse Bathing Suite"],
    family: "alpine",
    dogPolicy: "allowed",
    agePolicy: "adultsOnly21",
    partyScores: { partner: 5, friends: 3, family: 2, solo: 3 },
    interestScores: { iconTub: 5, outdoorSoak: 0, ownPlace: 0, scenic: 5, simpleCozy: 1 },
    features: {
      indoorTub: true,
      scenicView: true,
      privateDeck: true,
      heatedFloors: true,
      fireplace: true,
    },
    matchReasons: {
      iconTub: "its signature indoor soaking tub",
      scenic: "its elevated penthouse setting and balcony views",
    },
  },
  {
    key: "walden-forest-bathing-suite",
    categoryIds: [],
    legacyNames: ["Walden Forest Bathing Suite"],
    family: "walden",
    dogPolicy: "allowed",
    agePolicy: "adultsOnly21",
    partyScores: { partner: 5, friends: 3, family: 2, solo: 4 },
    interestScores: { iconTub: 0, outdoorSoak: 5, ownPlace: 0, scenic: 4, simpleCozy: 2 },
    features: { outdoorSoak: true, scenicView: true, privateDeck: true },
    matchReasons: {
      outdoorSoak: "its cedar soaking tub on a private deck among the trees",
      scenic: "its private deck overlooking the woods",
    },
  },
  {
    key: "walden-sunrise-bathing-suite",
    categoryIds: [],
    legacyNames: ["Walden Sunrise Bathing Suite"],
    family: "walden",
    dogPolicy: "allowed",
    agePolicy: "adultsOnly21",
    partyScores: { partner: 5, friends: 3, family: 2, solo: 3 },
    interestScores: { iconTub: 0, outdoorSoak: 5, ownPlace: 0, scenic: 5, simpleCozy: 1 },
    features: { outdoorSoak: true, scenicView: true, privateDeck: true },
    matchReasons: {
      outdoorSoak: "its outdoor cedar soaking tub",
      scenic: "its sunrise-facing private porch and mountain views",
    },
  },
  {
    key: "walden-forest-bathing-suite-den",
    categoryIds: [],
    legacyNames: ["Walden Forest Bathing Suite with Den"],
    family: "walden",
    dogPolicy: "notAllowed",
    agePolicy: "adultsOnly21",
    partyScores: { partner: 5, friends: 3, family: 2, solo: 3 },
    interestScores: { iconTub: 0, outdoorSoak: 5, ownPlace: 0, scenic: 4, simpleCozy: 1 },
    features: { outdoorSoak: true, scenicView: true, privateDeck: true },
    matchReasons: {
      outdoorSoak: "its cedar soaking tub on a private deck among the trees",
      scenic: "its private deck in the forest",
    },
  },
  {
    key: "walden-king",
    categoryIds: [],
    legacyNames: ["Walden King"],
    family: "walden",
    dogPolicy: "allowed",
    agePolicy: "adultsOnly21",
    partyScores: { partner: 4, friends: 3, family: 2, solo: 5 },
    interestScores: { iconTub: 0, outdoorSoak: 0, ownPlace: 0, scenic: 4, simpleCozy: 5 },
    features: { scenicView: true, privateDeck: true, simpleCozy: true },
    matchReasons: {
      scenic: "its forest-facing private deck",
      simpleCozy: "its classic cabin-style king-room setup",
    },
  },
  {
    key: "cabin",
    categoryIds: [],
    legacyNames: ["Cabin", "The Cabin"],
    family: "cabin",
    dogPolicy: "allowed",
    agePolicy: "none",
    partyScores: { partner: 5, friends: 4, family: 4, solo: 3 },
    interestScores: { iconTub: 5, outdoorSoak: 0, ownPlace: 5, scenic: 3, simpleCozy: 2 },
    features: { indoorTub: true, ownPlace: true, fireplace: true },
    matchReasons: {
      iconTub: "its copper clawfoot tub",
      ownPlace: "its standalone cabin setting",
    },
  },
  {
    key: "chalet",
    categoryIds: [],
    legacyNames: ["Chalet", "The Chalet"],
    family: "chalet",
    dogPolicy: "allowed",
    agePolicy: "none",
    partyScores: { partner: 5, friends: 4, family: 5, solo: 2 },
    interestScores: { iconTub: 0, outdoorSoak: 5, ownPlace: 5, scenic: 4, simpleCozy: 2 },
    features: {
      outdoorSoak: true,
      ownPlace: true,
      scenicView: true,
      fireplace: true,
      heatedFloors: true,
      privateDeck: true,
      fullKitchen: true,
    },
    matchReasons: {
      outdoorSoak: "its private cedar soaking tub",
      ownPlace: "its standalone chalet setting",
      scenic: "its picture windows and private deck",
    },
  },
  {
    key: "forest-house-queen",
    categoryIds: [],
    legacyNames: ["Forest House Queen", "Forest Haus Queen"],
    family: "forest-house",
    dogPolicy: "notAllowed",
    agePolicy: "none",
    partyScores: { partner: 4, friends: 3, family: 3, solo: 5 },
    interestScores: { iconTub: 0, outdoorSoak: 0, ownPlace: 0, scenic: 2, simpleCozy: 5 },
    features: { simpleCozy: true },
    matchReasons: { simpleCozy: "its cozy, straightforward Catskills room experience" },
  },
  {
    key: "forest-house-king",
    categoryIds: [],
    legacyNames: ["Forest House King", "Forest Haus King"],
    family: "forest-house",
    dogPolicy: "notAllowed",
    agePolicy: "none",
    partyScores: { partner: 4, friends: 3, family: 4, solo: 4 },
    interestScores: { iconTub: 0, outdoorSoak: 0, ownPlace: 0, scenic: 4, simpleCozy: 4 },
    features: { scenicView: true, simpleCozy: true, privateDeck: true },
    matchReasons: {
      scenic: "its private balcony at treetop level",
      simpleCozy: "its comfortable king-room setup",
    },
  },
  {
    key: "opas-cabin-2-bedroom",
    categoryIds: [],
    legacyNames: ["Opa’s Cabin 2 Bedroom", "Opa's Cabin 2 Bedroom"],
    family: "opas",
    dogPolicy: "unknown",
    agePolicy: "none",
    partyScores: { partner: 2, friends: 5, family: 5, solo: 1 },
    interestScores: { iconTub: 0, outdoorSoak: 0, ownPlace: 5, scenic: 2, simpleCozy: 3 },
    features: { ownPlace: true, fireplace: true, fullKitchen: true },
    matchReasons: { ownPlace: "its independent century-old cabin setting" },
  },
  {
    key: "opas-cabin-4-bedroom",
    categoryIds: [],
    legacyNames: ["Opa’s Cabin 4 Bedroom", "Opa's Cabin 4 Bedroom"],
    family: "opas",
    dogPolicy: "unknown",
    agePolicy: "none",
    partyScores: { partner: 1, friends: 5, family: 5, solo: 0 },
    interestScores: { iconTub: 0, outdoorSoak: 0, ownPlace: 5, scenic: 2, simpleCozy: 2 },
    features: { ownPlace: true, fireplace: true, fullKitchen: true },
    matchReasons: { ownPlace: "its independent four-bedroom cabin setting" },
  },
  {
    key: "lodge-penthouse-suite",
    categoryIds: [],
    legacyNames: ["Lodge Penthouse Suite"],
    family: "lodge",
    dogPolicy: "allowed",
    agePolicy: "adult21Required",
    partyScores: { partner: 5, friends: 3, family: 4, solo: 2 },
    interestScores: { iconTub: 5, outdoorSoak: 0, ownPlace: 2, scenic: 5, simpleCozy: 1 },
    features: { indoorTub: true, scenicView: true, privateDeck: true },
    matchReasons: {
      iconTub: "its copper clawfoot tub",
      scenic: "its elevated Lodge setting and private deck",
    },
  },
  {
    key: "lodge-3-bedroom-suite",
    categoryIds: [],
    legacyNames: ["Lodge 3 Bedroom Suite", "Lodge 3-Bedroom Suite"],
    family: "lodge",
    dogPolicy: "allowed",
    agePolicy: "adult21Required",
    partyScores: { partner: 2, friends: 5, family: 5, solo: 0 },
    interestScores: { iconTub: 4, outdoorSoak: 0, ownPlace: 2, scenic: 5, simpleCozy: 2 },
    features: { indoorTub: true, scenicView: true, privateDeck: true, fireplace: true },
    matchReasons: {
      iconTub: "its copper clawfoot tub",
      scenic: "its sweeping Lodge views",
    },
  },
  {
    key: "lodge-2-bedroom",
    categoryIds: [],
    legacyNames: ["Lodge 2 Bedroom", "Lodge 2-Bedroom"],
    family: "lodge",
    dogPolicy: "allowed",
    agePolicy: "adult21Required",
    partyScores: { partner: 2, friends: 5, family: 5, solo: 1 },
    interestScores: { iconTub: 0, outdoorSoak: 0, ownPlace: 1, scenic: 4, simpleCozy: 3 },
    features: { scenicView: true, privateDeck: true },
    matchReasons: { scenic: "its private deck above the main Lodge" },
  },
  {
    key: "lodge-king",
    categoryIds: [],
    legacyNames: ["Lodge King"],
    family: "lodge",
    dogPolicy: "allowed",
    agePolicy: "adult21Required",
    partyScores: { partner: 4, friends: 3, family: 4, solo: 5 },
    interestScores: { iconTub: 0, outdoorSoak: 0, ownPlace: 0, scenic: 3, simpleCozy: 5 },
    features: { simpleCozy: true },
    matchReasons: { simpleCozy: "its easy, classic Lodge-room setup" },
  },
  {
    key: "slide-mountain-haus-5-room",
    categoryIds: [],
    legacyNames: ["Slide Mountain Haus 5 Room", "Slide Mountain Haus Full Haus"],
    family: "slide-mountain",
    dogPolicy: "allowed",
    agePolicy: "none",
    partyScores: { partner: 0, friends: 5, family: 5, solo: 0 },
    interestScores: { iconTub: 0, outdoorSoak: 0, ownPlace: 5, scenic: 3, simpleCozy: 3 },
    features: { ownPlace: true, fullKitchen: true },
    matchReasons: { ownPlace: "its full-house setup with kitchen and living room" },
  },
  {
    key: "slide-mountain-haus-2-bedroom",
    categoryIds: [],
    legacyNames: ["Slide Mountain Haus 2 Bedroom"],
    family: "slide-mountain",
    dogPolicy: "notAllowed",
    agePolicy: "none",
    partyScores: { partner: 1, friends: 5, family: 5, solo: 0 },
    interestScores: { iconTub: 0, outdoorSoak: 0, ownPlace: 3, scenic: 3, simpleCozy: 4 },
    features: { simpleCozy: true, fullKitchen: true },
    matchReasons: { simpleCozy: "its straightforward small-group house setup" },
  },
  {
    key: "slide-mountain-haus-double-queen",
    categoryIds: [],
    legacyNames: ["Slide Mountain Haus Double Queen"],
    family: "slide-mountain",
    dogPolicy: "unknown",
    agePolicy: "none",
    partyScores: { partner: 2, friends: 5, family: 4, solo: 2 },
    interestScores: { iconTub: 0, outdoorSoak: 0, ownPlace: 0, scenic: 4, simpleCozy: 5 },
    features: { scenicView: true, simpleCozy: true },
    matchReasons: {
      scenic: "its porch view toward Slide Mountain",
      simpleCozy: "its practical double-queen setup",
    },
  },
  {
    key: "mountain-view-haus-2-bedroom",
    categoryIds: [],
    legacyNames: ["Mountain View Haus 2 Bedroom"],
    family: "mountain-view",
    dogPolicy: "unknown",
    agePolicy: "none",
    partyScores: { partner: 2, friends: 5, family: 5, solo: 0 },
    interestScores: { iconTub: 0, outdoorSoak: 0, ownPlace: 5, scenic: 5, simpleCozy: 3 },
    features: { ownPlace: true, scenicView: true, fireplace: true, fullKitchen: true },
    matchReasons: {
      ownPlace: "its independent house setup",
      scenic: "its view across the valley toward the Big Indian Wilderness",
    },
  },
  {
    key: "mountain-view-haus-4-bedroom",
    categoryIds: [],
    legacyNames: ["Mountain View Haus 4 Bedroom"],
    family: "mountain-view",
    dogPolicy: "unknown",
    agePolicy: "none",
    partyScores: { partner: 1, friends: 5, family: 5, solo: 0 },
    interestScores: { iconTub: 0, outdoorSoak: 0, ownPlace: 5, scenic: 5, simpleCozy: 2 },
    features: { ownPlace: true, scenicView: true, fireplace: true, fullKitchen: true },
    matchReasons: {
      ownPlace: "its independent four-bedroom house setup",
      scenic: "its view across the valley toward the Big Indian Wilderness",
    },
  },
];

const INTEREST_LADDERS: Partial<Record<MatchInterest, string[]>> = {
  iconTub: [
    "alpine-bathing-suite",
    "alpine-bathing-suite-den",
    "alpine-penthouse-bathing-suite",
    "lodge-penthouse-suite",
    "cabin",
    "lodge-3-bedroom-suite",
  ],
  outdoorSoak: [
    "walden-forest-bathing-suite",
    "walden-sunrise-bathing-suite",
    "walden-forest-bathing-suite-den",
    "chalet",
  ],
  ownPlace: [
    "cabin",
    "chalet",
    "mountain-view-haus-2-bedroom",
    "opas-cabin-2-bedroom",
    "slide-mountain-haus-5-room",
    "mountain-view-haus-4-bedroom",
    "opas-cabin-4-bedroom",
    "slide-mountain-haus-2-bedroom",
  ],
  scenic: [
    "walden-sunrise-bathing-suite",
    "alpine-bathing-suite-den",
    "alpine-penthouse-bathing-suite",
    "lodge-penthouse-suite",
    "alpine-bathing-suite",
    "mountain-view-haus-2-bedroom",
    "mountain-view-haus-4-bedroom",
    "lodge-3-bedroom-suite",
    "walden-forest-bathing-suite",
    "forest-house-king",
    "chalet",
    "slide-mountain-haus-double-queen",
    "walden-king",
    "lodge-2-bedroom",
    "lodge-king",
  ],
  simpleCozy: [
    "slide-mountain-haus-double-queen",
    "forest-house-queen",
    "walden-king",
    "lodge-king",
    "forest-house-king",
    "slide-mountain-haus-2-bedroom",
    "opas-cabin-2-bedroom",
    "lodge-2-bedroom",
  ],
};

function priorityFor(key: string): Partial<Record<MatchInterest, number>> {
  const out: Partial<Record<MatchInterest, number>> = {};
  for (const [interest, ladder] of Object.entries(INTEREST_LADDERS) as [MatchInterest, string[]][]) {
    const index = ladder.indexOf(key);
    if (index >= 0) out[interest] = index;
  }
  return out;
}

export const ROOM_MERCHANDISING: RoomMerchandising[] = BASE_ROOMS.map((room) => ({
  ...room,
  interestPriority: priorityFor(room.key),
}));

const BY_CATEGORY_ID = new Map<string, RoomMerchandising>();
const BY_LEGACY_NAME = new Map<string, RoomMerchandising>();

function normalizeName(value: string): string {
  return value.trim().toLocaleLowerCase().replace(/[’]/g, "'");
}

for (const room of ROOM_MERCHANDISING) {
  for (const id of room.categoryIds) {
    if (BY_CATEGORY_ID.has(id)) throw new Error(`Duplicate RoomCategoryId merchandising binding: ${id}`);
    BY_CATEGORY_ID.set(id, room);
  }
  for (const name of room.legacyNames) BY_LEGACY_NAME.set(normalizeName(name), room);
}

export function resolveRoomMerchandising(
  categoryId: string,
  roomName?: string | null,
): ResolvedRoomMerchandising | null {
  const byId = BY_CATEGORY_ID.get(categoryId);
  if (byId) return { merchandising: byId, source: "categoryId" };

  // Migration bridge only. This is deliberately isolated here so the matcher,
  // copy layer, cards and drawers never infer business facts from a room name.
  if (roomName) {
    const byName = BY_LEGACY_NAME.get(normalizeName(roomName));
    if (byName) return { merchandising: byName, source: "legacyName" };
  }

  return null;
}

export function merchandisingForKey(key: string): RoomMerchandising | null {
  return ROOM_MERCHANDISING.find((room) => room.key === key) ?? null;
}

export function unresolvedCategoryBindings(
  categories: { Id: string; Name: Record<string, string> }[],
): { key: string; categoryId: string; name: string }[] {
  const out: { key: string; categoryId: string; name: string }[] = [];
  for (const category of categories) {
    if (BY_CATEGORY_ID.has(category.Id)) continue;

    const names = Object.values(category.Name ?? {}).filter(
      (value): value is string => typeof value === "string" && value.trim().length > 0,
    );
    const match = names
      .map((name) => ({ name, legacy: BY_LEGACY_NAME.get(normalizeName(name)) }))
      .find((entry) => !!entry.legacy);

    if (match?.legacy) {
      out.push({
        key: match.legacy.key,
        categoryId: category.Id,
        name: match.name,
      });
    }
  }
  return out;
}
