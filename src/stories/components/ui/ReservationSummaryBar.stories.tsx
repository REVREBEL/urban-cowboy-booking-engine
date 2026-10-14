import type { Meta, StoryObj } from '@storybook/react-vite';
import { ReservationSummaryBar } from '@/components/ui/ReservationSummaryBar';

const meta: Meta<typeof ReservationSummaryBar> = {
  title: 'Components/UI/ReservationSummaryBar',
  component: ReservationSummaryBar,
  tags: ['autodocs'],
  args: {
    roomName: 'Alpine Bathing Suite',
    rateTitle: 'Best Flexible Rate',
    nights: 3,
    extrasTotal: 120,
    selectedItemCount: 2,
    hasScheduledTiming: true,
    actionLabel: 'Proceed to Guest Details & Pay',
  },
  argTypes: {
    onAction: { action: 'onAction' },
  },
};

export default meta;
type Story = StoryObj<typeof ReservationSummaryBar>;

export const Default: Story = {};
