"use client";

import { useState } from "react";
import { PhotoRooms } from "../../src/journey/PhotoRooms";
import type { MatchProfile } from "../../src/journey/data";
import { defineStory } from "../lib/story";

const imageBaseUrl = process.env.NEXT_PUBLIC_DOCS_BASE_PATH ?? "";

const romanceProfile: MatchProfile = {
  occasion: "romance",
  adults: 2,
  children: 0,
  dog: false,
  mustHaves: ["indoor-tub", "view"],
  quiet: 4,
  budget: 350,
};

interface RoomsDemoProps {
  profile?: MatchProfile | null;
  studioCatalog?: boolean;
}

function RoomsDemo({ profile = null, studioCatalog = true }: RoomsDemoProps) {
  const [action, setAction] = useState<string | null>(null);
  return (
    <div className="w-full">
      <PhotoRooms
        profile={profile}
        rooms={[]}
        imageBaseUrl={imageBaseUrl}
        galleries={{}}
        guests={2}
        children={0}
        studioCatalog={studioCatalog}
        onChoose={() => setAction("Room chosen")}
        onEditJournal={() => setAction("Edit journal")}
        onChangeDates={() => setAction("Change dates")}
      />
      <p className="sr-only" role="status">{action ?? "No room action"}</p>
    </div>
  );
}

export const journeyRoomsIndexStory = defineStory({
  Component: RoomsDemo,
  args: { initial: {} },
});

export const journeyRoomsSpreadsStory = defineStory({
  Component: RoomsDemo,
  args: { initial: { studioCatalog: false } },
});

export const journeyRoomsPreferencesStory = defineStory({
  Component: RoomsDemo,
  args: { initial: { profile: romanceProfile } },
});
