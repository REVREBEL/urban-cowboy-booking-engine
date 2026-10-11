import type { Meta, StoryObj } from '@storybook/react-vite';
import { DateRangePicker } from '../../components/forms/date-range-picker';

const meta: Meta<typeof DateRangePicker> = {
  title: 'Components/Forms/DateRangePicker',
  component: DateRangePicker,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: 'Accessible interactive date range picker with popover calendar, month navigation, and night counter.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    checkIn: { control: 'text', description: 'ISO date string (YYYY-MM-DD) for check-in' },
    checkOut: { control: 'text', description: 'ISO date string (YYYY-MM-DD) for check-out' },
    minDate: { control: 'text', description: 'Minimum allowed ISO date string' },
    onChange: { action: 'onChange' },
  },
} satisfies Meta<typeof DateRangePicker>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    checkIn: '2026-10-14',
    checkOut: '2026-10-17',
    minDate: '2026-10-01',
  },
};

export const Unselected: Story = {
  args: {
    checkIn: '',
    checkOut: '',
    minDate: '2026-10-01',
  },
};

export const CheckInOnly: Story = {
  args: {
    checkIn: '2026-10-20',
    checkOut: '',
    minDate: '2026-10-01',
  },
};
