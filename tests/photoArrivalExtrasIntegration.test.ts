import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";

const file = (path: string) =>
  readFileSync(new URL(`../src/${path}`, import.meta.url), "utf8");

test("Photo arrival uses one full-height image backdrop and gradient behind bottom-anchored booking content", () => {
  const arrival = file("journey/PhotoArrival.tsx");
  assert.match(arrival, /relative isolate flex min-h-dvh flex-col justify-end bg-smoke/);
  assert.match(arrival, /pointer-events-none absolute inset-0 z-0 m-0 h-full w-full overflow-hidden/);
  assert.match(arrival, /absolute inset-0 h-full w-full object-cover object-center/);
  assert.match(arrival, /absolute inset-0 bg-linear-to-t from-smoke via-smoke\/65 to-transparent/);
  assert.doesNotMatch(arrival, /min-h-\[clamp\(300px,32vw,420px\)\]/);
  assert.match(arrival, /relative z-10 mx-auto w-full max-w-\[1600px\]/);
  assert.match(arrival, /<SearchBarExpanded/);
  assert.match(arrival, /Match me with a room/);
  assert.match(arrival, /Browse every room/);
});

test("Photo add-ons use the existing card and smart customizer modal rather than duplicate inline cards", () => {
  const extras = file("journey/PhotoExtrasStep.tsx");
  const card = file("components/booking/extras/AddonCard.tsx");
  const modal = file("components/booking/extras/AddonCustomizerModal.tsx");
  const owner = file("steps/Extras.tsx");

  assert.match(extras, /import \{ AddonCard \} from/);
  assert.match(extras, /<AddonCard/);
  assert.match(extras, /onToggle=\{\(\) => props\.onToggle\(product\)\}/);
  assert.match(extras, /onOpenCustomize=\{locked \? undefined : \(\) => setEditing\(product\)\}/);
  assert.match(extras, /<AddonCustomizerModal/);
  assert.match(extras, /currentPreference=\{props\.preferences\[editing\.displayId\]\}/);
  assert.match(extras, /onSave=\{\(value\) => \{ props\.onSavePreference\(editing, value\)/);
  assert.match(extras, /locked=\{locked\}/);
  assert.match(owner, /guestsCount=\{guestsCount\}[\s\S]*?onToggle=\{toggleDisplayProduct\}/);
  assert.match(card, /const add = \(\) => \{/);
  assert.match(card, /onOpenCustomize\?\.\(\)/);
  assert.match(modal, /normalizeAddOnPreference/);
  assert.doesNotMatch(extras, /const timingOptions =/);
});
