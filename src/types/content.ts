export type ContentStatus = "draft" | "published" | "archived";

export interface ContentItem {
  id: string;
  tenantId: string;
  locationId?: string | null;
  kind: string;
  slug: string;
  status: ContentStatus;
  currentRevisionId?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface D1Event {
  id: string;
  tenantId: string;
  locationId?: string | null;
  title: string;
  description?: string | null;
  venue?: string | null;
  timeZone: string;
  startsAt: string;
  endsAt?: string | null;
  recurrenceRule?: string | null;
  capacity?: number | null;
  displayFlag: boolean;
  mediaAssetId?: string | null;
}

export interface D1AddOn {
  id: string;
  tenantId: string;
  locationId?: string | null;
  name: string;
  description?: string | null;
  mewsProductId?: string | null;
  iconMediaAssetId?: string | null;
  quantityCap?: number | null;
  sortOrder: number;
  status: ContentStatus;
}

export interface D1Offer {
  id: string;
  tenantId: string;
  locationId?: string | null;
  name: string;
  headline?: string | null;
  description?: string | null;
  rateProductId?: string | null;
  ctaLabel?: string | null;
  startsAt?: string | null;
  endsAt?: string | null;
  memberOnly: boolean;
  status: ContentStatus;
}

export interface D1Upgrade {
  id: string;
  tenantId: string;
  locationId?: string | null;
  name: string;
  description?: string | null;
  priority: number;
  audienceRule?: string | null;
  roomRule?: string | null;
  mediaAssetId?: string | null;
  status: ContentStatus;
}