import type { RoomTypeGroupKey } from "./accommodations";

export interface BuildingPolicyCms {
  id: string;
  name: string;
  slug: string | null;
}

export interface BuildingCms {
  id: string;
  groupKey: RoomTypeGroupKey;
  name: string;
  slug: string;
  subheading: string | null;
  shortDescription: string | null;
  featureBenefits: string | null;
  policy: BuildingPolicyCms[];
}

export type BuildingCmsMap = Partial<Record<RoomTypeGroupKey, BuildingCms>>;
