import { imgUrl } from "@/lib/format";
import type { ShapedRoom } from "@/types/mews";

import type { RoomExperience, RoomProduct } from "../types";

const EXPERIENCE_BY_FAMILY: Record<string, RoomExperience> = {
  alpine: "Alpine",
  walden: "Walden",
  lodge: "Lodge",
  "forest-house": "Forest House",
  cabin: "Cabin",
  chalet: "Chalet",
  opas: "Opa's",
  "slide-mountain": "Slide Mountain",
  "mountain-view": "Mountain View",
};

const TAGLINE_BY_FAMILY: Partial<Record<RoomExperience, string>> = {
  Alpine: "The iconic indoor soak.",
  Walden: "Bathing outside among the trees.",
  Lodge: "Closest to the social heart of the Cowboy.",
  "Forest House": "Simple, nostalgic Catskills comfort.",
  Cabin: "Your own private hideaway.",
  Chalet: "The alpine fantasy.",
  "Opa's": "Old-school Catskills house for a group.",
  "Slide Mountain": "Your upstate place at the trailhead.",
  "Mountain View": "Big views + group chalet living.",
};

function roomExperience(room: ShapedRoom): RoomExperience {
  const family = room.merchandising?.family;
  return family ? EXPERIENCE_BY_FAMILY[family] ?? "Other" : "Other";
}

function roomImages(room: ShapedRoom, imageBaseUrl: string): string[] {
  const images = room.imageIds
    .map((imageId) => imgUrl(imageBaseUrl, imageId, 1200))
    .filter((url): url is string => Boolean(url));

  return images.length > 0 ? images : ["/assets/room-photo-1.png"];
}

export function roomProductFromShapedRoom(
  room: ShapedRoom,
  imageBaseUrl: string,
): RoomProduct {
  const experience = roomExperience(room);
  const metadata = room.merchandising;
  const features = metadata?.features ?? {};
  const images = roomImages(room, imageBaseUrl);
  const nightly =
    room.rates.find((rate) => rate.perNightGross != null)?.perNightGross ??
    room.fromGross ??
    0;

  return {
    id: room.categoryId,
    name: room.name,
    experience,
    tagline: TAGLINE_BY_FAMILY[experience] ?? "",
    description: room.description,
    features: {
      dogFriendly: metadata?.dogPolicy === "allowed",
      adults21Plus: metadata?.agePolicy === "adultsOnly21",
      heatedFloors: features.heatedFloors,
      fireplace: features.fireplace,
      outdoorSoak: features.outdoorSoak,
      indoorTub: features.indoorTub,
      privateDeck: features.privateDeck,
      scenicView: features.scenicView,
      ownPlace: features.ownPlace,
      simpleCozy: features.simpleCozy,
      fullKitchen: features.fullKitchen,
      oneBed: room.normalBedCount === 1,
      twoBeds: room.normalBedCount >= 2,
      sleeps: room.capacity,
      beds: `${room.normalBedCount} bed${room.normalBedCount === 1 ? "" : "s"}`,
    },
    images,
    thumbImage: images[0],
    startingFrom: nightly,
    available: room.availableRoomCount > 0,
  };
}
