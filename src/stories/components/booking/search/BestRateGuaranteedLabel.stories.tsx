import type { Meta, StoryObj } from '@storybook/react-vite';
import { BestRateGuaranteedLabel } from '@/components/booking/search/BestRateGuaranteedLabel';

const meta: Meta<typeof BestRateGuaranteedLabel> = {
  title: 'Components/Booking/Search/BestRateGuaranteedLabel',
  component: BestRateGuaranteedLabel,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof BestRateGuaranteedLabel>;

export const Default: Story = {};
