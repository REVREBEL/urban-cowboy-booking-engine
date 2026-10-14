import type { Meta, StoryObj } from '@storybook/react-vite';
import ErrorState from '../../components/feedback/error-state';

const meta: Meta<typeof ErrorState> = {
  title: 'Components/Feedback/ErrorState',
  component: ErrorState,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Error state indicator component with error icon, message, and optional retry action.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    message: { control: 'text', description: 'Error message text' },
    onRetry: { action: 'onRetry', description: 'Retry action callback' },
  },
} satisfies Meta<typeof ErrorState>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    message: 'Something went wrong. Please try again.',
  },
};

export const WithRetry: Story = {
  args: {
    message: 'Unable to connect to Mews API reservation service.',
    onRetry: () => alert('Retry clicked'),
  },
};
