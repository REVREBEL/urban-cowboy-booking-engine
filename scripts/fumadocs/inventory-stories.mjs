#!/usr/bin/env node
// COW-69 inventory of existing CSF stories and their planned Fumadocs pages.
import { existsSync, mkdirSync, readdirSync, readFileSync, renameSync, writeFileSync } from "node:fs";
import { join, relative } from "node:path";

const root = process.cwd();
const storiesRoot = join(root, "src", "stories");

function walk(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name);
    return entry.isDirectory() ? walk(path) : [path];
  });
}

/** One kebab-case implementation for story slugs, page lookups and planned paths. */
function kebabCase(value) {
  return value
    .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
    .replace(/([A-Z])([A-Z][a-z])/g, "$1-$2")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

/**
 * Explicit source-to-page mapping for every migrated story. Matching by
 * basename alone conflates components with the same name in different folders,
 * so documentation status is keyed on the canonical story source path.
 */
const DOC_PAGE_OVERRIDES = Object.freeze({
  "src/stories/components/ui/Pill.stories.tsx": "docs-app/content/docs/components/pill.mdx",
  "src/stories/components/ui/Button.stories.tsx": "docs-app/content/docs/components/button.mdx",
  "src/stories/components/ui/switch.stories.tsx": "docs-app/content/docs/components/switch.mdx",
  "src/stories/components/booking/discovery/PreferenceIconButton.stories.tsx": "docs-app/content/docs/components/preference-icon-button.mdx",
  "src/stories/components/booking/discovery/DogToggleButton.stories.tsx": "docs-app/content/docs/components/dog-toggle-button.mdx",
  "src/stories/components/booking/discovery/FindYourStayTravelPartyButton.stories.tsx": "docs-app/content/docs/components/travel-party-button.mdx",
  "src/stories/components/booking/search/SearchButton.stories.tsx": "docs-app/content/docs/components/search-button.mdx",
  "src/stories/components/rooms/BuildingIcon.stories.tsx": "docs-app/content/docs/components/building-icon.mdx",
  "src/stories/components/rooms/AmenityIcons.stories.tsx": "docs-app/content/docs/components/amenity-icons.mdx",
  "src/stories/components/rates/ConfigurableRateCard.stories.tsx": "docs-app/content/docs/components/configurable-rate-card.mdx",
});

const usedPlannedPaths = new Set();

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
    const componentName = segments.at(-1)?.replace(/\.stories\.(tsx?|jsx?)$/, "") ?? title;
    const slug = kebabCase(componentName);
    const rationale = categoryKey === "dev"
      ? "Development-only tooling. Not part of the public component library."
      : categoryKey === "examples"
        ? "Storybook scaffold or story-only harness, not a canonical component. Replaced by component stories or existing interaction tests."
        : "Convert CSF story exports to @fumadocs/story examples with real component imports.";
    let plannedPath = null;
    if (!skip) {
      const directory = `docs-app/content/docs/components/${categoryKey}`;
      plannedPath = `${directory}/${slug}.mdx`;
      if (usedPlannedPaths.has(plannedPath)) {
        // Distinct stories can share a filename (e.g. two ExtrasStep stories).
        plannedPath = `${directory}/${kebabCase(segments.slice(-2, -1)[0] ?? "")}-${slug}.mdx`;
        let suffix = 2;
        while (usedPlannedPaths.has(plannedPath)) {
          plannedPath = `${directory}/${kebabCase(segments.slice(-2, -1)[0] ?? "")}-${slug}-${suffix++}.mdx`;
        }
      }
      usedPlannedPaths.add(plannedPath);
    }
    return {
      source: rel,
      title,
      categoryKey,
      category: CATEGORY_LABELS[categoryKey] ?? (categoryKey === "examples" ? "Legacy examples" : categoryKey),
      exportNames: exports,
      newDoc: plannedPath,
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
const manifestText = JSON.stringify(manifest, null, 2) + "\n";

// COW-70 coverage matrix: every historical story mapped to a Fumadocs page and
// its demo exports, plus production components with no story at all.
const docsRoot = join(root, "docs-app", "content", "docs");
const docsPages = walk(docsRoot)
  .filter((path) => path.endsWith(".mdx"))
  .map((path) => relative(root, path).replaceAll("\\", "/"));
for (const [storyPath, pagePath] of Object.entries(DOC_PAGE_OVERRIDES)) {
  if (!docsPages.includes(pagePath)) {
    throw new Error(`DOC_PAGE_OVERRIDES points at missing page ${pagePath} for ${storyPath}`);
  }
}
// Heuristic: exported PascalCase declarations in component source files. This
// deliberately over-reports helpers; the matrix records it as a candidate list
// for human triage rather than claiming every entry is a public component.
const sourceRoot = join(root, "src", "components");
const storyText = stories.map((story) => readFileSync(join(root, story.source), "utf8")).join("\n");
const undocumentedProductionCandidates = walk(sourceRoot)
  .filter((path) => /\.tsx$/.test(path) && !/\.stories\./.test(path))
  .flatMap((path) => {
    const source = readFileSync(path, "utf8");
    const names = [
      ...[...source.matchAll(/export function ([A-Z]\w*)/g)].map((match) => match[1]),
      ...[...source.matchAll(/export const ([A-Z]\w*)\s*=/g)].map((match) => match[1]),
    ];
    return [...new Set(names)]
      .filter((name) => !storyText.includes(name))
      .map((name) => ({ name, source: relative(root, path).replaceAll("\\", "/") }));
  });

const coverage = stories.map((story) => {
  const component = story.title.split("/").at(-1) ?? story.title;
  const existingPage = DOC_PAGE_OVERRIDES[story.source] ?? null;
  const plannedPage = story.newDoc;
  const docsPage = story.status === "skipped" ? null : existingPage ?? plannedPage;
  return {
    component,
    category: story.category,
    storySource: story.source,
    docsPage,
    demos: story.exportNames.length,
    demoExports: story.exportNames,
    status: story.status === "skipped" ? "excluded" : existingPage ? "documented" : "planned",
    note: story.status === "skipped"
      ? story.rationale
      : existingPage ? "Historical story has a Fumadocs page; variants pending migration." : "Awaiting Fumadocs page and interactive demos.",
  };
});

const coverageMatrix = {
  generatedFrom: "src/stories + docs-app/content/docs",
  totals: {
    components: coverage.length,
    documented: coverage.filter((entry) => entry.status === "documented").length,
    planned: coverage.filter((entry) => entry.status === "planned").length,
    excluded: coverage.filter((entry) => entry.status === "excluded").length,
    undocumentedProductionCandidates: undocumentedProductionCandidates.length,
  },
  components: coverage,
  undocumentedProductionCandidates,
};
const matrixPath = join(root, "docs", "component-library", "coverage-matrix.json");
const matrixText = JSON.stringify(coverageMatrix, null, 2) + "\n";
// Generate and validate every output before replacing either tracked file.
JSON.parse(manifestText);
JSON.parse(matrixText);
if (process.argv.includes("--check")) {
  const stale = [
    [out, manifestText],
    [matrixPath, matrixText],
  ].filter(([path, text]) => !existsSync(path) || readFileSync(path, "utf8") !== text);
  if (stale.length) {
    console.error(`Generated docs inventory is stale: ${stale.map(([path]) => relative(root, path)).join(", ")}. Run npm run docs:inventory.`);
    process.exit(1);
  }
  console.log("docs inventory is current");
  process.exit(0);
}
writeFileSync(`${out}.tmp`, manifestText);
writeFileSync(`${matrixPath}.tmp`, matrixText);
renameSync(`${out}.tmp`, out);
renameSync(`${matrixPath}.tmp`, matrixPath);
console.log(`${coverage.length} components, ${coverageMatrix.totals.documented} documented, ${undocumentedProductionCandidates.length} undocumented candidates -> ${relative(root, matrixPath)}`);
