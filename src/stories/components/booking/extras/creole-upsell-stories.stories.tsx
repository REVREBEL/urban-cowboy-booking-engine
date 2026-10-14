import type { Meta, StoryObj } from '@storybook/react-vite';
import { CreoleUpsellStories } from '@/components/booking/extras/creole-upsell-stories';

const meta: Meta<typeof CreoleUpsellStories> = {
  title: 'Components/Booking/Extras/CreoleUpsellStories',
  component: CreoleUpsellStories,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof CreoleUpsellStories>;

export const Default: Story = {};
