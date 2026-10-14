import type { Meta, StoryObj } from '@storybook/react-vite';
import { RateSelectionView } from '@/components/rates/RateSelectionView';
import type { RoomType } from '@/types';

const mockRoom: RoomType = {
  id: 'alpine-bathing-suite',
  buildingId: 'alpine',
  buildingName: 'Alpine Haus',
  name: 'Alpine Bathing Suite',
  eyebrow: 'THE ICONIC INDOOR SOAK',
  tagline: 'Copper clawfoot tub with forest views',
  description: 'A hillside suite with a copper clawfoot tub in front of a picture window.',
  longDescription: 'Perched on the hillside directly behind the Main Lodge, Alpine Bathing Suite pairs a king bed with a freestanding tub.',
  basePrice: 425,
  squareFeet: 450,
  bedType: 'King',
  maxGuests: 2,
  isDogFriendly: false,
  ageRestricted21: true,
  soakType: 'clawfoot-window',
  soakHighlight: 'Picture window clawfoot soak facing the hemlocks',
  images: [],
  features: ['Clawfoot Tub', 'Fireplace'],
  tags: ['alpine', 'soak'],
};

const meta: Meta<typeof RateSelectionView> = {
  title: 'Components/Rates/RateSelectionView',
  component: RateSelectionView,
  tags: ['autodocs'],
  args: {
    room: mockRoom,
    criteria: {
      checkIn: '2026-10-24',
      checkOut: '2026-10-27',
      guests: 2,
      nights: 3,
      property: 'catskills',
      rooms: 1,
    },
    selectedRate: null,
  },
  argTypes: {
    onChangeRoom: { action: 'onChangeRoom' },
    onSelectRate: { action: 'onSelectRate' },
  },
};

export default meta;
type Story = StoryObj<typeof RateSelectionView>;

export const Default: Story = {};
