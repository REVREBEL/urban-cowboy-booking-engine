import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, within, waitFor } from "storybook/test";
import { ProductionRateTray } from "@/components/rates/ProductionRateTray";
import type { ShapedRate } from "@/types/mews";
import type { RateCardConfig } from "@/types/rate-card";

/**
 * Figma production rate cards:
 * Card variants: 1390:31339
 * Detail popup: 1390:30695
 * Timeline: 1390:30329
 * Stay pricing: 1390:29947
 *
 * These stories render the real component, with deterministic mocked rate data.
 * They never call Mews or attempt a reservation.
 */
const createRate = (
  rateId: string,
  name: string,
  totalGross: number,
  options: { privateRate?: boolean; nonRefundable?: boolean } = {},
): ShapedRate => ({
  rateId,
  rateGroupId: "storybook-rate-group",
  knownRateGroup: options.nonRefundable ? "NON_REFUNDABLE" : null,
  name,
  description: "Our standard rate for guests who want a little more freedom around their plans.",
  isPrivate: options.privateRate ?? false,
  currency: "USD",
  totalGross,
  totalNet: Math.round((totalGross / 1.12) * 100) / 100,
  totalTax: Math.round((totalGross - totalGross / 1.12) * 100) / 100,
  perNightGross: totalGross,
  perNightNet: Math.round((totalGross / 1.12) * 100) / 100,
  perNightTax: Math.round((totalGross - totalGross / 1.12) * 100) / 100,
  maxGross: null,
  maxNet: null,
  maxTax: null,
  citySejour: null,
  settlement: {
    type: "Automatic",
    action: "ChargeCreditCard",
    isAutomatic: true,
    trigger: "Confirmation",
    offset: null,
    value: options.nonRefundable ? 1 : 0.5,
    flatValue: null,
    currencyCode: "USD",
    maximumTimeUnits: null,
  },
});

const baseConfig: RateCardConfig = {
  id: "story-ride-easy",
  name: "Ride Easy",
  mewsRateId: "ride-easy",
  isDefault: false,
  active: true,
  sortOrder: 0,
  desktopArtworkUrl: null,
  mobileArtworkUrl: null,
  horizontalArtworkUrl: null,
  desktopOverlayPosition: "normal",
  mobileOverlayPosition: "normal",
  buttonStyle: "filled",
  buttonColor: "lake-forest",
  textColor: "lake-forest",
  accentColor: "bandana-red",
  borderStyle: "single",
  fontPair: "desert-bianco",
  headline: "Ride Easy",
  eyebrow: "Keep Your Options Open",
  description: "Our standard rate for guests who want a little more freedom around their plans.",
  cancellationPenaltyWindow: 14,
  cancellationPenaltyWindowPeriod: "days",
  cancellationFullForfeitWindow: 5,
  cancellationFullForfeitWindowPeriod: "days",
};

const flexible = createRate("ride-easy", "Ride Easy", 285.6);
const member = createRate("member-rate", "Cowboy Member Rate", 255.6, { privateRate: true });
const packageRate = createRate("package-rate", "Stay & Gather", 345.6);
const nonRefundable = createRate("plan-ahead", "Plan Ahead", 225.6, { nonRefundable: true });
const configs: RateCardConfig[] = [
  baseConfig,
  { ...baseConfig, id: "story-member", mewsRateId: "member-rate", sortOrder: 1, headline: "Cowboy Member Rate", eyebrow: "A Little Something Extra", memberOnly: true, ctaLabel: "Unlock this rate" },
  { ...baseConfig, id: "story-package", mewsRateId: "package-rate", sortOrder: 2, headline: "Stay & Gather", eyebrow: "Make It A Getaway", description: "A little more to look forward to, included in your stay.", supportingText: "Breakfast for Two · S'mores Kits · Upgrade on Arrival" },
  { ...baseConfig, id: "story-plan-ahead", mewsRateId: "plan-ahead", sortOrder: 3, headline: "Plan Ahead", eyebrow: "Lock It In", description: "A lower rate for plans that are set in stone." },
];

function futureArrival(): string {
  const dateParts = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/New_York", year: "numeric", month: "2-digit", day: "2-digit",
  }).formatToParts(new Date());
  const part = (type: string) => dateParts.find((entry) => entry.type === type)?.value ?? "01";
  const arrival = new Date(Date.UTC(Number(part("year")), Number(part("month")) - 1, Number(part("day")) + 62));
  return arrival.toISOString().slice(0, 10);
}

const meta = {
  title: "Journey/Rates/ProductionRateTray",
  component: ProductionRateTray,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component: "Production rate-card variants and disclosure panel from the Urban Cowboy Figma designs. Uses typed example Mews rates and CMS configurations, without booking side effects.",
      },
    },
  },
  args: {
    roomName: "Alpine Bathing Suite",
    checkIn: futureArrival(),
    nights: 1,
    rates: [flexible, member, packageRate],
    configs,
    selectedRateId: null,
    onSelectRate: () => {},
    onChangeRoom: () => {},
    showChangeRoomAction: false,
  },
} satisfies Meta<typeof ProductionRateTray>;

export default meta;
type Story = StoryObj<typeof meta>;

export const AllRateVariants: Story = {};

export const StandardRateCard: Story = {
  args: { rates: [flexible] },
};

export const MemberRateCard: Story = {
  args: { rates: [member] },
  parameters: { docs: { description: { story: "Member rate without an eligibility service: selection must remain disabled." } } },
};

export const PackageRateCard: Story = {
  args: { rates: [packageRate] },
};

export const NonRefundableCard: Story = {
  args: { rates: [nonRefundable] },
};

export const RateDetailPopup: Story = {
  args: { rates: [flexible] },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: /view details/i }));
    await waitFor(() => expect(within(document.body).getByRole("dialog")).toBeVisible());
    await expect(within(document.body).getByRole("heading", { name: /stay pricing/i })).toBeVisible();
    await expect(within(document.body).getByRole("heading", { name: /policy & deposit timeline/i })).toBeVisible();
  },
};

export const CancellationTimeline: Story = {
  args: { rates: [flexible] },
  play: async ({ canvasElement }) => {
    await userEvent.click(within(canvasElement).getByRole("button", { name: /view details/i }));
    await waitFor(() => expect(within(document.body).getByRole("heading", { name: /policy & deposit timeline/i })).toBeVisible());
  },
};

export const StayPricing: Story = {
  args: { rates: [flexible] },
  play: async ({ canvasElement }) => {
    await userEvent.click(within(canvasElement).getByRole("button", { name: /view details/i }));
    const dialog = within(await within(document.body).findByRole("dialog"));
    await waitFor(() => expect(dialog.getByRole("heading", { name: /stay pricing/i })).toBeVisible());
    await expect(dialog.getByText(/nightly average/i)).toBeVisible();
    await expect(dialog.getByText(/stay before taxes/i)).toBeVisible();
  },
};

export const MobileRateCards: Story = {
  parameters: { viewport: { defaultViewport: "mobile1" } },
};

export const MobileRateDetailPopup: Story = {
  args: { rates: [flexible] },
  parameters: { viewport: { defaultViewport: "mobile1" } },
  play: RateDetailPopup.play,
};

/** Stubbed verification simulates the eligibility adapter and a server-retrieved rate. */
export const MemberUnlockVerified: Story = {
  args: {
    rates: [member],
    onUnlockMember: async (email, rate) => ({
      eligible: email.toLowerCase() === "member@example.com",
      rate: email.toLowerCase() === "member@example.com" ? rate : null,
    }),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: /unlock this rate/i }));
    const dialog = within(await within(document.body).findByRole("dialog"));
    await userEvent.type(dialog.getByRole("textbox", { name: /email address/i }), "member@example.com");
    await userEvent.click(dialog.getByRole("button", { name: /verify membership/i }));
    await waitFor(() => expect(within(document.body).queryByRole("dialog")).not.toBeInTheDocument());
  },
};
