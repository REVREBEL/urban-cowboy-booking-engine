import type { MatchInterest } from "./types";

const RAW =
  "https://raw.githubusercontent.com/REVREBEL/urban-cowboy-booking-engine/d77a9f16cb2f99624f730bbb63cd340c74a6fdb5/src/components/other-cowboy/figma/public/assets";

const asset = (path: string) => `${RAW}/${path}`;

export const DOG_ICON = asset("dog-toggle-off.svg");
export const DOG_ICON_SELECTED = asset("dog-toggle-on.svg");

export const PREFERENCE_ART: Record<
  MatchInterest,
  {
    icon: string;
    selectedIcon: string;
    label?: string;
    selectedLabel?: string;
  }
> = {
  iconTub: {
    icon: asset("copper-tub-illustration-unselected.png"),
    selectedIcon: asset("copper-tub-illustration-selected.png"),
    label: asset("copper-tub-label-unselected.svg"),
    selectedLabel: asset("copper-tub-label-selected.svg"),
  },
  outdoorSoak: {
    icon: asset("soak-outside-illustration-unselected.png"),
    selectedIcon: asset("soak-outside-illustration-selected.png"),
    label: asset("soak-outside-label.svg"),
    selectedLabel: asset("soak-outside-label.svg"),
  },
  ownPlace: {
    icon: asset("my-own-place-illustration-unselected.png"),
    selectedIcon: asset("my-own-place-illustration-selected.png"),
    label: asset("my-own-place-label-unselected.svg"),
    selectedLabel: asset("my-own-place-label-selected.svg"),
  },
  scenic: {
    icon: asset("scenic-views-illustration-unselected.png"),
    selectedIcon: asset("scenic-views-illustration-selected.png"),
    label: asset("scenic-views-label-unselected.svg"),
    selectedLabel: asset("scenic-views-label-selected.svg"),
  },
  simpleCozy: {
    icon: asset("simple-cozy-illustration-unselected.png"),
    selectedIcon: asset("simple-cozy-illustration-selected.png"),
    label: asset("simple-cozy-label-unselected.svg"),
    selectedLabel: asset("simple-cozy-label-selected.svg"),
  },
  social: {
    icon: asset("spaces-to-gather-illustration-unselected.png"),
    selectedIcon: asset("spaces-to-gather-illustration-selected.png"),
    label: asset("spaces-to-gather-label-unselected.svg"),
    selectedLabel: asset("spaces-to-gather-label-selected.svg"),
  },
};

export const COWBOY_PUBLIC_ASSET = asset;
