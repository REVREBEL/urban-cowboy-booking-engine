export const PREFERENCE_IDS = [
  "connection-with-nature",
  "indoor-sanctuaries",
  "minimal-distractions",
  "scenic-mountain-views",
  "simple-comforts",
  "spaces-for-connection",
  "spaces-to-gather",
  "your-own-hideaway",
] as const;

export type PreferenceId = (typeof PREFERENCE_IDS)[number];

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
