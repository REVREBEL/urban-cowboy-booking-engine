import type { Meta, StoryObj } from '@storybook/react-vite';
import { Toggle } from '@/components/ui/toggle';

const meta: Meta<typeof Toggle> = {
  title: 'Components/UI/Toggle',
  component: Toggle,
  tags: ['autodocs'],
  args: { children: 'Fireplace' },
};

export default meta;
type Story = StoryObj<typeof Toggle>;

export const Default: Story = {};
