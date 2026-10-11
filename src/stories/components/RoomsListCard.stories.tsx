import type { Meta, StoryObj } from '@storybook/react-vite';
import { RoomsListCard } from '../../components/RoomsListCard';
import type { ShapedRoom, ShapedRate } from '../../types/mews';
import type { RoomMerchandising } from '../../types/merchandising';

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

const mockMerchandising: RoomMerchandising = {
  key: 'alpine-bathing-suite',
  mewsRoomTypeId: 'alpine-bathing-suite-1',
  legacyNames: ['Alpine Bathing Suite'],
  roomTypeGroupKey: 'alpine',
  cardTagline: 'THE ICONIC INDOOR SOAK',
  cardDescription: 'A hillside suite with a copper clawfoot tub in front of a picture window, heated floors, and a picture window facing the forest.',
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

const mockRoom: ShapedRoom = {
  roomTypeId: 'alpine-bathing-suite-1',
  categoryId: 'alpine-bathing-suite-1',
  name: 'Alpine Bathing Suite',
  description: 'Hillside suite with a copper clawfoot tub in front of a picture window, radiant heated floors, and mountain views.',
  cmsShortDescription: 'Hillside suite with a copper clawfoot tub in front of a picture window, radiant heated floors, and forest views.',
  cmsLongDescription: 'Built into the hillside above the Lodge, Alpine is home to ten of the Cowboy’s most iconic rooms.',
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
  merchandising: mockMerchandising,
  merchandisingSource: 'mewsRoomTypeId',
};

const meta: Meta<typeof RoomsListCard> = {
  title: 'Components/RoomsListCard',
  component: RoomsListCard,
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
  args: {
    room: mockRoom,
    imageBaseUrl: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200',
    theme: 'paper',
    layout: 'left',
    isTopMatch: false,
  },
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
    customImage: 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=1200',
  },
};
