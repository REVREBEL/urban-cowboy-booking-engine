import type { Meta, StoryObj } from "@storybook/react-vite";
import { PhotoRooms } from "@/journey/PhotoRooms";

const meta = {
  title: "Journey/Rooms",
  component: PhotoRooms,
  tags: ["autodocs"],
  parameters: { layout: "fullscreen" },
  args: {
    profile: null, rooms: [], imageBaseUrl: "", galleries: {},
    guests: 2, children: 0, studioCatalog: true,
    onChoose: () => {}, onEditJournal: () => {},
  },
} satisfies Meta<typeof PhotoRooms>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Index: Story = {};
export const PhotoSpreads: Story = { args: { studioCatalog: false } };
export const WithPreferences: Story = {
  args: {
    profile: {
      occasion: "romance", adults: 2, children: 0, dog: false,
      mustHaves: ["indoor-tub", "view"], quiet: 4, budget: 350,
    },
  },
};
