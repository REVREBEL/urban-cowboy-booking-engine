/**
 * Production bridge for the Lovable photo-tour presentation.
 *
 * Live Mews availability/price/eligibility is already shaped and filtered by
 * Results.tsx. Keep that source of truth: never import JOURNEY_ROOMS, mock
 * rates, occupancy estimates, or independently rank rooms for bookings.
 */
import type { ShapedRoom } from "../types/mews";
import type { JourneyRoom, Feature } from "../journey/data";
import type { RoomTypeCmsGallery } from "../types/room-type-cms";
import { photoSourceFromUrl, type PhotoSource } from "./photoGalleries";
import { imgUrl } from "../lib/format";
import { getRoomImagesByRoomId } from "./roomImagePlaceholders";
import { roomTypeGroupName } from "./roomTypeGroups";

function verifiedFeatures(room: ShapedRoom): Feature[] {
  const flags = room.merchandising?.features;
  if (!flags) return [];
  const features: Feature[] = [];
  if (flags.indoorTub) features.push("indoor-tub");
  if (flags.outdoorSoak) features.push("outdoor-tub");
  if (flags.fireplace) features.push("fireplace");
  if (flags.scenicView) features.push("view");
  if (flags.separateLivingRoom || flags.fullKitchen) features.push("gather");
  if (flags.privateDeck) features.push("balcony");
  return features;
}

export function toPhotoTourRoom(room: ShapedRoom, imageBaseUrl: string, gallery?: RoomTypeCmsGallery, source: PhotoSource = photoSourceFromUrl()): JourneyRoom {
  const merchandising = room.merchandising;
  const group = merchandising?.roomTypeGroupKey ?? "other";
  const images = room.imageIds
    .map((image) => imgUrl(imageBaseUrl, image, 1600))
    .filter((image): image is string => Boolean(image));
  // The existing design assets are an editorial fallback, never a source of
  // availability, eligibility, or price.
  const mappedImages = getRoomImagesByRoomId(merchandising?.key ?? "");
  const displayImages = source === "webflow" && gallery?.images.length ? gallery.images : images;
  const photoSource = source === "webflow" && gallery?.images.length ? "webflow" : images.length ? "mews" : "fallback";
  return {
    id: room.roomTypeId,
    name: room.name,
    building: roomTypeGroupName(group),
    eyebrow: roomTypeGroupName(group),
    tagline: merchandising?.cardTagline ?? "",
    description: room.cmsLongDescription ?? room.description,
    basePrice: room.rates[0]?.perNightGross ?? 0,
    squareFeet: 0, // not present in the canonical Mews-shaped response
    bedType: room.normalBedCount === 1 ? "1 bed" : `${room.normalBedCount} beds`,
    maxGuests: room.capacity, // display estimate only; booking eligibility is decided upstream
    dogFriendly: merchandising?.dogPolicy === "allowed",
    adultsOnly: merchandising?.agePolicy === "adultsOnly21",
    quiet: 3, // photo-tour prototype field: not used for booking or eligibility
    features: verifiedFeatures(room),
    highlights: [],
    images: displayImages.length ? displayImages : mappedImages,
    photoSource,
    isMock: false,
  };
}

export function toPhotoTourRooms(rooms: readonly ShapedRoom[], imageBaseUrl: string): JourneyRoom[] {
  return rooms.filter((room) => room.rates.length > 0).map((room) => toPhotoTourRoom(room, imageBaseUrl));
}
