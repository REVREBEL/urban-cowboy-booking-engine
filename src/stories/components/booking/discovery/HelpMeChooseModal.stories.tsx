import type { Meta, StoryObj } from '@storybook/react-vite';
import { HelpMeChooseModal } from '@/components/booking/discovery/HelpMeChooseModal';

const meta: Meta<typeof HelpMeChooseModal> = {
  title: 'Components/Booking/Discovery/HelpMeChooseModal',
  component: HelpMeChooseModal,
  tags: ['autodocs'],
  args: { isOpen: true },
  argTypes: { onClose: { action: 'onClose' }, onSubmit: { action: 'onSubmit' } },
};

export default meta;
type Story = StoryObj<typeof HelpMeChooseModal>;

export const Open: Story = {};
