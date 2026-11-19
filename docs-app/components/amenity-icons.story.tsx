"use client";

import { AmenityIcons } from "../../src/components/rooms/AmenityIcons";
import type { TourIcon } from "../../src/journey/tour";
import { defineStory } from "../lib/story";

// All twelve fallback TourIcon values, matching the documented prop table.
const icons: TourIcon[] = [
  "bed", "tub", "outdoor-tub", "window", "seat", "stove",
  "robes", "speaker", "shower", "floors", "desk", "balcony",
];

export const amenityIconStory = defineStory({
  Component: AmenityIcons,
  args: { initial: { icon: "seat" } },
});

function AmenityIconGrid() {
  return (
    <div className="grid w-full grid-cols-2 gap-4 sm:grid-cols-4">
      {icons.map((icon) => (
        <div key={icon} className="flex flex-col items-center gap-2 rounded-xl border border-border p-4">
          <div className="size-12 text-primary">
            <AmenityIcons icon={icon} />
          </div>
          <span className="text-xs text-muted-foreground">{icon}</span>
        </div>
      ))}
    </div>
  );
}

export const amenityIconGridStory = defineStory({
  Component: AmenityIconGrid,
  args: { initial: {} },
});
