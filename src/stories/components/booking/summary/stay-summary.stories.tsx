import type { Meta, StoryObj } from '@storybook/react-vite';
import { StaySummary } from '@/components/booking/summary/stay-summary';

const meta: Meta<typeof StaySummary> = {
  title: 'Components/Booking/Summary/StaySummary',
  component: StaySummary,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof StaySummary>;

export const Default: Story = {};
