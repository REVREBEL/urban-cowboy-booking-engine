import type { Meta, StoryObj } from '@storybook/react-vite';
import { RateOfferCard } from '@/components/rates/RateOfferCard';

const mockPricingDetails = {
  nightly: 145,
  subtotal: 290,
  taxesAndFees: 45,
  total: 335,
  dueToday: 167.5,
  remaining: 167.5,
};

const meta: Meta<typeof RateOfferCard> = {
  title: 'Components/Rates/RateOfferCard',
  component: RateOfferCard,
  tags: ['autodocs'],
  args: {
    variant: 'default',
    theme: 'ride-easy',
    price: '$145',
    priceUnit: 'NIGHTLY',
    taxDisclaimer: 'Excluding Taxes + Fees',
    isExpanded: false,
    pricingDetails: mockPricingDetails,
  },
  argTypes: {
    theme: {
      control: 'select',
      options: ['ride-easy', 'plan-ahead', 'stay-while', 'sunup', 'outfit'],
    },
    variant: {
      control: 'radio',
      options: ['default', 'compact'],
    },
    isExpanded: {
      control: 'boolean',
    },
    disabled: {
      control: 'boolean',
    },
    isLoading: {
      control: 'boolean',
    },
    onToggleExpand: { action: 'onToggleExpand' },
    onBook: { action: 'onBook' },
    onConfirmBooking: { action: 'onConfirmBooking' },
    onUnlock: { action: 'onUnlock' },
  },
};

export default meta;
type Story = StoryObj<typeof RateOfferCard>;

// ============================================================================
// 1. Ride Easy Theme (Best Flexible Rate)
// ============================================================================
export const RideEasy: Story = {
  args: {
    theme: 'ride-easy',
    eyebrow: 'BEST FLEXIBLE RATE',
    headline: 'RIDE\nEASY',
    headlineSub: ['Keep', 'Your', 'Options', 'Open.'],
    description:
      'Our standard rate for guests who want a little more freedom around their plans. Plans change. This one gives you room to move, with our most flexible cancellation terms.',
    guaranteeText: 'THE COWBOY BEST RATE GUARANTEE',
    ctaLabel: 'BOOK RATE',
    policyText: 'Free Cancellation until May 31, 2027',
  },
};

export const RideEasyExpanded: Story = {
  args: {
    ...RideEasy.args,
    isExpanded: true,
  },
};

// ============================================================================
// 2. Plan Ahead Theme (Early Bird Savings)
// ============================================================================
export const PlanAhead: Story = {
  args: {
    theme: 'plan-ahead',
    eyebrow: 'EARLY BIRD SAVINGS',
    headline: 'plan\nahead.\nsave a\nlittle.',
    description:
      "Know when you're coming?\nBook ahead and enjoy a better rate for making the call early.",
    ctaLabel: 'COMMIT TO THE COWBOY',
    policyText: 'Full Prepay. Non Refundable.',
  },
};

export const PlanAheadExpanded: Story = {
  args: {
    ...PlanAhead.args,
    isExpanded: true,
  },
};

// ============================================================================
// 3. Stay Awhile Theme (5+ Nights Extended Stay)
// ============================================================================
export const StayAwhile: Story = {
  args: {
    theme: 'stay-while',
    eyebrow: 'STAY 5+ NIGHTS',
    headline: 'STAY A\nWHILE &\nUNCLINCH',
    description:
      'Slip away Sunday through Thursday for slower mornings, quieter trails, and a better reason to stay out a little longer.',
    ctaLabel: 'BOOK THIS RATE',
    policyText: 'Free Cancellation until May 19',
  },
};

export const StayAwhileExpanded: Story = {
  args: {
    ...StayAwhile.args,
    isExpanded: true,
  },
};

// ============================================================================
// 4. Sunup Theme (Room + Breakfast Package)
// ============================================================================
export const Sunup: Story = {
  args: {
    theme: 'sunup',
    eyebrow: 'ROOM + BREAKFAST',
    headline: 'SUNUP\nBEFORE\nTHE\nTRAIL',
    description:
      'Start the day slowly with your room and breakfast wrapped into one easy stay.',
    ctaLabel: 'BOOK THIS RATE',
    policyText: 'Free Cancellation until May 19',
  },
};

export const SunupExpanded: Story = {
  args: {
    ...Sunup.args,
    isExpanded: true,
  },
};

// ============================================================================
// 5. Outfit Theme (Member Rate with Email Unlock)
// ============================================================================
export const Outfit: Story = {
  args: {
    theme: 'outfit',
    eyebrow: 'book direct & save',
    headline: 'WELCOME\nTO\nTHE\nOUTFIT.',
    subheadline: 'member rate',
    description:
      'Share your email and unlock our direct-only member rate from your very first stay.',
    ctaLabel: 'UNLOCK THIS RATE',
    calloutText: 'A BETTER RATE, STRAIGHT FROM COWBOY.',
    policyText: 'Free Cancellation until May 19',
    onUnlock: async (email: string) => {
      console.log('Unlocking for email:', email);
      return { eligible: true };
    },
  },
};

export const OutfitExpanded: Story = {
  args: {
    ...Outfit.args,
    isExpanded: true,
  },
};

// ============================================================================
// 6. Compact Variant Comparison
// ============================================================================
export const CompactRideEasy: Story = {
  args: {
    ...RideEasy.args,
    variant: 'compact',
  },
};

export const CompactOutfitExpanded: Story = {
  args: {
    ...Outfit.args,
    variant: 'compact',
    isExpanded: true,
  },
};