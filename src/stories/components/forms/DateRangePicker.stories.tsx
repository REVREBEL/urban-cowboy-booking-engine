import type { Meta, StoryObj } from '@storybook/react-vite';
import { DateRangePicker } from '@/components/forms/date-range-picker';

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
  // The calendar is absolutely positioned, so it does not contribute to the
  // Storybook Docs preview height. Reserve enough room for the open popover.
  decorators: [
    (Story) => (
      <div className="min-h-[480px] w-full pt-2">
        <div className="max-w-[720px]">
          <Story />
        </div>
      </div>
    ),
  ],
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
