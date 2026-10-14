import type { Meta, StoryObj } from '@storybook/react-vite';
import { OffersCardPlanAhead } from '@/components/rates/PlanAheadOffersCard';

const meta: Meta<typeof OffersCardPlanAhead> = {
  title: 'Components/Rates/PlanAheadOffersCard',
  component: OffersCardPlanAhead,
  tags: ['autodocs'],
  args: { variant: 'default', price: '$320' },
};

export default meta;
type Story = StoryObj<typeof OffersCardPlanAhead>;

export const Default: Story = {};
