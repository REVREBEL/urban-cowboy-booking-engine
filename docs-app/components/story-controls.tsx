"use client";

import { pillStory } from "./pill.story";
import { preferenceIconButtonStory } from "./preference-icon-button.story";
import { buttonStory, buttonVariantsStory } from "./button.story";
import { switchStory } from "./switch.story";
import { dogToggleStory } from "./dog-toggle-button.story";
import { travelPartyStory } from "./travel-party-button.story";
import { searchButtonStory, searchButtonVariantsStory } from "./search-button.story";

/** Client wrappers so MDX renders a component, not a member of a client proxy. */
export function PillStoryControl() {
  return <pillStory.WithControl />;
}

export function PreferenceIconButtonStoryControl() {
  return <preferenceIconButtonStory.WithControl />;
}

export function ButtonStoryControl() {
  return <buttonStory.WithControl />;
}

export function ButtonVariantsStoryControl() {
  return <buttonVariantsStory.WithControl />;
}

export function SwitchStoryControl() {
  return <switchStory.WithControl />;
}

export function DogToggleStoryControl() {
  return <dogToggleStory.WithControl />;
}

export function TravelPartyStoryControl() {
  return <travelPartyStory.WithControl />;
}

export function SearchButtonStoryControl() {
  return <searchButtonStory.WithControl />;
}

export function SearchButtonVariantsStoryControl() {
  return <searchButtonVariantsStory.WithControl />;
}
