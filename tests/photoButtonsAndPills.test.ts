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

test("live RoomPhotoTour uses FocusAmenity and retires the legacy hotspot", () => {
  const tour = read("journey/RoomPhotoTour.tsx");
  const focus = read("components/rooms/FocusAmenity.tsx");
  const stylesheet = read("styles/room-photo-tour.css");

  assert.match(tour, /import \{ FocusAmenity \} from ['"]@\/components\/rooms\/FocusAmenity['"]/);
  assert.match(tour, /<FocusAmenity\s+count=\{pinIndex \+ 1\}/);
  assert.match(tour, /zIndex: activePin === pin\.id \? 50 : 1/);
  assert.match(tour, /cardSide=\{pin\.x > 55 \? "left" : "right"\}/);
  assert.match(focus, /className=\{`pointer-events-auto absolute z-50/);
  assert.match(tour, /iconPath=\{pin\.iconPath\}/);
  assert.match(tour, /active=\{activePin === pin\.id\}/);
  assert.match(tour, /state=\{activePin !== null && activePin !== pin\.id \? "Inactive" : undefined\}/);
  assert.doesNotMatch(tour, /is-muted/);
  assert.match(tour, /selectAmenity\(willOpen \? id : null\)/);
  assert.match(tour, /setAmenityExiting\(true\)/);
  assert.match(tour, /pendingPin\.current = next/);
  assert.match(tour, /const unseenAmenities = amenities\.filter/);
  assert.match(tour, /import \{ SideFocusAmenityBar \} from ['"]@\/components\/rooms\/SideFocusAmenityBar['"]/);
  assert.match(tour, /createPortal\(\s*<SideFocusAmenityBar amenities=\{sideAmenities\}/);
  assert.match(tour, /description: amenity\.longNote \?\? amenity\.note/);
  assert.doesNotMatch(tour, /j-other-amenities/);
  assert.doesNotMatch(tour, /FeatureFocus|<FeatureFocus/);
  assert.match(focus, /<button\b/);
  assert.match(focus, /<AmenityIcons\b/);
  assert.match(focus, /aria-pressed=\{currentState === "Active"\}/);
  assert.doesNotMatch(stylesheet, /\.j-focus(?:[\s.{:#]|$)|--ff-size/);
  assert.match(stylesheet, /\.j-cms-icon/);
});

test("SideFocusAmenityBar uses focus states, a four-item viewport, and aligned selection", () => {
  const source = read("components/rooms/SideFocusAmenityBar.tsx");

  assert.match(source, /seenIds\.has\(item\.id\) \|\| seenTitles\.has\(normalizedTitle\)/);
  assert.match(source, /fixed top-1\/2 left-8/);
  assert.match(source, /h-\[clamp\(224px,calc\(100dvh-128px\),528px\)\]/);
  assert.match(source, /first:mt-11/);
  assert.doesNotMatch(source, /pb-4 pt-11/);
  assert.match(source, /scrollIntoView\(/);
  assert.match(source, /selectedIndex >= 0 \? uniqueAmenities\[selectedIndex\] : undefined/);
  assert.match(source, /setSelectedId\(\(currentId\) => currentId === id \? null : id\)/);
  assert.match(source, /if \(!value\) setSelectedId\(null\)/);
  assert.match(source, /onScroll=\{updateCardPosition\}/);
  assert.match(source, /"focus-active" : "focus-default hover:focus-hover"/);
  assert.match(source, /style=\{\{ top: cardCenter \}\}/);
  assert.match(source, /Math\.min\(maximumCenter, Math\.max\(minimumCenter, desiredCenter\)\)/);
  assert.doesNotMatch(source, /state="Active" tone="faded"/);
});

test("native button detector is case-sensitive for JSX components", () => {
  const nativeButton = /<button\b/;
  assert.match('<button type="button">Click</button>', nativeButton);
  assert.doesNotMatch('<Button type="button">Click</Button>', nativeButton);
  assert.doesNotMatch('<PillButton type="button">Click</PillButton>', nativeButton);
});

test("Pill shares the Button palette and interactive PillButton delegates to Button", () => {
  const pill = read("components/ui/Pill.tsx");
  const button = read("components/ui/Button.tsx");
  assert.match(pill, /COLOR_PALETTE/);
  assert.match(pill, /type ButtonColor/);
  assert.match(pill, /type ButtonStyle/);
  assert.match(pill, /<Button\s/);
  assert.match(pill, /aria-pressed/);
  assert.match(pill, /export function Pill\(/);
  assert.match(pill, /export const PillButton/);
  assert.match(button, /export const COLOR_PALETTE/);
});


test("Pill and PillButton share the four CSS size utilities without locking visual padding", () => {
  const source = read("components/ui/Pill.tsx");
  const styles = read("styles/utilities.css");
  for (const size of ["xs", "sm", "default", "lg"]) {
    const rule = styles.split("@utility pill-" + size + " {")[1]?.split("}")[0];
    assert.ok(rule, "Missing pill-" + size + " utility");
    assert.match(rule, /font-size:\s*[^;]+;/, "Pill size must define its font size");
    assert.match(rule, /padding:\s*[^;]+;/, "Pill size must define its spacing");
  }
  assert.match(source, /PILL_SIZE_CLASSES\[size\]/);
  assert.equal(source.split("PILL_SIZE_CLASSES[size]").length - 1, 2);
  assert.doesNotMatch(source, /PILL_SIZES/);
});

test("control palette utilities use runtime foundation variables and filled controls have borders", () => {
  const css = read("styles/utilities.css");
  const colors = css.split("@utility control-color-").slice(1);
  assert.equal(colors.length, 14, "All fourteen control palettes remain present");
  for (const block of colors) {
    const body = block.slice(block.indexOf("{") + 1, block.indexOf("}"));
    for (const token of ["--bg", "--fg", "--border"]) {
      assert.match(body, new RegExp(token + ": var\\(--(?!color-)[a-z0-9-]+\\);"), token + " must reference a runtime foundation variable");
    }
  }
  const filled = css.split("@utility control-filled {")[1]?.split("}")[0] ?? "";
  assert.match(filled, /border-width:\s*2px/);
  assert.match(filled, /border-style:\s*solid/);
});

test("Pill stories cover all Button palette colors, variants and toggles", () => {
  const story = read("stories/components/ui/Pill.stories.tsx");
  const storybook = readFileSync(new URL("../.storybook/main.ts", import.meta.url), "utf8");
  assert.match(storybook, /src\/stories\/components\/\*\*\/\*\.stories/);
  assert.match(story, /Object\.keys\(COLOR_PALETTE\)/);
  for (const name of ["Playground", "AllColors", "Sizes", "Selectable", "ComparedWithButtons"]) {
    assert.ok(story.includes(`export const ${name}`), `Story ${name} missing`);
  }
});

test("Button and Pill share a single color prop and border/clickable styling", () => {
  const button = read("components/ui/Button.tsx");
  const pill = read("components/ui/Pill.tsx");
  const css = read("styles/utilities.css");
  for (const source of [button, pill]) {
    assert.match(source, /colorScheme\?: ButtonColor/);
    assert.doesNotMatch(source, /^\s*color\?: ButtonColor;/m);
    assert.match(source, /borderColor\?: ControlBorderColor/);
    assert.match(source, /clickable\?: boolean/);
    assert.match(source, /CONTROL_BORDER_CLASSES\[borderColor\]/);
  }
  for (const [name, token] of [["background", "bg"], ["foreground", "fg"], ["faded", "border"]]) {
    assert.ok(css.includes("@utility control-border-" + name + " { --selected-control-border: var(--" + token + "); }"));
  }
  assert.ok(css.includes('not([data-clickable="false"])'));
  assert.match(button, /data-clickable=\{clickable\}/);
  assert.match(pill, /data-clickable=\{clickable\}/);
});

