import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";

const read = (path: string) =>
  readFileSync(new URL(`../src/${path}`, import.meta.url), "utf8");

const photoComponents = [
  "journey/PhotoArrival.tsx",
  "journey/PhotoJournal.tsx",
  "journey/PhotoJourneyHeader.tsx",
  "journey/PhotoRooms.tsx",
  "journey/RoomPhotoTour.tsx",
  "journey/PhotoRateStep.tsx",
  "journey/PhotoExtrasStep.tsx",
  "journey/PhotoReviewGuest.tsx",
  "components/rooms/FeatureFocus.tsx",
];

test("Photo Engine actions use the shared Button or its PillButton composition", () => {
  for (const file of photoComponents) {
    const source = read(file);
    // JSX component names are case-sensitive: <Button> is not a native <button>.
    assert.doesNotMatch(source, /<button\b/, `Unshared native button in ${file}`);
    assert.match(source, /<Button\b|<PillButton\b/, `Missing shared button in ${file}`);
    const count = (source.match(/<Button\b/g) ?? []).length;
    const closing = (source.match(/<\/Button>/g) ?? []).length;
    const selfClosing = (source.match(/<Button\b[^>]*\/>/g) ?? []).length;
    assert.ok(count >= closing, `Extra Button close in ${file}`);
    assert.ok(count <= closing + selfClosing + 1, `Possible unmatched Button in ${file}`);
  }
});

test("native button detector is case-sensitive for JSX components", () => {
  const nativeButton = /<button\\b/;
  assert.match('<button type="button">Click</button>', nativeButton);
  assert.doesNotMatch('<Button type="button">Click</Button>', nativeButton);
  assert.doesNotMatch('<PillButton type="button">Click</PillButton>', nativeButton);
});

test("Pill shares the Button palette and interactive PillButton delegates to Button", () => {
  const pill = read("components/ui/pill.tsx");
  const button = read("components/ui/button.tsx");
  assert.match(pill, /COLOR_PALETTE/);
  assert.match(pill, /type ButtonColor/);
  assert.match(pill, /type ButtonStyle/);
  assert.match(pill, /<Button\s/);
  assert.match(pill, /aria-pressed/);
  assert.match(pill, /export function Pill\(/);
  assert.match(pill, /export const PillButton/);
  assert.match(button, /export const COLOR_PALETTE/);
});

test("Pill stories cover all Button palette colors, variants and toggles", () => {
  const story = read("stories/components/Pill.stories.tsx");
  const storybook = readFileSync(new URL("../.storybook/main.ts", import.meta.url), "utf8");
  assert.match(storybook, /src\/stories\/components\/\*\*\/\*\.stories/);
  assert.match(story, /Object\.keys\(COLOR_PALETTE\)/);
  for (const name of ["Playground", "AllColors", "Sizes", "Selectable", "ComparedWithButtons"]) {
    assert.ok(story.includes(`export const ${name}`), `Story ${name} missing`);
  }
});
