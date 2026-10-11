import type { Meta, StoryObj } from '@storybook/react-vite';
import { RoomDetailModal } from '../../components/rooms/RoomDetailModal';
import type { RoomType, SearchCriteria } from '../../types';
import type { RoomTypeCmsReview } from '../../types/room-type-cms';

const mockRoom: RoomType = {
  id: 'alpine-bathing-suite',
  buildingId: 'alpine',
  buildingName: 'Alpine Haus',
  name: 'Alpine Bathing Suite',
  eyebrow: 'Building 01 · First Floor',
  tagline: 'The Iconic Indoor Soak',
  description: 'Freestanding clawfoot tub facing a picture window, radiant heated floors, and forest views.',
  longDescription: 'Built into the hillside above the Lodge, Alpine is home to ten of the Cowboy’s most iconic rooms. Every suite pairs a freestanding clawfoot tub in front of a picture window, with the forest and mountains doing the decorating outside.',
  basePrice: 425,
  squareFeet: 430,
  bedType: 'King Bed',
  maxGuests: 2,
  isDogFriendly: false,
  ageRestricted21: true,
  soakType: 'clawfoot-window',
  soakHighlight: 'Freestanding copper clawfoot tub in front of a forest picture window',
  images: [
    'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200',
    'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=1200',
  ],
  features: ['Clawfoot Soaking Tub', 'Radiant Heated Floors', 'Cast Iron Wood Stove', 'Letter Writing Desk'],
  tags: ['indoor-soak', 'picture-window', '21-plus'],
};

const mockCriteria: SearchCriteria = {
  property: 'Urban Cowboy Catskills',
  checkIn: '2026-10-14',
  checkOut: '2026-10-17',
  nights: 3,
  guests: 2,
  rooms: 1,
};

const mockReview: RoomTypeCmsReview = {
  roomTypeId: 'alpine-bathing-suite',
  quote: 'Bathing in front of the snow-covered forest with the cast iron stove crackling was pure magic.',
  reviewer: 'Emma & Liam',
  reviewDate: '2025-11-20',
  source: 'Condé Nast Traveler',
  sourceUrl: 'https://example.com/review',
};

const meta: Meta<typeof RoomDetailModal> = {
  title: 'Components/RoomDetailModal',
  component: RoomDetailModal,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'Modal dialog displaying comprehensive room specifications, photo gallery carousel, woodcut amenity icons, review quotes, and checkout CTA.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    room: {
      control: 'object',
      description: 'Selected room details or null if modal is closed',
    },
    criteria: {
      control: 'object',
      description: 'Active search dates and guest criteria',
    },
    review: {
      control: 'object',
      description: 'CMS guest review quote object',
    },
    onClose: { action: 'onClose' },
    onProceedToRates: { action: 'onProceedToRates' },
  },
} satisfies Meta<typeof RoomDetailModal>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    room: mockRoom,
    criteria: mockCriteria,
    review: mockReview,
  },
};

export const WithoutReview: Story = {
  args: {
    ...Default.args,
    review: null,
  },
};

export const OutdoorCedarTubRoom: Story = {
  args: {
    ...Default.args,
    room: {
      ...mockRoom,
      id: 'walden-forest-bathing-suite',
      buildingId: 'walden',
      buildingName: 'Walden Haus',
      name: 'Walden Forest Bathing Suite',
      tagline: 'Deep in the Pines · Outdoor Soaks',
      soakType: 'outdoor-cedar-tub',
      soakHighlight: 'Private outdoor cedar soaking tub on a secluded forest-facing deck',
      isDogFriendly: true,
    },
  },
};

export const ClosedState: Story = {
  args: {
    room: null,
    criteria: mockCriteria,
  },
};
