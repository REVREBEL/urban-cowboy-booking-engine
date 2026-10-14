import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";

const source = (name: string) => readFileSync(new URL(`../src/${name}`, import.meta.url), "utf8");

test("Photo chooses its own entire journey, not just an alternate card results component", () => {
  const app = source("App.tsx");
  assert.match(app, /const photoJourney = layout === "photo"/);
  assert.match(app, /photoJourney && <PhotoJourneyHeader\s*\/>/);
  assert.match(app, /photoJourney && step === "dates" \? <PhotoArrival/);
  assert.match(app, /photoJourney && step === "rates" \? <PhotoRateStep/);
  assert.match(app, /photoJourney && step === "extras" \? <Extras photoMode/);
  assert.match(app, /photoJourney && step === "guest" \? <PhotoReviewGuest/);
  assert.match(app, /!photoJourney && <BookingHeader/);
});

test("Photo journey retains Lovable arrival, journal and its five-stage navigation", () => {
  const arrival = source("journey/PhotoArrival.tsx");
  const journal = source("journey/PhotoJournal.tsx");
  const header = source("journey/PhotoJourneyHeader.tsx");
  assert.match(arrival, /Come for the soak\. Stay for the woods/);
  assert.match(arrival, /Match me with a room/);
  assert.match(arrival, /Browse every room/);
  assert.match(journal, /What brings you to the mountains/);
  assert.match(journal, /What would make it perfect/);
  for (const label of ["Dates", "Room", "Rate", "Extras", "Review"]) {
    assert.ok(header.includes(`label: "${label}"`));
  }
});

test("Photo room browser preserves original filters, mobile sheet and photo-index switch", () => {
  const rooms = source("journey/PhotoRooms.tsx");
  assert.match(rooms, /j-room-filters/);
  assert.match(rooms, /sheetOpen/);
  assert.match(rooms, /buildingStrip/);
  assert.match(rooms, /Full photos/);
  assert.match(rooms, /Index/);
  assert.match(rooms, /RoomPhotoTour/);
  assert.match(rooms, /toPhotoTourRoom\(source, imageBaseUrl, photoGalleryForRoom\(source.roomTypeId, galleries\), photoSource, cmsAmenities\[studioEditorialRoomTypeId\(source.roomTypeId\)\] \?\? \[\]\)/);
  assert.doesNotMatch(rooms, /JOURNEY_ROOMS/);
});

test("Studio switches between independent starts instead of retaining the previous layout's step", () => {
  const controller = source("studio/StudioController.tsx");
  assert.match(controller, /url\.searchParams\.delete\("photoPath"\)/);
  assert.match(controller, /booking\.resetAll\(\)/);
});

test("Results does not include retired photo tour branches", () => {
  const results = source("steps/Results.tsx");
  assert.match(results, /<PhotoRooms/);
  assert.match(results, /<BuildingExperienceList/);
  assert.doesNotMatch(results, /<PhotoJourneyHeader/);
  assert.doesNotMatch(results, /photoRooms\.map\(/);
  assert.doesNotMatch(results, /<RoomPhotoTour/);
  assert.doesNotMatch(results, /tourDetailsId/);
});

test("Photo Journal matches center beside image selections and labels keep a dark gradient", () => {
  const journal = source("journey/PhotoJournal.tsx");
  assert.match(journal, /page === 0 \? "self-center" : "self-start"/);
  assert.match(journal, /colorScheme="paper" size="small"/);
  assert.match(journal, /linear-gradient\(to top, rgba\(15, 18, 16, 0\.92\)/);
  assert.match(journal, /pointer-events-none absolute inset-0/);
  assert.match(journal, /absolute inset-x-0 bottom-0 z-10/);
});

test("Photo rate cards expose reusable detail panels with the policy timeline", () => {
  const rates = source("journey/PhotoRateStep.tsx");
  assert.match(rates, />\s*Details\s*</);
  assert.match(rates, /aria-haspopup="dialog"/);
  assert.match(rates, /<RateOfferSidePanel/);
  assert.match(rates, /<PolicyDisplay/);
  assert.match(rates, /orientation="horizontal"/);
  assert.match(rates, /freeCancelDate && nonRefundableDate/);
  assert.match(rates, /event\.key === "Escape"/);
});
