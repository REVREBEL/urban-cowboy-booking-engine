import type { Meta, StoryObj } from "@storybook/react-vite";
import { SideFocusAmenityBar } from "@/components/rooms/SideFocusAmenityBar";

const examples = [
  { id: "bed", title: "Cabin King Bed + Bunk", description: "A king bed anchors the room, with a built-in nook for lounging or resting.", icon: "bed" as const },
  { id: "speaker", title: "Marshall Speaker", description: "Put on something good and stay a while.", icon: "speaker" as const },
  { id: "stove", title: "Cast Iron Wood Stove", description: "Warm up after a day in the woods.", icon: "stove" as const },
];
const meta = {
  title: "Components/Rooms/SideFocusAmenityBar",
  component: SideFocusAmenityBar,
  tags: ["autodocs"],
  parameters: { layout: "padded", backgrounds: { default: "dark" } },
  args: { amenities: examples },
  argTypes: { open: { control: "boolean" } },
} satisfies Meta<typeof SideFocusAmenityBar>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Collapsed: Story = {};
export const Expanded: Story = { args: { open: true } };
export const Overflow: Story = { args: { open: true, amenities: [...examples, ...examples.map((a) => ({ ...a, id: a.id + "-2" })), ...examples.map((a) => ({ ...a, id: a.id + "-3" }))] } };
