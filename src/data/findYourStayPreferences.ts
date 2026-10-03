import type { PreferenceId } from "@/types/booking-ui";

export type FindYourStayPreference = {
  id: PreferenceId;
  label: string;
  description: string;
  resultPhrase: string;
};

export const FIND_YOUR_STAY_PREFERENCES: readonly FindYourStayPreference[] = [
  {
    id: "iconic-tub",
    label: "Iconic Tub",
    description: "The signature Cowboy bathing ritual.",
    resultPhrase: "an iconic copper-tub soak",
  },
  {
    id: "bathe-outside",
    label: "Bathe Outside",
    description: "A soak in the open air.",
    resultPhrase: "bathing outside",
  },
  {
    id: "my-own-place",
    label: "My Own Place",
    description: "A private place to settle in.",
    resultPhrase: "a place of your own",
  },
  {
    id: "near-everything",
    label: "Near Everything",
    description: "Stay close to the social heart of the Cowboy.",
    resultPhrase: "staying near everything",
  },
  {
    id: "simple-cozy",
    label: "Simple + Cozy",
    description: "Something easy, warm, and unfussy.",
    resultPhrase: "something simple and cozy",
  },
  {
    id: "mountain-views",
    label: "Mountain Views",
    description: "Mountain and forest views.",
    resultPhrase: "mountain and forest views",
  },
  {
    id: "bringing-my-people",
    label: "Bringing My People",
    description: "More room for friends or family to stay together.",
    resultPhrase: "bringing your people together",
  },
] as const;

export const PREFERENCE_LABELS: Record<PreferenceId, string> = Object.fromEntries(
  FIND_YOUR_STAY_PREFERENCES.map((preference) => [preference.id, preference.label]),
) as Record<PreferenceId, string>;

export const PREFERENCE_RESULT_PHRASES: Record<PreferenceId, string> = Object.fromEntries(
  FIND_YOUR_STAY_PREFERENCES.map((preference) => [preference.id, preference.resultPhrase]),
) as Record<PreferenceId, string>;
