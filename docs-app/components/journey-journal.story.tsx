"use client";

import { useState } from "react";
import { PhotoJournal } from "../../src/journey/PhotoJournal";
import type { MatchProfile } from "../../src/journey/data";
import { studioPhotoRoomCatalog } from "../../src/data/photoTourRooms";
import { defineStory } from "../lib/story";

const imageBaseUrl = process.env.NEXT_PUBLIC_DOCS_BASE_PATH ?? "";

// Simulated studio room types, never live Mews inventory.
const rooms = studioPhotoRoomCatalog().map((room) =>
  room.roomTypeId === "demo-forest" || room.roomTypeId === "demo-opa-cabin"
    ? { ...room, capacity: 4 }
    : room,
);

const romanceProfile: MatchProfile = {
  occasion: "romance",
  adults: 2,
  children: 0,
  dog: false,
  mustHaves: ["fireplace", "view"],
  quiet: 5,
  budget: 350,
};

interface JournalDemoProps {
  adults?: number;
  children?: number;
  initial?: MatchProfile | null;
}

function JournalDemo({ adults = 2, children = 0, initial = null }: JournalDemoProps) {
  const [result, setResult] = useState<string | null>(null);
  return (
    <div className="w-full">
      <PhotoJournal
        adults={adults}
        children={children}
        rooms={rooms}
        imageBaseUrl={imageBaseUrl}
        galleries={{}}
        initial={initial}
        onDone={(profile) => setResult(`Done: ${profile.occasion ?? "any occasion"}`)}
        onSkip={() => setResult("Skipped")}
      />
      <p className="sr-only" role="status">{result ?? "No journal action"}</p>
    </div>
  );
}

export const journalCoupleStory = defineStory({
  Component: JournalDemo,
  args: { initial: {} },
});

export const journalFamilyStory = defineStory({
  Component: JournalDemo,
  args: { initial: { adults: 2, children: 2 } },
});

export const journalPreferencesStory = defineStory({
  Component: JournalDemo,
  args: { initial: { initial: romanceProfile } },
});
