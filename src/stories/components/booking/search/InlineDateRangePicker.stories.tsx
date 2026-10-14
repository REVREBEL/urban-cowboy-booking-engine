import type { Meta, StoryObj } from '@storybook/react-vite';
import { InlineDateRangePicker } from '@/components/booking/search/InlineDateRangePicker';

const meta: Meta<typeof InlineDateRangePicker> = {
  title: 'Components/Booking/Search/InlineDateRangePicker',
  component: InlineDateRangePicker,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof InlineDateRangePicker>;

export const Default: Story = {};
