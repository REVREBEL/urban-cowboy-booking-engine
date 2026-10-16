import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { PhotoExtrasStep } from "@/journey/PhotoExtrasStep";
import type { MerchandisedAddOn } from "@/types/add-on-cms";
import type { AddonSchedulePreference } from "@/components/booking/extras/addon-types";
import { ROOM_IMAGE_ASSETS } from "@/data/roomImagePlaceholders";

const sauna: MerchandisedAddOn = {
  id: "storybook-sauna", displayId: "storybook-sauna", cmsItemId: "storybook-sauna",
  name: "Estonian Sauna Session", description: "A wood-fired sauna session.",
  price: 45, currency: "USD", chargingMode: "perPerson", imageId: "sauna",
  imageUrl: ROOM_IMAGE_ASSETS.ALPINE_BATHING_SUITE,
  contentSource: "webflow", knownAddOn: null, property: "Urban Cowboy Catskills",
};

type Props = React.ComponentProps<typeof PhotoExtrasStep>;

function InteractiveExtras({ initialSelected = [], ...props }: Props & { initialSelected?: string[] }) {
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>(initialSelected);
  const [selectedDisplayByProduct, setSelectedDisplayByProduct] = useState<Record<string, string>>({});
  const [preferences, setPreferences] = useState<Record<string, AddonSchedulePreference>>({});

  const onToggle = (product: MerchandisedAddOn) => {
    setSelectedProductIds((current) =>
      current.includes(product.id) ? current.filter((id) => id !== product.id) : [...current, product.id],
    );
    setSelectedDisplayByProduct((current) => ({ ...current, [product.id]: product.displayId }));
  };
  const onSavePreference = (product: MerchandisedAddOn, preference: AddonSchedulePreference) => {
    setPreferences((current) => ({ ...current, [product.displayId]: preference }));
    setSelectedProductIds((current) => current.includes(product.id) ? current : [...current, product.id]);
    setSelectedDisplayByProduct((current) => ({ ...current, [product.id]: product.displayId }));
  };
  const extrasTotal = props.products
    .filter((product) => selectedProductIds.includes(product.id))
    .reduce((sum, product) => sum + product.price * (product.chargingMode === "perPerson" ? props.guestsCount : 1), 0);

  return <PhotoExtrasStep {...props}
    selectedProductIds={selectedProductIds}
    selectedDisplayByProduct={selectedDisplayByProduct}
    preferences={preferences}
    total={props.total + extrasTotal}
    onToggle={onToggle}
    onSavePreference={onSavePreference}
  />;
}

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
  render: (args) => <InteractiveExtras {...args} />,
} satisfies Meta<typeof PhotoExtrasStep>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Available: Story = {};
export const Selected: Story = { render: (args) => <InteractiveExtras {...args} initialSelected={[sauna.id]} /> };
export const NoExtras: Story = { args: { products: [] } };
