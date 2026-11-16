// Stable media identity contract for Urban Cowboy.
//
// Squarespace owns file storage/transforms; D1 owns editorial identity. Original
// file, CDN public_id and URLs are never primary keys. Hotspots reference the
// stable media_asset_id + version, never a URL.

export interface MediaAsset {
  id: string; // stable master media ID (D1 PK)
  tenantId: string;
  locationId?: string | null;
  kind: "image" | "video" | "document";
  originalFilename?: string | null;
  squarespaceAssetId?: string | null; // CDN identity, not PK
  squarespaceUrl?: string | null;
  width?: number | null;
  height?: number | null;
  altText?: string | null;
  currentVersion: number;
}

export interface MediaVersion {
  id: string;
  mediaAssetId: string;
  version: number;
  squarespaceAssetId: string;
  squarespaceUrl: string;
  width?: number | null;
  height?: number | null;
}

export interface FocusHotspot {
  id: string;
  mediaAssetId: string;
  mediaVersion: number;
  x: number; // 0..1 normalized
  y: number; // 0..1 normalized
  amenityId?: string | null;
  label?: string | null;
}

export function squarespaceTransformUrl(
  publicId: string,
  transform: string,
): string {
  // Cloudinary URL shape: .../image/upload/<transform>/<publicId>
  return `https://${transform}/${publicId}`;
}