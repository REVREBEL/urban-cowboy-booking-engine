
import type { Meta, StoryObj } from "@storybook/react-vite";
import { OffersCard } from "@/components/rates/RideEasyOffersCard";

const meta = {
  title: "Components/Rates/RideEasyOffersCard",
  component: OffersCard,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
    docs: {
      story: {
        inline: false,
        iframeHeight: 850,
      },
    },
  },
  decorators: [
    (Story) => (
      <div
        style={{
          width: "100%",
          minHeight: "850px",
          overflowX: "auto",
          padding: "32px",
          boxSizing: "border-box",
        }}
      >
        <div style={{ width: "max-content", minWidth: "100%" }}>
          <Story />
        </div>
      </div>
    ),
  ],
  args: {
    variant: "default",
    price: "$425",
  },
} satisfies Meta<typeof OffersCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
