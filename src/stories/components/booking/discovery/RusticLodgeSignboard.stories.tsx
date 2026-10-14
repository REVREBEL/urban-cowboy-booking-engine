import type { Meta, StoryObj } from '@storybook/react-vite';
import { LodgeSignboard } from '@/components/booking/discovery/RusticLodgeSignboard';

const meta: Meta<typeof LodgeSignboard> = {
  title: 'Components/Booking/Discovery/RusticLodgeSignboard',
  component: LodgeSignboard,
  tags: ['autodocs'],
  args: {
    textSlot: <span className="text-white font-bold">URBAN COWBOY</span>,
    buttonSlotTop: <button className="btn-primary">Find Your Stay</button>,
    buttonSlotBottom: <button className="btn-secondary">Browse All Rooms</button>,
  },
};

export default meta;
type Story = StoryObj<typeof LodgeSignboard>;

export const Default: Story = {};
