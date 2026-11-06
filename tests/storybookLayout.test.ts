import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";

const read = (path: string) => readFileSync(new URL(path, import.meta.url), "utf8");

test("Canvas and Docs use one max-width setting", () => {
  const layout = read("../.storybook/StorybookLayout.tsx");
  const preview = read("../.storybook/preview.tsx");
  const head = read("../.storybook/preview-head.html");

  assert.match(layout, /STORY_MAX_WIDTH = 1600/);
  assert.match(layout, /maxWidth: STORY_MAX_WIDTH/);
  assert.match(layout, /style\.setProperty\(/);
  assert.match(layout, /STORY_MAX_WIDTH_CSS_VAR/);
  assert.match(preview, /applyStorybookWidthToken\(\)/);
  assert.match(head, /max-width: var\(--storybook-story-max-width, 100%\)/);
  assert.doesNotMatch(head, /max-width: 1600px/);
});
