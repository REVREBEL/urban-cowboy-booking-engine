#!/usr/bin/env node
// COW-69 inventory of existing CSF stories and their planned Fumadocs pages.
import { mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join, relative } from "node:path";

const root = process.cwd();
const storiesRoot = join(root, "src", "stories");

function walk(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name);
    return entry.isDirectory() ? walk(path) : [path];
  });
}

const CATEGORY_LABELS = {
  booking: "Booking steps",
  brand: "Brand",
  dev: "Developer tooling",
  feedback: "Feedback",
  forms: "Forms",
  icons: "Icons",
  journey: "Photo Journey",
  layout: "Layout",
  media: "Media",
  rates: "Rates",
  rooms: "Rooms",
  search: "Search and header",
  ui: "Shared controls",
};

const stories = walk(storiesRoot)
  .filter((path) => /\.stories\.(tsx?|jsx?)$/.test(path))
  .sort()
  .map((path) => {
    const source = readFileSync(path, "utf8");
    const rel = relative(root, path);
    const segments = relative(storiesRoot, path).split("/");
    const group = segments[0] ?? "uncategorized";
    const categoryKey = group === "components" ? (segments[1] ?? "uncategorized") : group;
    const title = /title:\s*["']([^"']+)["']/.exec(source)?.[1] ?? segments.join("/");
    const exports = [...source.matchAll(/export const (\w+)/g)].map((match) => match[1]);
    const skip = categoryKey === "dev" || categoryKey === "examples";
    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    const rationale = categoryKey === "dev"
      ? "Development-only tooling. Not part of the public component library."
      : categoryKey === "examples"
        ? "Storybook scaffold or story-only harness, not a canonical component. Replaced by component stories or existing interaction tests."
        : "Convert CSF story exports to @fumadocs/story examples with real component imports.";
    return {
      source: rel,
      title,
      categoryKey,
      category: CATEGORY_LABELS[categoryKey] ?? (categoryKey === "examples" ? "Legacy examples" : categoryKey),
      exportNames: exports,
      newDoc: skip ? null : `docs-app/content/docs/components/${categoryKey}/${slug}.mdx`,
      status: skip ? "skipped" : "planned",
      rationale,
    };
  });

const byCategory = Object.create(null);
for (const story of stories) {
  const entry = byCategory[story.categoryKey] ??= {
    category: story.category,
    stories: 0,
    examples: 0,
    skipped: 0,
  };
  entry.stories += 1;
  entry.examples += story.exportNames.length;
  entry.skipped += story.status === "skipped" ? 1 : 0;
}

const manifest = {
  generatedFrom: "src/stories",
  totalStories: stories.length,
  totalExamples: stories.reduce((sum, story) => sum + story.exportNames.length, 0),
  skippedStories: stories.filter((story) => story.status === "skipped").length,
  byCategory,
  stories,
};

const out = join(root, "docs", "component-library", "inventory.json");
mkdirSync(join(root, "docs", "component-library"), { recursive: true });
writeFileSync(out, JSON.stringify(manifest, null, 2) + "\n");
console.log(`${stories.length} stories, ${manifest.totalExamples} examples, ${manifest.skippedStories} skipped -> ${relative(root, out)}`);
