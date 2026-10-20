import type { Meta, StoryObj } from "@storybook/react-vite";
import { SideFocusAmenityBar } from "@/components/rooms/SideFocusAmenityBar";

const examples = [
  { id: "bed", title: "Cabin King Bed + Bunk", description: "A king bed anchors the room, with a built-in nook for lounging or resting.", icon: "bed" as const, iconPath: "/assets/icons/icons-simple/cowboy_robe.svg" },
  { id: "speaker", title: "Marshall Speaker", description: "Put on something good and stay a while.", icon: "speaker" as const, iconPath: "/assets/icons/icons-simple/marshall_speaker.svg" },
  { id: "stove", title: "Cast Iron Wood Stove", description: "Warm up after a day in the woods.", icon: "stove" as const, iconPath: "/assets/icons/icons-simple/cast_iron_wood_stove.svg" },
];
const meta = {
  title: "Components/Rooms/SideFocusAmenityBar",
  component: SideFocusAmenityBar,
  tags: ["autodocs"],
  parameters: { layout: "padded" },
  decorators: [(Story) => <div className="min-h-[660px] rounded-xl bg-smoke p-8 text-paper"><Story /></div>],
  args: { amenities: examples },
  argTypes: { open: { control: "boolean" } },
} satisfies Meta<typeof SideFocusAmenityBar>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Collapsed: Story = {};
export const Expanded: Story = { args: { open: true } };
export const Overflow: Story = { args: { open: true, amenities: [...examples, ...examples.map((a) => ({ ...a, id: a.id + "-2" })), ...examples.map((a) => ({ ...a, id: a.id + "-3" }))] } };
