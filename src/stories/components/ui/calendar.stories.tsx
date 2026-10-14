import type { Meta, StoryObj } from '@storybook/react-vite';
import { Calendar } from '@/components/ui/calendar';

const meta: Meta<typeof Calendar> = {
  title: 'Components/UI/Calendar',
  component: Calendar,
  tags: ['autodocs'],
  args: { mode: 'single', selected: new Date() },
};

export default meta;
type Story = StoryObj<typeof Calendar>;

export const Default: Story = {
  render: (args) => <Calendar {...args} className="rounded-md border shadow" />,
};
