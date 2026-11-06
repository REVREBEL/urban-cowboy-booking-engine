import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";

const read = (path: string) =>
  readFileSync(new URL(`../src/${path}`, import.meta.url), "utf8");

test("production rate actions render named slots through the shared Button", () => {
  const tray = read("components/rates/ProductionRateTray.tsx");
  const replacement = read("components/rates/FigmaRateComponents.tsx");
  const source = tray + "\n" + replacement;
  assert.match(source, /import \{ Button \} from ["']@\/components\/ui\/Button["']/);
  assert.match(tray, /type RateActionSlot =/);
  assert.match(tray, /data-slot=\{slot\}/);
  assert.match(tray, /<FigmaRateCard/);
  assert.match(tray, /<FigmaRateDetailPopup/);
  assert.match(replacement, /<FigmaPolicyTimeline/);
  assert.match(source, /<Button\b/);
  assert.doesNotMatch(source, /<button\b/);
  for (const slot of ["change-room", "details", "select", "close-details", "browse-rooms"]) {
    assert.ok(source.includes(`slot="${slot}"`), `Missing shared-button rate action slot: ${slot}`);
  }
});

test("production rate palette derives from global color tokens rather than hardcoded swatches", () => {
  const css = read("styles/RateCard.css");
  const production = css.slice(css.indexOf("/* ---------- Production rate selection"));
  assert.match(production, /--rc-paper: var\(--paper\)/);
  assert.match(production, /--rc-free: var\(--lake-forest-fade\)/);
  assert.match(production, /--rc-kept: var\(--copper\)/);
  assert.match(production, /--rc-locked: var\(--oxblood\)/);
  assert.match(production, /\.rc-production \.rc-action-primary/);
  assert.doesNotMatch(production, /#[0-9a-fA-F]{3,8}\b/);
  assert.doesNotMatch(production, /\.rc-production \.rc-book/);
});
