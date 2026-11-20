"use client";

import { pillStory } from "./pill.story";
import { preferenceIconButtonStory } from "./preference-icon-button.story";
import { buttonStory, buttonVariantsStory } from "./button.story";
import { switchStory } from "./switch.story";
import { dogToggleStory } from "./dog-toggle-button.story";
import { travelPartyStory } from "./travel-party-button.story";
import { searchButtonStory, searchButtonVariantsStory } from "./search-button.story";
import {
  buildingIconStory,
  buildingIconVariantsStory,
  buildingIconColorsStory,
} from "./building-icon.story";
import { amenityIconStory, amenityIconGridStory } from "./amenity-icons.story";
import {
  configurableRateCardStory,
  configurableRateCardVariantsStory,
} from "./configurable-rate-card.story";
import { photoStory, photoStatesStory } from "./media-photo.story";
import { photoTourArrowStory, photoTourArrowVariantsStory } from "./journey-arrow.story";
import { roomPhotoTourStory, roomPhotoTourDetailsStory } from "./journey-room-tour.story";
import {
  arrivalStory,
  arrivalCalendarStory,
  arrivalDatesStory,
  arrivalNoEditorialStory,
} from "./journey-arrival.story";
import {
  extrasAvailableStory,
  extrasSelectedStory,
  extrasEmptyStory,
} from "./journey-extras.story";
import {
  journalCoupleStory,
  journalFamilyStory,
  journalPreferencesStory,
} from "./journey-journal.story";
import {
  journeyRoomsIndexStory,
  journeyRoomsSpreadsStory,
  journeyRoomsPreferencesStory,
} from "./journey-rooms.story";
import {
  helpMeChooseModalStory,
  matchOrBrowseStory,
  roomMatcherPageStory,
  matcherProgressStory,
  matcherProgressStepsStory,
  matchBenefitsCardStory,
  matchBenefitsVariantsStory,
} from "./recommendation.story";

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

export function BuildingIconStoryControl() {
  return <buildingIconStory.WithControl />;
}

export function BuildingIconVariantsStoryControl() {
  return <buildingIconVariantsStory.WithControl />;
}

export function BuildingIconColorsStoryControl() {
  return <buildingIconColorsStory.WithControl />;
}

export function AmenityIconStoryControl() {
  return <amenityIconStory.WithControl />;
}

export function AmenityIconGridStoryControl() {
  return <amenityIconGridStory.WithControl />;
}

export function ConfigurableRateCardStoryControl() {
  return <configurableRateCardStory.WithControl />;
}

export function ConfigurableRateCardVariantsStoryControl() {
  return <configurableRateCardVariantsStory.WithControl />;
}

export function PhotoStoryControl() {
  return <photoStory.WithControl />;
}

export function PhotoStatesStoryControl() {
  return <photoStatesStory.WithControl />;
}

export function PhotoTourArrowStoryControl() {
  return <photoTourArrowStory.WithControl />;
}

export function PhotoTourArrowVariantsStoryControl() {
  return <photoTourArrowVariantsStory.WithControl />;
}

export function RoomPhotoTourStoryControl() {
  return <roomPhotoTourStory.WithControl />;
}

export function RoomPhotoTourDetailsStoryControl() {
  return <roomPhotoTourDetailsStory.WithControl />;
}

export function ArrivalStoryControl() {
  return <arrivalStory.WithControl />;
}

export function ArrivalCalendarStoryControl() {
  return <arrivalCalendarStory.WithControl />;
}

export function ArrivalDatesStoryControl() {
  return <arrivalDatesStory.WithControl />;
}

export function ArrivalNoEditorialStoryControl() {
  return <arrivalNoEditorialStory.WithControl />;
}

export function ExtrasAvailableStoryControl() {
  return <extrasAvailableStory.WithControl />;
}

export function ExtrasSelectedStoryControl() {
  return <extrasSelectedStory.WithControl />;
}

export function ExtrasEmptyStoryControl() {
  return <extrasEmptyStory.WithControl />;
}

export function JournalCoupleStoryControl() {
  return <journalCoupleStory.WithControl />;
}

export function JournalFamilyStoryControl() {
  return <journalFamilyStory.WithControl />;
}

export function JournalPreferencesStoryControl() {
  return <journalPreferencesStory.WithControl />;
}

export function JourneyRoomsIndexStoryControl() {
  return <journeyRoomsIndexStory.WithControl />;
}

export function JourneyRoomsSpreadsStoryControl() {
  return <journeyRoomsSpreadsStory.WithControl />;
}

export function JourneyRoomsPreferencesStoryControl() {
  return <journeyRoomsPreferencesStory.WithControl />;
}

export function HelpMeChooseModalStoryControl() {
  return <helpMeChooseModalStory.WithControl />;
}

export function MatchOrBrowseStoryControl() {
  return <matchOrBrowseStory.WithControl />;
}

export function RoomMatcherPageStoryControl() {
  return <roomMatcherPageStory.WithControl />;
}

export function MatcherProgressStoryControl() {
  return <matcherProgressStory.WithControl />;
}

export function MatcherProgressStepsStoryControl() {
  return <matcherProgressStepsStory.WithControl />;
}

export function MatchBenefitsCardStoryControl() {
  return <matchBenefitsCardStory.WithControl />;
}

export function MatchBenefitsVariantsStoryControl() {
  return <matchBenefitsVariantsStory.WithControl />;
}
