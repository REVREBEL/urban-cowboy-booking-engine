import type { Meta, StoryObj } from '@storybook/react-vite';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

const meta: Meta<typeof Alert> = {
  title: 'Components/UI/Alert',
  component: Alert,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Alert>;

export const Default: Story = {
  render: () => (
    <Alert className="max-w-md">
      <AlertTitle>Special Offer Applied</AlertTitle>
      <AlertDescription>Your Stay Awhile 20% discount has been automatically applied.</AlertDescription>
    </Alert>
  ),
};
