import type { Meta, StoryObj } from '@storybook/react-vite';
import { RoomsListBuilding } from '@/components/rooms/RoomsListBuilding';
import type { BuildingCms } from '@/types/building-cms';
import type { ShapedRoom } from '@/types/mews';
import { ROOM_IMAGE_ASSETS } from '@/data/roomImagePlaceholders';

const mockBuilding: BuildingCms = {
  id: 'alpine',
  slug: 'alpine',
  groupKey: 'alpine',
  name: 'Alpine Haus',
  subheading: 'THE ICONIC INDOOR SOAK',
  shortDescription: 'Perched on the hillside directly behind the Main Lodge.',
  featureBenefits: 'Best for couples looking for deep privacy.',
  policy: [
    { id: '21plus', slug: '21plus', name: 'Adults Only 21+' },
    { id: 'no-pets', slug: 'no-pets', name: 'No Dogs Allowed' },
  ],
};

const mockRoom: ShapedRoom = {
  roomTypeId: 'alpine-bathing-suite',
  categoryId: 'alpine-bathing-suite',
  name: 'Alpine Bathing Suite',
  description: 'Freestanding clawfoot tub facing private picture window.',
  cmsShortDescription: 'Freestanding clawfoot tub facing private picture window.',
  cmsLongDescription: 'Freestanding clawfoot tub facing private picture window.',
  imageIds: [ROOM_IMAGE_ASSETS.ALPINE_BATHING_SUITE],
  normalBedCount: 1,
  extraBedCount: 0,
  roomClass: 'Suite',
  spaceType: 'Suite',
  availableRoomCount: 2,
  capacity: 2,
  rates: [],
  fromGross: 425,
  property: 'Urban Cowboy Catskills',
  merchandising: {
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
  },
  merchandisingSource: 'mewsRoomTypeId',
};

const meta: Meta<typeof RoomsListBuilding> = {
  title: 'Components/Rooms/RoomsListBuilding',
  component: RoomsListBuilding,
  tags: ['autodocs'],
  args: {
    building: mockBuilding,
    rooms: [mockRoom],
    imageBaseUrl: 'https://cdn.prod.website-files.com/6abc810fd801e90511049adb',
  },
  argTypes: {
    onSelectRoom: { action: 'onSelectRoom' },
    onOpenRoomDetails: { action: 'onOpenRoomDetails' },
  },
};

export default meta;
type Story = StoryObj<typeof RoomsListBuilding>;

export const Default: Story = {};
