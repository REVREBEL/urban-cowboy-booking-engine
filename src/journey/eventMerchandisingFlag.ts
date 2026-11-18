// COW-40 optional room-journey merchandising flag.
//
// The flag is off by default so no guest-facing behavior changes until the
// event schedule has been verified against the live Webflow calendar.

export function eventsMerchandisingEnabled(value: string | undefined): boolean {
  return value === "true";
}
