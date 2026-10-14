import type { Meta, StoryObj } from '@storybook/react-vite';
import { DogToggleButton } from '@/components/booking/discovery/DogToggleButton';

const meta: Meta<typeof DogToggleButton> = {
  title: 'Components/Booking/Discovery/DogToggleButton',
  component: DogToggleButton,
  tags: ['autodocs'],
  args: { selected: false },
  argTypes: { selected: { control: 'boolean' }, onToggle: { action: 'onToggle' } },
};

export default meta;
type Story = StoryObj<typeof DogToggleButton>;

export const Inactive: Story = {};
export const Selected: Story = { args: { selected: true } };
