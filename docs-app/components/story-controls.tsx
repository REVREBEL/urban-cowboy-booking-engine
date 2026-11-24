"use client";

import { pillStory } from "./pill.story";
import { preferenceIconButtonStory } from "./preference-icon-button.story";
import { buttonStory, buttonVariantsStory } from "./button.story";
import { switchStory } from "./switch.story";
import { dogToggleStory } from "./dog-toggle-button.story";
import { travelPartyStory } from "./travel-party-button.story";
import { searchButtonStory, searchButtonVariantsStory } from "./search-button.story";
import {
  searchBarCircleStory,
  searchBarSquareStory,
  searchBarLoadingStory,
  expandedSearchStory,
} from "./search-bar.story";
import {
  bookingChromeDatesStory,
  bookingChromeResultsStory,
  bookingChromeExtrasStory,
} from "./booking-chrome.story";
import { conversionBadgesStory, conversionBadgesCompactStory } from "./conversion-badges.story";
import {
  searchGuestsDropdownStory,
  searchLocationDropdownStory,
  searchPromoDropdownStory,
} from "./search-dropdowns.story";
import {
  dateSearchDropdownStory,
  dateSearchDropdownUnselectedStory,
  dateSearchDropdownExternalActionsStory,
  inlineDateRangePickerStory,
} from "./search-date.story";
import { inlineUpsellStory, upsellCardStory } from "./extras-upsell.story";
import { roomsListCardStory, roomsListCardCopperStory } from "./room-list-card.story";
import {
  focusAmenityStatesStory,
  focusAmenityPrimitivesStory,
  sideBarFocusAmenityStory,
} from "./focus-amenity.story";
import {
  rateOfferCardStory,
  configurableRateOfferStory,
  rateOfferSidePanelStory,
  policyDisplayStory,
} from "./rate-offers.story";
import {
  staySummaryStory,
  reservationSummaryBarStory,
} from "./booking-summary.story";
import { bookingLabelsStory, lodgeSignboardStory } from "./booking-details.story";
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
import { dateRangePickerStory, phoneInputStory, phoneInputInvalidStory } from "./forms.story";
import {
  emptyStateStory,
  emptyStateWithActionStory,
  errorStateStory,
  errorStateWithRetryStory,
  loadingStateStory,
  loadingMessagesStory,
} from "./feedback.story";
import {
  stepLayoutStory,
  stepProgressStory,
  progressBarStory,
  progressStepStatesStory,
} from "./booking-layout.story";

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

export function DateRangePickerStoryControl() {
  return <dateRangePickerStory.WithControl />;
}

export function PhoneInputStoryControl() {
  return <phoneInputStory.WithControl />;
}

export function PhoneInputInvalidStoryControl() {
  return <phoneInputInvalidStory.WithControl />;
}

export function EmptyStateStoryControl() {
  return <emptyStateStory.WithControl />;
}

export function EmptyStateWithActionStoryControl() {
  return <emptyStateWithActionStory.WithControl />;
}

export function ErrorStateStoryControl() {
  return <errorStateStory.WithControl />;
}

export function ErrorStateWithRetryStoryControl() {
  return <errorStateWithRetryStory.WithControl />;
}

export function LoadingStateStoryControl() {
  return <loadingStateStory.WithControl />;
}

export function LoadingMessagesStoryControl() {
  return <loadingMessagesStory.WithControl />;
}

export function StepLayoutStoryControl() {
  return <stepLayoutStory.WithControl />;
}

export function StepProgressStoryControl() {
  return <stepProgressStory.WithControl />;
}

export function ProgressBarStoryControl() {
  return <progressBarStory.WithControl />;
}

export function ProgressStepStatesStoryControl() {
  return <progressStepStatesStory.WithControl />;
}

export function SearchBarStoryControl() {
  return <searchBarCircleStory.WithControl />;
}

export function SearchBarSquareStoryControl() {
  return <searchBarSquareStory.WithControl />;
}

export function SearchBarLoadingStoryControl() {
  return <searchBarLoadingStory.WithControl />;
}

export function ExpandedSearchStoryControl() {
  return <expandedSearchStory.WithControl />;
}

export function BookingChromeDatesStoryControl() {
  return <bookingChromeDatesStory.WithControl />;
}

export function BookingChromeResultsStoryControl() {
  return <bookingChromeResultsStory.WithControl />;
}

export function BookingChromeExtrasStoryControl() {
  return <bookingChromeExtrasStory.WithControl />;
}

export function ConversionBadgesStoryControl() {
  return <conversionBadgesStory.WithControl />;
}

export function ConversionBadgesCompactStoryControl() {
  return <conversionBadgesCompactStory.WithControl />;
}

export function InlineUpsellStoryControl() {
  return <inlineUpsellStory.WithControl />;
}

export function UpsellCardStoryControl() {
  return <upsellCardStory.WithControl />;
}

export function RoomsListCardStoryControl() {
  return <roomsListCardStory.WithControl />;
}

export function RoomsListCardCopperStoryControl() {
  return <roomsListCardCopperStory.WithControl />;
}

export function FocusAmenityStatesStoryControl() {
  return <focusAmenityStatesStory.WithControl />;
}

export function FocusAmenityPrimitivesStoryControl() {
  return <focusAmenityPrimitivesStory.WithControl />;
}

export function SideBarFocusAmenityStoryControl() {
  return <sideBarFocusAmenityStory.WithControl />;
}

export function RateOfferCardStoryControl() {
  return <rateOfferCardStory.WithControl />;
}

export function ConfigurableRateOfferStoryControl() {
  return <configurableRateOfferStory.WithControl />;
}

export function RateOfferSidePanelStoryControl() {
  return <rateOfferSidePanelStory.WithControl />;
}

export function PolicyDisplayStoryControl() {
  return <policyDisplayStory.WithControl />;
}

export function StaySummaryStoryControl() {
  return <staySummaryStory.WithControl />;
}

export function ReservationSummaryBarStoryControl() {
  return <reservationSummaryBarStory.WithControl />;
}

export function BookingLabelsStoryControl() {
  return <bookingLabelsStory.WithControl />;
}

export function LodgeSignboardStoryControl() {
  return <lodgeSignboardStory.WithControl />;
}

export function SearchGuestsDropdownStoryControl() {
  return <searchGuestsDropdownStory.WithControl />;
}

export function SearchLocationDropdownStoryControl() {
  return <searchLocationDropdownStory.WithControl />;
}

export function SearchPromoDropdownStoryControl() {
  return <searchPromoDropdownStory.WithControl />;
}

export function DateSearchDropdownStoryControl() {
  return <dateSearchDropdownStory.WithControl />;
}

export function DateSearchDropdownUnselectedStoryControl() {
  return <dateSearchDropdownUnselectedStory.WithControl />;
}

export function DateSearchDropdownExternalActionsStoryControl() {
  return <dateSearchDropdownExternalActionsStory.WithControl />;
}

export function InlineDateRangePickerStoryControl() {
  return <inlineDateRangePickerStory.WithControl />;
}
