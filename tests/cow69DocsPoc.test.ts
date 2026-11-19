// COW-69 docs PoC: inventory, static-export config and real-component import contract.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { resolveDocsBasePath } from "../scripts/fumadocs/base-path.mjs";
import { contrastForTokens } from "../scripts/fumadocs/contrast.mjs";

const root = new URL("../", import.meta.url);
const read = (path: string) => readFileSync(new URL(path, root), "utf8");
const inventory = JSON.parse(read("docs/component-library/inventory.json")) as {
  totalStories: number;
  totalExamples: number;
  skippedStories: number;
  byCategory: Record<string, { stories: number }>;
  stories: Array<{ source: string; newDoc: string | null; status: string; rationale: string }>;
};
const nextConfig = read("docs-app/next.config.mjs");
const globalCss = read("docs-app/app/globals.css");
const brandColors = read("src/styles/colors.css");
const source = read("docs-app/source.ts");
const widthToken = read("src/styles/documentation-layout.ts");
const storybookLayout = read(".storybook/StorybookLayout.tsx");
const storyControls = read("docs-app/components/story-controls.tsx");
const pillMdx = read("docs-app/content/docs/components/pill.mdx");
const preferenceMdx = read("docs-app/content/docs/components/preference-icon-button.mdx");
const workflow = read(".github/workflows/docs-pages.yml");
const migrationDoc = read("docs/component-library/fumadocs-migration.md");
const smokeScript = read("scripts/fumadocs/smoke-docs.mjs");

test("inventory maps every story with explicit exclusions", () => {
  assert.equal(inventory.totalStories, 142);
  assert.equal(inventory.totalExamples, 345);
  assert.equal(inventory.skippedStories, 6);
  for (const area of ["booking", "rooms", "rates", "ui", "journey"]) {
    assert.ok(inventory.byCategory[area]?.stories > 0, `${area} has stories`);
  }
  const skipped = inventory.stories.filter((story) => story.status === "skipped");
  assert.ok(skipped.every((story) => story.newDoc === null && story.rationale.length > 20));
  const planned = inventory.stories.filter((story) => story.status === "planned");
  assert.ok(planned.every((story) => story.newDoc?.startsWith("docs-app/content/docs/components/")));
});

test("Fumadocs is configured for static export and subpath builds", () => {
  assert.match(nextConfig, /output: "export"/);
  assert.match(nextConfig, /trailingSlash: true/);
  assert.match(nextConfig, /resolveDocsBasePath\(process\.env, \{ isDev \}\)/);
  assert.match(nextConfig, /basePath,/);
  assert.match(nextConfig, /assetPrefix: basePath/);
  assert.match(nextConfig, /createNextStory/);
  assert.match(nextConfig, /createMDX/);
  assert.match(source, /baseUrl: "\/"/);
});

test("base path resolver covers Pages, custom-domain roots and local dev", () => {
  assert.equal(resolveDocsBasePath({}), "/urban-cowboy-booking-engine");
  assert.equal(resolveDocsBasePath({ DOCS_BASE_PATH: "/custom-path" }), "/custom-path");
  assert.equal(resolveDocsBasePath({ DOCS_BASE_PATH: "/" }), "");
  assert.equal(resolveDocsBasePath({}, { isDev: true }), "");
  assert.match(smokeScript, /resolveDocsBasePath\(\)/);
  assert.match(smokeScript, /static assets are missing base path/);
});

test("Fumadocs theme maps brand color tokens and lays out the desktop sidebar", () => {
  for (const token of [
    "background", "foreground", "card", "card-foreground", "popover",
    "popover-foreground", "muted", "muted-foreground", "accent",
    "accent-foreground", "primary", "primary-foreground", "border", "ring",
  ]) {
    assert.match(globalCss, new RegExp(`--color-fd-${token}:`));
  }
  assert.match(globalCss, /--color-fd-muted-foreground: var\(--lake-forest-200\)/);
  assert.match(globalCss, /\.dark \{/);
  assert.match(globalCss, /--color-fd-muted-foreground: var\(--paper-300\)/);
  assert.match(globalCss, /#nd-docs-layout \{/);
  assert.match(globalCss, /--fd-sidebar-width: 268px/);
  assert.match(globalCss, /--fd-toc-width: 260px/);
});

test("muted foreground meets WCAG AA contrast in both themes", () => {
  const light = contrastForTokens(brandColors, "lake-forest-200", "paper-100");
  const dark = contrastForTokens(brandColors, "paper-300", "smoke-950");
  assert.ok(light >= 4.5, `light muted contrast ${light.toFixed(2)}`);
  assert.ok(dark >= 4.5, `dark muted contrast ${dark.toFixed(2)}`);
});

test("docs and Storybook share one maximum-width token", () => {
  assert.match(widthToken, /STORY_MAX_WIDTH = 1600/);
  assert.match(widthToken, /STORY_MAX_WIDTH_CSS_VAR = "--storybook-story-max-width"/);
  assert.match(storybookLayout, /from "\.\.\/src\/styles\/documentation-layout\.ts"/);
  assert.match(storybookLayout, /export \{ STORY_MAX_WIDTH, STORY_MAX_WIDTH_CSS_VAR \}/);
});

test("PoC stories import real components through client story controls", () => {
  assert.match(storyControls, /from "\.\/pill\.story"/);
  assert.match(storyControls, /from "\.\/preference-icon-button\.story"/);
  assert.match(storyControls, /<pillStory\.WithControl \/>/);
  assert.match(storyControls, /<preferenceIconButtonStory\.WithControl \/>/);
  assert.match(pillMdx, /PillStoryControl/);
  assert.match(preferenceMdx, /PreferenceIconButtonStoryControl/);
  assert.match(preferenceMdx, /docs-only harness/);
});

test("Pages workflow validates PRs and gates publication behind an explicit variable", () => {
  assert.match(workflow, /pull_request:/);
  assert.match(workflow, /fetch-depth: 0/);
  assert.match(workflow, /npm run lint:controls/);
  assert.match(workflow, /npm run docs:build/);
  assert.match(workflow, /npm run docs:smoke/);
  assert.match(workflow, /DOCS_BASE_PATH: \$\{\{ vars\.DOCS_BASE_PATH \|\| '\/urban-cowboy-booking-engine' \}\}/);
  assert.doesNotMatch(workflow, /GITHUB_ENV/);
  assert.match(workflow, /vars\.DOCS_PAGES_ENABLED == 'true'/);
  assert.match(workflow, /steps\.deployment\.outputs\.page_url/);
  assert.doesNotMatch(workflow, /urbancowboy\.github\.io/);
  assert.match(migrationDoc, /public/);
  assert.match(migrationDoc, /explicit opt-in/);
  assert.match(migrationDoc, /No (production|booking-engine or Cloudflare Worker) cutover/);
});
