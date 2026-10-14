import type { Meta, StoryObj } from '@storybook/react-vite';
import { OffersCardStayAWhile } from '@/components/rates/StayAwhileOffersCard';

const meta: Meta<typeof OffersCardStayAWhile> = {
  title: 'Components/Rates/StayAwhileOffersCard',
  component: OffersCardStayAWhile,
  tags: ['autodocs'],
  args: { variant: 'default', price: '$340' },
};

export default meta;
type Story = StoryObj<typeof OffersCardStayAWhile>;

export const Default: Story = {};
