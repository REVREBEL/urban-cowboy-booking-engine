"use client";

import { useState } from "react";
import { RoomPhotoTour } from "../../src/journey/RoomPhotoTour";
import type { JourneyRoom } from "../../src/journey/data";
import { defineStory } from "../lib/story";

const imageBaseUrl = process.env.NEXT_PUBLIC_DOCS_BASE_PATH ?? "";

/** Local editorial fixture: no live Mews inventory, pricing or booking state. */
const room: JourneyRoom = {
  id: "docs-alpine",
  name: "Alpine Bathing Suite",
  building: "Alpine",
  eyebrow: "THE ICONIC INDOOR SOAK",
  tagline: "A tub with a view",
  description: "A forest-facing suite with space to slow down.",
  basePrice: 295,
  squareFeet: 500,
  bedType: "King",
  maxGuests: 2,
  dogFriendly: false,
  adultsOnly: true,
  quiet: 4,
  features: ["indoor-tub", "fireplace", "view"],
  highlights: ["Clawfoot tub", "Forest views"],
  images: [
    `${imageBaseUrl}/assets/icons/buildings/alpine.svg`,
    `${imageBaseUrl}/assets/icons/buildings/lodge.svg`,
  ],
  isMock: true,
};

interface TourDemoProps {
  details: boolean;
}

function RoomTourDemo({ details }: TourDemoProps) {
  const [open, setOpen] = useState(details);
  const [choice, setChoice] = useState(false);
  return (
    <div className="min-h-dvh bg-smoke text-paper">
      <RoomPhotoTour
        room={room}
        position={0}
        count={1}
        details={open}
        onDetails={setOpen}
        onChoose={() => setChoice(true)}
      />
      <p className="sr-only" role="status">
        {choice ? "Docs-only room choice recorded" : "No booking started"}
      </p>
    </div>
  );
}

export const roomPhotoTourStory = defineStory({
  Component: RoomTourDemo,
  args: { initial: { details: false } },
});

export const roomPhotoTourDetailsStory = defineStory({
  Component: RoomTourDemo,
  args: { initial: { details: true } },
});
