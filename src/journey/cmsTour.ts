import { cmsPhotoKey } from "../lib/cmsPhotoHotspots.ts";
import type { CmsPhotoHotspotMap, CmsRoomAmenity } from "../types/photo-hotspot-cms.ts";
import type { PhotoHighlight } from "./tour.ts";

/**
 * Hotspots belong to the exact photograph, but are visible only when the
 * guest's room type actually references that Amenity in Webflow.
 */
export function cmsHighlightsForPhoto(
  imageUrl: string,
  amenities: readonly CmsRoomAmenity[],
  hotspots: CmsPhotoHotspotMap,
): PhotoHighlight[] {
  const key = cmsPhotoKey(imageUrl);
  if (!key) return [];
  const byId = new Map(amenities.map((amenity) => [amenity.id, amenity]));
  return (hotspots[key] ?? []).flatMap((hotspot) => {
    const amenity = byId.get(hotspot.amenityId);
    if (!amenity) return [];
    return [{
      id: hotspot.id,
      amenityId: amenity.id,
      x: hotspot.x,
      y: hotspot.y,
      title: amenity.shortName,
      note: amenity.shortDescription ?? amenity.name,
      longNote: amenity.longDescription ?? amenity.shortDescription ?? amenity.name,
      icon: "seat" as const,
      iconPath: amenity.iconPath,
    }];
  });
}
