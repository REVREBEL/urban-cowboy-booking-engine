import type { Meta, StoryObj } from '@storybook/react-vite';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';

const meta: Meta<typeof InputOTP> = {
  title: 'Components/UI/InputOTP',
  component: InputOTP,
  tags: ['autodocs'],
  args: { maxLength: 6 },
};

export default meta;
type Story = StoryObj<typeof InputOTP>;

export const Default: Story = {
  render: (args) => (
    <InputOTP maxLength={args.maxLength ?? 6}>
      <InputOTPGroup>
        <InputOTPSlot index={0} />
        <InputOTPSlot index={1} />
        <InputOTPSlot index={2} />
        <InputOTPSlot index={3} />
        <InputOTPSlot index={4} />
        <InputOTPSlot index={5} />
      </InputOTPGroup>
    </InputOTP>
  ),
};
