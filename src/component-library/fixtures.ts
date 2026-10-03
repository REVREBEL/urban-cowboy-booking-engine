import type { RateOffer, RecommendationResult, RoomProduct } from "@/types/find-your-stay";
import type { MatchRoomSummary } from "@/types/booking-ui";

export const demoRooms: RoomProduct[] = [
  {
    id: "alpine-king",
    name: "Alpine King",
    experience: "Alpine",
    tagline: "The iconic indoor soak.",
    description:
      "A hillside suite with a copper clawfoot tub, heated floors, and a picture window facing the forest.",
    features: {
      indoorTub: true,
      heatedFloors: true,
      fireplace: true,
      scenicView: true,
      adults21Plus: true,
      oneBed: true,
      sleeps: 2,
      beds: "1 King",
      sqft: 430,
    },
    images: ["/assets/room-photo-1.png", "/assets/room-photo-2.png"],
    thumbImage: "/assets/room-photo-1.png",
    startingFrom: 425,
    available: true,
  },
  {
    id: "walden-king",
    name: "Walden King",
    experience: "Walden",
    tagline: "Bathing outside among the trees.",
    description:
      "A cabin-style room with a private cedar soaking tub, forest-facing deck, and room to disappear for a while.",
    features: {
      outdoorSoak: true,
      privateDeck: true,
      scenicView: true,
      dogFriendly: true,
      oneBed: true,
      sleeps: 2,
      beds: "1 King",
      sqft: 390,
    },
    images: ["/assets/room-photo-3.png", "/assets/room-photo-4.png"],
    thumbImage: "/assets/room-photo-3.png",
    startingFrom: 395,
    available: true,
  },
  {
    id: "cabin",
    name: "The Cabin",
    experience: "Cabin",
    tagline: "Your own private hideaway.",
    description:
      "A private cabin with a full kitchen, wood stove, porch, and the sort of quiet that makes phones feel unnecessary.",
    features: {
      ownPlace: true,
      fullKitchen: true,
      castIronStove: true,
      privateDeck: true,
      dogFriendly: true,
      separateLivingRoom: true,
      oneBed: true,
      sleeps: 2,
      beds: "1 King",
      sqft: 650,
    },
    images: ["/assets/the-cabin.png", "/assets/room-photo-5.png"],
    thumbImage: "/assets/the-cabin.png",
    startingFrom: 525,
    available: true,
  },
  {
    id: "chalet",
    name: "Mountain View Chalet",
    experience: "Chalet",
    tagline: "The alpine fantasy.",
    description:
      "Big views, generous living space, and enough room to bring the people you actually want to travel with.",
    features: {
      scenicView: true,
      fullKitchen: true,
      separateLivingRoom: true,
      wrapAroundPorch: true,
      familyFriendly: true,
      twoBeds: true,
      sleeps: 4,
      beds: "2 Queens",
      sqft: 900,
    },
    images: ["/assets/room-photo-7.png", "/assets/room-photo-8.png"],
    thumbImage: "/assets/room-photo-7.png",
    startingFrom: 610,
    available: true,
  },
];

export const demoRecommendation: RecommendationResult = {
  room: demoRooms[1],
  score: 96,
  matchedInterests: ["bathe-outside", "mountain-views"],
  explanation: {
    match_badge: "TOP MATCH",
    room_type: "Walden",
    party_summary: "Just right for two",
    interest_summary: "Outdoor soak + scenic views",
    top_match_reason:
      "A private cedar tub in the trees makes this the strongest match for a quiet Catskills stay.",
    benefit_1: "Private outdoor cedar soaking tub",
    benefit_2: "Forest-facing private deck",
    benefit_3: "Dog-friendly",
    season_label: "fall",
    alternate_match_heading: "Also a Strong Fit",
  },
};

export const demoResults: RecommendationResult[] = [
  demoRecommendation,
  {
    room: demoRooms[2],
    score: 88,
    matchedInterests: ["my-own-place"],
  },
  {
    room: demoRooms[0],
    score: 82,
    matchedInterests: ["scenic"],
  },
];

export const demoRates: RateOffer[] = [
  {
    id: "ride-easy",
    roomId: demoRooms[1].id,
    name: "Ride Easy",
    variant: "ride-easy",
    eyebrow: "Best Flexible Rate",
    headline: "Keep Your Options Open",
    description:
      "Flexible booking with a 50% deposit today and room to change plans before arrival.",
    cancellationPolicy:
      "Free changes or cancellation up to 14 days before arrival. Deposit forfeited inside 14 days.",
    nightlyRate: 395,
    available: true,
    pricing: {
      currency: "USD",
      nightly: 395,
      accommodation: 1185,
      taxesAndFees: 142.2,
      total: 1327.2,
      dueNow: 663.6,
      remainingBalance: 663.6,
    },
  },
  {
    id: "sunup",
    roomId: demoRooms[1].id,
    name: "Sunup",
    variant: "sunup",
    eyebrow: "Room + Breakfast",
    headline: "Sunup. Before the Trail.",
    description: "Breakfast included for two each morning.",
    cancellationPolicy: "Same flexible cancellation terms as the best available rate.",
    nightlyRate: 435,
    breakfastIncluded: true,
    available: true,
    pricing: {
      currency: "USD",
      nightly: 435,
      accommodation: 1305,
      taxesAndFees: 156.6,
      total: 1461.6,
      dueNow: 730.8,
      remainingBalance: 730.8,
    },
  },
];

export const demoMatchRoom: MatchRoomSummary = {
  name: "Walden King",
  headline: "Bathing outside among the trees.",
  blurb: "Private cedar soaking tub, forest views, and a deck made for disappearing.",
  features: [
    { label: "Outdoor cedar soaking tub" },
    { label: "Private deck" },
    { label: "Dog friendly" },
  ],
};

export const demoStaySummary = {
  roomName: "Walden King",
  rateName: "Ride Easy",
  checkIn: "2026-10-14",
  checkOut: "2026-10-17",
  adults: 2,
  children: 0,
  dog: true,
  nightlyRate: 395,
  total: 1327.2,
  currency: "USD",
};
