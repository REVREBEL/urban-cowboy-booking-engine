import type { Meta, StoryObj } from '@storybook/react-vite';
import { StayBreakdown } from '@/components/booking/summary/stay-breakdown';

const meta: Meta<typeof StayBreakdown> = {
  title: 'Components/Booking/Summary/StayBreakdown',
  component: StayBreakdown,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof StayBreakdown>;

export const Default: Story = {};
