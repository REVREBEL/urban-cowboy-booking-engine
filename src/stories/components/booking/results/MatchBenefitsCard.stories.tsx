import type { Meta, StoryObj } from '@storybook/react-vite';
import { MatchBenefitsCard } from '@/components/booking/results/MatchBenefitsCard';

const mockRoom = {
  id: "alpine-bathing-suite",
  name: "Alpine Bathing Suite",
  headline: "Clawfoot soaking with forest views",
  blurb: "featuring a deep clawfoot tub positioned for forest gazing.",
  building: "Alpine Haus",
  squareFeet: 450,
  maxGuests: 2,
  bedType: "King Bed",
  imageUrl: "/assets/rooms/alpine.jpg",
  features: [
    { id: "tub", label: "Clawfoot tub", icon: "tub" },
    { id: "view", label: "Forest views", icon: "window" },
  ],
};

const meta: Meta<typeof MatchBenefitsCard> = {
  title: 'Components/Booking/Results/MatchBenefitsCard',
  component: MatchBenefitsCard,
  tags: ['autodocs'],
  args: {
    room: mockRoom as any,
    reasons: ["Clawfoot tub positioned by the window", "Private deck with mountain air"],
  },
};

export default meta;
type Story = StoryObj<typeof MatchBenefitsCard>;

export const Default: Story = {};
