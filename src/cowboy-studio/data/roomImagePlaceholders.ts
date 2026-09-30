/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Official Urban Cowboy Room Image Assets & Placeholders
 * Stored on file to use across the booking engine for room showcases,
 * architectural building spreads, rate selection cards, and detail galleries.
 */

export const ROOM_IMAGE_ASSETS = {
  // The Lodge
  LODGE_PENTHOUSE_LIVING_ROOM:
    'https://res.cloudinary.com/revrebel/image/upload/v1790025065/cowboy/The_Lodge_Penthouse_Living_Room_hlnr33.jpg',
  LODGE_PENTHOUSE_BEDROOM:
    'https://res.cloudinary.com/revrebel/image/upload/v1790025051/cowboy/The_Lodge_Penthouse_001_owujhh.jpg',

  // Walden Haus
  WALDEN_SUNRISE_BATHING_SUITE:
    'https://res.cloudinary.com/revrebel/image/upload/v1790024989/cowboy/Walden_Haus_Sunrise_Bathing_Suite_kg5m9s.jpg',
  WALDEN_FOREST_BATHING_SUITE:
    'https://res.cloudinary.com/revrebel/image/upload/v1790024980/cowboy/Walden_Haus_Forest_Bathing_Suite_Long_Angle_Door_Open_r9rukz.jpg',

  // Alpine Haus
  ALPINE_PENTHOUSE_COPPER_TUB:
    'https://res.cloudinary.com/revrebel/image/upload/v1790024900/cowboy/Alpine_Penthouse_Copper_Soaking_Tub_qx9apf.jpg',
  ALPINE_HEADBOARD:
    'https://res.cloudinary.com/revrebel/image/upload/v1790024888/cowboy/Alpine_Headboard_xh3syd.jpg',
  ALPINE_BATHING_SUITE:
    'https://res.cloudinary.com/revrebel/image/upload/v1790024884/cowboy/Alpine_Bathing_Suite_wosvih.jpg'
} as const;

export type RoomImageAssetKey = keyof typeof ROOM_IMAGE_ASSETS;

export interface RoomImagePlaceholder {
  id: string;
  assetKey: RoomImageAssetKey;
  title: string;
  buildingId: 'alpine' | 'walden' | 'lodge';
  buildingName: string;
  url: string;
  description: string;
  caption: string;
  tags: string[];
}

/**
 * Catalog of on-file placeholder images with rich metadata
 */
export const ROOM_IMAGE_PLACEHOLDERS: RoomImagePlaceholder[] = [
  {
    id: 'alpine-bathing-suite',
    assetKey: 'ALPINE_BATHING_SUITE',
    title: 'Alpine Bathing Suite',
    buildingId: 'alpine',
    buildingName: 'Alpine Haus',
    url: ROOM_IMAGE_ASSETS.ALPINE_BATHING_SUITE,
    description:
      'Iconic freestanding clawfoot soaking tub placed deliberately before the forest picture window.',
    caption: 'Picture window clawfoot soak facing the hemlocks and changing mountain light.',
    tags: ['clawfoot-tub', 'window-soak', 'alpine', 'bathing-suite']
  },
  {
    id: 'alpine-headboard',
    assetKey: 'ALPINE_HEADBOARD',
    title: 'Alpine Headboard & Master Chamber',
    buildingId: 'alpine',
    buildingName: 'Alpine Haus',
    url: ROOM_IMAGE_ASSETS.ALPINE_HEADBOARD,
    description:
      'Artisanal carved headboard with heritage wool blankets, leather accents, and warm timber framing.',
    caption: 'Handcrafted timber headboard and custom bedding designed for deep mountain rest.',
    tags: ['headboard', 'bedroom', 'handcrafted-wood', 'alpine']
  },
  {
    id: 'alpine-penthouse-copper-tub',
    assetKey: 'ALPINE_PENTHOUSE_COPPER_TUB',
    title: 'Alpine Penthouse Copper Soaking Tub',
    buildingId: 'alpine',
    buildingName: 'Alpine Haus',
    url: ROOM_IMAGE_ASSETS.ALPINE_PENTHOUSE_COPPER_TUB,
    description:
      'Hand-hammered double slipper copper tub beneath cathedral timber rafters and gas hearth.',
    caption: 'Hand-hammered copper soaking tub overlooking the upper mountain canopy.',
    tags: ['copper-tub', 'penthouse', 'fireplace', 'cathedral-ceiling', 'alpine']
  },
  {
    id: 'walden-forest-bathing-suite',
    assetKey: 'WALDEN_FOREST_BATHING_SUITE',
    title: 'Walden Forest Bathing Suite Deck',
    buildingId: 'walden',
    buildingName: 'Walden Haus',
    url: ROOM_IMAGE_ASSETS.WALDEN_FOREST_BATHING_SUITE,
    description:
      'Long-angle vista looking through open french doors out to the private outdoor cedar deck and trees.',
    caption: 'Open french doors revealing the secluded cedar soaking deck deep in the pine woods.',
    tags: ['forest', 'open-door', 'deck', 'outdoor-soak', 'walden']
  },
  {
    id: 'walden-sunrise-bathing-suite',
    assetKey: 'WALDEN_SUNRISE_BATHING_SUITE',
    title: 'Walden Sunrise Bathing Suite',
    buildingId: 'walden',
    buildingName: 'Walden Haus',
    url: ROOM_IMAGE_ASSETS.WALDEN_SUNRISE_BATHING_SUITE,
    description:
      'Morning golden sunlight warming the round red cedar tub and rustic covered cabin porch.',
    caption: 'Handcrafted round red cedar soaking tub ready for early morning forest steam.',
    tags: ['sunrise', 'cedar-tub', 'cabin-deck', 'walden']
  },
  {
    id: 'lodge-penthouse-bedroom',
    assetKey: 'LODGE_PENTHOUSE_BEDROOM',
    title: 'The Lodge Penthouse Bedroom',
    buildingId: 'lodge',
    buildingName: 'The Lodge',
    url: ROOM_IMAGE_ASSETS.LODGE_PENTHOUSE_BEDROOM,
    description:
      'Sculpted black-willow headboard framing a grand king bed with historic 1800s pine joists.',
    caption: 'Wild sculpted black-willow headboard in the romantic Lodge Penthouse bedroom.',
    tags: ['black-willow', 'headboard', 'honeymoon-suite', 'lodge']
  },
  {
    id: 'lodge-penthouse-living-room',
    assetKey: 'LODGE_PENTHOUSE_LIVING_ROOM',
    title: 'The Lodge Penthouse Living Room & Parlor',
    buildingId: 'lodge',
    buildingName: 'The Lodge',
    url: ROOM_IMAGE_ASSETS.LODGE_PENTHOUSE_LIVING_ROOM,
    description:
      'Generous living room and private parlor with wet bar, hearth fireplace, and mountain view deck.',
    caption: 'Private timber living parlor with cocktail bar and comfortable fireside seating.',
    tags: ['living-room', 'wet-bar', 'gathering', 'parlor', 'lodge']
  }
];

/**
 * Returns a curated set of authentic room photos for a specific room type ID
 */
export function getRoomImagesByRoomId(roomId: string): string[] {
  switch (roomId) {
    case 'alpine-bathing-suite-den':
      return [
        ROOM_IMAGE_ASSETS.ALPINE_HEADBOARD,
        ROOM_IMAGE_ASSETS.ALPINE_BATHING_SUITE,
        ROOM_IMAGE_ASSETS.ALPINE_PENTHOUSE_COPPER_TUB
      ];
    case 'alpine-penthouse':
      return [
        ROOM_IMAGE_ASSETS.ALPINE_PENTHOUSE_COPPER_TUB,
        ROOM_IMAGE_ASSETS.ALPINE_HEADBOARD,
        ROOM_IMAGE_ASSETS.ALPINE_BATHING_SUITE
      ];
    case 'alpine-bathing-suite':
      return [
        ROOM_IMAGE_ASSETS.ALPINE_BATHING_SUITE,
        ROOM_IMAGE_ASSETS.ALPINE_HEADBOARD,
        ROOM_IMAGE_ASSETS.ALPINE_PENTHOUSE_COPPER_TUB
      ];
    case 'walden-forest-bathing':
      return [
        ROOM_IMAGE_ASSETS.WALDEN_FOREST_BATHING_SUITE,
        ROOM_IMAGE_ASSETS.WALDEN_SUNRISE_BATHING_SUITE,
        ROOM_IMAGE_ASSETS.ALPINE_BATHING_SUITE
      ];
    case 'walden-king':
      return [
        ROOM_IMAGE_ASSETS.WALDEN_SUNRISE_BATHING_SUITE,
        ROOM_IMAGE_ASSETS.WALDEN_FOREST_BATHING_SUITE,
        ROOM_IMAGE_ASSETS.ALPINE_HEADBOARD
      ];
    case 'lodge-penthouse':
      return [
        ROOM_IMAGE_ASSETS.LODGE_PENTHOUSE_BEDROOM,
        ROOM_IMAGE_ASSETS.LODGE_PENTHOUSE_LIVING_ROOM,
        ROOM_IMAGE_ASSETS.ALPINE_PENTHOUSE_COPPER_TUB
      ];
    case 'lodge-three-bedroom':
      return [
        ROOM_IMAGE_ASSETS.LODGE_PENTHOUSE_LIVING_ROOM,
        ROOM_IMAGE_ASSETS.LODGE_PENTHOUSE_BEDROOM,
        ROOM_IMAGE_ASSETS.ALPINE_HEADBOARD
      ];
    case 'lodge-king':
      return [
        ROOM_IMAGE_ASSETS.LODGE_PENTHOUSE_BEDROOM,
        ROOM_IMAGE_ASSETS.LODGE_PENTHOUSE_LIVING_ROOM,
        ROOM_IMAGE_ASSETS.ALPINE_BATHING_SUITE
      ];
    default:
      return [
        ROOM_IMAGE_ASSETS.ALPINE_BATHING_SUITE,
        ROOM_IMAGE_ASSETS.WALDEN_FOREST_BATHING_SUITE,
        ROOM_IMAGE_ASSETS.LODGE_PENTHOUSE_BEDROOM
      ];
  }
}

/**
 * Returns a fallback placeholder image for a building
 */
export function getBuildingPlaceholderHero(buildingId: string): string {
  switch (buildingId) {
    case 'alpine':
      return ROOM_IMAGE_ASSETS.ALPINE_BATHING_SUITE;
    case 'walden':
      return ROOM_IMAGE_ASSETS.WALDEN_FOREST_BATHING_SUITE;
    case 'lodge':
      return ROOM_IMAGE_ASSETS.LODGE_PENTHOUSE_LIVING_ROOM;
    default:
      return ROOM_IMAGE_ASSETS.ALPINE_BATHING_SUITE;
  }
}
