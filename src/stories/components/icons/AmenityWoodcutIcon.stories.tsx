import type { Meta, StoryObj } from '@storybook/react-vite';
import { AmenityWoodcutIcon } from '@/components/icons/AmenityWoodcutIcon';

const meta: Meta<typeof AmenityWoodcutIcon> = {
  title: 'Components/Icons/AmenityWoodcutIcon',
  component: AmenityWoodcutIcon,
  tags: ['autodocs'],
  args: { type: 'clawfoot-tub', className: 'w-12 h-12' },
};

export default meta;
type Story = StoryObj<typeof AmenityWoodcutIcon>;

export const Default: Story = {};
