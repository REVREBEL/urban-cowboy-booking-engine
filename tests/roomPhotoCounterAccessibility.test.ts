import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";

const source = readFileSync(new URL("../src/components/rooms/RoomsListCard.tsx", import.meta.url), "utf8");
const modalSource = readFileSync(new URL("../src/components/rooms/RoomDetailModal.tsx", import.meta.url), "utf8");

test("room photo counter announces meaningful photo position", () => {
  assert.match(source, /role="status" aria-live="polite" aria-atomic="true"/);
  assert.match(source, /<span aria-hidden="true">\{activeImageIndex \+ 1\} \/ \{imageUrls\.length\}<\/span>/);
  assert.match(source, /<span className="sr-only">Photo \{activeImageIndex \+ 1\} of \{imageUrls\.length\}<\/span>/);
});

test("room detail modal photo counter announces photo position to screen readers", () => {
  // Validate the counter's text and ARIA attributes together, not anywhere in the file.
  assert.match(
    modalSource,
    /<div\b(?=[^>]*\brole="status")(?=[^>]*\baria-live="polite")(?=[^>]*\baria-atomic="true")[^>]*>\s*Photo \{activeImageIndex \+ 1\} of \{room\.images\.length\}\s*<\/div>/,
  );
});
