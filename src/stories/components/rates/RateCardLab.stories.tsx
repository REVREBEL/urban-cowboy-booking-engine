import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, within } from "storybook/test";
import { RateCardLab } from "@/components/rates/RateCardLab";

const meta = {
  title: "Journey/Rates/RateCardLab",
  component: RateCardLab,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "Developer design lab for comparing rate-card disclosure patterns and cancellation/payment states without entering the live booking flow.",
      },
    },
  },
  args: {
    initialMode: "drawer",
    initialScenario: "62",
  },
  argTypes: {
    initialMode: {
      control: "radio",
      options: ["single", "drawer", "tray"],
    },
    initialScenario: {
      control: "select",
      options: ["365", "62", "20", "10", "3"],
    },
  },
} satisfies Meta<typeof RateCardLab>;

export default meta;
type Story = StoryObj<typeof meta>;

export const SingleCard: Story = {
  args: { initialMode: "single", initialScenario: "62" },
};

export const SingleCardExpanded: Story = {
  args: { initialMode: "single", initialScenario: "62" },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "View details" }));
    await expect(canvas.getByRole("heading", { name: "About this rate" })).toBeVisible();
  },
};

export const DrawerOpen: Story = {
  args: { initialMode: "drawer", initialScenario: "62" },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getAllByRole("button", { name: "View details" })[0]);
    await expect(canvas.getByRole("dialog")).toBeVisible();
  },
};

export const FullWidthTray: Story = {
  args: { initialMode: "tray", initialScenario: "62" },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getAllByRole("button", { name: "View details" })[0]);
    await expect(canvas.getByRole("heading", { name: "About this rate" })).toBeVisible();
  },
};

export const LongLeadTime: Story = {
  args: { initialMode: "single", initialScenario: "365" },
};

export const DepositAtRisk: Story = {
  args: { initialMode: "single", initialScenario: "10" },
};

export const FullyLocked: Story = {
  args: { initialMode: "single", initialScenario: "3" },
};
