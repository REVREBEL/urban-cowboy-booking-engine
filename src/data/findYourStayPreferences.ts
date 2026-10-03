import type { PreferenceId } from "@/types/booking-ui";

export type FindYourStayPreference = {
  id: PreferenceId;
  label: string;
  description: string;
  resultPhrase: string;
  artwork: string;
};

export const FIND_YOUR_STAY_PREFERENCES: readonly FindYourStayPreference[] = [
  {
    id: "connection-with-nature",
    label: "Connection with Nature",
    description: "Stay connected to the landscape and outdoors.",
    resultPhrase: "a stronger connection with nature",
    artwork: "connection_with_nature.svg",
  },
  {
    id: "indoor-sanctuaries",
    label: "Indoor Sanctuaries",
    description: "A room that feels restorative from the inside out.",
    resultPhrase: "an indoor sanctuary",
    artwork: "indoor_sancuaries.svg",
  },
  {
    id: "minimal-distractions",
    label: "Minimal Distractions",
    description: "A simpler stay with less competing for your attention.",
    resultPhrase: "minimal distractions",
    artwork: "minimal_distractions.svg",
  },
  {
    id: "scenic-mountain-views",
    label: "Scenic Mountain Views",
    description: "Mountain and forest views.",
    resultPhrase: "scenic mountain views",
    artwork: "scenic_mountain_views.svg",
  },
  {
    id: "simple-comforts",
    label: "Simple Comforts",
    description: "Something easy, warm, and unfussy.",
    resultPhrase: "simple comforts",
    artwork: "simple_comforts.svg",
  },
  {
    id: "spaces-for-connection",
    label: "Spaces for Connection",
    description: "A room with a separate living room or lounge space.",
    resultPhrase: "space to connect in a living room",
    artwork: "spaces_for_connection.svg",
  },
  {
    id: "spaces-to-gather",
    label: "Spaces to Gather",
    description: "A room with a kitchen for gathering together.",
    resultPhrase: "a kitchen made for gathering",
    artwork: "spaces_to_gather.svg",
  },
  {
    id: "your-own-hideaway",
    label: "Your Own Hideaway",
    description: "A private place to settle in.",
    resultPhrase: "a hideaway of your own",
    artwork: "your_own_hideaway.svg",
  },
] as const;

export const PREFERENCE_BY_ID = new Map(
  FIND_YOUR_STAY_PREFERENCES.map((preference) => [preference.id, preference] as const),
);

export const PREFERENCE_LABELS: Record<PreferenceId, string> = Object.fromEntries(
  FIND_YOUR_STAY_PREFERENCES.map((preference) => [preference.id, preference.label]),
) as Record<PreferenceId, string>;

export const PREFERENCE_RESULT_PHRASES: Record<PreferenceId, string> = Object.fromEntries(
  FIND_YOUR_STAY_PREFERENCES.map((preference) => [preference.id, preference.resultPhrase]),
) as Record<PreferenceId, string>;
