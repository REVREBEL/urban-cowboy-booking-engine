export type PreferenceId =
  | "iconic-tub"
  | "bathe-outside"
  | "my-own-place"
  | "near-everything"
  | "simple-cozy"
  | "mountain-views"
  | "bringing-my-people";

export type PartyType = "partner" | "friends" | "family" | "solo";

export type FeatureKind =
  | "kitchen"
  | "heating"
  | "water"
  | "room"
  | "bed"
  | "basic"
  | "building"
  | "badge";

export type RoomFeature = {
  kind: FeatureKind;
  label: string;
};

export type Room = {
  id: string;
  name: string;
  house: string;
  headline: string;
  blurb: string;
  maxAdults: number;
  maxChildren: number;
  petsWelcome: boolean;
  accessible: boolean;
  privateEntrance: boolean;
  nightlyFrom: number;
  tags: PreferenceId[];
  /** The preferences this room is genuinely the definitive answer to. */
  signature: PreferenceId[];
  features: RoomFeature[];
  /** Plain-language reason to show when a preference matched. */
  reasons: Partial<Record<PreferenceId, string>>;
};

export type Preference = {
  id: PreferenceId;
  label: string;
  description: string;
};

export const PREFERENCES: Preference[] = [
  {
    id: "iconic-tub",
    label: "Iconic Tub",
    description: "The signature indoor soak, right in the room.",
  },
  {
    id: "bathe-outside",
    label: "Soak Outside",
    description: "Cedar bathing out among the trees.",
  },
  {
    id: "my-own-place",
    label: "My Own Place",
    description: "Privacy, your own door, a more independent stay.",
  },
  {
    id: "near-everything",
    label: "Spaces to Gather",
    description: "Shared spaces close to dining, drinks, fireside nights, and the social heart.",
  },
  {
    id: "simple-cozy",
    label: "Simple + Cozy",
    description: "An easier-going stay at a friendlier price.",
  },
  {
    id: "mountain-views",
    label: "Scenic Views",
    description: "Rooms where the woodland setting and mountain ridgeline come first.",
  },
];

/** Only offered when the party is big enough for it to mean something. */
export const GROUP_PREFERENCE: Preference = {
  id: "bringing-my-people",
  label: "Bringing My People",
  description: "Room for the whole crew under one roof.",
};

export const PARTY_TYPES: { id: PartyType; label: string; blurb: string }[] = [
  { id: "partner", label: "Partner", blurb: "Just the two of us" },
  { id: "friends", label: "Friends", blurb: "A crew weekend" },
  { id: "family", label: "Family", blurb: "Grown-ups and kids" },
  { id: "solo", label: "Solo", blurb: "Time to myself" },
];

export const ROOMS: Room[] = [
  {
    id: "alpine-bathing-suite",
    name: "Alpine Bathing Suite",
    house: "Alpine",
    headline: "Iconic indoor soak with the ridgeline out the window",
    blurb:
      "A big copper soaking tub set beside the window, wool blankets, and a view that changes with the weather.",
    maxAdults: 2,
    maxChildren: 0,
    petsWelcome: false,
    accessible: true,
    privateEntrance: false,
    nightlyFrom: 445,
    tags: ["iconic-tub", "mountain-views", "near-everything"],
    signature: ["iconic-tub", "mountain-views"],
    features: [
      { kind: "water", label: "Copper soaking tub in-room" },
      { kind: "bed", label: "King bed" },
      { kind: "heating", label: "Wood-burning stove" },
      { kind: "room", label: "Ridgeline window seat" },
      { kind: "basic", label: "Fast wifi, no TV" },
    ],
    reasons: {
      "iconic-tub": "The soak everyone comes here for, steps from the bed.",
      "mountain-views": "Windows framed straight onto the ridgeline.",
      "near-everything": "A short walk from the bar and the fire.",
    },
  },
  {
    id: "walden-forest-bathing-suite",
    name: "Walden Forest Bathing Suite",
    house: "Walden",
    headline: "Outdoor cedar tub, right in the trees",
    blurb:
      "Your own cedar tub on a private deck under the canopy. Soak outside at dusk, then walk twenty steps back to bed.",
    maxAdults: 2,
    maxChildren: 1,
    petsWelcome: true,
    accessible: false,
    privateEntrance: true,
    nightlyFrom: 495,
    tags: ["bathe-outside", "iconic-tub", "my-own-place", "near-everything"],
    signature: ["bathe-outside"],
    features: [
      { kind: "water", label: "Outdoor cedar soaking tub" },
      { kind: "bed", label: "King bed" },
      { kind: "building", label: "Private deck in the trees" },
      { kind: "heating", label: "Radiant heat + fire pit" },
      { kind: "badge", label: "Guest favorite" },
    ],
    reasons: {
      "bathe-outside": "Cedar tub outside, under the canopy, all yours.",
      "iconic-tub": "A soak worth planning the trip around.",
      "my-own-place": "Own entrance and deck, no shared hallway.",
      "near-everything": "Still an easy walk to dinner and drinks.",
    },
  },
  {
    id: "lodge-room",
    name: "Lodge Room",
    house: "Lodge",
    headline: "Right above the bar, in the middle of it all",
    blurb:
      "Simple, warm and well-worn in the best way. Wake up, come downstairs, you are already where everyone is.",
    maxAdults: 2,
    maxChildren: 1,
    petsWelcome: false,
    accessible: true,
    privateEntrance: false,
    nightlyFrom: 265,
    tags: ["near-everything", "simple-cozy"],
    signature: ["near-everything"],
    features: [
      { kind: "bed", label: "Queen bed" },
      { kind: "room", label: "Vintage furnishings" },
      { kind: "water", label: "Walk-in shower" },
      { kind: "basic", label: "Coffee and tea in-room" },
    ],
    reasons: {
      "near-everything": "You are living directly above the social heart.",
      "simple-cozy": "The friendliest price on the property, and plenty cozy.",
    },
  },
  {
    id: "cabin",
    name: "The Cabin",
    house: "Cabin",
    headline: "A little place in the woods with a wood stove",
    blurb:
      "Stand-alone cabin, one room, one stove, one very good chair. Bring the dog and stay off the grid for a couple of days.",
    maxAdults: 2,
    maxChildren: 2,
    petsWelcome: true,
    accessible: false,
    privateEntrance: true,
    nightlyFrom: 355,
    tags: ["my-own-place", "simple-cozy", "bathe-outside"],
    signature: ["my-own-place", "simple-cozy"],
    features: [
      { kind: "building", label: "Stand-alone cabin" },
      { kind: "heating", label: "Wood-burning stove" },
      { kind: "bed", label: "Queen bed" },
      { kind: "water", label: "Outdoor shower" },
      { kind: "basic", label: "Dog-friendly" },
    ],
    reasons: {
      "my-own-place": "No neighbors, no hallways. Your own front door.",
      "simple-cozy": "Small, warm, and unfussy on purpose.",
      "bathe-outside": "An outdoor shower under the pines.",
    },
  },
  {
    id: "chalet",
    name: "The Chalet",
    house: "Chalet",
    headline: "Your own place, more room to spread out",
    blurb:
      "Two floors, a full kitchen and a deck facing the mountain. The one to book when you want the stay to feel like a house, not a room.",
    maxAdults: 4,
    maxChildren: 2,
    petsWelcome: true,
    accessible: false,
    privateEntrance: true,
    nightlyFrom: 725,
    tags: [
      "my-own-place",
      "mountain-views",
      "bringing-my-people",
      "bathe-outside",
      "iconic-tub",
    ],
    signature: ["my-own-place", "bringing-my-people"],
    features: [
      { kind: "kitchen", label: "Full kitchen" },
      { kind: "building", label: "Two floors, private entrance" },
      { kind: "water", label: "Indoor soaking tub + outdoor shower" },
      { kind: "bed", label: "King + queen" },
      { kind: "heating", label: "Fireplace" },
      { kind: "badge", label: "Go all in" },
    ],
    reasons: {
      "my-own-place": "A whole house to yourselves, kitchen included.",
      "mountain-views": "Deck pointed straight at the mountain.",
      "bringing-my-people": "Sleeps your group without splitting it up.",
      "bathe-outside": "Outdoor shower off the lower deck.",
      "iconic-tub": "Deep indoor tub upstairs.",
    },
  },
  {
    id: "forest-house",
    name: "Forest House",
    house: "Forest House",
    headline: "The whole house, deep in the trees",
    blurb:
      "Three bedrooms, a long table and a fire pit. Built for the group that wants to cook, linger and not go anywhere.",
    maxAdults: 6,
    maxChildren: 3,
    petsWelcome: true,
    accessible: false,
    privateEntrance: true,
    nightlyFrom: 1150,
    tags: ["bringing-my-people", "my-own-place", "bathe-outside"],
    signature: ["bringing-my-people"],
    features: [
      { kind: "kitchen", label: "Chef's kitchen + long table" },
      { kind: "building", label: "Three bedrooms" },
      { kind: "water", label: "Outdoor cedar tub" },
      { kind: "heating", label: "Fire pit" },
      { kind: "bed", label: "Three king beds" },
    ],
    reasons: {
      "bringing-my-people": "Everyone under one roof, one long table.",
      "my-own-place": "An entire house, no shared anything.",
      "bathe-outside": "Cedar tub out back for the whole group.",
    },
  },
  {
    id: "slide-mountain-suite",
    name: "Slide Mountain Suite",
    house: "Slide Mountain",
    headline: "The best look at the ridge on the property",
    blurb:
      "Corner suite with windows on two sides, a deep tub, and the quietest end of the building.",
    maxAdults: 2,
    maxChildren: 1,
    petsWelcome: false,
    accessible: true,
    privateEntrance: false,
    nightlyFrom: 525,
    tags: ["mountain-views", "iconic-tub", "near-everything"],
    signature: ["mountain-views"],
    features: [
      { kind: "room", label: "Corner suite, windows on two sides" },
      { kind: "water", label: "Deep soaking tub" },
      { kind: "bed", label: "King bed" },
      { kind: "heating", label: "Heated floors" },
      { kind: "badge", label: "Best view" },
    ],
    reasons: {
      "mountain-views": "Two walls of windows onto Slide Mountain.",
      "iconic-tub": "A proper deep soak with the view.",
      "near-everything": "Close in, but the quiet end.",
    },
  },
  {
    id: "walden-room",
    name: "Walden Room",
    house: "Walden",
    headline: "Simple and quiet at the edge of the woods",
    blurb:
      "A calm room with good light and a shared cedar bathing deck a few steps away.",
    maxAdults: 2,
    maxChildren: 1,
    petsWelcome: true,
    accessible: true,
    privateEntrance: false,
    nightlyFrom: 295,
    tags: ["simple-cozy", "bathe-outside", "near-everything"],
    signature: ["simple-cozy"],
    features: [
      { kind: "bed", label: "Queen bed" },
      { kind: "water", label: "Shared cedar bathing deck" },
      { kind: "room", label: "Woodland-facing windows" },
      { kind: "basic", label: "Dog-friendly" },
    ],
    reasons: {
      "simple-cozy": "Easy-going, well-priced, still very Cowboy.",
      "bathe-outside": "Cedar bathing deck a few steps from the door.",
      "near-everything": "Short path to dinner and the fire.",
    },
  },
];

export type RateId = "member" | "ride-easy" | "advance";

export type Rate = {
  id: RateId;
  name: string;
  pitch: string;
  terms: string;
  multiplier: number;
};

export const RATES: Rate[] = [
  {
    id: "member",
    name: "Member Rate",
    pitch: "Our best direct price, for joining the Cowboy list.",
    terms: "Join the email list at checkout. Cancel up to 48 hours before.",
    multiplier: 0.9,
  },
  {
    id: "ride-easy",
    name: "RIDE EASY",
    pitch: "The most flexible way to book. Plans change, we get it.",
    terms: "Free cancellation up to 24 hours before arrival.",
    multiplier: 1,
  },
  {
    id: "advance",
    name: "Advance Purchase",
    pitch: "Better value when your plans are firm.",
    terms: "Paid in full today. Non-refundable.",
    multiplier: 0.82,
  },
];

export function rateNightly(room: Room, rate: Rate) {
  return Math.round(room.nightlyFrom * rate.multiplier);
}
