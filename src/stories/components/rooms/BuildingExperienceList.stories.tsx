import type { Meta, StoryObj } from '@storybook/react-vite';
import { BuildingExperienceList } from '@/components/rooms/BuildingExperienceList';
import type { SearchCriteria } from '@/types';
import type { ShapedRoom, ShapedRate } from '@/types/mews';
import type { RoomMerchandising } from '@/types/merchandising';
import { ROOM_IMAGE_ASSETS } from '@/data/roomImagePlaceholders';

const mockCriteria: SearchCriteria = {
  property: 'Urban Cowboy Catskills',
  checkIn: '2026-10-14',
  checkOut: '2026-10-17',
  nights: 3,
  guests: 2,
  rooms: 1,
};

const mockRate1: ShapedRate = {
  rateId: 'rate-1',
  rateGroupId: 'group-1',
  knownRateGroup: 'FLEXIBLE',
  name: 'Best Flexible Rate',
  description: 'Flexible rate',
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

const mockRate2: ShapedRate = {
  ...mockRate1,
  rateId: 'rate-2',
  perNightGross: 395,
  totalGross: 1185,
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

const makeMockRoom = ({
  roomTypeId,
  name,
  description,
  imageIds,
  rate,
  merchandising,
}: {
  roomTypeId: string;
  name: string;
  description?: string;
  imageIds: string[];
  rate: ShapedRate;
  merchandising: RoomMerchandising;
}): ShapedRoom => ({
  roomTypeId,
  categoryId: roomTypeId,
  name,
  description: description ?? '',
  cmsShortDescription: description ?? '',
  cmsLongDescription: description ?? '',
  imageIds,
  normalBedCount: 1,
  extraBedCount: 0,
  roomClass: 'Suite',
  spaceType: 'Suite',
  availableRoomCount: 3,
  capacity: 2,
  rates: [rate],
  fromGross: rate.perNightGross,
  property: 'Urban Cowboy Catskills',
  merchandising,
  merchandisingSource: 'mewsRoomTypeId',
});

const mockRooms: ShapedRoom[] = [
  makeMockRoom({
    roomTypeId: 'alpine-bathing-suite',
    name: 'Alpine Bathing Suite',
    description: mockMerchandisingAlpine.cardDescription,
    imageIds: [ROOM_IMAGE_ASSETS.ALPINE_BATHING_SUITE, ROOM_IMAGE_ASSETS.ALPINE_HEADBOARD],
    rate: mockRate1,
    merchandising: mockMerchandisingAlpine,
  }),
  makeMockRoom({
    roomTypeId: 'alpine-bathing-suite-with-den',
    name: 'Alpine Bathing Suite with Den',
    description: mockMerchandisingAlpineBathingSuiteDen.cardDescription,
    imageIds: [ROOM_IMAGE_ASSETS.ALPINE_HEADBOARD, ROOM_IMAGE_ASSETS.ALPINE_BATHING_SUITE],
    rate: mockRate1,
    merchandising: mockMerchandisingAlpineBathingSuiteDen,
  }),
  makeMockRoom({
    roomTypeId: 'alpine-penthouse-bathing-suite',
    name: 'Alpine Penthouse Bathing Suite',
    description: mockMerchandisingAlpinePenthouse.cardDescription,
    imageIds: [ROOM_IMAGE_ASSETS.ALPINE_PENTHOUSE_COPPER_TUB, ROOM_IMAGE_ASSETS.ALPINE_HEADBOARD],
    rate: mockRate1,
    merchandising: mockMerchandisingAlpinePenthouse,
  }),
  makeMockRoom({
    roomTypeId: 'walden-king',
    name: 'Walden King',
    description: mockMerchandisingWalden.cardDescription,
    imageIds: [ROOM_IMAGE_ASSETS.WALDEN_SUNRISE_BATHING_SUITE],
    rate: mockRate2,
    merchandising: mockMerchandisingWalden,
  }),
  makeMockRoom({
    roomTypeId: 'walden-forest-bathing-suite-with-den',
    name: 'Walden Forest Bathing Suite with Den',
    description: mockMerchandisingWaldenBathingSuiteDen.cardDescription,
    imageIds: [ROOM_IMAGE_ASSETS.WALDEN_FOREST_BATHING_SUITE],
    rate: mockRate2,
    merchandising: mockMerchandisingWaldenBathingSuiteDen,
  }),
  makeMockRoom({
    roomTypeId: 'walden-sunrise-bathing-suite',
    name: 'Walden Sunrise Bathing Suite',
    description: mockMerchandisingWaldenSunriseBathingSuite.cardDescription,
    imageIds: [ROOM_IMAGE_ASSETS.WALDEN_SUNRISE_BATHING_SUITE, ROOM_IMAGE_ASSETS.WALDEN_FOREST_BATHING_SUITE],
    rate: mockRate2,
    merchandising: mockMerchandisingWaldenSunriseBathingSuite,
  }),
];


const meta: Meta<typeof BuildingExperienceList> = {
  title: 'Components/Rooms/BuildingExperienceList',
  component: BuildingExperienceList,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'Editorial building experience list showing lodging experiences organized by building, feature filter pills, and magazine vs catalog view toggles.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    criteria: { control: 'object', description: 'Search parameters (dates, guests, nights)' },
    rooms: { control: 'object', description: 'List of available shaped rooms' },
    imageBaseUrl: { control: 'text', description: 'Base URL for Mews imagery' },
    onUpdateCriteria: { action: 'onUpdateCriteria' },
    onSelectRoom: { action: 'onSelectRoom' },
    onOpenRoomDetails: { action: 'onOpenRoomDetails' },
    onOpenHelpMeChoose: { action: 'onOpenHelpMeChoose' },
    onBackToSearch: { action: 'onBackToSearch' },
  },
} satisfies Meta<typeof BuildingExperienceList>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    criteria: mockCriteria,
    rooms: mockRooms,
    imageBaseUrl: 'https://cdn.prod.website-files.com/6abc810fd801e90511049adb/6ac85bc2a6a679fb6f2dd9e4_Alpine%20Copper%20Soaking%20Tub%20Day-p-1600.jpg',
  },
};

export const AlpineBathingSuiteWithDen: Story = {
  args: {
    ...Default.args,
    rooms: [mockRooms[1]],
  },
};

export const AlpinePenthouse: Story = {
  args: {
    ...Default.args,
    rooms: [mockRooms[2]],
  },
};

export const WaldenKing: Story = {
  args: {
    ...Default.args,
    rooms: [mockRooms[3]],
  },
};

export const WaldenBathingSuiteWithDen: Story = {
  args: {
    ...Default.args,
    rooms: [mockRooms[4]],
  },
};

export const WaldenSunriseBathingSuite: Story = {
  args: {
    ...Default.args,
    rooms: [mockRooms[5]],
  },
};




export const SingleRoomAvailable: Story = {
  args: {
    ...Default.args,
    rooms: [mockRooms[0]],
  },
};







export const EmptyRoomList: Story = {
  args: {
    ...Default.args,
    rooms: [],
  },
};
