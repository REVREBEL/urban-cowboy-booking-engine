// PolicyDisplay.stories.tsx
import type { Meta, StoryObj } from '@storybook/react-vite';
import PolicyDisplay from '@/components/rates/PolicyDisplay';
/**
Storybook meta configuration for PolicyDisplay.
Demonstrates cancellation policies, payment milestones, and interactive tooltips.
*/

const meta: Meta<typeof PolicyDisplay> = {
  title: 'Components/Rates/PolicyDisplay',
  component: PolicyDisplay,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'A reservation policy breakdown card displaying payment schedules and cancellation milestones in both horizontal and vertical orientations.',
      },
    },
  },

  tags: ['autodocs'],
  argTypes: {
    orientation: {
      control: 'radio',
      options: ['horizontal', 'vertical'],
      description: 'Layout orientation of the card',
    },
    title: {
      control: 'text',
      description: 'Card section header title',
    },
    initialAmount: {
      control: 'text',
      description: 'Initial deposit amount due upon booking confirmation',
    },
    remainingAmount: {
      control: 'text',
      description: 'Remaining deposit amount due prior to arrival',
    },
    freeCancelDate: {
      control: 'object',
      description: 'Free cancellation cutoff date and days-prior milestone',
    },
    nonRefundableDate: {
      control: 'object',
      description: 'Non-refundable lock-in date and days-prior milestone',
    },
    initialDepositTooltip: {
      control: 'object',
      description: 'Title and description copy for the initial deposit tooltip',
    },
    remainingBalanceTooltip: {
      control: 'object',
      description: 'Title and description copy for the remaining balance tooltip',
    },
  },
} satisfies Meta<typeof PolicyDisplay>;


export default meta;
type Story = StoryObj<typeof meta>;


/**
 * Default horizontal card layout matching the primary design mockup.
 */
export const Horizontal: Story = {
  args: {
    orientation: 'horizontal',
    title: 'POLICY INFORMATION',
    initialAmount: '$000.00',
    remainingAmount: '$000.00',
    freeCancelDate: {
      daysPrior: '14',
      day: '11',
      month: 'OCT',
    },
    nonRefundableDate: {
      daysPrior: '05',
      day: '30',
      month: 'OCT',
    },
  },
};

/**
 * Vertical variant matching the side-by-side vertical divider design mockup.
 */
export const Vertical: Story = {
  args: {
    orientation: 'vertical',
    title: 'POLICY INFORMATION',
    initialAmount: '$000.00',
    remainingAmount: '$000.00',
    freeCancelDate: {
      daysPrior: '14',
      day: '11',
      month: 'OCT',
    },
    nonRefundableDate: {
      daysPrior: '05',
      day: '30',
      month: 'OCT',
    },
    showTooltips: false,
  },
};

/**
 * Vertical variant with populated booking values and active tooltips.
 */
export const VerticalWithAmounts: Story = {
  args: {
    orientation: 'vertical',
    title: 'POLICY INFORMATION',
    initialAmount: '$120.00',
    remainingAmount: '$480.00',
    freeCancelDate: {
      daysPrior: '14',
      day: '11',
      month: 'OCT',
    },
    nonRefundableDate: {
      daysPrior: '05',
      day: '30',
      month: 'OCT',
    },
    showTooltips: true,
  },
};

/**
Custom tooltip and messaging copy.
*/
export const CustomTooltips: Story = {
  args: {
    title: 'RESERVATION & PAYMENT SCHEDULE',
    initialAmount: '$250.00',
    remainingAmount: '$750.00',
    freeCancelDate: {
      daysPrior: '30',
      day: '01',
      month: 'DEC',
    },
    nonRefundableDate: {
      daysPrior: '07',
      day: '24',
      month: 'DEC',
    },
    initialDepositTooltip: {
      title: 'INITIAL DEPOSIT',
      description:
        'This is the amount due at booking. Once your reservation is confirmed, the hotel will charge this amount to the payment method provided.',
    },
    remainingBalanceTooltip: {
      title: 'REMAINING BALANCE',
      description:
        'This is the remaining amount due for your stay. It will be charged automatically to your payment method on the date shown above.',
    },
  },
};

/**
 * Property-standard 50% deposit and five-day balance schedule.
 */
export const CowboyPaymentSchedule: Story = {
  args: {
    orientation: 'horizontal',
    title: 'PAYMENT & CANCELLATION',
    initialAmount: '$688.80',
    remainingAmount: '$688.80',
    freeCancelDate: {
      daysPrior: '14',
      day: '06',
      month: 'JUN',
    },
    nonRefundableDate: {
      daysPrior: '05',
      day: '15',
      month: 'JUN',
    },
    initialDepositTooltip: {
      title: 'INITIAL DEPOSIT',
      description:
        'This is the amount due at booking. Once your reservation is confirmed, the hotel will charge this amount to the payment method provided.',
    },
    remainingBalanceTooltip: {
      title: 'REMAINING BALANCE',
      description:
        'This is the remaining amount due for your stay. It will be charged automatically to your payment method on the date shown above.',
    },
  },
};

export const TextOnlyFallback: Story = {
  args: {
    text: 'Free cancellation through 14 days before arrival. Inside 14 days the deposit is forfeited; inside 5 days the full stay is non-refundable.',
    label: 'Cancellation policy',
  },
};
