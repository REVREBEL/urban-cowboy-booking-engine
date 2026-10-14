import type { Meta, StoryObj } from '@storybook/react-vite';
import { OffersCardSunup } from '@/components/rates/SunupOffersCard';

const meta: Meta<typeof OffersCardSunup> = {
  title: 'Components/Rates/SunupOffersCard',
  component: OffersCardSunup,
  tags: ['autodocs'],
  args: { variant: 'default', price: '$385' },
};

export default meta;
type Story = StoryObj<typeof OffersCardSunup>;

export const Default: Story = {};
