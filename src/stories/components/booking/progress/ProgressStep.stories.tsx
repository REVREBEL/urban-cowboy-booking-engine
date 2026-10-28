import type { Meta, StoryObj } from "@storybook/react-vite";
import { ProgressStep, ProgressStepper } from "@/components/booking/progress/ProgressStep";

const meta = {
  title: "Components/Booking/Progress/ProgressStep",
  component: ProgressStep,
  tags: ["autodocs"],
  args: { step: 2, label: "Room", state: "current" },
  argTypes: { state: { control: "inline-radio", options: ["default", "current", "complete"] } },
} satisfies Meta<typeof ProgressStep>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = { args: { state: "default" } };
export const Current: Story = {};
export const Complete: Story = { args: { state: "complete", showCheckOnComplete: true } };
export const Disabled: Story = { args: { disabled: true } };
export const Loading: Story = { args: { isLoading: true } };
export const Stepper: Story = {
  render: () => <ProgressStepper currentStep={2} showCheckOnComplete steps={[
    { step: 1, label: "Stay" }, { step: 2, label: "Room" },
    { step: 3, label: "Extras" }, { step: 4, label: "Checkout" },
  ]} />,
};
