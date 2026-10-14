import type { Meta, StoryObj } from '@storybook/react-vite';
import { Badge } from '@/components/ui/badge';

const meta: Meta<typeof Badge> = {
  title: 'Components/UI/Badge',
  component: Badge,
  tags: ['autodocs'],
  args: { children: 'Top Match', variant: 'default' },
  argTypes: {
    variant: { control: 'select', options: ['default', 'secondary', 'destructive', 'outline'] },
  },
};

export default meta;
type Story = StoryObj<typeof Badge>;

export const Default: Story = {};
export const Secondary: Story = { args: { variant: 'secondary', children: 'Adults Only 21+' } };
export const Destructive: Story = { args: { variant: 'destructive', children: 'Last 1 Room' } };
export const Outline: Story = { args: { variant: 'outline', children: 'Dog Friendly' } };
