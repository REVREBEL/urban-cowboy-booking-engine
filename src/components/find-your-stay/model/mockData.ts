import type { RoomProduct, RateOffer } from './types';

/* ── Room catalogue ─────────────────────────────────────────────────────────
   Scoring columns per match_logic.md:
   partner / friends / family / solo / iconTub / outdoorSoak / ownPlace / scenic / simpleCozy
   ──────────────────────────────────────────────────────────────────────────── */

export const ROOMS: RoomProduct[] = [
  {
    id: 'alpine-bathing-suite',
    name: 'Alpine Bathing Suite',
    experience: 'Alpine',
    tagline: 'The iconic copper tub, yours alone.',
    description: "Tennessee's most-photographed soak. A private copper tub, stone surround, and a valley view that turns a bath into an event.",
    features: {
      dogFriendly: true, adults21Plus: true, indoorTub: true, scenicView: true, walkInShower: true,
      privateDeck: true, oneBed: true, sleeps: 2, beds: '1 King', sqft: 420,
    },
    images: ['/assets/alpine-suite-1.jpg', '/assets/alpine-suite-2.jpg'],
    thumbImage: '/assets/room-thumb-alpine.jpg',
    startingFrom: 395,
    available: true,
    matchScores: { partner: 5, friends: 2, family: 1, solo: 4, iconTub: 5, outdoorSoak: 2, ownPlace: 3, scenic: 5, simpleCozy: 2 },
  },
  {
    id: 'alpine-bathing-suite-den',
    name: 'Alpine Bathing Suite with Den',
    experience: 'Alpine',
    tagline: 'More room, same iconic tub.',
    description: 'Everything the Alpine Suite offers, plus a separate den for working late or spreading out a long weekend.',
    features: {
      dogFriendly: true, adults21Plus: true, indoorTub: true, scenicView: true, walkInShower: true,
      privateDeck: true, den: true, oneBed: true, sleeps: 3, beds: '1 King + sofa', sqft: 580,
    },
    images: ['/assets/alpine-den-1.jpg'],
    thumbImage: '/assets/room-thumb-alpine-den.jpg',
    startingFrom: 445,
    available: true,
    matchScores: { partner: 4, friends: 4, family: 2, solo: 3, iconTub: 5, outdoorSoak: 2, ownPlace: 3, scenic: 5, simpleCozy: 2 },
  },
  {
    id: 'walden-forest-bathing-suite',
    name: 'Walden Forest Bathing Suite',
    experience: 'Walden',
    tagline: 'A cedar tub set in the pines.',
    description: 'Step outside and into your own cedar soaking tub, sheltered by a canopy of white pines. No neighbors visible.',
    features: {
      dogFriendly: false, adults21Plus: true, outdoorSoak: true, scenicView: true, walkInShower: true,
      privateDeck: true, oneBed: true, sleeps: 2, beds: '1 King', sqft: 390,
    },
    images: ['/assets/walden-1.jpg'],
    thumbImage: '/assets/room-thumb-walden.jpg',
    startingFrom: 375,
    available: true,
    matchScores: { partner: 5, friends: 2, family: 1, solo: 4, iconTub: 2, outdoorSoak: 5, ownPlace: 3, scenic: 5, simpleCozy: 3 },
  },
  {
    id: 'walden-forest-bathing-suite-den',
    name: 'Walden Forest Bathing Suite with Den',
    experience: 'Walden',
    tagline: 'Cedar soak, extra space.',
    description: 'The Walden experience with an attached den — room to breathe, read, or simply linger.',
    features: {
      dogFriendly: false, adults21Plus: true, outdoorSoak: true, scenicView: true, walkInShower: true,
      privateDeck: true, den: true, oneBed: true, sleeps: 3, beds: '1 King + sofa', sqft: 540,
    },
    images: ['/assets/walden-den-1.jpg'],
    thumbImage: '/assets/room-thumb-walden-den.jpg',
    startingFrom: 425,
    available: true,
    matchScores: { partner: 4, friends: 4, family: 2, solo: 3, iconTub: 2, outdoorSoak: 5, ownPlace: 3, scenic: 5, simpleCozy: 3 },
  },
  {
    id: 'lodge-room',
    name: 'Lodge Room',
    experience: 'Lodge',
    tagline: 'The classic cowboy stay.',
    description: 'Hand-hewn timber, cast-iron stove, and a wraparound porch shared with the whole lodge. Simple. Right.',
    features: {
      dogFriendly: true, adults21Plus: false, simpleCozy: true, scenicView: true, walkInShower: true,
      castIronStove: true, wrapAroundPorch: true, trailheadAccess: true, oneBed: true, twoBeds: true,
      sleeps: 2, beds: '1 King or 2 Queens', sqft: 310,
    },
    images: ['/assets/lodge-room-1.jpg'],
    thumbImage: '/assets/room-thumb-lodge.jpg',
    startingFrom: 225,
    available: true,
    matchScores: { partner: 3, friends: 4, family: 4, solo: 4, iconTub: 1, outdoorSoak: 1, ownPlace: 1, scenic: 3, simpleCozy: 5 },
  },
  {
    id: 'forest-house',
    name: 'Forest House',
    experience: 'Forest House',
    tagline: 'A full house in the trees.',
    description: 'A private three-bedroom home deep in the forest. Your own kitchen, living room, and two decks. Best for groups.',
    features: {
      dogFriendly: false, adults21Plus: false, ownPlace: true, scenicView: true, walkInShower: true,
      fullKitchen: true, separateLivingRoom: true, privateDeck: true, familyFriendly: true,
      trailheadAccess: true, twoBeds: true, sleeps: 8, beds: '3 Bedrooms', sqft: 1800,
    },
    images: ['/assets/forest-house-1.jpg'],
    thumbImage: '/assets/room-thumb-forest-house.jpg',
    startingFrom: 695,
    available: true,
    matchScores: { partner: 2, friends: 5, family: 5, solo: 1, iconTub: 1, outdoorSoak: 1, ownPlace: 5, scenic: 4, simpleCozy: 3 },
  },
  {
    id: 'cabin',
    name: 'Cabin',
    experience: 'Cabin',
    tagline: 'Yours alone, tucked in the pines.',
    description: 'A private cabin with a wood-burning fireplace, full kitchen, and a porch built for evening whiskey.',
    features: {
      dogFriendly: true, adults21Plus: false, ownPlace: true, fireplace: true, walkInShower: true,
      fullKitchen: true, privateDeck: true, familyFriendly: true, trailheadAccess: true,
      esopusCreek: true, oneBed: true, sleeps: 4, beds: '1 King + Bunk', sqft: 720,
    },
    images: ['/assets/cabin-1.jpg'],
    thumbImage: '/assets/room-thumb-cabin.jpg',
    startingFrom: 345,
    available: true,
    matchScores: { partner: 4, friends: 3, family: 4, solo: 3, iconTub: 1, outdoorSoak: 2, ownPlace: 5, scenic: 2, simpleCozy: 5 },
  },
  {
    id: 'chalet',
    name: 'Chalet',
    experience: 'Chalet',
    tagline: 'A ridge-top perch.',
    description: 'Floor-to-ceiling windows, a deck facing the valley, and enough room for the whole crew.',
    features: {
      dogFriendly: true, adults21Plus: false, ownPlace: true, scenicView: true, walkInShower: true,
      separateLivingRoom: true, privateDeck: true, wetBar: true, familyFriendly: true,
      twoBeds: true, sleeps: 6, beds: '2 Kings + Bunk', sqft: 1250,
    },
    images: ['/assets/chalet-1.jpg'],
    thumbImage: '/assets/room-thumb-chalet.jpg',
    startingFrom: 595,
    available: true,
    matchScores: { partner: 3, friends: 5, family: 5, solo: 2, iconTub: 1, outdoorSoak: 2, ownPlace: 5, scenic: 5, simpleCozy: 3 },
  },
  {
    id: 'opas-room',
    name: "Opa's Room",
    experience: "Opa's",
    tagline: 'A quiet corner at the main house.',
    description: "Named for the original owner's grandfather. Small, precise, and exactly enough — a room that knows what it is.",
    features: {
      dogFriendly: true, adults21Plus: false, simpleCozy: true, walkInShower: true,
      wrapAroundPorch: true, oneBed: true, sleeps: 2, beds: '1 Queen', sqft: 240,
    },
    images: ['/assets/opas-1.jpg'],
    thumbImage: '/assets/room-thumb-opas.jpg',
    startingFrom: 195,
    available: true,
    matchScores: { partner: 3, friends: 2, family: 2, solo: 5, iconTub: 1, outdoorSoak: 1, ownPlace: 2, scenic: 2, simpleCozy: 5 },
  },
];

export const RATE_OFFERS: RateOffer[] = [
  {
    id: 'ride-easy-flexible',
    roomId: '',
    name: 'Ride Easy',
    variant: 'ride-easy',
    eyebrow: 'FLEXIBLE RATE',
    headline: 'Ride Easy',
    description: 'Book now, change your mind later. Cancel up to 48 hours before arrival for a full refund.',
    nightlyRate: 0,
    totalStay: 0,
    cancellationPolicy: 'Free cancellation up to 48 hours before check-in.',
    breakfastIncluded: false,
    available: true,
  },
  {
    id: 'plan-ahead',
    roomId: '',
    name: 'Plan Ahead',
    variant: 'plan-ahead',
    eyebrow: '21+ DAYS OUT',
    headline: 'Plan Ahead',
    description: 'Lock in your stay at a lower rate when you book at least 3 weeks in advance.',
    nightlyRate: 0,
    totalStay: 0,
    cancellationPolicy: 'Non-refundable.',
    breakfastIncluded: false,
    advanceDays: 21,
    available: true,
  },
  {
    id: 'sunup',
    roomId: '',
    name: 'Sunup',
    variant: 'sunup',
    eyebrow: 'BREAKFAST INCLUDED',
    headline: 'Sunup',
    description: 'Start the morning right. A full Texas-style breakfast for two, cooked to order.',
    nightlyRate: 0,
    totalStay: 0,
    cancellationPolicy: 'Free cancellation up to 48 hours before check-in.',
    breakfastIncluded: true,
    available: true,
  },
  {
    id: 'stay-a-while',
    roomId: '',
    name: 'Stay a While',
    variant: 'stay-a-while',
    eyebrow: '4+ NIGHTS',
    headline: 'Stay a While',
    description: 'For guests who settle in properly. Best rate available for extended stays of four nights or more.',
    nightlyRate: 0,
    totalStay: 0,
    cancellationPolicy: 'Free cancellation up to 72 hours before check-in.',
    breakfastIncluded: false,
    minNights: 4,
    available: true,
  },
  {
    id: 'outfit',
    roomId: '',
    name: 'Welcome to the Outfit',
    variant: 'outfit',
    eyebrow: 'MEMBER RATE',
    headline: 'Welcome to the Outfit',
    description: 'The best rate on property, reserved for Outfit members. Join once, save forever.',
    nightlyRate: 0,
    totalStay: 0,
    cancellationPolicy: 'Free cancellation up to 48 hours before check-in. Member terms apply.',
    breakfastIncluded: false,
    memberOnly: true,
    available: true,
  },
];

export function getRoomsForAvailability(
  checkIn: string,
  checkOut: string,
  adults: number,
  children: number,
): RoomProduct[] {
  return ROOMS.filter((r) => {
    if (!r.available) return false;
    const maxSleeps = r.features.sleeps ?? 2;
    return adults + children <= maxSleeps;
  });
}

export function getRatesForRoom(
  roomId: string,
  checkIn: string,
  checkOut: string,
  adults: number,
): RateOffer[] {
  const room = ROOMS.find((r) => r.id === roomId);
  if (!room) return [];

  const nights = checkIn && checkOut
    ? Math.max(1, Math.round((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / 86400000))
    : 2;

  const base = room.startingFrom;

  return RATE_OFFERS.map((rate) => {
    let nightly = base;
    if (rate.variant === 'plan-ahead') nightly = Math.round(base * 0.85);
    if (rate.variant === 'sunup') nightly = Math.round(base * 1.12);
    if (rate.variant === 'stay-a-while') nightly = Math.round(base * 0.78);
    if (rate.variant === 'outfit') nightly = Math.round(base * 0.72);

    const minNightsMet = rate.minNights ? nights >= rate.minNights : true;
    const advanceMet = rate.advanceDays
      ? checkIn
        ? Math.round((new Date(checkIn).getTime() - Date.now()) / 86400000) >= rate.advanceDays
        : false
      : true;

    return {
      ...rate,
      roomId,
      nightlyRate: nightly,
      totalStay: nightly * nights,
      available: minNightsMet && advanceMet,
    };
  }).filter((r) => r.available);
}
