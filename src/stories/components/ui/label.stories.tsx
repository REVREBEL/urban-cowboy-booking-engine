import type { Meta, StoryObj } from '@storybook/react-vite';
import { Label } from '@/components/ui/label';

const meta: Meta<typeof Label> = {
  title: 'Components/UI/Label',
  component: Label,
  tags: ['autodocs'],
  args: { children: 'Special Requests' },
};

export default meta;
type Story = StoryObj<typeof Label>;

export const Default: Story = {};
