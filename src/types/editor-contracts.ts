/** Contracts for the editorial draft/publish API (COW-38). */
import { z } from "zod";

export const EDITOR_KINDS = [
  "rate_card", "add_on", "event", "offer", "upgrade", "policy", "instagram", "outlet", "site_settings",
  // COW-73: amenity editorial and per-room assignment documents.
  "amenity_content", "room_amenities",
  // COW-84: ordered room gallery document (link/unlink, order, metadata, flags).
  "room_gallery",
] as const;
export type EditorKind = (typeof EDITOR_KINDS)[number];

export const ROOM_GALLERY_KIND = "room_gallery" as const;

/** One ordered room gallery document. Squarespace URLs are registry facts, not payload. */
export const roomGalleryPayloadSchema = z.object({
  items: z.array(z.object({
    mediaAssetId: z.string().min(1),
    displayOrder: z.number().int().min(1).max(999_999),
    excluded: z.boolean().default(false),
    altText: z.string().trim().max(500).nullable().default(null),
    caption: z.string().trim().max(1000).nullable().default(null),
    description: z.string().trim().max(4000).nullable().default(null),
  })).max(500).refine(
    (items) => new Set(items.map((item) => item.mediaAssetId)).size === items.length,
    "a photo can only appear once per room",
  ),
});
export type RoomGalleryPayload = z.infer<typeof roomGalleryPayloadSchema>;

export const AMENITY_CONTENT_KIND = "amenity_content" as const;
export const ROOM_AMENITIES_KIND = "room_amenities" as const;

/** Site-local SVG path only: the same rule the guest icon resolver enforces. */
const amenityIconPath = z.string().trim().max(300)
  .refine((value) => value === "" || /^assets\/icons\/[a-z0-9_-]+(?:\/[a-z0-9_-]+)*\.svg$/i.test(value),
    "icon path must be a site-local assets/icons/*.svg path")
  .nullable();
const amenityIconName = z.string().trim().max(200)
  .refine((value) => value === "" || /^[a-z0-9_-]+\.svg$/i.test(value),
    "icon name must be a *.svg filename")
  .nullable();

/** Editorial values for one Amenity; slug is the canonical Webflow amenity id. */
export const amenityContentPayloadSchema = z.object({
  name: z.string().trim().min(1).max(200).optional(),
  shortName: z.string().trim().min(1).max(200),
  shortDescription: z.string().trim().max(1000).nullable().default(null),
  longDescription: z.string().trim().max(4000).nullable().default(null),
  imagePath: amenityIconPath.default(null),
  imageName: amenityIconName.default(null),
  active: z.boolean().default(true),
});
export type AmenityContentPayload = z.infer<typeof amenityContentPayloadSchema>;

/** Ordered per-room assignment document; slug is the canonical room type id. */
export const roomAmenitiesPayloadSchema = z.object({
  items: z.array(z.object({
    amenityId: z.string().min(1),
    displayOrder: z.number().int().min(0).max(10_000),
    excluded: z.boolean().default(false),
  })).max(500).refine(
    (items) => new Set(items.map((item) => item.amenityId)).size === items.length,
    "an amenity can only be assigned once per room",
  ),
});
export type RoomAmenitiesPayload = z.infer<typeof roomAmenitiesPayloadSchema>;

const FORBIDDEN_KEYS = new Set(["__proto__", "constructor", "prototype"]);
const MAX_PAYLOAD_BYTES = 200_000;

/** Staged editor payloads are JSON objects, bounded and free of injection keys. */
export const draftPayloadSchema = z.record(z.string(), z.unknown())
  .refine((value) => Object.keys(value).every((key) => !FORBIDDEN_KEYS.has(key)), "forbidden payload key")
  .refine((value) => {
    try { return JSON.stringify(value).length <= MAX_PAYLOAD_BYTES; }
    catch { return false; }
  }, "payload too large or not JSON-serializable");

export const createDraftSchema = z.object({
  kind: z.enum(EDITOR_KINDS),
  slug: z.string().min(1).max(200),
  locationId: z.string().min(1).nullable().optional(),
  payload: draftPayloadSchema,
});
export type CreateDraftInput = z.infer<typeof createDraftSchema>;

/** An expected revision is required so a stale editor cannot overwrite a newer draft. */
export const saveDraftSchema = z.object({
  payload: draftPayloadSchema,
  expectedRevisionId: z.string().min(1),
});
export type SaveDraftInput = z.infer<typeof saveDraftSchema>;

export const publishSchema = z.object({
  revisionId: z.string().min(1).optional(),
});

export const rollbackSchema = z.object({
  revisionId: z.string().min(1),
});

export const contentStatusSchema = z.enum(["draft", "published", "archived"]);
