import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
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
    onClose: fn(),
    onConfirm: fn(),
  },
  argTypes: {
    variant: { control: 'radio', options: ['default', 'compact'] },
    theme: { control: 'select', options: ['ride-easy', 'plan-ahead', 'stay-while', 'sunup', 'outfit'] },
  },
};

export default meta;
type Story = StoryObj<typeof RateOfferSidePanel>;

export const Default: Story = {};


export const Compact: Story = {
  args: {
    variant: 'compact',
  },
};

export const RideEasy: Story = {
  args: {
    theme: 'ride-easy',
    rateTitle: 'RIDE EASY',
  },
};

export const PlanAhead: Story = {
  args: {
    theme: 'plan-ahead',
    rateTitle: 'PLAN AHEAD',
  },
};

export const StayAwhile: Story = {
  args: {
    theme: 'stay-while',
    rateTitle: 'STAY AWHILE',
  },
};

export const Sunup: Story = {
  args: {
    theme: 'sunup',
    rateTitle: 'SUNUP',
  },
};

export const Submitting: Story = {
  args: {
    isSubmitting: true,
  },
};
