"use client";

import { pillStory } from "./pill.story";
import { preferenceIconButtonStory } from "./preference-icon-button.story";

/** Client wrappers so MDX renders a component, not a member of a client proxy. */
export function PillStoryControl() {
  return <pillStory.WithControl />;
}

export function PreferenceIconButtonStoryControl() {
  return <preferenceIconButtonStory.WithControl />;
}
