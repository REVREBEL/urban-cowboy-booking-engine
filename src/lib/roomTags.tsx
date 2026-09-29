import type { RoomMerchandising } from "../types/merchandising";
import type { RoomTag } from "@/components/rooms/room-tags";
import {
  IconCheck,
  IconFlame,
  IconLeaf,
  IconLock,
  IconMapPin,
  IconSparkles,
  IconSun,
  IconWave,
} from "@/components/icons/cowboy-icons";
import { t } from "../i18n";

export function roomBenefitTags(merchandising: RoomMerchandising | null): RoomTag[] {
  if (!merchandising) return [];
  const tags: RoomTag[] = [];
  const f = merchandising.features;

  if (f.indoorTub) tags.push({ key: "indoorTub", label: t("roomTag.iconTub"), Icon: IconSparkles });
  if (f.outdoorSoak) tags.push({ key: "outdoorSoak", label: t("roomTag.outdoorSoak"), Icon: IconWave });
  if (f.ownPlace) tags.push({ key: "ownPlace", label: t("roomTag.ownPlace"), Icon: IconLock });
  if (f.scenicView) tags.push({ key: "scenic", label: t("roomTag.scenic"), Icon: IconMapPin });
  if (f.simpleCozy && tags.length === 0) {
    tags.push({ key: "simpleCozy", label: t("roomTag.simpleCozy"), Icon: IconLeaf });
  }

  return tags.slice(0, 2);
}

export function roomDetailTags(merchandising: RoomMerchandising | null): RoomTag[] {
  if (!merchandising) return [];
  const tags = [...roomBenefitTags(merchandising)];
  const f = merchandising.features;

  if (merchandising.dogPolicy === "allowed") {
    tags.push({ key: "dog", label: t("roomTag.dogFriendly"), Icon: IconCheck });
  }
  if (merchandising.agePolicy === "adultsOnly21") {
    tags.push({ key: "21plus", label: t("roomTag.adultsOnly"), Icon: IconLock });
  } else if (merchandising.agePolicy === "adult21Required") {
    tags.push({ key: "adult21", label: t("roomTag.adultRequired"), Icon: IconLock });
  }
  if (f.privateDeck) tags.push({ key: "deck", label: t("roomTag.privateDeck"), Icon: IconLeaf });
  if (f.fireplace) tags.push({ key: "fireplace", label: t("roomTag.fireplace"), Icon: IconFlame });
  if (f.heatedFloors) tags.push({ key: "heatedFloors", label: t("roomTag.heatedFloors"), Icon: IconSun });

  return tags;
}
