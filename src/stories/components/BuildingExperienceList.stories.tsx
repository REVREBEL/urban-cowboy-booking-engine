import type { Meta, StoryObj } from '@storybook/react-vite';
import { BuildingExperienceList } from '../../components/BuildingExperienceList';
import type { SearchCriteria } from '../../types';
import type { ShapedRoom, ShapedRate } from '../../types/mews';
import type { RoomMerchandising } from '../../types/merchandising';

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

const mockMerchandisingWalden: RoomMerchandising = {
  key: 'walden-king',
  mewsRoomTypeId: 'walden-king',
  legacyNames: ['Walden King'],
  roomTypeGroupKey: 'walden',
  cardTagline: 'BATHING OUTSIDE AMONG THE TREES',
  cardDescription: 'Cabin-style room with a private outdoor cedar soaking tub.',
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

const mockRooms: ShapedRoom[] = [
  {
    roomTypeId: 'alpine-bathing-suite',
    categoryId: 'alpine-bathing-suite',
    name: 'Alpine Bathing Suite',
    description: 'Hillside suite with a copper clawfoot tub in front of a picture window.',
    cmsShortDescription: 'Hillside suite with a copper clawfoot tub in front of a picture window.',
    imageIds: ['img-1'],
    normalBedCount: 1,
    extraBedCount: 0,
    roomClass: 'Suite',
    spaceType: 'Suite',
    availableRoomCount: 2,
    capacity: 2,
    rates: [mockRate1],
    fromGross: 425,
    merchandising: mockMerchandisingAlpine,
    merchandisingSource: 'mewsRoomTypeId',
  },
  {
    roomTypeId: 'walden-king',
    categoryId: 'walden-king',
    name: 'Walden King',
    description: 'Cabin-style room with a private deck and forest views.',
    cmsShortDescription: 'Cabin-style room with a private deck and forest views.',
    imageIds: ['img-2'],
    normalBedCount: 1,
    extraBedCount: 0,
    roomClass: 'Standard',
    spaceType: 'Standard',
    availableRoomCount: 4,
    capacity: 2,
    rates: [mockRate2],
    fromGross: 395,
    merchandising: mockMerchandisingWalden,
    merchandisingSource: 'mewsRoomTypeId',
  },
];

const meta: Meta<typeof BuildingExperienceList> = {
  title: 'Components/BuildingExperienceList',
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
    imageBaseUrl: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200',
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
