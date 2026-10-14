import type { Meta, StoryObj } from '@storybook/react-vite';
import { ConfigurableRateOffer } from '@/components/rates/ConfigurableRateOffer';

const meta: Meta<typeof ConfigurableRateOffer> = {
  title: 'Components/Rates/ConfigurableRateOffer',
  component: ConfigurableRateOffer,
  tags: ['autodocs'],
  args: {
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
      taxLabel: 'Excl. taxes',
      cancellationText: 'Non-refundable',
    },
  },
};

export default meta;
type Story = StoryObj<typeof ConfigurableRateOffer>;

export const Default: Story = {};
