/**
 * D1 row contracts for the Urban Cowboy platform migration (COW-30).
 *
 * These schemas describe the *stored* (snake_case) shape returned by D1 and
 * transform it into the camelCase domain shape used by the app. D1 numbers
 * used as booleans are validated as 0/1 integers and converted explicitly.
 *
 * Mews remains the transactional authority: nothing here models live price,
 * availability or settlement. These contracts cover editorial content,
 * versioned content, stable media identity, provenance and publication state.
 */
import { z } from "zod";

const id = z.string().min(1);
const nullableText = z.string().nullable();
const timestamp = z.string().min(1);
const flag = z.number().int().min(0).max(1).transform((value) => value === 1);

export const contentStatusSchema = z.enum(["draft", "published", "archived"]);
export type ContentStatusValue = z.infer<typeof contentStatusSchema>;

export const mediaAliasTypeSchema = z.enum([
  "webflow_file_id",
  "webflow_cdn_url",
  "squarespace_asset_id",
  "squarespace_url",
  "mews_asset_id",
]);
export type MediaAliasType = z.infer<typeof mediaAliasTypeSchema>;

export const sourceSystemSchema = z.enum([
  "webflow_cms",
  "mews",
  "n8n",
  "manual",
  "import",
]);
export type SourceSystem = z.infer<typeof sourceSystemSchema>;

export const tenantScopeSchema = z.object({
  tenantId: id,
  locationId: z.string().nullable().optional(),
});
export type TenantScopeContract = z.infer<typeof tenantScopeSchema>;

export const tenantRowSchema = z.object({
  id,
  slug: id,
  name: id,
  created_at: timestamp,
}).transform((row) => ({
  id: row.id,
  slug: row.slug,
  name: row.name,
  createdAt: row.created_at,
}));
export type TenantContract = z.output<typeof tenantRowSchema>;

export const locationRowSchema = z.object({
  id,
  tenant_id: id,
  slug: id,
  name: id,
  time_zone: id,
  mews_hotel_id: nullableText,
  created_at: timestamp,
}).transform((row) => ({
  id: row.id,
  tenantId: row.tenant_id,
  slug: row.slug,
  name: row.name,
  timeZone: row.time_zone,
  mewsHotelId: row.mews_hotel_id,
  createdAt: row.created_at,
}));
export type LocationContract = z.output<typeof locationRowSchema>;

export const buildingRowSchema = z.object({
  id,
  tenant_id: id,
  location_id: nullableText,
  name: id,
  slug: nullableText,
  sort_order: z.number().int(),
  created_at: timestamp,
}).transform((row) => ({
  id: row.id,
  tenantId: row.tenant_id,
  locationId: row.location_id,
  name: row.name,
  slug: row.slug,
  sortOrder: row.sort_order,
  createdAt: row.created_at,
}));
export type BuildingContract = z.output<typeof buildingRowSchema>;

export const roomTypeRowSchema = z.object({
  id,
  tenant_id: id,
  location_id: nullableText,
  mews_room_category_id: id,
  name: id,
  slug: nullableText,
  sort_order: z.number().int(),
  created_at: timestamp,
}).transform((row) => ({
  id: row.id,
  tenantId: row.tenant_id,
  locationId: row.location_id,
  mewsRoomCategoryId: row.mews_room_category_id,
  name: row.name,
  slug: row.slug,
  sortOrder: row.sort_order,
  createdAt: row.created_at,
}));
export type RoomTypeContract = z.output<typeof roomTypeRowSchema>;

export const amenityRowSchema = z.object({
  id,
  tenant_id: id,
  name: id,
  image_name: nullableText,
  image_path: nullableText,
  sort_order: z.number().int(),
  created_at: timestamp,
}).transform((row) => ({
  id: row.id,
  tenantId: row.tenant_id,
  name: row.name,
  imageName: row.image_name,
  imagePath: row.image_path,
  sortOrder: row.sort_order,
  createdAt: row.created_at,
}));
export type AmenityContract = z.output<typeof amenityRowSchema>;

export const roomTypeAmenityRowSchema = z.object({
  room_type_id: id,
  amenity_id: id,
  display_order: z.number().int(),
  excluded: flag,
}).transform((row) => ({
  roomTypeId: row.room_type_id,
  amenityId: row.amenity_id,
  displayOrder: row.display_order,
  excluded: row.excluded,
}));
export type RoomTypeAmenityContract = z.output<typeof roomTypeAmenityRowSchema>;

/**
 * COW-73: published editorial overlay for an Amenity. Identity, icon paths and
 * global sort order stay in `amenities`; these are the CMS-backed prose/visibility
 * values that the React admin edits through the COW-38 revision API.
 */
export const amenityEditorialRowSchema = z.object({
  amenity_id: id,
  tenant_id: id,
  short_name: nullableText,
  short_description: nullableText,
  long_description: nullableText,
  active: flag,
  updated_at: timestamp,
}).transform((row) => ({
  amenityId: row.amenity_id,
  tenantId: row.tenant_id,
  shortName: row.short_name,
  shortDescription: row.short_description,
  longDescription: row.long_description,
  active: row.active,
  updatedAt: row.updated_at,
}));
export type AmenityEditorialContract = z.output<typeof amenityEditorialRowSchema>;

/** Joined canonical + editorial row returned by the room amenity admin API. */
export const roomAmenityAssignmentRowSchema = z.object({
  room_type_id: id,
  amenity_id: id,
  name: id,
  image_name: nullableText,
  image_path: nullableText,
  sort_order: z.number().int(),
  short_name: nullableText,
  short_description: nullableText,
  long_description: nullableText,
  active: flag,
  display_order: z.number().int(),
  excluded: flag,
}).transform((row) => ({
  roomTypeId: row.room_type_id,
  amenityId: row.amenity_id,
  name: row.name,
  imageName: row.image_name,
  imagePath: row.image_path,
  sortOrder: row.sort_order,
  shortName: row.short_name,
  shortDescription: row.short_description,
  longDescription: row.long_description,
  active: row.active,
  displayOrder: row.display_order,
  excluded: row.excluded,
}));
export type RoomAmenityAssignmentRow = z.output<typeof roomAmenityAssignmentRowSchema>;

export const contentItemRowSchema = z.object({
  id,
  tenant_id: id,
  location_id: nullableText,
  kind: id,
  slug: id,
  status: contentStatusSchema,
  current_revision_id: nullableText,
  created_at: timestamp,
  updated_at: timestamp,
}).transform((row) => ({
  id: row.id,
  tenantId: row.tenant_id,
  locationId: row.location_id,
  kind: row.kind,
  slug: row.slug,
  status: row.status,
  currentRevisionId: row.current_revision_id,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
}));
export type ContentItemContract = z.output<typeof contentItemRowSchema>;

export const contentRevisionRowSchema = z.object({
  id,
  content_item_id: id,
  revision: z.number().int().positive(),
  payload_json: z.string().min(1).refine((value) => {
    try {
      JSON.parse(value);
      return true;
    } catch {
      return false;
    }
  }, "payload_json must be valid JSON"),
  published_at: nullableText,
  created_by: nullableText,
  created_at: timestamp,
}).transform((row) => ({
  id: row.id,
  contentItemId: row.content_item_id,
  revision: row.revision,
  payloadJson: row.payload_json,
  publishedAt: row.published_at,
  createdBy: row.created_by,
  createdAt: row.created_at,
}));
export type ContentRevisionContract = z.output<typeof contentRevisionRowSchema>;

export const eventRowSchema = z.object({
  id,
  tenant_id: id,
  location_id: nullableText,
  title: id,
  description: nullableText,
  venue: nullableText,
  time_zone: id,
  starts_at: id,
  ends_at: nullableText,
  recurrence_rule: nullableText,
  capacity: z.number().int().nullable(),
  display_flag: flag,
  media_asset_id: nullableText,
  created_at: timestamp,
  updated_at: timestamp,
}).transform((row) => ({
  id: row.id,
  tenantId: row.tenant_id,
  locationId: row.location_id,
  title: row.title,
  description: row.description,
  venue: row.venue,
  timeZone: row.time_zone,
  startsAt: row.starts_at,
  endsAt: row.ends_at,
  recurrenceRule: row.recurrence_rule,
  capacity: row.capacity,
  displayFlag: row.display_flag,
  mediaAssetId: row.media_asset_id,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
}));
export type EventContract = z.output<typeof eventRowSchema>;

export const addOnRowSchema = z.object({
  id,
  tenant_id: id,
  location_id: nullableText,
  name: id,
  description: nullableText,
  mews_product_id: nullableText,
  icon_media_asset_id: nullableText,
  quantity_cap: z.number().int().nullable(),
  sort_order: z.number().int(),
  status: contentStatusSchema,
  created_at: timestamp,
  updated_at: timestamp,
}).transform((row) => ({
  id: row.id,
  tenantId: row.tenant_id,
  locationId: row.location_id,
  name: row.name,
  description: row.description,
  mewsProductId: row.mews_product_id,
  iconMediaAssetId: row.icon_media_asset_id,
  quantityCap: row.quantity_cap,
  sortOrder: row.sort_order,
  status: row.status,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
}));
export type AddOnContract = z.output<typeof addOnRowSchema>;

export const offerRowSchema = z.object({
  id,
  tenant_id: id,
  location_id: nullableText,
  name: id,
  headline: nullableText,
  description: nullableText,
  rate_product_id: nullableText,
  cta_label: nullableText,
  starts_at: nullableText,
  ends_at: nullableText,
  member_only: flag,
  status: contentStatusSchema,
  created_at: timestamp,
  updated_at: timestamp,
}).transform((row) => ({
  id: row.id,
  tenantId: row.tenant_id,
  locationId: row.location_id,
  name: row.name,
  headline: row.headline,
  description: row.description,
  rateProductId: row.rate_product_id,
  ctaLabel: row.cta_label,
  startsAt: row.starts_at,
  endsAt: row.ends_at,
  memberOnly: row.member_only,
  status: row.status,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
}));
export type OfferContract = z.output<typeof offerRowSchema>;

export const upgradeRowSchema = z.object({
  id,
  tenant_id: id,
  location_id: nullableText,
  name: id,
  description: nullableText,
  priority: z.number().int(),
  audience_rule: nullableText,
  room_rule: nullableText,
  media_asset_id: nullableText,
  status: contentStatusSchema,
  created_at: timestamp,
  updated_at: timestamp,
}).transform((row) => ({
  id: row.id,
  tenantId: row.tenant_id,
  locationId: row.location_id,
  name: row.name,
  description: row.description,
  priority: row.priority,
  audienceRule: row.audience_rule,
  roomRule: row.room_rule,
  mediaAssetId: row.media_asset_id,
  status: row.status,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
}));
export type UpgradeContract = z.output<typeof upgradeRowSchema>;

export const rateMerchandisingRowSchema = z.object({
  id,
  tenant_id: id,
  location_id: nullableText,
  rate_product_id: id,
  position: z.number().int(),
  styling: nullableText,
  geo_targeting: nullableText,
  cancellation_rules: nullableText,
  created_at: timestamp,
  updated_at: timestamp,
}).transform((row) => ({
  id: row.id,
  tenantId: row.tenant_id,
  locationId: row.location_id,
  rateProductId: row.rate_product_id,
  position: row.position,
  styling: row.styling,
  geoTargeting: row.geo_targeting,
  cancellationRules: row.cancellation_rules,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
}));
export type RateMerchandisingContract = z.output<typeof rateMerchandisingRowSchema>;

export const mediaAssetRowSchema = z.object({
  id,
  tenant_id: id,
  location_id: nullableText,
  kind: z.enum(["image", "video", "document"]),
  original_filename: nullableText,
  created_at: timestamp,
  updated_at: timestamp,
}).transform((row) => ({
  id: row.id,
  tenantId: row.tenant_id,
  locationId: row.location_id,
  kind: row.kind,
  originalFilename: row.original_filename,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
}));
export type MediaAssetContract = z.output<typeof mediaAssetRowSchema>;

export const mediaAliasRowSchema = z.object({
  id,
  tenant_id: id,
  media_asset_id: id,
  alias_type: mediaAliasTypeSchema,
  alias_value: id,
  created_at: timestamp,
}).transform((row) => ({
  id: row.id,
  tenantId: row.tenant_id,
  mediaAssetId: row.media_asset_id,
  aliasType: row.alias_type,
  aliasValue: row.alias_value,
  createdAt: row.created_at,
}));
export type MediaAliasContract = z.output<typeof mediaAliasRowSchema>;

export const contentProvenanceRowSchema = z.object({
  tenant_id: id,
  location_id: nullableText,
  target_table: id,
  target_id: id,
  source_system: sourceSystemSchema,
  source_collection: nullableText,
  source_id: nullableText,
  source_snapshot_date: nullableText,
  source_hash: nullableText,
  imported_at: timestamp,
}).transform((row) => ({
  tenantId: row.tenant_id,
  locationId: row.location_id,
  targetTable: row.target_table,
  targetId: row.target_id,
  sourceSystem: row.source_system,
  sourceCollection: row.source_collection,
  sourceId: row.source_id,
  sourceSnapshotDate: row.source_snapshot_date,
  sourceHash: row.source_hash,
  importedAt: row.imported_at,
}));
export type ContentProvenanceContract = z.output<typeof contentProvenanceRowSchema>;

// ---------------------------------------------------------------------------
// COW-33 media registry extension
// ---------------------------------------------------------------------------

/** Explicit actions recorded in media_revisions. */
export const mediaActionSchema = z.enum([
  "create_new",
  "link_existing",
  "replace",
  "retire",
  "set_placement",
]);
export type MediaAction = z.infer<typeof mediaActionSchema>;

/** Placement kinds. The database column stays free text; Zod owns the values. */
export const mediaPlacementTypeSchema = z.enum([
  "gallery",
  "hero",
  "icon",
  "hotspot",
  "document",
]);
export type MediaPlacementType = z.infer<typeof mediaPlacementTypeSchema>;

const tagsText = z.string()
  .refine((value) => {
    try {
      const parsed: unknown = JSON.parse(value);
      return Array.isArray(parsed) && parsed.every((item) => typeof item === "string");
    } catch {
      return false;
    }
  }, "tags must be a JSON array of strings")
  .transform((value) => JSON.parse(value) as string[]);

export const mediaAssetMetadataRowSchema = z.object({
  media_asset_id: id,
  tenant_id: id,
  description: nullableText,
  caption: nullableText,
  tags: tagsText.nullable(),
  attribution: nullableText,
  status: z.enum(["active", "retired"]),
  current_version_id: nullableText,
  created_at: timestamp,
  updated_at: timestamp,
}).transform((row) => ({
  mediaAssetId: row.media_asset_id,
  tenantId: row.tenant_id,
  description: row.description,
  caption: row.caption,
  tags: row.tags,
  attribution: row.attribution,
  status: row.status,
  currentVersionId: row.current_version_id,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
}));
export type MediaAssetMetadataContract = z.output<typeof mediaAssetMetadataRowSchema>;

export const mediaVersionFileRowSchema = z.object({
  version_id: id,
  tenant_id: id,
  media_asset_id: id,
  cloudinary_public_id: nullableText,
  cloudinary_version: nullableText,
  sha256: nullableText,
  byte_size: z.number().int().nullable(),
  mime_type: nullableText,
  created_at: timestamp,
}).transform((row) => ({
  versionId: row.version_id,
  tenantId: row.tenant_id,
  mediaAssetId: row.media_asset_id,
  cloudinaryPublicId: row.cloudinary_public_id,
  cloudinaryVersion: row.cloudinary_version,
  sha256: row.sha256,
  byteSize: row.byte_size,
  mimeType: row.mime_type,
  createdAt: row.created_at,
}));
export type MediaVersionFileContract = z.output<typeof mediaVersionFileRowSchema>;

export const mediaPlacementRowSchema = z.object({
  id,
  tenant_id: id,
  media_asset_id: id,
  target_table: id,
  target_id: id,
  placement_type: mediaPlacementTypeSchema,
  alt_text_override: nullableText,
  caption_override: nullableText,
  description_override: nullableText,
  display_order: z.number().int(),
  created_at: timestamp,
  updated_at: timestamp,
}).transform((row) => ({
  id: row.id,
  tenantId: row.tenant_id,
  mediaAssetId: row.media_asset_id,
  targetTable: row.target_table,
  targetId: row.target_id,
  placementType: row.placement_type,
  altTextOverride: row.alt_text_override,
  captionOverride: row.caption_override,
  descriptionOverride: row.description_override,
  displayOrder: row.display_order,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
}));
export type MediaPlacementContract = z.output<typeof mediaPlacementRowSchema>;

export const mediaRevisionRowSchema = z.object({
  id,
  tenant_id: id,
  media_asset_id: id,
  action: mediaActionSchema,
  from_version_id: nullableText,
  to_version_id: nullableText,
  target_table: nullableText,
  target_id: nullableText,
  actor: nullableText,
  note: nullableText,
  metadata_json: nullableText,
  created_at: timestamp,
}).transform((row) => ({
  id: row.id,
  tenantId: row.tenant_id,
  mediaAssetId: row.media_asset_id,
  action: row.action,
  fromVersionId: row.from_version_id,
  toVersionId: row.to_version_id,
  targetTable: row.target_table,
  targetId: row.target_id,
  actor: row.actor,
  note: row.note,
  metadataJson: row.metadata_json,
  createdAt: row.created_at,
}));
export type MediaRevisionContract = z.output<typeof mediaRevisionRowSchema>;

/** Joined current-version view returned by the media registry service. */
export const mediaAssetViewRowSchema = z.object({
  media_id: id,
  tenant_id: id,
  location_id: nullableText,
  kind: id,
  original_filename: nullableText,
  description: nullableText,
  caption: nullableText,
  tags: tagsText.nullable(),
  attribution: nullableText,
  status: z.enum(["active", "retired"]).nullable(),
  current_version_id: nullableText,
  version: z.number().int().nullable(),
  cloudinary_public_id: nullableText,
  cloudinary_version: nullableText,
  sha256: nullableText,
  byte_size: z.number().int().nullable(),
  mime_type: nullableText,
}).transform((row) => ({
  mediaId: row.media_id,
  tenantId: row.tenant_id,
  locationId: row.location_id,
  kind: row.kind,
  originalFilename: row.original_filename,
  description: row.description,
  caption: row.caption,
  tags: row.tags,
  attribution: row.attribution,
  status: row.status,
  currentVersionId: row.current_version_id,
  version: row.version,
  cloudinaryPublicId: row.cloudinary_public_id,
  cloudinaryVersion: row.cloudinary_version,
  sha256: row.sha256,
  byteSize: row.byte_size,
  mimeType: row.mime_type,
}));
export type MediaAssetView = z.output<typeof mediaAssetViewRowSchema>;

/** Room gallery placement joined to its current media version metadata. */
export const roomGalleryRowSchema = z.object({
  placement_id: id,
  media_asset_id: id,
  display_order: z.number().int(),
  original_filename: nullableText,
  width: z.number().int().nullable(),
  height: z.number().int().nullable(),
  alt_text: nullableText,
  caption: nullableText,
  description: nullableText,
  tags: tagsText.nullable(),
  current_version_id: nullableText,
  cloudinary_public_id: nullableText,
  cloudinary_version: nullableText,
  sha256: nullableText,
}).transform((row) => ({
  placementId: row.placement_id,
  mediaAssetId: row.media_asset_id,
  displayOrder: row.display_order,
  originalFilename: row.original_filename,
  width: row.width,
  height: row.height,
  altText: row.alt_text,
  caption: row.caption,
  description: row.description,
  tags: row.tags,
  currentVersionId: row.current_version_id,
  cloudinaryPublicId: row.cloudinary_public_id,
  cloudinaryVersion: row.cloudinary_version,
  sha256: row.sha256,
}));
export type RoomGalleryRow = z.output<typeof roomGalleryRowSchema>;
