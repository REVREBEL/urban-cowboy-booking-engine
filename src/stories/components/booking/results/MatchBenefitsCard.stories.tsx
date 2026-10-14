import type { Meta, StoryObj } from '@storybook/react-vite';
import { MatchBenefitsCard } from '@/components/booking/results/MatchBenefitsCard';

const meta: Meta<typeof MatchBenefitsCard> = {
  title: 'Components/Booking/Results/MatchBenefitsCard',
  component: MatchBenefitsCard,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof MatchBenefitsCard>;

export const Default: Story = {};
