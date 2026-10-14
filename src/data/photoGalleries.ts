import type { RoomTypeCmsGallery, RoomTypeCmsGalleryMap } from "../types/room-type-cms";
import { isStudioRoute } from "../studio/runtime.ts";

/** Studio uses simulated Mews IDs. Match its three demo categories to real
 * published Webflow Room Types for photography testing only. This never
 * changes room eligibility, prices, availability or booking identifiers.
 */
const STUDIO_GALLERY_IDS: Record<string, string> = {
  "demo-alpine": "9cbb022a-742f-4abe-9586-b10600706caf", // Alpine Bathing Suite
  "demo-forest": "38cebace-6f26-47fd-b7e0-b1f1012d30a6", // Forest House King, gallery representative
  "demo-opa-cabin": "a2230bdd-1770-41b6-8932-b202001df350", // Opa\'s Cabin 2 Bedroom Suite
  "demo-cabin": "e90c2a72-1cf8-4246-84d7-b10600706caf", // The Cabin
};

/** Look up editorial Webflow content for Studio fixture IDs without changing their booking IDs. */
export function studioEditorialRoomTypeId(roomTypeId: string): string {
  return isStudioRoute() ? (STUDIO_GALLERY_IDS[roomTypeId] ?? roomTypeId) : roomTypeId;
}

export type PhotoSource = "webflow" | "mews";

export function photoSourceFromUrl(): PhotoSource {
  if (typeof window === "undefined") return "webflow";
  return new URLSearchParams(window.location.search).get("photoSource") === "mews" ? "mews" : "webflow";
}

let galleries: RoomTypeCmsGalleryMap = {};

/** Retain editorial galleries as the guest advances to Rate and Review. */
export function savePhotoGalleries(map: RoomTypeCmsGalleryMap): void {
  galleries = map;
}

export function photoGalleryForRoom(
  roomTypeId: string,
  map: RoomTypeCmsGalleryMap = galleries,
  studio = isStudioRoute(),
): RoomTypeCmsGallery | undefined {
  return map[roomTypeId] ?? (studio ? map[STUDIO_GALLERY_IDS[roomTypeId]] : undefined);
}

/** Pure photo selection: switch only the image URLs, never bookability or price. */
export function selectPhotoImages(
  mewsImages: readonly string[],
  gallery: RoomTypeCmsGallery | undefined,
  source: PhotoSource,
): { images: string[]; photoSource: "webflow" | "mews" | "fallback" } {
  if (source === "webflow" && gallery?.images.length) {
    return { images: gallery.images, photoSource: "webflow" };
  }
  if (mewsImages.length) {
    return { images: [...mewsImages], photoSource: "mews" };
  }
  return { images: [], photoSource: "fallback" };
}
