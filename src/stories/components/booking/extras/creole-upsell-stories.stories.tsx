import type { Meta, StoryObj } from '@storybook/react-vite';
import { CreoleUpsellStories } from '@/components/booking/extras/creole-upsell-stories';
import { BookingProvider } from '@/state/booking';

const meta: Meta<typeof CreoleUpsellStories> = {
  title: 'Components/Booking/Extras/CreoleUpsellStories',
  component: CreoleUpsellStories,
  tags: ['autodocs'],
  decorators: [(Story) => (
    <BookingProvider>
      <Story />
    </BookingProvider>
  )],
};

export default meta;
type Story = StoryObj<typeof CreoleUpsellStories>;

export const Default: Story = {};
