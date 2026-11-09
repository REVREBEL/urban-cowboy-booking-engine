import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";
import { buildCancellationTimeline } from "@/lib/cancellationTimeline";
import {
  FigmaRateCard,
  FigmaRateDetailPopup,
  FigmaPolicyTimeline,
} from "@/components/rates/FigmaRateComponents";

const SAMPLE_DATE = "2027-01-13";
const timeline = buildCancellationTimeline("2026-11-20", SAMPLE_DATE, 285.60, {
  freeCancelDays: 14,
  balanceDueDays: 5,
  depositShare: 0.5,
});

const meta = {
  title: "Components/Rates/Figma Rate Card",
  component: FigmaRateCard,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: { description: { component: "Figma 1390:31339. Production rate card variants; responsive without fixed dimensions. The Buttons use shared design-system controls." } },
  },
  args: {
    eyebrow: "Keep Your Options Open",
    name: "Ride Easy",
    description: "Our standard rate for guests who want a little more freedom around their plans.",
    policy: "Free Cancellation Until December 31",
    roomSummary: "Alpine Bathing Suite, 1 night for 2 Adults",
    total: 285.60,
    currency: "USD",
    variant: "default",
    onDetails: fn(),
    onConfirm: fn(),
  },
  decorators: [(Story) => <div className="mx-auto w-full max-w-[523px]"><Story /></div>],
} satisfies Meta<typeof FigmaRateCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Standard: Story = {};
export const MemberRate: Story = {
  args: { variant: "member", confirmLabel: "Unlock This Rate" },
};
export const PackageRate: Story = {
  args: {
    variant: "package",
    confirmLabel: "Unlock This Rate",
    perks: ["Upgrade on Arrival", "Breakfast for Two (2)", "S'mores Kits"],
  },
};
export const Mobile: Story = {
  parameters: { viewport: { defaultViewport: "mobile1" } },
};

export const DetailsPopup: Story = {
  render: () => (
    <div className="mx-auto w-full max-w-[1314px]">
      <FigmaRateDetailPopup
        name="Ride Easy"
        eyebrow="Keep Your Options Open"
        description="Our standard rate for guests who want a little more freedom around their plans."
        nightly={285.6}
        currency="USD"
        nights={1}
        subtotal={255}
        taxes={30.6}
        total={285.6}
        dueToday={142.8}
        policyText="Cancellation: Free Cancellation until Dec 30, 2026"
        timeline={timeline}
        arrivalDate={SAMPLE_DATE}
        onClose={fn()}
        onConfirm={fn()}
      />
    </div>
  ),
  parameters: { layout: "fullscreen" },
};

export const UnavailableDetails: Story = {
  render: () => (
    <FigmaRateDetailPopup
      name="Ride Easy"
      eyebrow="Rate unavailable"
      description="This offer is not currently available."
      nightly={null}
      currency="USD"
      nights={2}
      subtotal={null}
      taxes={null}
      total={null}
      dueToday={null}
      policyText="Please choose another offer."
      timeline={null}
      arrivalDate={SAMPLE_DATE}
      onClose={fn()}
      onConfirm={fn()}
    />
  ),
};

export const DepositWithoutTimeline: Story = {
  render: () => (
    <FigmaRateDetailPopup
      name="Ride Easy"
      eyebrow="Flexible booking"
      description="A deposit is due at booking."
      supportingText="Breakfast is included."
      nightly={142.8}
      currency="USD"
      nights={2}
      subtotal={250}
      taxes={35.6}
      total={285.6}
      dueToday={142.8}
      policyText="50% deposit at booking."
      timeline={null}
      arrivalDate={SAMPLE_DATE}
      confirmLabel="Reserve this rate"
      onClose={fn()}
      onConfirm={fn()}
    />
  ),
};

export const PolicyTimeline: Story = {
  render: () => (
    <div className="mx-auto w-full max-w-[1314px] p-6">
      <FigmaPolicyTimeline timeline={timeline} currency="USD" arrivalDate={SAMPLE_DATE} />
    </div>
  ),
};
