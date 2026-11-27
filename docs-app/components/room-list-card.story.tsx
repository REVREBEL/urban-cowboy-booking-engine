"use client";

import { useState } from "react";
import { RoomsListCard } from "../../src/components/rooms/RoomsListCard";
import type { ShapedRoom } from "../../src/types/mews";
import { defineStory } from "../lib/story";

const room: ShapedRoom = {
  roomTypeId: "studio-fireplace",
  categoryId: "studio-fireplace",
  name: "Fireplace Studio",
  description: "A warm studio with a private fireplace and a view of the pines.",
  cmsShortDescription: "Sleeps two · private fireplace",
  cmsLongDescription: null,
  imageIds: [],
  normalBedCount: 1,
  extraBedCount: 0,
  roomClass: "studio",
  spaceType: "studio",
  availableRoomCount: 2,
  capacity: 2,
  rates: [],
  fromGross: null,
  property: null,
  merchandising: null,
  merchandisingSource: null,
};

function RoomsListCardDemo({ theme }: { theme: "paper" | "copper" | "lake-forest" }) {
  const [last, setLast] = useState("none");
  return (
    <div className="w-full rounded-xl bg-smoke p-4 sm:p-6">
      <RoomsListCard
        room={room}
        imageBaseUrl={process.env.NEXT_PUBLIC_DOCS_BASE_PATH ?? ""}
        theme={theme}
        isTopMatch
        onSelectRoom={() => setLast("selected")}
        onOpenRoomDetails={() => setLast("details")}
      />
      <p className="sr-only" role="status">{`Last action: ${last}`}</p>
    </div>
  );
}

export const roomsListCardStory = defineStory({
  Component: RoomsListCardDemo,
  args: { initial: { theme: "paper" } },
});

export const roomsListCardCopperStory = defineStory({
  Component: RoomsListCardDemo,
  args: { initial: { theme: "copper" } },
});
