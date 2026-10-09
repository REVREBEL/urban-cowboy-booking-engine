export interface RoomTypeCmsReview {
  roomTypeId: string;
  quote: string;
  reviewer: string | null;
  source: string | null;
  sourceUrl: string | null;
  reviewDate: string | null;
}

export type RoomTypeCmsReviewMap = Record<string, RoomTypeCmsReview>;

export interface RoomTypeCmsDescription {
  roomTypeId: string;
  shortDescription: string | null;
  longDescription: string | null;
}

export type RoomTypeCmsDescriptionMap = Record<string, RoomTypeCmsDescription>;
