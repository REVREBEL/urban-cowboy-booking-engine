import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { RoomPhotoTour } from "@/journey/RoomPhotoTour";
import type { JourneyRoom } from "@/journey/data";
import { ROOM_IMAGE_ASSETS } from "@/data/roomImagePlaceholders";

const room: JourneyRoom = {
  id: "storybook-alpine", name: "Alpine Bathing Suite", building: "Alpine",
  eyebrow: "THE ICONIC INDOOR SOAK", tagline: "A tub with a view",
  description: "A forest-facing suite with space to slow down.",
  basePrice: 295, squareFeet: 500, bedType: "King", maxGuests: 2,
  dogFriendly: false, adultsOnly: true, quiet: 4,
  features: ["indoor-tub", "fireplace", "view"], highlights: ["Clawfoot tub", "Forest views"],
  images: [ROOM_IMAGE_ASSETS.ALPINE_BATHING_SUITE, ROOM_IMAGE_ASSETS.ALPINE_HEADBOARD],
  isMock: true,
};

function Preview({ initiallyOpen = false }: { initiallyOpen?: boolean }) {
  const [details, setDetails] = useState(initiallyOpen);
  return <div className="min-h-dvh bg-smoke text-paper">
    <RoomPhotoTour room={room} position={0} count={1} details={details}
      onDetails={setDetails} onChoose={() => {}} />
  </div>;
}

const meta = {
  title: "Journey/Room Photo Tour",
  component: RoomPhotoTour,
  tags: ["autodocs"],
  parameters: { layout: "fullscreen" },
  args: { room, position: 0, count: 1, details: false, onDetails: () => {}, onChoose: () => {} },
  render: () => <Preview />,
} satisfies Meta<typeof RoomPhotoTour>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
export const DetailsOpen: Story = { render: () => <Preview initiallyOpen /> };
