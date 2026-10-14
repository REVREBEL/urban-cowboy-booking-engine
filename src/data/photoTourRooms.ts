/**
 * Production bridge for the Lovable photo-tour presentation.
 *
 * Live Mews availability/price/eligibility is already shaped and filtered by
 * Results.tsx. Keep that source of truth: never import JOURNEY_ROOMS, mock
 * rates, occupancy estimates, or independently rank rooms for bookings.
 */
import type { ShapedRoom } from "../types/mews";
import { buildRooms } from "../lib/shaping";
import { studioHotel, studioAvailability } from "../studio/demoData";
import type { JourneyRoom, Feature } from "../journey/data";
import type { RoomTypeCmsGallery } from "../types/room-type-cms";
import type { CmsRoomAmenity } from "../types/photo-hotspot-cms";
import { photoSourceFromUrl, selectPhotoImages, type PhotoSource } from "./photoGalleries";
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

export function toPhotoTourRoom(room: ShapedRoom, imageBaseUrl: string, gallery?: RoomTypeCmsGallery, source: PhotoSource = photoSourceFromUrl(), cmsAmenities?: CmsRoomAmenity[]): JourneyRoom {
  const merchandising = room.merchandising;
  const group = merchandising?.roomTypeGroupKey ?? "other";
  const images = room.imageIds
    .map((image) => imgUrl(imageBaseUrl, image, 1600))
    .filter((image): image is string => Boolean(image));
  // The existing design assets are an editorial fallback, never a source of
  // availability, eligibility, or price.
  const mappedImages = getRoomImagesByRoomId(merchandising?.key ?? "");
  const { images: displayImages, photoSource } = selectPhotoImages(images, gallery, source);
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
    cmsAmenities,
    images: displayImages.length ? displayImages : mappedImages,
    photoSource,
    isMock: false,
  };
}

export function toPhotoTourRooms(rooms: readonly ShapedRoom[], imageBaseUrl: string): JourneyRoom[] {
  return rooms.filter((room) => room.rates.length > 0).map((room) => toPhotoTourRoom(room, imageBaseUrl));
}

/** Design Studio room catalog: local fixtures only, never fetched Mews availability.
 * This is the deterministic room source for the Photo Studio preview.
 * Simulated rates support navigating the prototype but cannot create reservations.
 */
export function studioPhotoRoomCatalog(): ShapedRoom[] {
  return buildRooms(studioAvailability(), studioHotel);
}
