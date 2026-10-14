import type { Meta, StoryObj } from '@storybook/react-vite';
import { PreferenceIconButton } from '@/components/booking/discovery/PreferenceIconButton';

const meta: Meta<typeof PreferenceIconButton> = {
  title: 'Components/Booking/Discovery/PreferenceIconButton',
  component: PreferenceIconButton,
  tags: ['autodocs'],
  args: {
    id: 'your-own-hideaway',
    label: 'Your Own Hideaway',
    description: 'Secluded cabin retreat with private balcony',
    selected: false,
  },
  argTypes: {
    selected: { control: 'boolean' },
    onToggle: { action: 'onToggle' },
  },
};

export default meta;
type Story = StoryObj<typeof PreferenceIconButton>;

export const Default: Story = {};
export const Selected: Story = { args: { selected: true } };
