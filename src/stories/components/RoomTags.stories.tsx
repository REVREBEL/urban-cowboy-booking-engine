import type { Meta, StoryObj } from '@storybook/react-vite';
import { RoomTagsPanel, RoomBenefitsOverlay, type RoomTag } from '../../components/rooms/room-tags';
import { Sparkles, Trees, Eye, ShieldCheck } from 'lucide-react';

const mockTags: RoomTag[] = [
  { key: 'soak', label: 'Outdoor Cedar Tub', Icon: Sparkles },
  { key: 'views', label: 'Forest Views', Icon: Trees },
  { key: 'deck', label: 'Private Deck', Icon: Eye },
  { key: 'privacy', label: 'Secluded Hideaway', Icon: ShieldCheck },
];

const meta: Meta<typeof RoomTagsPanel> = {
  title: 'Components/Rooms/RoomTagsPanel',
  component: RoomTagsPanel,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Pill badge panel displaying key room features and amenity tags with icons.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    tags: { control: 'object', description: 'List of room tags with icons and labels' },
  },
} satisfies Meta<typeof RoomTagsPanel>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    tags: mockTags,
  },
};

export const SingleTag: Story = {
  args: {
    tags: [mockTags[0]],
  },
};

export const BenefitsOverlayVariant: Story = {
  render: () => (
    <div className="relative w-80 h-48 bg-smoke/90 rounded-2xl p-4 overflow-hidden">
      <RoomBenefitsOverlay tags={mockTags} />
      <span className="text-white text-sm font-bold">Room Image Container</span>
    </div>
  ),
};
