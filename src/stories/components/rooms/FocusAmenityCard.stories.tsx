import type { Meta, StoryObj } from "@storybook/react-vite";
import { FocusAmenityCard } from "@/components/rooms/FocusAmenityCard";

const sampleDescription =
  "The Cabin keeps the sleeping setup relaxed: a proper king bed anchors the room, while the built-in bunk or lounging nook gives you another place to stretch out, read, or tuck someone in without turning the whole space into a bedroom.";

const meta = {
  title: "Components/Rooms/FocusAmenityCard",
  component: FocusAmenityCard,
  tags: ["autodocs"],
  args: {
    headline: "Cabin King Bed + Bunk",
    description: sampleDescription,
  },
  argTypes: {
    headline: {
      control: "text",
      description: "Amenity headline from CMS content.",
    },
    description: {
      control: "text",
      description: "Amenity description from CMS content.",
    },
    className: {
      control: "text",
      description: "Optional placement or layout classes supplied by the parent.",
    },
  },
  parameters: {
    layout: "centered",
  },
} satisfies Meta<typeof FocusAmenityCard>;

export default meta;

type Story = StoryObj<typeof meta>;

export const FigmaReference: Story = {};

export const HeadlineOnly: Story = {
  args: {
    headline: "Outdoor Cedar Soaking Tub",
    description: null,
  },
};

export const WrappedCopy: Story = {
  args: {
    headline: "Architectural Diamond Window",
    description:
      "A distinctive window frames the surrounding Catskills landscape and brings soft natural light into the room throughout the day.",
  },
};
