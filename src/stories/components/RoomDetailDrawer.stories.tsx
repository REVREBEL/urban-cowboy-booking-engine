import type { Meta, StoryObj } from '@storybook/react-vite';
import { RoomDetailDrawer } from '../../components/rooms/room-detail-drawer';
import type { ShapedRoom, ShapedRate } from '../../types/mews';
import { Sparkles, Trees } from 'lucide-react';

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

const mockRoom: ShapedRoom = {
  roomTypeId: 'alpine-bathing-suite-drawer',
  categoryId: 'alpine-bathing-suite-drawer',
  name: 'Alpine Bathing Suite',
  description: 'A hillside suite with a copper clawfoot tub in front of a picture window, heated floors, and a picture window facing the forest.',
  cmsShortDescription: 'A hillside suite with a copper clawfoot tub in front of a picture window.',
  cmsLongDescription: 'Built into the hillside above the Lodge, Alpine is home to ten of the Cowboy’s most iconic rooms.',
  imageIds: ['img-1', 'img-2'],
  normalBedCount: 1,
  extraBedCount: 0,
  roomClass: 'Suite',
  spaceType: 'Suite',
  availableRoomCount: 2,
  capacity: 2,
  rates: [mockRate],
  fromGross: 425,
  merchandising: null,
  merchandisingSource: null,
};

const mockTags = [
  { key: 'soak', label: 'Clawfoot Tub', Icon: Sparkles },
  { key: 'views', label: 'Forest Views', Icon: Trees },
];

const mockSearch = {
  checkIn: '2026-10-14',
  checkOut: '2026-10-17',
  adults: 2,
  children: 0,
};

const meta: Meta<typeof RoomDetailDrawer> = {
  title: 'Components/Rooms/RoomDetailDrawer',
  component: RoomDetailDrawer,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'Slide-out room detail drawer with photo carousel, rate plans, and pricing confirmation.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    imageBaseUrl: { control: 'text', description: 'Base URL for Mews imagery' },
    nightsCount: { control: 'number', description: 'Total nights in reservation' },
    onClose: { action: 'onClose' },
    onSelectRate: { action: 'onSelectRate' },
  },
} satisfies Meta<typeof RoomDetailDrawer>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    room: mockRoom,
    imageBaseUrl: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200',
    tags: mockTags,
    search: mockSearch,
    nightsCount: 3,
  },
};
