export type PreferenceId =
  | "iconic-tub"
  | "bathe-outside"
  | "my-own-place"
  | "near-everything"
  | "simple-cozy"
  | "mountain-views"
  | "bringing-my-people";

const RAW =
  "https://raw.githubusercontent.com/REVREBEL/urban-cowboy-booking-engine/d77a9f16cb2f99624f730bbb63cd340c74a6fdb5/src/components/other-cowboy/figma/public/assets";

const asset = (path: string) => `${RAW}/${path}`;

export const DOG_ICON = asset("dog-toggle-off.svg");
export const DOG_ICON_SELECTED = asset("dog-toggle-on.svg");

export const PREFERENCE_ICON: Record<PreferenceId, string> = {
  "iconic-tub": asset("copper-tub-illustration-unselected.png"),
  "bathe-outside": asset("soak-outside-illustration-unselected.png"),
  "my-own-place": asset("my-own-place-illustration-unselected.png"),
  "near-everything": asset("spaces-to-gather-illustration-unselected.png"),
  "simple-cozy": asset("simple-cozy-illustration-unselected.png"),
  "mountain-views": asset("scenic-views-illustration-unselected.png"),
  "bringing-my-people": asset("party-card-bg-wide.svg"),
};

export const PREFERENCE_LABEL: Partial<Record<PreferenceId, string>> = {
  "iconic-tub": asset("copper-tub-label-unselected.svg"),
  "bathe-outside": asset("soak-outside-label.svg"),
  "my-own-place": asset("my-own-place-label-unselected.svg"),
  "near-everything": asset("spaces-to-gather-label-unselected.svg"),
  "simple-cozy": asset("simple-cozy-label-unselected.svg"),
  "mountain-views": asset("scenic-views-label-unselected.svg"),
};

export const PREFERENCE_ICON_SELECTED: Partial<Record<PreferenceId, string>> = {
  "iconic-tub": asset("copper-tub-illustration-selected.png"),
  "bathe-outside": asset("outdoor-cedar-soaking-tub.png"),
  "my-own-place": asset("the-cabin.png"),
  "near-everything": asset("spaces-to-gather-illustration-selected.png"),
  "simple-cozy": asset("simple-cozy-illustration-selected.png"),
  "mountain-views": asset("scenic-views-illustration-selected.png"),
};

export const PREFERENCE_LABEL_SELECTED: Partial<Record<PreferenceId, string>> = {
  "iconic-tub": asset("copper-tub-label-selected.svg"),
  "bathe-outside": asset("soak-outside-label.svg"),
  "my-own-place": asset("my-own-place-label-selected.svg"),
  "near-everything": asset("spaces-to-gather-label-selected.svg"),
  "simple-cozy": asset("simple-cozy-label-selected.svg"),
  "mountain-views": asset("scenic-views-label-selected.svg"),
};

export const POINTING_HAND = asset("pointing-hand-1.svg");
export const TOP_MATCH_FALLBACK = asset("best-rate-guaranteed-icon.svg");
