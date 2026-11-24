// COW-70 stage 2: docs demos must not weaken component accessibility.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const read = (path: string) => readFileSync(new URL(path, import.meta.url), "utf8");

test("travel party demo uses the accessible group, not orphan radio buttons", () => {
  const story = read("../docs-app/components/travel-party-button.story.tsx");
  const component = read("../src/components/booking/discovery/FindYourStayTravelPartyButton.tsx");
  assert.match(story, /<TravelPartyGroup/);
  assert.doesNotMatch(story, /role="radio"/);
  assert.match(component, /role="radiogroup"/);
  assert.match(component, /aria-label="Select your travel party"/);
});

test("docs tables align left and story blocks keep a 1rem vertical rhythm", () => {
  const css = read("../docs-app/app/globals.css");
  assert.match(css, /\.prose table th[\s\S]*?text-align: left/);
  assert.match(css, /\.docs-story-frame \{[\s\S]*?gap: 1rem/);
  assert.match(css, /article#nd-page \.prose\.flex-1 \{[\s\S]*?gap: 1rem/);
});

test("docs export publishes and prefixes root-relative component icons", () => {
  const prepare = read("../scripts/fumadocs/prepare-docs-assets.mjs");
  const finalize = read("../scripts/fumadocs/finalize-docs-assets.mjs");
  const build = read("../package.json");
  assert.match(prepare, /assets\/icons\/detailed\/dog_friendly\.svg/);
  assert.match(prepare, /assets\/icons\/badges\/features\/dog_friendly\.svg/);
  assert.match(finalize, /basePath/);
  assert.match(finalize, /\/assets\//);
  assert.match(build, /prepare-docs-assets\.mjs/);
  assert.match(build, /finalize-docs-assets\.mjs/);
});
