import type { Meta, StoryObj } from '@storybook/react-vite';
import { ConfigurableRateOffer } from '@/components/rates/ConfigurableRateOffer';

const meta: Meta<typeof ConfigurableRateOffer> = {
  title: 'Components/Rates/ConfigurableRateOffer',
  component: ConfigurableRateOffer,
  tags: ['autodocs'],
  args: {
    theme: 'plan-ahead',
    isExpanded: false,
    variant: 'default',
    config: {
      id: 'plan-ahead',
      name: 'Plan Ahead',
      mewsRateId: 'rate-plan-ahead',
      isDefault: false,
      active: true,
      sortOrder: 1,
      desktopArtworkUrl: null,
      mobileArtworkUrl: null,
      horizontalArtworkUrl: null,
      eyebrow: 'EARLY BIRD SAVINGS',
      headline: 'PLAN AHEAD',
      description: 'Book 30+ days early and save 15%.',
      supportingText: null,
      buttonStyle: 'filled',
      buttonColor: 'copper',
      borderStyle: 'none',
      textColor: 'cowboy-umber',
      fontPair: 'brothers-bianco',
      ctaLabel: 'Book Rate',
      desktopOverlayPosition: 'normal',
      mobileOverlayPosition: 'normal',
      cancellationPenaltyWindow: 14,
      cancellationPenaltyWindowPeriod: 'days',
      cancellationFullForfeitWindow: 5,
      cancellationFullForfeitWindowPeriod: 'days',
    },
    live: {
      price: '$360',
      priceUnit: 'nightly',
      taxLabel: 'Excl. taxes & fees',
      cancellationText: 'Flexible cancellation up to 14 days prior',
    },
    pricing: {
      nightly: '$360.00',
      subtotal: '$1,080.00',
      taxesAndFees: '$92.40',
      total: '$1,172.40',
      dueToday: '$360.00',
      remaining: '$812.40',
    },
    depositNote: '50% deposit charged once the reservation is confirmed.',
    remainingNote: 'Remaining balance automatically charged 5 days before arrival.',
    fullPolicyText: 'Free cancellation through 14 days before arrival. Inside 14 days the deposit is forfeited; inside 5 days the full stay is non-refundable.',
    checkIn: '2027-06-20',
  },
  argTypes: {
    theme: { control: 'select', options: ['ride-easy', 'plan-ahead', 'stay-while', 'sunup', 'outfit'] },
    variant: { control: 'radio', options: ['default', 'compact'] },
    isExpanded: { control: 'boolean' },
    onToggleExpand: { action: 'onToggleExpand' },
    onConfirmBooking: { action: 'onConfirmBooking' },
  },
};

export default meta;
type Story = StoryObj<typeof ConfigurableRateOffer>;

export const Collapsed: Story = {};

export const Expanded: Story = {
  args: {
    isExpanded: true,
  },
};

export const CompactExpanded: Story = {
  args: {
    variant: 'compact',
    isExpanded: true,
  },
};

export const PlanAheadThemeExpanded: Story = {
  args: {
    theme: 'plan-ahead',
    isExpanded: true,
  },
};

export const CompactWithPaymentMilestones: Story = {
  args: {
    variant: 'compact',
    isExpanded: true,
    checkIn: '2027-06-20',
  },
};

export const RideEasyExpanded: Story = {
  args: {
    theme: 'ride-easy',
    isExpanded: true,
  },
};

export const StayAwhileExpanded: Story = {
  args: {
    theme: 'stay-while',
    isExpanded: true,
  },
};

export const SunupExpanded: Story = {
  args: {
    theme: 'sunup',
    isExpanded: true,
  },
};

export const OutfitExpanded: Story = {
  args: {
    theme: 'outfit',
    isExpanded: true,
  },
};
