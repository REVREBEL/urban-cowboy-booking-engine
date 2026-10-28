/** Published editorial content; never a source of Mews availability or room eligibility. */
export interface CmsRoomAmenity {
  id: string;
  name: string;
  shortName: string;
  shortDescription: string | null;
  longDescription: string | null;
  /** Validated site-local icon URL (public/assets/icons/...), never raw SVG markup. */
  iconPath: string | null;
  /** Webflow Image field takes precedence over the local SVG fallback. */
  imageUrl?: string | null;
}

export type RoomTypeCmsAmenityMap = Record<string, CmsRoomAmenity[]>;

export interface CmsPhotoHotspot {
  id: string;
  amenityId: string;
  /** Canonical photo identity: file:<webflow-asset-id> or url:<normalized-url>. */
  photoKey: string;
  x: number;
  y: number;
  order: number;
}

export type CmsPhotoHotspotMap = Record<string, CmsPhotoHotspot[]>;
