import type { Meta, StoryObj } from '@storybook/react-vite';
import { FeatureFocus } from '../../components/rooms/FeatureFocus';

const meta = {
  title: 'Components/Rooms/FeatureFocus',
  component: FeatureFocus,
  tags: ['autodocs'],
} satisfies Meta<typeof FeatureFocus>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { count: 1, icon: 'bed', title: 'King bed', active: false, onSelect: () => {} },
};

export const Active: Story = {
  args: { count: 1, icon: 'tub', title: 'Clawfoot soaking tub', active: true, onSelect: () => {} },
};
