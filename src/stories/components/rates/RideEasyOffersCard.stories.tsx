import type { Meta, StoryObj } from '@storybook/react-vite';
import { OffersCard } from '@/components/rates/RideEasyOffersCard';

const meta: Meta<typeof OffersCard> = {
  title: 'Components/Rates/RideEasyOffersCard',
  component: OffersCard,
  tags: ['autodocs'],
  args: { variant: 'default', price: '$425' },
};

export default meta;
type Story = StoryObj<typeof OffersCard>;

export const Default: Story = {};
