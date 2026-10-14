import type { Meta, StoryObj } from '@storybook/react-vite';
import { ContactBar } from '@/components/booking/chrome/contact-bar';

const meta: Meta<typeof ContactBar> = {
  title: 'Components/Booking/Chrome/ContactBar',
  component: ContactBar,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof ContactBar>;

export const Default: Story = {};
