import type { Meta, StoryObj } from '@storybook/react-vite';
import { BuildingWoodcut } from '@/components/icons/BuildingWoodcut';

const meta: Meta<typeof BuildingWoodcut> = {
  title: 'Components/Icons/BuildingWoodcut',
  component: BuildingWoodcut,
  tags: ['autodocs'],
  args: { group: 'alpine', className: 'w-60 h-36' },
  argTypes: {
    group: { control: 'select', options: ['alpine', 'walden', 'lodge', 'forest-house', 'cabin', 'chalet', 'opas-cabin', 'slide-mountain', 'mountain-view'] },
  },
};

export default meta;
type Story = StoryObj<typeof BuildingWoodcut>;

export const Alpine: Story = {};
export const Walden: Story = { args: { group: 'walden' } };
export const Lodge: Story = { args: { group: 'lodge' } };
