export interface RoomTypeCmsReview {
  roomTypeId: string;
  quote: string;
  reviewer: string | null;
  source: string | null;
  sourceUrl: string | null;
  reviewDate: string | null;
}

export type RoomTypeCmsReviewMap = Record<string, RoomTypeCmsReview>;
