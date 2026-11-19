"use client";

import { AmenityIcons } from "../../src/components/rooms/AmenityIcons";
import type { TourIcon } from "../../src/journey/tour";
import { defineStory } from "../lib/story";

const icons: TourIcon[] = ["seat", "tub", "robes", "window", "stove", "desk", "outdoor-tub"];

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
