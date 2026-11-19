"use client";

import { useEffect, useState } from "react";
import { DogToggleButton } from "../../src/components/booking/discovery/DogToggleButton";
import { defineStory } from "../lib/story";

interface DemoProps { selected: boolean }

/** Docs-only controlled harness; booking state is never touched. */
function DogToggleDemo({ selected }: DemoProps) {
  const [active, setActive] = useState(selected);
  useEffect(() => setActive(selected), [selected]);
  return (
    <div className="w-full max-w-sm space-y-2">
      <DogToggleButton selected={active} onToggle={() => setActive((value) => !value)} />
      <p className="text-sm text-muted-foreground" role="status">
        Docs-only state: {active ? "dog-friendly only" : "all rooms"}
      </p>
    </div>
  );
}

export const dogToggleStory = defineStory({
  Component: DogToggleDemo,
  args: {
    initial: { selected: false },
  },
});
