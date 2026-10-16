import type { Meta, StoryObj } from "@storybook/react-vite";
import { PhotoExtrasStep } from "@/journey/PhotoExtrasStep";
import type { MerchandisedAddOn } from "@/types/add-on-cms";
import { ROOM_IMAGE_ASSETS } from "@/data/roomImagePlaceholders";

const sauna: MerchandisedAddOn = {
  id: "storybook-sauna", displayId: "storybook-sauna", cmsItemId: "storybook-sauna",
  name: "Estonian Sauna Session", description: "A wood-fired sauna session.",
  price: 45, currency: "USD", chargingMode: "perPerson", imageId: "sauna",
  imageUrl: ROOM_IMAGE_ASSETS.ALPINE_BATHING_SUITE,
  contentSource: "webflow", knownAddOn: null, property: "Urban Cowboy Catskills",
};
const meta = {
  title: "Journey/Extras",
  component: PhotoExtrasStep,
  tags: ["autodocs"],
  parameters: { layout: "fullscreen" },
  args: {
    products: [sauna], selectedProductIds: [], selectedDisplayByProduct: {},
    lockedProductIds: new Set<string>(), preferences: {}, imageBaseUrl: "",
    currency: "USD", total: 750, roomName: "Alpine Bathing Suite",
    checkIn: "2026-11-12", checkOut: "2026-11-15", nights: 3, guestsCount: 2,
    onToggle: () => {}, onSavePreference: () => {}, onNext: () => {}, onBack: () => {},
  },
} satisfies Meta<typeof PhotoExtrasStep>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Available: Story = {};
export const Selected: Story = { args: { selectedProductIds: [sauna.id] } };
export const NoExtras: Story = { args: { products: [] } };
