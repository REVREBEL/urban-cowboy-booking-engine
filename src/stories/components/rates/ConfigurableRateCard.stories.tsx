import type { Meta, StoryObj } from '@storybook/react-vite';
import { ConfigurableRateCard } from '@/components/rates/ConfigurableRateCard';

const meta: Meta<typeof ConfigurableRateCard> = {
  title: 'Components/Rates/ConfigurableRateCard',
  component: ConfigurableRateCard,
  tags: ['autodocs'],
  args: {
    config: {
      id: 'stay-awhile',
      name: 'Stay Awhile',
      mewsRateId: 'rate-stay-awhile',
      isDefault: false,
      active: true,
      sortOrder: 1,
      desktopArtworkUrl: null,
      mobileArtworkUrl: null,
      horizontalArtworkUrl: null,
      eyebrow: '20% OFF 3+ NIGHTS',
      headline: 'STAY AWHILE',
      description: 'Unpack once. Deepen into the mountain rhythm.',
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
      price: '$340',
      priceUnit: 'avg / night',
      taxLabel: '+ $28 taxes & fees',
      cancellationText: 'Flexible cancellation up to 14 days prior',
    },
    layout: 'vertical',
  },
  argTypes: {
    layout: { control: 'radio', options: ['vertical', 'horizontal'] },
    isExpanded: { control: 'boolean' },
    disabled: { control: 'boolean' },
    onBook: { action: 'onBook' },
    onExpand: { action: 'onExpand' },
  },
};

export default meta;
type Story = StoryObj<typeof ConfigurableRateCard>;

export const Vertical: Story = {};

export const Horizontal: Story = {
  args: {
    layout: 'horizontal',
  },
};

export const SingleBorder: Story = {
  args: {
    config: {
      ...meta.args!.config!,
      borderStyle: 'single',
    },
  },
};

export const DoubleBorder: Story = {
  args: {
    config: {
      ...meta.args!.config!,
      borderStyle: 'double',
    },
  },
};

export const OutlineButton: Story = {
  args: {
    config: {
      ...meta.args!.config!,
      buttonStyle: 'outline',
    },
  },
};