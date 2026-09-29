// Brand imagery exported from the Cowboy design files.
import badgeAdultsOnly from "@/assets/cowboy/badge-adults-only.png.asset.json";
import badgeDogFriendly from "@/assets/cowboy/badge-dog-friendly.png.asset.json";
import badgeWifi from "@/assets/cowboy/badge-wifi.png.asset.json";
import buildingAlpine from "@/assets/cowboy/building-alpine.png.asset.json";
import wordmarkForest from "@/assets/cowboy/cowboy-wordmark-forest.png.asset.json";
import wordmarkLinen from "@/assets/cowboy/cowboy-wordmark-linen.png.asset.json";
import cabin from "@/assets/cowboy/ib-cabin.png.asset.json";
import copperClawfootTub from "@/assets/cowboy/ib-tub.png.asset.json";
import letterWritingDesk from "@/assets/cowboy/ib-desk.png.asset.json";
import outdoorCedarTub from "@/assets/cowboy/ib-soak.png.asset.json";
import peakBalcony from "@/assets/cowboy/ib-scenic.png.asset.json";
import separateLivingRoom from "@/assets/cowboy/ib-gather.png.asset.json";
import cabinLabel from "@/assets/cowboy/ib-label-cabin.svg.asset.json";
import copperClawfootTubLabel from "@/assets/cowboy/ib-label-tub.svg.asset.json";
import letterWritingDeskLabel from "@/assets/cowboy/ib-label-cozy.svg.asset.json";
import outdoorCedarTubLabel from "@/assets/cowboy/ib-label-soak.svg.asset.json";
import peakBalconyLabel from "@/assets/cowboy/ib-label-scenic.svg.asset.json";
import separateLivingRoomLabel from "@/assets/cowboy/ib-label-gather.png.asset.json";
import cabinOn from "@/assets/cowboy/ib-cabin-on.png.asset.json";
import copperClawfootTubOn from "@/assets/cowboy/ib-tub-on.png.asset.json";
import letterWritingDeskOn from "@/assets/cowboy/ib-desk-on.png.asset.json";
import outdoorCedarTubOn from "@/assets/cowboy/ib-soak-on.png.asset.json";
import peakBalconyOn from "@/assets/cowboy/ib-scenic-on.png.asset.json";
import separateLivingRoomOn from "@/assets/cowboy/ib-gather-on.png.asset.json";
import cabinLabelOn from "@/assets/cowboy/ib-label-cabin-on.svg.asset.json";
import copperClawfootTubLabelOn from "@/assets/cowboy/ib-label-tub-on.svg.asset.json";
import letterWritingDeskLabelOn from "@/assets/cowboy/ib-label-cozy-on.svg.asset.json";
import outdoorCedarTubLabelOn from "@/assets/cowboy/ib-label-soak-on.svg.asset.json";
import peakBalconyLabelOn from "@/assets/cowboy/ib-label-scenic-on.svg.asset.json";
import separateLivingRoomLabelOn from "@/assets/cowboy/ib-label-gather-on.png.asset.json";
import dogFriendly from "@/assets/cowboy/ib-dog.png.asset.json";
import featureBed from "@/assets/cowboy/feature-bed.png.asset.json";
import featureClawfootTub from "@/assets/cowboy/feature-clawfoot-tub.png.asset.json";
import featureFireplace from "@/assets/cowboy/feature-fireplace.png.asset.json";
import featureHeatedFloors from "@/assets/cowboy/feature-heated-floors.png.asset.json";
import featureRobe from "@/assets/cowboy/feature-robe.png.asset.json";
import iconAirstream from "@/assets/cowboy/icon-airstream.png.asset.json";
import iconCampfire from "@/assets/cowboy/icon-campfire.png.asset.json";
import iconHammock from "@/assets/cowboy/icon-hammock.png.asset.json";
import iconStar from "@/assets/cowboy/star.png.asset.json";
import logoLinen from "@/assets/cowboy/urban-cowboy-logo-linen.png.asset.json";

import type { FeatureKind, PreferenceId } from "./rooms";

export const BRAND = {
  wordmarkForest: wordmarkForest.url,
  wordmarkLinen: wordmarkLinen.url,
  logoLinen: logoLinen.url,
  star: iconStar.url,
  building: buildingAlpine.url,
};

export const PREFERENCE_ICON: Record<PreferenceId, string> = {
  "iconic-tub": copperClawfootTub.url,
  "bathe-outside": outdoorCedarTub.url,
  "my-own-place": cabin.url,
  "near-everything": separateLivingRoom.url,
  "simple-cozy": letterWritingDesk.url,
  "mountain-views": peakBalcony.url,
  "bringing-my-people": iconAirstream.url,
};

export const PREFERENCE_LABEL: Partial<Record<PreferenceId, string>> = {
  "iconic-tub": copperClawfootTubLabel.url,
  "bathe-outside": outdoorCedarTubLabel.url,
  "my-own-place": cabinLabel.url,
  "near-everything": separateLivingRoomLabel.url,
  "simple-cozy": letterWritingDeskLabel.url,
  "mountain-views": peakBalconyLabel.url,
};

// Selected states ship their own darker artwork straight from the design file.
export const PREFERENCE_ICON_SELECTED: Partial<Record<PreferenceId, string>> = {
  "iconic-tub": copperClawfootTubOn.url,
  "bathe-outside": outdoorCedarTubOn.url,
  "my-own-place": cabinOn.url,
  "near-everything": separateLivingRoomOn.url,
  "simple-cozy": letterWritingDeskOn.url,
  "mountain-views": peakBalconyOn.url,
};

export const PREFERENCE_LABEL_SELECTED: Partial<Record<PreferenceId, string>> = {
  "iconic-tub": copperClawfootTubLabelOn.url,
  "bathe-outside": outdoorCedarTubLabelOn.url,
  "my-own-place": cabinLabelOn.url,
  "near-everything": separateLivingRoomLabelOn.url,
  "simple-cozy": letterWritingDeskLabelOn.url,
  "mountain-views": peakBalconyLabelOn.url,
};

export const DOG_ICON = dogFriendly.url;

export const FEATURE_ICON: Record<FeatureKind, string> = {
  water: featureClawfootTub.url,
  bed: featureBed.url,
  heating: featureFireplace.url,
  room: featureHeatedFloors.url,
  building: buildingAlpine.url,
  basic: featureRobe.url,
  kitchen: featureRobe.url,
  badge: iconStar.url,
};

export const BADGE_ICON = {
  adultsOnly: badgeAdultsOnly.url,
  wifi: badgeWifi.url,
  dogFriendly: badgeDogFriendly.url,
};

export const INTERESTS: {
  id: string;
  icon: string;
  title: string;
  copy: string;
  preferences: PreferenceId[];
}[] = [
  {
    id: "disappear",
    icon: iconHammock.url,
    title: "Disappear for a while",
    copy: "Trade pavement for mountain air and the kind of quiet that makes you forget what day it is.",
    preferences: ["my-own-place", "simple-cozy"],
  },
  {
    id: "soak",
    icon: iconAirstream.url,
    title: "Soak it all in",
    copy: "Sauna, outdoor hangs, long baths and plenty of ways to slow the whole operation down.",
    preferences: ["iconic-tub", "bathe-outside"],
  },
  {
    id: "together",
    icon: iconCampfire.url,
    title: "Better together",
    copy: "Dinner, drinks, fireside nights and whatever happens next. Cowboy is made for gathering.",
    preferences: ["near-everything", "bringing-my-people"],
  },
];
