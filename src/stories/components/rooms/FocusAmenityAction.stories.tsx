import type { Meta, StoryObj } from '@storybook/react-vite';
import {FocusAmenityAction as Component} from '@/components/rooms/FocusAmenityAction';

const meta: Meta<typeof FocusAmenityAction> = {
  title: 'Components/Rooms/FocusAmenityAction',
  component: FocusAmenityAction,
  tags: ['autodocs'],
} satisfies Meta<typeof FeatureFocus>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    state: 'Default',
  },
};

export const Hover: Story = {
  args: {
    ...Default.args,
    State: 'Hover',
  }
};

export const Active: Story = {
  args: {
    ...Default.args,
    State: 'Active',
  }
};

