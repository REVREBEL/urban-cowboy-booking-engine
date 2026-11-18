"use client";

import { useState } from "react";
import { PreferenceIconButton } from "../../src/components/booking/discovery/PreferenceIconButton";
import type { PreferenceId } from "../../src/types/booking-ui";
import { defineStory } from "../lib/story";

interface DemoProps {
  id: PreferenceId;
  label: string;
  description: string;
  selected: boolean;
}

/** Docs-only controlled harness around the real component. No booking state is touched. */
function PreferenceIconButtonDemo({ id, label, description, selected }: DemoProps) {
  const [active, setActive] = useState(selected);
  return (
    <div className="flex w-full max-w-md flex-col gap-3">
      <PreferenceIconButton
        id={id}
        label={label}
        description={description}
        selected={active}
        onToggle={() => setActive((value) => !value)}
      />
      <p className="text-sm text-muted-foreground" role="status">
        Docs-only example state: {active ? "selected" : "not selected"}
      </p>
    </div>
  );
}

export const preferenceIconButtonStory = defineStory({
  Component: PreferenceIconButtonDemo,
  args: {
    initial: {
      id: "your-own-hideaway",
      label: "Your Own Hideaway",
      description: "Secluded cabin retreat with private balcony",
      selected: false,
    },
  },
});
