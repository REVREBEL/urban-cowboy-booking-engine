import type {
  MatchInterest,
  ResolvedRoomMerchandising,
  RoomMerchandising,
} from "../types/merchandising";

type BaseRoomMerchandising = Omit<RoomMerchandising, "interestPriority">;

// Scores are copied from docs/match_logic.md. Feature flags are deliberately
// conservative and only represent facts we are willing to surface as guest-facing copy.
// Mews calls lodging room types "Space Categories" and exposes their IDs as RoomCategoryId.
// In our hotel domain these are Room Types, so mewsRoomTypeId stores that integration key.
// The Room Type Group is our own layer because Mews does not provide one.
const BASE_ROOMS: BaseRoomMerchandising[] = [
  {
    key: "alpine-bathing-suite",
    mewsRoomTypeId: "9cbb022a-742f-4abe-9586-b10600706caf",
    legacyNames: ["Alpine Bathing Suite"],
    roomTypeGroupKey: "alpine",
    cardTagline: "Clawfoot tub by the window overlooking the changing woods",
    dogPolicy: "allowed",
    agePolicy: "adultsOnly21",
    partyScores: { partner: 5, friends: 3, family: 2, solo: 4 },
    interestScores: { "indoor-sanctuaries": 5, "connection-with-nature": 0, "your-own-hideaway": 0, "scenic-mountain-views": 5, "simple-comforts": 2 },
    features: { indoorTub: true, scenicView: true, privateDeck: true, heatedFloors: true },
    matchReasons: {
      "indoor-sanctuaries": "its signature indoor soaking tub",
      "scenic-mountain-views": "its mountain-and-forest outlook",
    },
  },
  {
    key: "alpine-bathing-suite-den",
    mewsRoomTypeId: "7ed2f1d1-1bcc-4dd1-8ebf-b10600706caf",
    legacyNames: ["Alpine Bathing Suite with Den"],
    roomTypeGroupKey: "alpine",
    cardTagline: "Hand-hammered copper soaking tub and built-in chaise den by the fire",
    dogPolicy: "allowed",
    agePolicy: "adultsOnly21",
    partyScores: { partner: 5, friends: 3, family: 2, solo: 3 },
    interestScores: { "indoor-sanctuaries": 5, "connection-with-nature": 0, "your-own-hideaway": 0, "scenic-mountain-views": 5, "simple-comforts": 1 },
    features: { indoorTub: true, scenicView: true, privateDeck: true, heatedFloors: true },
    matchReasons: {
      "indoor-sanctuaries": "its signature indoor soaking tub",
      "scenic-mountain-views": "its elevated mountain-and-forest views",
    },
  },
  {
    key: "alpine-penthouse-bathing-suite",
    mewsRoomTypeId: "33536114-501b-40e9-87f2-b10600706caf",
    legacyNames: ["Alpine Penthouse Bathing Suite"],
    roomTypeGroupKey: "alpine",
    cardTagline: "Cathedral ceilings, private balcony, copper tub and crackling fireplace",
    dogPolicy: "allowed",
    agePolicy: "adultsOnly21",
    partyScores: { partner: 5, friends: 3, family: 2, solo: 3 },
    interestScores: { "indoor-sanctuaries": 5, "connection-with-nature": 0, "your-own-hideaway": 0, "scenic-mountain-views": 5, "simple-comforts": 1 },
    features: {
      indoorTub: true,
      scenicView: true,
      privateDeck: true,
      heatedFloors: true,
      fireplace: true,
    },
    matchReasons: {
      "indoor-sanctuaries": "its signature indoor soaking tub",
      "scenic-mountain-views": "its elevated penthouse setting and balcony views",
    },
  },
  {
    key: "walden-forest-bathing-suite",
    mewsRoomTypeId: "c76c83ca-eeef-4c9a-80a5-b10600706caf",
    legacyNames: ["Walden Forest Bathing Suite"],
    roomTypeGroupKey: "walden",
    cardTagline: "Hand-built cedar soaking tub on private deck with sunrise diamond window",
    dogPolicy: "allowed",
    agePolicy: "adultsOnly21",
    partyScores: { partner: 5, friends: 3, family: 2, solo: 4 },
    interestScores: { "indoor-sanctuaries": 0, "connection-with-nature": 5, "your-own-hideaway": 0, "scenic-mountain-views": 4, "simple-comforts": 2 },
    features: { outdoorSoak: true, scenicView: true, privateDeck: true },
    matchReasons: {
      "connection-with-nature": "its cedar soaking tub on a private deck among the trees",
      "scenic-mountain-views": "its private deck overlooking the woods",
    },
  },
  {
    key: "walden-sunrise-bathing-suite",
    mewsRoomTypeId: "074257cb-3cce-4dc2-b74c-b10600706caf",
    legacyNames: ["Walden Sunrise Bathing Suite"],
    roomTypeGroupKey: "walden",
    dogPolicy: "allowed",
    agePolicy: "adultsOnly21",
    partyScores: { partner: 5, friends: 3, family: 2, solo: 3 },
    interestScores: { "indoor-sanctuaries": 0, "connection-with-nature": 5, "your-own-hideaway": 0, "scenic-mountain-views": 5, "simple-comforts": 1 },
    features: { outdoorSoak: true, scenicView: true, privateDeck: true },
    matchReasons: {
      "connection-with-nature": "its outdoor cedar soaking tub",
      "scenic-mountain-views": "its sunrise-facing private porch and mountain views",
    },
  },
  {
    key: "walden-forest-bathing-suite-den",
    mewsRoomTypeId: "a9deaf36-5ab1-47ce-ac68-b10600706caf",
    legacyNames: ["Walden Forest Bathing Suite with Den"],
    roomTypeGroupKey: "walden",
    dogPolicy: "notAllowed",
    agePolicy: "adultsOnly21",
    partyScores: { partner: 5, friends: 3, family: 2, solo: 3 },
    interestScores: { "indoor-sanctuaries": 0, "connection-with-nature": 5, "your-own-hideaway": 0, "scenic-mountain-views": 4, "simple-comforts": 1 },
    features: { outdoorSoak: true, scenicView: true, privateDeck: true },
    matchReasons: {
      "connection-with-nature": "its cedar soaking tub on a private deck among the trees",
      "scenic-mountain-views": "its private deck in the forest",
    },
  },
  {
    key: "walden-king",
    mewsRoomTypeId: "2f42029c-44ea-4058-ab0e-b10600706caf",
    legacyNames: ["Walden King"],
    roomTypeGroupKey: "walden",
    cardTagline: "Simple, warm, tucked into the woods with private morning deck",
    dogPolicy: "allowed",
    agePolicy: "adultsOnly21",
    partyScores: { partner: 4, friends: 3, family: 2, solo: 5 },
    interestScores: { "indoor-sanctuaries": 0, "connection-with-nature": 0, "your-own-hideaway": 0, "scenic-mountain-views": 4, "simple-comforts": 5 },
    features: { scenicView: true, privateDeck: true, simpleCozy: true },
    matchReasons: {
      "scenic-mountain-views": "its forest-facing private deck",
      "simple-comforts": "its classic cabin-style king-room setup",
    },
  },
  {
    key: "cabin",
    mewsRoomTypeId: "e90c2a72-1cf8-4246-84d7-b10600706caf",
    legacyNames: ["Cabin", "The Cabin"],
    roomTypeGroupKey: "cabin",
    dogPolicy: "allowed",
    agePolicy: "none",
    partyScores: { partner: 5, friends: 4, family: 4, solo: 3 },
    interestScores: { "indoor-sanctuaries": 5, "connection-with-nature": 0, "your-own-hideaway": 5, "scenic-mountain-views": 3, "simple-comforts": 2 },
    features: { indoorTub: true, ownPlace: true, fireplace: true },
    matchReasons: {
      "indoor-sanctuaries": "its copper clawfoot tub",
      "your-own-hideaway": "its standalone cabin setting",
    },
  },
  {
    key: "chalet",
    mewsRoomTypeId: "87342626-a461-444b-9a72-b10600706caf",
    legacyNames: ["Chalet", "The Chalet"],
    roomTypeGroupKey: "chalet",
    dogPolicy: "allowed",
    agePolicy: "none",
    partyScores: { partner: 5, friends: 4, family: 5, solo: 2 },
    interestScores: { "indoor-sanctuaries": 0, "connection-with-nature": 5, "your-own-hideaway": 5, "scenic-mountain-views": 4, "simple-comforts": 2 },
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
      "connection-with-nature": "its private cedar soaking tub",
      "your-own-hideaway": "its standalone chalet setting",
      "scenic-mountain-views": "its picture windows and private deck",
    },
  },
  {
    key: "forest-house-queen",
    mewsRoomTypeId: "bce0e941-af9f-4239-8449-b1f101307a72",
    legacyNames: ["Forest House Queen", "Forest Haus Queen"],
    roomTypeGroupKey: "forest-house",
    dogPolicy: "notAllowed",
    agePolicy: "none",
    partyScores: { partner: 4, friends: 3, family: 3, solo: 5 },
    interestScores: { "indoor-sanctuaries": 0, "connection-with-nature": 0, "your-own-hideaway": 0, "scenic-mountain-views": 2, "simple-comforts": 5 },
    features: { simpleCozy: true },
    matchReasons: { "simple-comforts": "its cozy, straightforward Catskills room experience" },
  },
  {
    key: "forest-house-king",
    mewsRoomTypeId: "38cebace-6f26-47fd-b7e0-b1f1012d30a6",
    legacyNames: ["Forest House King", "Forest Haus King"],
    roomTypeGroupKey: "forest-house",
    dogPolicy: "notAllowed",
    agePolicy: "none",
    partyScores: { partner: 4, friends: 3, family: 4, solo: 4 },
    interestScores: { "indoor-sanctuaries": 0, "connection-with-nature": 0, "your-own-hideaway": 0, "scenic-mountain-views": 4, "simple-comforts": 4 },
    features: { scenicView: true, simpleCozy: true, privateDeck: true },
    matchReasons: {
      "scenic-mountain-views": "its private balcony at treetop level",
      "simple-comforts": "its comfortable king-room setup",
    },
  },
  {
    key: "opas-cabin-2-bedroom",
    mewsRoomTypeId: "a2230bdd-1770-41b6-8932-b202001df350",
    legacyNames: ["Opa’s Cabin 2 Bedroom", "Opa's Cabin 2 Bedroom"],
    roomTypeGroupKey: "opas",
    dogPolicy: "unknown",
    agePolicy: "none",
    partyScores: { partner: 2, friends: 5, family: 5, solo: 1 },
    interestScores: { "indoor-sanctuaries": 0, "connection-with-nature": 0, "your-own-hideaway": 5, "scenic-mountain-views": 2, "simple-comforts": 3 },
    features: { ownPlace: true, fireplace: true, fullKitchen: true },
    matchReasons: { "your-own-hideaway": "its independent century-old cabin setting" },
  },
  {
    key: "opas-cabin-4-bedroom",
    mewsRoomTypeId: "e26a0e14-0ce7-467d-a911-b1f1012b01b2",
    legacyNames: ["Opa’s Cabin 4 Bedroom", "Opa's Cabin 4 Bedroom"],
    roomTypeGroupKey: "opas",
    dogPolicy: "unknown",
    agePolicy: "none",
    partyScores: { partner: 1, friends: 5, family: 5, solo: 0 },
    interestScores: { "indoor-sanctuaries": 0, "connection-with-nature": 0, "your-own-hideaway": 5, "scenic-mountain-views": 2, "simple-comforts": 2 },
    features: { ownPlace: true, fireplace: true, fullKitchen: true },
    matchReasons: { "your-own-hideaway": "its independent four-bedroom cabin setting" },
  },
  {
    key: "lodge-penthouse-suite",
    mewsRoomTypeId: "1bcedebb-a880-4baf-86f3-b10600706caf",
    legacyNames: ["Lodge Penthouse Suite"],
    roomTypeGroupKey: "lodge",
    cardTagline: "Handcrafted exposed branch headboard, copper clawfoot tub, private deck and wet bar",
    dogPolicy: "allowed",
    agePolicy: "adult21Required",
    partyScores: { partner: 5, friends: 3, family: 4, solo: 2 },
    interestScores: { "indoor-sanctuaries": 5, "connection-with-nature": 0, "your-own-hideaway": 2, "scenic-mountain-views": 5, "simple-comforts": 1 },
    features: { indoorTub: true, scenicView: true, privateDeck: true, separateLivingRoom: true },
    matchReasons: {
      "indoor-sanctuaries": "its copper clawfoot tub",
      "scenic-mountain-views": "its elevated Lodge setting and private deck",
    },
  },
  {
    key: "lodge-3-bedroom-suite",
    mewsRoomTypeId: "92bd10f2-58bf-4e9a-8985-b10600706caf",
    legacyNames: ["Lodge 3 Bedroom Suite", "Lodge 3-Bedroom Suite"],
    roomTypeGroupKey: "lodge",
    cardTagline: "Three bedrooms, generous shared living parlor, stone fireplace and deck",
    dogPolicy: "allowed",
    agePolicy: "adult21Required",
    partyScores: { partner: 2, friends: 5, family: 5, solo: 0 },
    interestScores: { "indoor-sanctuaries": 4, "connection-with-nature": 0, "your-own-hideaway": 2, "scenic-mountain-views": 5, "simple-comforts": 2 },
    features: { indoorTub: true, scenicView: true, privateDeck: true, fireplace: true, separateLivingRoom: true },
    matchReasons: {
      "indoor-sanctuaries": "its copper clawfoot tub",
      "scenic-mountain-views": "its sweeping Lodge views",
    },
  },
  {
    key: "lodge-2-bedroom",
    mewsRoomTypeId: "be081636-bd06-4273-bdc3-b10600706caf",
    legacyNames: ["Lodge 2 Bedroom", "Lodge 2-Bedroom"],
    roomTypeGroupKey: "lodge",
    dogPolicy: "allowed",
    agePolicy: "adult21Required",
    partyScores: { partner: 2, friends: 5, family: 5, solo: 1 },
    interestScores: { "indoor-sanctuaries": 0, "connection-with-nature": 0, "your-own-hideaway": 1, "scenic-mountain-views": 4, "simple-comforts": 3 },
    features: { scenicView: true, privateDeck: true },
    matchReasons: { "scenic-mountain-views": "its private deck above the main Lodge" },
  },
  {
    key: "lodge-king",
    mewsRoomTypeId: "ea80fc33-3aa0-4a90-88db-b10600706caf",
    legacyNames: ["Lodge King"],
    roomTypeGroupKey: "lodge",
    cardTagline: "Comfortable King room directly above the dining parlor and evening fire",
    dogPolicy: "allowed",
    agePolicy: "adult21Required",
    partyScores: { partner: 4, friends: 3, family: 4, solo: 5 },
    interestScores: { "indoor-sanctuaries": 0, "connection-with-nature": 0, "your-own-hideaway": 0, "scenic-mountain-views": 3, "simple-comforts": 5 },
    features: { simpleCozy: true },
    matchReasons: { "simple-comforts": "its easy, classic Lodge-room setup" },
  },
  {
    key: "slide-mountain-haus-5-room",
    mewsRoomTypeId: "d68e4504-7944-43a7-8e12-b1f1012d6350",
    legacyNames: ["Slide Mountain Haus 5 Bedroom", "Slide Mountain Haus 5 Room", "Slide Mountain Haus Full Haus"],
    roomTypeGroupKey: "slide-mountain",
    dogPolicy: "allowed",
    agePolicy: "none",
    partyScores: { partner: 0, friends: 5, family: 5, solo: 0 },
    interestScores: { "indoor-sanctuaries": 0, "connection-with-nature": 0, "your-own-hideaway": 5, "scenic-mountain-views": 3, "simple-comforts": 3 },
    features: { ownPlace: true, fullKitchen: true, separateLivingRoom: true },
    matchReasons: { "your-own-hideaway": "its full-house setup with kitchen and living room" },
  },
  {
    key: "slide-mountain-haus-2-bedroom",
    mewsRoomTypeId: "d0961acc-145f-4ad9-a965-b1f1012e7f00",
    legacyNames: ["Slide Mountain Haus 2 Bedroom"],
    roomTypeGroupKey: "slide-mountain",
    dogPolicy: "notAllowed",
    agePolicy: "none",
    partyScores: { partner: 1, friends: 5, family: 5, solo: 0 },
    interestScores: { "indoor-sanctuaries": 0, "connection-with-nature": 0, "your-own-hideaway": 3, "scenic-mountain-views": 3, "simple-comforts": 4 },
    features: { simpleCozy: true, fullKitchen: true, separateLivingRoom: true },
    matchReasons: { "simple-comforts": "its straightforward small-group house setup" },
  },
  {
    key: "slide-mountain-haus-double-queen",
    mewsRoomTypeId: "1c035d90-e174-4af4-95a1-b1f1012ed296",
    legacyNames: ["Slide Mountain Haus Double Queen"],
    roomTypeGroupKey: "slide-mountain",
    dogPolicy: "unknown",
    agePolicy: "none",
    partyScores: { partner: 2, friends: 5, family: 4, solo: 2 },
    interestScores: { "indoor-sanctuaries": 0, "connection-with-nature": 0, "your-own-hideaway": 0, "scenic-mountain-views": 4, "simple-comforts": 5 },
    features: { scenicView: true, simpleCozy: true },
    matchReasons: {
      "scenic-mountain-views": "its porch view toward Slide Mountain",
      "simple-comforts": "its practical double-queen setup",
    },
  },
  {
    key: "mountain-view-haus-2-bedroom",
    mewsRoomTypeId: "81ecc428-8c85-405e-8607-b2a500e66429",
    legacyNames: ["Mountain View Haus 2 Bedroom"],
    roomTypeGroupKey: "mountain-view",
    dogPolicy: "unknown",
    agePolicy: "none",
    partyScores: { partner: 2, friends: 5, family: 5, solo: 0 },
    interestScores: { "indoor-sanctuaries": 0, "connection-with-nature": 0, "your-own-hideaway": 5, "scenic-mountain-views": 5, "simple-comforts": 3 },
    features: { ownPlace: true, scenicView: true, fireplace: true, fullKitchen: true },
    matchReasons: {
      "your-own-hideaway": "its independent house setup",
      "scenic-mountain-views": "its view across the valley toward the Big Indian Wilderness",
    },
  },
  {
    key: "mountain-view-haus-4-bedroom",
    mewsRoomTypeId: "9f2f57b0-9533-46f0-9d9b-b282017b3741",
    legacyNames: ["Mountain View Haus 4 Bedroom"],
    roomTypeGroupKey: "mountain-view",
    dogPolicy: "unknown",
    agePolicy: "none",
    partyScores: { partner: 1, friends: 5, family: 5, solo: 0 },
    interestScores: { "indoor-sanctuaries": 0, "connection-with-nature": 0, "your-own-hideaway": 5, "scenic-mountain-views": 5, "simple-comforts": 2 },
    features: { ownPlace: true, scenicView: true, fireplace: true, fullKitchen: true },
    matchReasons: {
      "your-own-hideaway": "its independent four-bedroom house setup",
      "scenic-mountain-views": "its view across the valley toward the Big Indian Wilderness",
    },
  },
];

const INTEREST_LADDERS: Partial<Record<MatchInterest, string[]>> = {
  "indoor-sanctuaries": [
    "alpine-bathing-suite",
    "alpine-bathing-suite-den",
    "alpine-penthouse-bathing-suite",
    "lodge-penthouse-suite",
    "cabin",
    "lodge-3-bedroom-suite",
  ],
  "connection-with-nature": [
    "walden-forest-bathing-suite",
    "walden-sunrise-bathing-suite",
    "walden-forest-bathing-suite-den",
    "chalet",
  ],
  "your-own-hideaway": [
    "cabin",
    "chalet",
    "mountain-view-haus-2-bedroom",
    "opas-cabin-2-bedroom",
    "slide-mountain-haus-5-room",
    "mountain-view-haus-4-bedroom",
    "opas-cabin-4-bedroom",
    "slide-mountain-haus-2-bedroom",
  ],
  "scenic-mountain-views": [
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
  "simple-comforts": [
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

const BY_MEWS_ROOM_TYPE_ID = new Map<string, RoomMerchandising>();
const BY_LEGACY_NAME = new Map<string, RoomMerchandising>();

function normalizeName(value: string): string {
  return value.trim().toLocaleLowerCase().replace(/[’]/g, "'");
}

for (const room of ROOM_MERCHANDISING) {
  const id = room.mewsRoomTypeId;
  if (BY_MEWS_ROOM_TYPE_ID.has(id)) throw new Error(`Duplicate Mews Room Type ID binding: ${id}`);
  BY_MEWS_ROOM_TYPE_ID.set(id, room);
  for (const name of room.legacyNames) BY_LEGACY_NAME.set(normalizeName(name), room);
}

export function resolveRoomMerchandising(
  mewsRoomTypeId: string,
  roomName?: string | null,
): ResolvedRoomMerchandising | null {
  const byId = BY_MEWS_ROOM_TYPE_ID.get(mewsRoomTypeId);
  if (byId) return { merchandising: byId, source: "mewsRoomTypeId" };

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

export function unresolvedRoomTypeBindings(
  categories: { Id: string; Name: Record<string, string> }[],
): { key: string; mewsRoomTypeId: string; name: string }[] {
  const out: { key: string; mewsRoomTypeId: string; name: string }[] = [];
  for (const category of categories) {
    if (BY_MEWS_ROOM_TYPE_ID.has(category.Id)) continue;

    const names = Object.values(category.Name ?? {}).filter(
      (value): value is string => typeof value === "string" && value.trim().length > 0,
    );
    const match = names
      .map((name) => ({ name, legacy: BY_LEGACY_NAME.get(normalizeName(name)) }))
      .find((entry) => !!entry.legacy);

    if (match?.legacy) {
      out.push({
        key: match.legacy.key,
        mewsRoomTypeId: category.Id,
        name: match.name,
      });
    }
  }
  return out;
}
