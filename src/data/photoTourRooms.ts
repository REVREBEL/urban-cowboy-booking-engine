/**
 * Production bridge for the Lovable photo-tour presentation.
 *
 * Live Mews availability/price/eligibility is already shaped and filtered by
 * Results.tsx. Keep that source of truth: never import JOURNEY_ROOMS, mock
 * rates, occupancy estimates, or independently rank rooms for bookings.
 */
import type { ShapedRoom } from "../types/mews";
import type { JourneyRoom, Feature } from "../journey/data";
import { imgUrl } from "../lib/format";
import { getRoomImagesByRoomId } from "./roomImagePlaceholders";
import { roomTypeGroupName } from "./roomTypeGroups";

function verifiedFeatures(room: ShapedRoom): Feature[] {
  const flags = room.merchandising?.features;
  if (!flags) return [];
  const features: Feature[] = [];
  if (flags.indoorTub) features.push("indoor-tub");
  if (flags.outdoorSoak) features.push("outdoor-tub");
  if (flags.scenicView) features.push("view");
  if (flags.separateLivingRoom || flags.fullKitchen) features.push("gather");
  if (flags.privateDeck) features.push("balcony");
  return features;
}

export function toPhotoTourRoom(room: ShapedRoom, imageBaseUrl: string): JourneyRoom {
  const merchandising = room.merchandising;
  const group = merchandising?.roomTypeGroupKey ?? "other";
  const images = room.imageIds
    .map((image) => imgUrl(imageBaseUrl, image, 1600))
    .filter((image): image is string => Boolean(image));
  // The existing design assets are an editorial fallback, never a source of
  // availability, eligibility, or price.
  const mappedImages = getRoomImagesByRoomId(merchandising?.key ?? "");
  return {
    id: room.roomTypeId,
    name: room.name,
    building: roomTypeGroupName(group),
    eyebrow: roomTypeGroupName(group),
    tagline: merchandising?.cardTagline ?? "",
    description: room.cmsLongDescription ?? room.description,
    basePrice: room.rates[0]?.perNightGross ?? room.fromGross ?? 0,
    squareFeet: 0, // not present in the canonical Mews-shaped response
    bedType: room.normalBedCount === 1 ? "1 bed" : `${room.normalBedCount} beds`,
    maxGuests: room.capacity, // legacy estimate, not an occupancy authority
    dogFriendly: merchandising?.dogPolicy === "allowed",
    adultsOnly: merchandising?.agePolicy === "adultsOnly21",
    quiet: 3, // photo-tour prototype field: not used for booking or eligibility
    features: verifiedFeatures(room),
    highlights: [],
    images: images.length ? images : mappedImages,
    isMock: false,
  };
}

export function toPhotoTourRooms(rooms: readonly ShapedRoom[], imageBaseUrl: string): JourneyRoom[] {
  return rooms.filter((room) => room.rates.length > 0).map((room) => toPhotoTourRoom(room, imageBaseUrl));
}
