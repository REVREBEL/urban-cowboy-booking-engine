import type { MatchInterest } from "./types";

const RAW =
  "https://raw.githubusercontent.com/REVREBEL/urban-cowboy-booking-engine/d77a9f16cb2f99624f730bbb63cd340c74a6fdb5/src/components/other-cowboy/figma/public/assets";

const asset = (path: string) => `${RAW}/${path}`;

export const DOG_ICON = asset("dog-toggle-off.svg");
export const DOG_ICON_SELECTED = asset("dog-toggle-on.svg");

export const PREFERENCE_ICON: Record<MatchInterest, string> = {
  iconTub: asset("copper-tub-illustration-unselected.png"),
  outdoorSoak: asset("soak-outside-illustration-unselected.png"),
  ownPlace: asset("my-own-place-illustration-unselected.png"),
  scenic: asset("scenic-views-illustration-unselected.png"),
  simpleCozy: asset("simple-cozy-illustration-unselected.png"),
  social: asset("spaces-to-gather-illustration-unselected.png"),
};

export const PREFERENCE_ICON_SELECTED: Record<MatchInterest, string> = {
  iconTub: asset("copper-tub-illustration-selected.png"),
  outdoorSoak: asset("outdoor-cedar-soaking-tub.png"),
  ownPlace: asset("the-cabin.png"),
  scenic: asset("scenic-views-illustration-selected.png"),
  simpleCozy: asset("simple-cozy-illustration-selected.png"),
  social: asset("spaces-to-gather-illustration-selected.png"),
};

export const PREFERENCE_LABEL: Record<MatchInterest, string> = {
  iconTub: asset("copper-tub-label-unselected.svg"),
  outdoorSoak: asset("soak-outside-label.svg"),
  ownPlace: asset("my-own-place-label-unselected.svg"),
  scenic: asset("scenic-views-label-unselected.svg"),
  simpleCozy: asset("simple-cozy-label-unselected.svg"),
  social: asset("spaces-to-gather-label-unselected.svg"),
};

export const PREFERENCE_LABEL_SELECTED: Record<MatchInterest, string> = {
  iconTub: asset("copper-tub-label-selected.svg"),
  outdoorSoak: asset("soak-outside-label.svg"),
  ownPlace: asset("my-own-place-label-selected.svg"),
  scenic: asset("scenic-views-label-selected.svg"),
  simpleCozy: asset("simple-cozy-label-selected.svg"),
  social: asset("spaces-to-gather-label-selected.svg"),
};

export const POINTING_HAND = asset("pointing-hand-1.svg");
