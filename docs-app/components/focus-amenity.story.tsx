"use client";

import { useState } from "react";
import { FocusAmenity, type FocusAmenityState } from "../../src/components/rooms/FocusAmenity";
import { FocusAmenityAction } from "../../src/components/rooms/FocusAmenityAction";
import { FocusAmenityCard } from "../../src/components/rooms/FocusAmenityCard";
import { FocusAmenityCount } from "../../src/components/rooms/FocusAmenityCount";
import { AmenityIcon } from "../../src/components/rooms/FocusAmenityIcon";
import { SideBarFocusAmenity, type SideFocusAmenityItem } from "../../src/components/rooms/SideBarFocusAmenity";
import { defineStory } from "../lib/story";

const states: FocusAmenityState[] = ["Default", "Hover", "Active", "Inactive", "Disabled"];

const items: SideFocusAmenityItem[] = [
  { id: "tub", title: "Copper soaking tub", description: "A deep soak with a view of the pines.", icon: "tub" },
  { id: "window", title: "Forest window", description: "Morning light through the trees.", icon: "window" },
];

function FocusAmenityStates() {
  const [selected, setSelected] = useState<string | null>(null);
  return (
    <div className="w-full rounded-xl p-4 sm:p-6">
      <div className="flex flex-wrap items-start gap-6">
        {states.map((state) => (
          <div key={state} className="flex flex-col items-center gap-2 text-foreground">
            <FocusAmenity
              icon="tub"
              title="Copper soaking tub"
              description="Soak overlooking the tree line."
              count={1}
              state={state}
              active={state === "Active"}
              onSelect={() => setSelected(state)}
            />
            <span className="text-xs">{state}</span>
          </div>
        ))}
      </div>
      <p className="sr-only" role="status">{selected ? `Selected ${selected}` : "No pin selected"}</p>
    </div>
  );
}

function FocusAmenityPrimitives() {
  return (
    <div className="w-full space-y-5 rounded-xl bg-paper p-4 sm:p-6">
      <div className="flex flex-wrap items-center gap-4">
        {(["Default", "Hover", "Active"] as const).map((state) => (
          <div key={state} className="flex flex-col items-center gap-1">
            <FocusAmenityAction state={state} />
            <span className="text-xs">action {state}</span>
          </div>
        ))}
        {(["Default", "Hover", "Active"] as const).map((state) => (
          <div key={state} className="flex flex-col items-center gap-1">
            <FocusAmenityCount count={2} state={state} />
            <span className="text-xs">count {state}</span>
          </div>
        ))}
      </div>
      <FocusAmenityCard headline="Copper soaking tub" description="Hand-finished copper, fed by the mountain spring." />
      <div className="flex flex-wrap items-center gap-3">
        <AmenityIcon name="wifi_badge" state="Default" basePath={process.env.NEXT_PUBLIC_DOCS_BASE_PATH ?? "/"} />
        <AmenityIcon name="wifi_badge" state="Active" basePath={process.env.NEXT_PUBLIC_DOCS_BASE_PATH ?? "/"} />
        <span className="text-xs">wifi badge · default / active</span>
      </div>
    </div>
  );
}

function SidebarDemo() {
  // Start closed: the production rail is viewport-fixed and would otherwise
  // cover the documentation before the reader opts in.
  const [open, setOpen] = useState(false);
  return (
    <div className="w-full rounded-xl p-4 sm:p-6">
      <button type="button" onClick={() => setOpen((value) => !value)} className="rounded-md border border-border px-3 py-2 text-sm">
        Toggle amenity rail
      </button>
      <SideBarFocusAmenity amenities={items} open={open} onOpenChange={setOpen} />
      <p className="sr-only" role="status">{open ? "Rail open" : "Rail closed"}</p>
    </div>
  );
}

export const focusAmenityStatesStory = defineStory({
  Component: FocusAmenityStates,
  args: { initial: {} },
});

export const focusAmenityPrimitivesStory = defineStory({
  Component: FocusAmenityPrimitives,
  args: { initial: {} },
});

export const sideBarFocusAmenityStory = defineStory({
  Component: SidebarDemo,
  args: { initial: {} },
});
