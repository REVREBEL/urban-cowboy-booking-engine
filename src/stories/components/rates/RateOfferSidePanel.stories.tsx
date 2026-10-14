import type { Meta, StoryObj } from '@storybook/react-vite';
import { RateOfferSidePanel } from '@/components/rates/RateOfferSidePanel';

const meta: Meta<typeof RateOfferSidePanel> = {
  title: 'Components/Rates/RateOfferSidePanel',
  component: RateOfferSidePanel,
  tags: ['autodocs'],
  args: {
    variant: 'default',
    theme: 'outfit',
    rateTitle: 'THE OUTFIT MEMBER RATE',
    cancellationHeader: 'FREE CANCELLATION UNTIL CHECK-IN',
    cancellationSub: 'Direct booking perk: instant savings',
    depositNote: '50% deposit due today upon booking',
    remainingNote: 'Remaining balance due on arrival',
    nightlyRate: 131,
    stayTotal: 262,
    taxesAndFees: 44,
    totalStay: 306,
    dueAtBooking: 153,
    remaining: 153,
  },
};

export default meta;
type Story = StoryObj<typeof RateOfferSidePanel>;

export const Default: Story = {};
