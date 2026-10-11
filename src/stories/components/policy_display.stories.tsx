// PolicyDisplay.stories.tsx
import type { Meta, StoryObj } from '@storybook/react-vite';
import PolicyDisplay from '../../components/rates/policy_display';
/**
Storybook meta configuration for PolicyDisplay.
Demonstrates cancellation policies, payment milestones, and interactive tooltips.
*/

const meta: Meta = {
  title: 'Components/PolicyDisplay',
  component: PolicyDisplay,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'A reservation policy breakdown card showing payment milestones, cancellation cutoffs, and deposit schedules with interactive tooltips.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    title: {
      control: 'text',
      description: 'Heading text for the policy card',
    },
    initialAmount: {
      control: 'text',
      description: 'Initial deposit amount due upon confirmation',
    },
    remainingAmount: {
      control: 'text',
      description: 'Remaining balance due prior to arrival',
    },
    freeCancelDate: {
      control: 'object',
      description: 'Milestone date for the 100% refundable cancellation cutoff',
    },
    nonRefundableDate: {
      control: 'object',
      description: 'Milestone date when the stay becomes non-refundable / locked',
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
Default story showing placeholder zero balances and default October milestones.
*/
export const Default: Story = {
  args: {
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
Realistic scenario with concrete deposit numbers and dates.
*/
export const RealisticBooking: Story = {
  args: {
    title: 'POLICY INFORMATION',
    initialAmount: '$150.00',
    remainingAmount: '$450.00',
    freeCancelDate: {
      daysPrior: '14',
      day: '15',
      month: 'NOV',
    },
    nonRefundableDate: {
      daysPrior: '03',
      day: '26',
      month: 'NOV',
    },
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
      title: 'FIRST PAYMENT',
      description:
        'A refundable holding deposit processed immediately upon reservation confirmation.',
    },
    remainingBalanceTooltip: {
      title: 'FINAL SETTLEMENT',
      description:
        'The remaining charge automatically settled one week prior to check-in.',
    },
  },
};