"use client";

import { useState } from "react";
import { Switch } from "../../src/components/ui/switch";
import { Label } from "../../src/components/ui/label";
import { defineStory } from "../lib/story";

interface SwitchDemoProps {
  label: string;
  initiallyChecked: boolean;
  disabled: boolean;
}

/** Controlled docs-only harness; the real Radix Switch owns presentation and a11y. */
function SwitchDemo({ label, initiallyChecked, disabled }: SwitchDemoProps) {
  const [checked, setChecked] = useState(initiallyChecked);
  return (
    <div className="flex w-full max-w-md flex-col gap-2">
      <div className="flex items-center gap-3">
        <Switch
          id="docs-switch"
          checked={checked}
          disabled={disabled}
          onCheckedChange={setChecked}
        />
        <Label htmlFor="docs-switch">{label}</Label>
      </div>
      <p className="text-sm text-muted-foreground" role="status">
        Docs-only state: {checked ? "on" : "off"}
        {disabled ? " (disabled)" : ""}
      </p>
    </div>
  );
}

export const switchStory = defineStory({
  Component: SwitchDemo,
  args: {
    initial: {
      label: "Dog Friendly Room (+ $75)",
      initiallyChecked: false,
      disabled: false,
    },
  },
});
