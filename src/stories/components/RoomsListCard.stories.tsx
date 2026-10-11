import type { Meta, StoryObj } from '@storybook/react-vite';
import { RoomsListCard } from '../../components/RoomsListCard';
import type { ShapedRoom, ShapedRate } from '../../types/mews';
import type { RoomMerchandising } from '../../types/merchandising';

import {
  ROOM_IMAGE_ASSETS,
  ROOM_IMAGE_PLACEHOLDERS,
  getRoomImagesByRoomId,
  getBuildingPlaceholderHero
} from '../../data/roomImagePlaceholders';

export {
  ROOM_IMAGE_ASSETS,
  ROOM_IMAGE_PLACEHOLDERS,
  getRoomImagesByRoomId,
  getBuildingPlaceholderHero
};


const mockRate: ShapedRate = {
  rateId: 'rate-1',
  rateGroupId: 'rate-group-1',
  knownRateGroup: 'FLEXIBLE',
  name: 'Best Flexible Rate',
  description: 'Flexible rate with cancellation option.',
  isPrivate: false,
  currency: 'USD',
  totalGross: 1275,
  totalNet: 1200,
  totalTax: 75,
  perNightGross: 425,
  perNightNet: 400,
  perNightTax: 25,
  maxGross: null,
  maxNet: null,
  maxTax: null,
  citySejour: null,
  settlement: {
    type: 'automatic',
    action: 'charge',
    isAutomatic: true,
    trigger: null,
    offset: null,
    value: null,
    flatValue: null,
    currencyCode: null,
    maximumTimeUnits: null,
  },
};



const mockMerchandisingAlpine: RoomMerchandising = {
  key: 'alpine-bathing-suite',
  mewsRoomTypeId: 'alpine-bathing-suite',
  legacyNames: ['Alpine Bathing Suite'],
  roomTypeGroupKey: 'alpine',
  cardTagline: 'THE ICONIC INDOOR SOAK',
  cardDescription: 'A hillside suite with a copper clawfoot tub in front of a picture window.',
  dogPolicy: 'notAllowed',
  agePolicy: 'adultsOnly21',
  partyScores: { partner: 10, friends: 5, family: 0, solo: 8 },
  interestScores: {},
  interestPriority: {},
  features: {
    indoorTub: true,
    outdoorSoak: false,
    fireplace: true,
    scenicView: true,
  },
  matchReasons: {},
};


const mockMerchandisingAlpineBathingSuiteDen: RoomMerchandising = {
  key: 'alpine-bathing-suite',
  mewsRoomTypeId: 'alpine-bathing-suite-with-den',
  legacyNames: ['Alpine Bathing Suite with Den'],
  roomTypeGroupKey: 'alpine',
  cardTagline: 'THE ICONIC INDOOR SOAK',
  cardDescription: "Tucked beneath the eaves at the top of Alpine, these are the building's biggest and most playful suites—dormered ceilings, exposed beams, unexpected angles and a balcony made for two. There's a copper clawfoot tub, naturally. And a fireplace for everything that comes after.",
  dogPolicy: 'notAllowed',
  agePolicy: 'adultsOnly21',
  partyScores: { partner: 10, friends: 5, family: 0, solo: 8 },
  interestScores: {},
  interestPriority: {},
  features: {
    indoorTub: true,
    outdoorSoak: false,
    fireplace: true,
    scenicView: true,
  },
  matchReasons: {},
};

const mockMerchandisingAlpinePenthouse: RoomMerchandising = {
  key: 'alpine-bathing-suite',
  mewsRoomTypeId: 'alpine-penthouse-bathing-suite',
  legacyNames: ['Alpine Penthouse Bathing Suite'],
  roomTypeGroupKey: 'alpine',
  cardTagline: 'THE ICONIC INDOOR SOAK',
  cardDescription: "There's only one like this. Stretch out in the built-in chaise den by the fire, or climb into the copper clawfoot tub and take in one of Alpine's best mountain views. It's part bathing suite, part hideaway, and exactly the kind of room that makes leaving for dinner feel optional.",
  dogPolicy: 'notAllowed',
  agePolicy: 'adultsOnly21',
  partyScores: { partner: 10, friends: 5, family: 0, solo: 8 },
  interestScores: {},
  interestPriority: {},
  features: {
    indoorTub: true,
    outdoorSoak: false,
    fireplace: true,
    scenicView: true,
  },
  matchReasons: {},
};



const mockMerchandisingWalden: RoomMerchandising = {
  key: 'walden-king',
  mewsRoomTypeId: 'walden-king',
  legacyNames: ['Walden King'],
  roomTypeGroupKey: 'walden',
  cardTagline: 'BATHING OUTSIDE AMONG THE TREES',
  cardDescription: "Simple, warm and tucked into the woods, the Walden King is for guests who want the forest outside and just enough Cowboy inside. Take your coffee to the deck. Write something at the desk. Wander off for the day. Or don't.",
  dogPolicy: 'allowed',
  agePolicy: 'adultsOnly21',
  partyScores: { partner: 9, friends: 6, family: 0, solo: 7 },
  interestScores: {},
  interestPriority: {},
  features: {
    indoorTub: false,
    outdoorSoak: true,
    fireplace: false,
    scenicView: true,
  },
  matchReasons: {},
};

const mockMerchandisingWaldenBathingSuiteDen: RoomMerchandising = {
  key: 'walden-king',
  mewsRoomTypeId: 'walden-forest-bathing-suite-with-den',
  legacyNames: ['Walden Forest Bathing Suite with Den'],
  roomTypeGroupKey: 'walden',
  cardTagline: 'BATHING OUTSIDE AMONG THE TREES',
  cardDescription: "Walden's largest suite gives you more room inside and your own cedar soaking tub outside. Start slow in the lounge. Take the afternoon to the deck. Stay in the water until the stars come out. There is, technically, a desk too. We prefer the original purpose: writing letters to your lover.",
  dogPolicy: 'allowed',
  agePolicy: 'adultsOnly21',
  partyScores: { partner: 9, friends: 6, family: 0, solo: 7 },
  interestScores: {},
  interestPriority: {},
  features: {
    indoorTub: false,
    outdoorSoak: true,
    fireplace: false,
    scenicView: true,
  },
  matchReasons: {},
};

const mockMerchandisingWaldenSunriseBathingSuite: RoomMerchandising = {
  key: 'walden-king',
  mewsRoomTypeId: 'walden-sunrise-bathing-suite',
  legacyNames: ['Walden Sunrise Bathing Suite'],
  roomTypeGroupKey: 'walden',
  cardTagline: 'BATHING OUTSIDE AMONG THE TREES',
  cardDescription: 'Some of the best sunrise views on the property belong to this room. Watch the first light arrive through the diamond-shaped window or, better yet, from the cedar soaking tub on your private porch. Two leather loungers inside give you somewhere to do very little afterward.',
  dogPolicy: 'allowed',
  agePolicy: 'adultsOnly21',
  partyScores: { partner: 9, friends: 6, family: 0, solo: 7 },
  interestScores: {},
  interestPriority: {},
  features: {
    indoorTub: false,
    outdoorSoak: true,
    fireplace: false,
    scenicView: true,
  },
  matchReasons: {},
};

const mockAlpineRoom: ShapedRoom = {
  roomTypeId: 'alpine-bathing-suite',
  categoryId: 'alpine-bathing-suite',
  name: 'Alpine Bathing Suite',
  description: "Tucked beneath the eaves at the top of Alpine, these are the building's biggest and most playful suites—dormered ceilings, exposed beams, unexpected angles and a balcony made for two. There's a copper clawfoot tub, naturally. And a fireplace for everything that comes after.",
  cmsShortDescription: "Tucked beneath the eaves at the top of Alpine, these are the building's biggest and most playful suites—dormered ceilings, exposed beams, unexpected angles and a balcony made for two. There's a copper clawfoot tub, naturally. And a fireplace for everything that comes after.",
  cmsLongDescription: "Perched on the hillside directly behind the Main Lodge, the Alpine Bathing Suites are the classic indoor-soak version of Cowboy. Each adults-only room pairs a king bed with a freestanding clawfoot tub set beside a picture window, a cast-iron wood stove and a private deck with rocking chairs. Heated bathroom floors and a walk-in shower make cold mountain mornings easier, while Wright mattresses, Pendleton layers, Printsburgh wallpaper and a stocked minibar bring the rest of the room together. Expect the Lodge to be close, the hillside to feel quiet and the tub to become part of the day's itinerary.",
  imageIds: ['img-1', 'img-2'],
  normalBedCount: 1,
  extraBedCount: 0,
  roomClass: 'Suite',
  spaceType: 'Suite',
  availableRoomCount: 3,
  capacity: 2,
  rates: [mockRate],
  fromGross: 425,
  property: 'Urban Cowboy Catskills',
  merchandising: mockMerchandisingAlpine,
  merchandisingSource: 'mewsRoomTypeId',
};

const mockAlpineDenRoom: ShapedRoom = {
  roomTypeId: 'alpine-bathing-suite-den',
  categoryId: 'alpine-bathing-suite-den',
  name: 'Alpine Bathing Suite',
  description: "The ultimate private Catskill retreat. With a moodier, dark timber palette, this suite features a hand-hammered double-slipper copper soaking tub and an integrated alcove daybed for deep reading and afternoon naps. When dusk falls, warm lantern light washes over the exposed hand-hewn logs and the mountain breeze fills the room.",
  cmsShortDescription: "Tucked beneath the eaves at the top of Alpine, these are the building's biggest and most playful suites—dormered ceilings, exposed beams, unexpected angles and a balcony made for two. There's a copper clawfoot tub, naturally. And a fireplace for everything that comes after.",
  cmsLongDescription: "The ultimate private Catskill retreat. With a moodier, dark timber palette, this suite features a hand-hammered double-slipper copper soaking tub and an integrated alcove daybed for deep reading and afternoon naps. When dusk falls, warm lantern light washes over the exposed hand-hewn logs and the mountain breeze fills the room.",
  imageIds: [
    ROOM_IMAGE_ASSETS.ALPINE_HEADBOARD,
    ROOM_IMAGE_ASSETS.ALPINE_BATHING_SUITE,
    ROOM_IMAGE_ASSETS.ALPINE_PENTHOUSE_COPPER_TUB
  ],
  normalBedCount: 1,
  extraBedCount: 0,
  roomClass: 'Suite',
  spaceType: 'Suite',
  availableRoomCount: 3,
  capacity: 2,
  rates: [mockRate],
  fromGross: 425,
  property: 'Urban Cowboy Catskills',
  merchandising: mockMerchandisingAlpineBathingSuiteDen,
  merchandisingSource: 'mewsRoomTypeId',
};


const mockAlpinePenthouseRoom: ShapedRoom = {
  roomTypeId: 'alpine-penthouse',
  categoryId: 'alpine-penthouse',
  name: 'Alpine Bathing Suite',
  description: "Tucked beneath the eaves at the top of Alpine, these are the building's biggest and most playful suites—dormered ceilings, exposed beams, unexpected angles and a balcony made for two. There's a copper clawfoot tub, naturally. And a fireplace for everything that comes after.",
  cmsShortDescription: "Tucked beneath the eaves at the top of Alpine, these are the building's biggest and most playful suites—dormered ceilings, exposed beams, unexpected angles and a balcony made for two. There's a copper clawfoot tub, naturally. And a fireplace for everything that comes after.",
  cmsLongDescription: "Tucked beneath the eaves at the top of Alpine, these are the building's biggest and most playful suites—dormered ceilings, exposed beams, unexpected angles and a balcony made for two. There's a copper clawfoot tub, naturally. And a fireplace for everything that comes after.",
  imageIds: [
    ROOM_IMAGE_ASSETS.ALPINE_PENTHOUSE_COPPER_TUB,
    ROOM_IMAGE_ASSETS.ALPINE_HEADBOARD,
    ROOM_IMAGE_ASSETS.ALPINE_BATHING_SUITE
  ],
  normalBedCount: 1,
  extraBedCount: 0,
  roomClass: 'Suite',
  spaceType: 'Suite',
  availableRoomCount: 3,
  capacity: 2,
  rates: [mockRate],
  fromGross: 425,
  property: 'Urban Cowboy Catskills',
  merchandising: mockMerchandisingAlpinePenthouse,
  merchandisingSource: 'mewsRoomTypeId',
};



const mockWaldenKingRoom: ShapedRoom = {
  roomTypeId: 'walden-king',
  categoryId: 'walden-king',
  name: 'Walden King',
  description: "Simple, warm and tucked into the woods, the Walden King is for guests who want the forest outside and just enough Cowboy inside.",
  cmsShortDescription: "Simple, warm and tucked into the woods, the Walden King is for guests who want the forest outside and just enough Cowboy inside. Take your coffee to the deck. Write something at the desk. Wander off for the day. Or don't.",
  cmsLongDescription: "Rooted deeply in the hemlocks, Walden King captures the contemplative spirit of Henry David Thoreau with a rugged, tactile Cowboy finish. Step out with freshly brewed Chemex onto your secluded forest porch. Inside, reclaimed timber walls, a custom writing desk, and artisanal ironwork create a warm, grounding haven.",
  normalBedCount: 1,
  extraBedCount: 0,
  roomClass: 'Room',
  spaceType: 'Room',
  availableRoomCount: 3,
  capacity: 2,
  rates: [mockRate],
  fromGross: 425,
  property: 'Urban Cowboy Catskills',
  imageIds: [
    ROOM_IMAGE_ASSETS.WALDEN_SUNRISE_BATHING_SUITE,
    ROOM_IMAGE_ASSETS.WALDEN_FOREST_BATHING_SUITE,
    ROOM_IMAGE_ASSETS.ALPINE_HEADBOARD
  ],
  merchandising: mockMerchandisingWalden,
  merchandisingSource: 'mewsRoomTypeId',
};


const mockWaldenDenRoom: ShapedRoom = {
  roomTypeId: 'walden-forest-bathing-suite-with-den',
  categoryId: 'walden-forest-bathing-suite-with-den',
  name: 'Walden Bathing Suite with Den',
  description: "Tucked beneath the eaves at the top of Alpine, these are the building's biggest and most playful suites—dormered ceilings, exposed beams, unexpected angles and a balcony made for two. There's a copper clawfoot tub, naturally. And a fireplace for everything that comes after.",
  cmsShortDescription: "Tucked beneath the eaves at the top of Alpine, these are the building's biggest and most playful suites—dormered ceilings, exposed beams, unexpected angles and a balcony made for two. There's a copper clawfoot tub, naturally. And a fireplace for everything that comes after.",
  cmsLongDescription: "Perched on the hillside directly behind the Main Lodge, the Alpine Bathing Suites are the classic indoor-soak version of Cowboy. Each adults-only room pairs a king bed with a freestanding clawfoot tub set beside a picture window, a cast-iron wood stove and a private deck with rocking chairs. Heated bathroom floors and a walk-in shower make cold mountain mornings easier, while Wright mattresses, Pendleton layers, Printsburgh wallpaper and a stocked minibar bring the rest of the room together. Expect the Lodge to be close, the hillside to feel quiet and the tub to become part of the day's itinerary.",
  imageIds: ['img-1', 'img-2'],
  normalBedCount: 1,
  extraBedCount: 0,
  roomClass: 'Suite',
  spaceType: 'Suite',
  availableRoomCount: 3,
  capacity: 2,
  rates: [mockRate],
  fromGross: 425,
  property: 'Urban Cowboy Catskills',
  merchandising: mockMerchandisingWaldenBathingSuiteDen,
  merchandisingSource: 'mewsRoomTypeId',
};


const mockWaldenSunriseRoom: ShapedRoom = {
  roomTypeId: 'walden-sunrise-bathing-suite',
  categoryId: 'walden-sunrise-bathing-suite',
  name: 'Walden Sunrise Bathing Suite',
  description: 'Some of the best sunrise views on the property belong to this room, from its private porch and cedar soaking tub.',
  cmsShortDescription: 'Some of the best sunrise views on the property belong to this room. Watch the first light arrive through the diamond-shaped window or, better yet, from the cedar soaking tub on your private porch. Two leather loungers inside give you somewhere to do very little afterward.',
  cmsLongDescription: 'The quintessential Walden experience. Walden Forest Bathing Suite dissolves the border between indoor luxury and wild nature. Your private outdoor cedar deck houses a custom round cedar soaking tub, constantly steaming in the crisp mountain air. Complete with an open-air seasonal outdoor shower, plush terry robes, and woodland seclusion.',
  imageIds: [
    ROOM_IMAGE_ASSETS.WALDEN_FOREST_BATHING_SUITE,
    ROOM_IMAGE_ASSETS.WALDEN_SUNRISE_BATHING_SUITE,
    ROOM_IMAGE_ASSETS.ALPINE_BATHING_SUITE
  ],
  normalBedCount: 1,
  extraBedCount: 0,
  roomClass: 'Suite',
  spaceType: 'Suite',
  availableRoomCount: 3,
  capacity: 2,
  rates: [mockRate],
  fromGross: 425,
  property: 'Urban Cowboy Catskills',
  merchandising: mockMerchandisingWaldenSunriseBathingSuite,
  merchandisingSource: 'mewsRoomTypeId',
};





const meta: Meta<typeof RoomsListCard> = {
  title: 'Components/RoomsListCard',
  component: RoomsListCard,
  args: {
    room: mockAlpineRoom,
    imageBaseUrl: 'https://cdn.prod.website-files.com/6abc810fd801e90511049adb',
    theme: 'paper',
    layout: 'left',
    isTopMatch: false,
  },
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: 'A feature room list card displaying room details, image carousel, merchandising tags, pricing, and action triggers.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    theme: {
      control: 'select',
      options: ['paper', 'copper', 'lake-forest'],
      description: 'Card color theme variant',
    },
    layout: {
      control: 'radio',
      options: ['left', 'right'],
      description: 'Media layout position (left or right column)',
    },
    isTopMatch: {
      control: 'boolean',
      description: 'Displays Top Pick badge if enabled',
    },
    customImage: {
      control: 'text',
      description: 'Custom image URL override',
    },
    imageBaseUrl: {
      control: 'text',
      description: 'Base URL for Mews image assets',
    },
    onSelectRoom: { action: 'onSelectRoom' },
    onOpenRoomDetails: { action: 'onOpenRoomDetails' },
  },
} satisfies Meta<typeof RoomsListCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};

export const CopperTheme: Story = {
  args: {
    ...Default.args,
    theme: 'copper',
  },
};

export const LakeForestTheme: Story = {
  args: {
    ...Default.args,
    theme: 'lake-forest',
  },
};

export const RightLayout: Story = {
  args: {
    ...Default.args,
    layout: 'right',
  },
};

export const TopMatch: Story = {
  args: {
    ...Default.args,
    isTopMatch: true,
    theme: 'copper',
  },
};

export const WithCustomImage: Story = {
  args: {
    ...Default.args,
    customImage: 'https://cdn.prod.website-files.com/6abc810fd801e90511049adb/6ac85bc2a6a679fb6f2dd9e4_Alpine%20Copper%20Soaking%20Tub%20Day.jpg',
  },
};


export const AlpineBathingSuiteWithDen: Story = {
  args: {
    ...Default.args,
    room: mockAlpineDenRoom,
  },
};

export const AlpinePenthouse: Story = {
  args: {
    ...Default.args,
    room: mockAlpinePenthouseRoom,
  },
};

export const WaldenKing: Story = {
  args: {
    ...Default.args,
    room: mockWaldenKingRoom,
  },
};

export const WaldenBathingSuiteWithDen: Story = {
  args: {
    ...Default.args,
    room: mockWaldenDenRoom,
  },
};

export const WaldenSunriseBathingSuite: Story = {
  args: {
    ...Default.args,
    room: mockWaldenSunriseRoom,
  },
};
