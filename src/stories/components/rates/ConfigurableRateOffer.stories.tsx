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
      cancellationPenaltyWindow: null,
      cancellationPenaltyWindowPeriod: null,
      cancellationFullForfeitWindow: null,
      cancellationFullForfeitWindowPeriod: null,
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
    depositNote: 'First night deposit due today upon booking.',
    remainingNote: 'Remaining balance due 14 days prior to check-in.',
    fullPolicyText: 'Free cancellation up to 14 days before arrival. Cancellations made within 14 days will forfeit the deposit.',
  },
  argTypes: {
    theme: { control: 'select', options: ['paper', 'copper', 'lake-forest'] },
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