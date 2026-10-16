import type { Meta, StoryObj } from "@storybook/react-vite";
import { PhotoJournal } from "@/journey/PhotoJournal";

const meta = {
  title: "Journey/Stay Journal",
  component: PhotoJournal,
  tags: ["autodocs"],
  parameters: { layout: "fullscreen" },
  args: {
    adults: 2, children: 0, rooms: [], imageBaseUrl: "", galleries: {},
    onDone: () => {}, onSkip: () => {},
  },
} satisfies Meta<typeof PhotoJournal>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Couple: Story = {};
export const Family: Story = { args: { adults: 2, children: 2 } };
export const WithPreferences: Story = {
  args: {
    initial: { occasion: "romance", adults: 2, children: 0, dog: true,
      mustHaves: ["fireplace", "view"], quiet: 5, budget: 350 },
  },
};
