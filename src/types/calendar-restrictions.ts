/** Public calendar hints. They are never authoritative booking constraints. */
export type RestrictionType = "ClosedToArrival" | "ClosedToDeparture" | "ClosedToStay";

export interface RestrictionAdvisory {
  type: RestrictionType;
  /** Null means the Mews restriction has no explicit category scope. */
  categoryId: string | null;
  exactRateId: string | null;
  baseRateId: string | null;
  rateGroupId: string | null;
  /** A Mews exception that may make the closure inapplicable, not a global minimum. */
  exceptionMinNights?: number;
  exceptionMaxNights?: number;
  /** Advance, price, or reservation-count exceptions require live validation. */
  hasOtherExceptions: boolean;
}
