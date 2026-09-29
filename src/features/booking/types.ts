export type PreferenceId =
  | "iconic-tub"
  | "bathe-outside"
  | "my-own-place"
  | "near-everything"
  | "simple-cozy"
  | "mountain-views"
  | "bringing-my-people";

export type MatchRoomSummary = {
  name: string;
  headline: string;
  blurb: string;
  features: { label: string }[];
};

export type StaySummaryData = {
  roomName?: string | null;
  rateName?: string | null;
  arrival: string;
  departure: string;
  adults: number;
  children: number;
  pets?: boolean;
  nightlyAmount?: number | null;
  totalAmount?: number | null;
  currency?: string;
};
