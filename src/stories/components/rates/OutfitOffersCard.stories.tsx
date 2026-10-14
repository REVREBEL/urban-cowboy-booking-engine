import type { Meta, StoryObj } from '@storybook/react-vite';
import { OffersCardOutfit } from '@/components/rates/OutfitOffersCard';

const meta: Meta<typeof OffersCardOutfit> = {
  title: 'Components/Rates/OutfitOffersCard',
  component: OffersCardOutfit,
  tags: ['autodocs'],
  args: {
    variant: 'default',
    eyebrow: 'book direct & save',
    headline: 'WELCOME\nTO\nTHE\nOUTFIT.',
    price: '$145',
    ctaLabel: 'UNLOCK THIS RATE',
  },
};

export default meta;
type Story = StoryObj<typeof OffersCardOutfit>;

export const Default: Story = {};
export const Compact: Story = { args: { variant: 'compact' } };
