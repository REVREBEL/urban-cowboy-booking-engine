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
