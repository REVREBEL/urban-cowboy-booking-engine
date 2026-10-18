import type {
  CmsPhotoHotspot, CmsPhotoHotspotMap, CmsRoomAmenity, RoomTypeCmsAmenityMap,
} from "../../src/types/photo-hotspot-cms.ts";
import { cmsIconUrl, cmsPhotoKey } from "../../src/lib/cmsPhotoHotspots.ts";

export interface WebflowCmsItem {
  id?: unknown;
  isArchived?: unknown;
  isDraft?: unknown;
  fieldData?: Record<string, unknown>;
}

const text = (value: unknown) => typeof value === "string" ? value.trim() : "";
const published = (item: WebflowCmsItem) =>
  item.isDraft !== true && item.isArchived !== true && item.fieldData?.active !== false;
const refs = (value: unknown): string[] =>
  Array.isArray(value) ? value.map(text).filter(Boolean) : [];

/** Text and icon are normalized only from published, active CMS Amenities. */
export function normalizePublishedAmenities(items: readonly WebflowCmsItem[]): Map<string, CmsRoomAmenity> {
  const content = new Map<string, CmsRoomAmenity>();
  for (const item of items) {
    if (!published(item)) continue;
    const id = text(item.id);
    const fields = item.fieldData ?? {};
    const name = text(fields.name);
    if (!id || !name) continue;
    const iconPath = cmsIconUrl(text(fields["image-path"]) || (
      text(fields["image-name"]) ? `assets/icons/icons-simple/${text(fields["image-name"])}` : ""
    ));
    content.set(id, {
      id,
      name,
      shortName: text(fields["short-name"]) || name,
      shortDescription: text(fields["short-description"]) || null,
      longDescription: text(fields["long-description"]) || null,
      iconPath,
    });
  }
  return content;
}

export function normalizeRoomAmenityMap(
  roomItems: readonly WebflowCmsItem[],
  amenities: ReadonlyMap<string, CmsRoomAmenity>,
): RoomTypeCmsAmenityMap {
  const result: RoomTypeCmsAmenityMap = {};
  for (const item of roomItems) {
    if (!published(item)) continue;
    const fields = item.fieldData ?? {};
    const roomTypeId = text(fields["mews-room-type-id"]);
    if (!roomTypeId) continue;
    // Room membership always comes from the multi-reference field. Ordering is
    // optional and cannot introduce amenities not assigned to this room type.
    const assignedIds = [...new Set(refs(fields["features-amenities"]))];
    const requestedOrder = text(fields["amenity-display-order"])
      .split(",").map((id) => id.trim()).filter(Boolean);
    const position = new Map<string, number>();
    for (const id of requestedOrder) {
      if (!position.has(id)) position.set(id, position.size);
    }
    result[roomTypeId] = assignedIds
      .map((id) => amenities.get(id))
      .filter((amenity): amenity is CmsRoomAmenity => Boolean(amenity))
      .sort((a, b) => (position.get(a.id) ?? Infinity) - (position.get(b.id) ?? Infinity));
  }
  return result;
}

/** Pins are published only when the referenced Amenity exists and its coordinates are valid. */
export function normalizePhotoHotspots(
  items: readonly WebflowCmsItem[],
  amenities: ReadonlyMap<string, CmsRoomAmenity>,
): CmsPhotoHotspotMap {
  const result: CmsPhotoHotspotMap = {};
  for (const item of items) {
    if (!published(item)) continue;
    const fields = item.fieldData ?? {};
    const id = text(item.id);
    const amenityId = text(fields.amenity);
    const xRaw = fields["x-percent"];
    const yRaw = fields["y-percent"];
    const x = typeof xRaw === "number" ? xRaw : NaN;
    const y = typeof yRaw === "number" ? yRaw : NaN;
    const photoKey = cmsPhotoKey(text(fields["photo-file-id"]) || text(fields["photo-url"]));
    if (!id || !amenities.has(amenityId) || !photoKey ||
        !Number.isFinite(x) || !Number.isFinite(y) || x < 0 || x > 100 || y < 0 || y > 100) continue;
    const rawOrder = fields["display-order"];
    const order = typeof rawOrder === "number" && Number.isFinite(rawOrder) ? rawOrder : 9999;
    const pin: CmsPhotoHotspot = { id, amenityId, photoKey, x, y, order };
    (result[photoKey] ??= []).push(pin);
  }
  for (const pins of Object.values(result)) pins.sort((a, b) => a.order - b.order || a.id.localeCompare(b.id));
  return result;
}
