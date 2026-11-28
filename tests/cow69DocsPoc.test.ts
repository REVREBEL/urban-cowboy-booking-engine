// COW-69 docs PoC: inventory, static-export config and real-component import contract.
import assert from "node:assert/strict";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import test from "node:test";
import { resolveDocsBasePath } from "../scripts/fumadocs/base-path.mjs";
import { contrastForTokens } from "../scripts/fumadocs/contrast.mjs";
import { prefixFontUrls } from "../scripts/fumadocs/prefix-font-urls.mjs";

const root = new URL("../", import.meta.url);
const read = (path: string) => readFileSync(new URL(path, root), "utf8");
const nextConfig = read("docs-app/next.config.mjs");
const globalCss = read("docs-app/app/globals.css");
const brandColors = read("src/styles/colors.css");
const source = read("docs-app/source.ts");
const storyControls = read("docs-app/components/story-controls.tsx");
const pillMdx = read("docs-app/content/docs/components/pill.mdx");
const preferenceMdx = read("docs-app/content/docs/components/preference-icon-button.mdx");
const workflow = read(".github/workflows/docs-pages.yml");
const migrationDoc = read("docs/component-library/fumadocs-migration.md");
const smokeScript = read("scripts/fumadocs/smoke-docs.mjs");

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

test("font URLs are prefixed for quoted, unquoted and spaced url() forms", () => {
  const css = [
    'src: url("/fonts/DesertRain/Regular.woff2")',
    "src: url('/fonts/Brothers/Bold.woff2')",
    "src: url(/fonts/LeagueSpartan/Variable.woff2)",
    "src: url(  /fonts/Bianco%20Sans/Regular.woff2)",
  ].join("\n");
  const prefixed = prefixFontUrls(css, "/urban-cowboy-booking-engine");
  assert.equal((prefixed.match(/\/urban-cowboy-booking-engine\/fonts\//g) ?? []).length, 4);
  assert.doesNotMatch(prefixed, /url\(["' ]?\/fonts\//);
  assert.equal(prefixFontUrls(css, ""), css);
});

test("catalog search is static-export compatible", () => {
  const layout = read("docs-app/app/layout.tsx");
  const pkg = JSON.parse(read("package.json"));
  assert.match(layout, /enabled: true/);
  assert.match(layout, /type: "static"/);
  assert.match(layout, /NEXT_PUBLIC_DOCS_BASE_PATH.*search-index\.json/);
  assert.match(pkg.scripts["docs:prepare"], /prepare-docs-assets\.mjs/);
  assert.match(pkg.scripts["docs:prepare"], /build-search-index\.mjs/);
  assert.match(pkg.scripts["docs:build"], /docs:prepare/);
  assert.match(pkg.scripts["docs:dev"], /dev-docs\.mjs/);
  assert.match(smokeScript, /static search index/);
});

test("base path resolver covers Pages, custom-domain roots and local dev", () => {
  assert.equal(resolveDocsBasePath({}), "/urban-cowboy-booking-engine");
  assert.equal(resolveDocsBasePath({ DOCS_BASE_PATH: "/custom-path" }), "/custom-path");
  assert.equal(resolveDocsBasePath({ DOCS_BASE_PATH: "/custom-path/" }), "/custom-path");
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
  // COW-85: the side rail was removed, so the TOC grid column is now zero.
  assert.match(globalCss, /--fd-toc-width: 0px/);
});

test("story select menu has an opaque popover surface", () => {
  // The story controls use bg-fd-popover/text-fd-popover-foreground on the
  // expanded select popup. Without local definitions the menu renders transparent.
  assert.match(globalCss, /\.bg-fd-popover \{ background-color: var\(--color-fd-popover\)/);
  assert.match(globalCss, /\.text-fd-popover-foreground \{ color: var\(--color-fd-popover-foreground\)/);
  assert.match(globalCss, /data-\\\[highlighted\\\]\\:bg-fd-accent\[data-highlighted\] \{\n  background-color: var\(--color-fd-primary\);\n  color: var\(--color-fd-primary-foreground\);/);
});

test("muted foreground meets WCAG AA contrast in both themes", () => {
  const light = contrastForTokens(brandColors, "lake-forest-200", "paper-100");
  const dark = contrastForTokens(brandColors, "paper-300", "smoke-950");
  assert.ok(light >= 4.5, `light muted contrast ${light.toFixed(2)}`);
  assert.ok(dark >= 4.5, `dark muted contrast ${dark.toFixed(2)}`);
});

test("docs pages and story frames share one maximum-width token", () => {
  assert.match(globalCss, /--component-docs-max-width: 1600px/);
  assert.match(globalCss, /max-width: var\(--component-docs-max-width\)/);
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

test("the removed compact SearchBar and legacy component showcase leave no references", () => {
  assert.equal(existsSync(new URL("src/components/booking/search/SearchBar.tsx", root)), false);
  assert.equal(existsSync(new URL("components.html", root)), false);
  assert.equal(existsSync(new URL("src/component-library/", root)), false);

  const story = read("docs-app/components/search-bar.story.tsx");
  const mdx = read("docs-app/content/docs/components/search-bar.mdx");
  const controls = read("docs-app/components/story-controls.tsx");
  const viteConfig = read("vite.config.ts");
  const packageJson = read("package.json");
  assert.doesNotMatch(story, /\bSearchBar\b(?!Expanded)/);
  assert.doesNotMatch(mdx, /<SearchBarStoryControl \/>/);
  assert.match(mdx, /title: SearchBarExpanded/);
  assert.doesNotMatch(storyControls, /SearchBarStoryControl/);
  assert.doesNotMatch(viteConfig, /components\.html/);
  assert.doesNotMatch(packageJson, /"components":/);
  assert.doesNotMatch(smokeScript, /21 – 24 Nov/);
  assert.match(smokeScript, /"components\/search-bar\/index\.html": \["2026-11-21 — 2026-11-24", "Search accommodations"\]/);
  const runtimeTest = read("tests/docsRuntime.test.mjs");
  assert.doesNotMatch(runtimeTest, /page: "search-bar", asset: "assets\/icons\/ui\/arrow-right\.svg"/);
});

test("expanded search bar renders the shared SearchButton in its button slot", () => {
  const expanded = read("src/components/booking/search/SearchBarExpanded.tsx");
  assert.match(expanded, /import \{ SearchButton, type SearchButtonVariant \} from "\.\/SearchButton";/);
  assert.match(expanded, /buttonVariant\?: SearchButtonVariant;/);
  assert.match(
    expanded,
    /buttonSlot \?\? \(\s*<SearchButton[\s\S]*?aria-label="Search accommodations"[\s\S]*?variant=\{buttonVariant \?\? \(variant === "circle" \? "full-circle" : "full-square"\)\}/,
  );
  // The bespoke button used to duplicate SearchButton's styling and icon.
  assert.doesNotMatch(expanded, /ExpandedSearchButton/);

  const story = read("docs-app/components/search-bar.story.tsx");
  assert.match(story, /buttonVariant: SearchButtonVariant;/);
  assert.match(story, /<SearchBarExpanded[\s\S]*?buttonVariant=\{buttonVariant\}/);
  assert.match(story, /<SearchBarExpanded[\s\S]*?isLoading=\{isLoading\}/);
  assert.match(story, /initial: \{ variant: "circle", buttonVariant: "full-circle", isLoading: false \}/);
});

test("component docs use story controls instead of static prop tables", () => {
  // The interactive Props panel on each story is the single source of truth
  // for selectable values; a static table beside it only goes stale.
  const walk = (dir: URL): URL[] =>
    readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
      const child = new URL(`${entry.name}${entry.isDirectory() ? "/" : ""}`, dir);
      return entry.isDirectory()
        ? walk(child)
        : entry.name.endsWith(".mdx")
          ? [child]
          : [];
    });
  const files = walk(new URL("docs-app/content/docs/", root));
  assert.ok(files.length > 0);
  for (const file of files) {
    const mdx = readFileSync(file, "utf8");
    assert.doesNotMatch(mdx, /^\| Prop \| Values \| Notes \|$/m, `${file.pathname} has a static prop table`);
  }
});

test("story demos render on light surfaces without dark canvases", () => {
  // Any dark palette token used as a demo wrapper would reintroduce the
  // decorative canvas; only the bounded .docs-contrast-specimen swatch is dark.
  const darkCanvas = /\bbg-(?:smoke|dark|foreground|lake-forest|cowboy-umber|oxblood)\b/;
  const signboard = /<span className="text-paper">Find your stay<\/span>/g;
  const files = readdirSync(new URL("docs-app/components/", root))
    .filter((file) => file.endsWith(".story.tsx"));
  assert.ok(files.length > 0);
  for (const file of files) {
    const source = read(`docs-app/components/${file}`);
    assert.doesNotMatch(source, darkCanvas, `${file} has a dark demo canvas`);
    // The signboard keeps light text because it is printed over a dark wooden
    // image; strip only that span before checking the rest of the demo.
    const withoutSignboard = source.replace(signboard, "");
    assert.doesNotMatch(withoutSignboard, /text-paper/, `${file} has light-on-dark demo text`);
  }

  const buttonStory = read("docs-app/components/button.story.tsx");
  const pillStory = read("docs-app/components/pill.story.tsx");
  assert.match(buttonStory, /<PaletteSpecimen key=\{color\} color=\{color\} variant=\{variant\}>/);
  assert.match(pillStory, /<PaletteSpecimen key=\{color\} color=\{color\} variant=\{variant\}>/);
  assert.match(globalCss, /\.docs-contrast-specimen \{[^}]*background-color: var\(--color-smoke\)/);
  assert.match(
    read("src/styles/room-photo-tour.css"),
    /\.j-tour-footer \{[^}]*color: var\(--color-paper\)/,
  );
});

test("story demos never expose a no-op Unset choice", () => {
  // @fumadocs/story adds "Unset" for optional demo props. When the wrapper
  // also has a default, choosing it changes nothing, so all demo props are
  // required and their values come from defineStory's initial args.
  const files = readdirSync(new URL("docs-app/components/", root))
    .filter((file) => file.endsWith(".story.tsx"));
  assert.ok(files.length > 0);
  for (const file of files) {
    const source = read(`docs-app/components/${file}`);
    assert.doesNotMatch(source, /function \w+Demo\([^)]*=/, `${file} has a defaulted demo prop`);
    assert.doesNotMatch(source, /interface \w+DemoProps \{[^}]*\?:/, `${file} has an optional demo prop`);
  }
});

test("Colors page uses the Figma color swatch for palette cards", () => {
  const showcase = read("docs-app/components/colors-showcase.tsx");
  const swatch = read("docs-app/components/color-swatch.tsx");
  assert.match(showcase, /import \{ ColorSwatch \} from "\.\/color-swatch"/);
  assert.match(showcase, /<PaletteCard/);
  assert.doesNotMatch(showcase, /function Swatch\(/);
  assert.match(showcase, /oklchToHex/);
  // Light palette cards need dark ink, and the copy icon must follow it.
  assert.match(swatch, /foreground: string/);
  assert.match(swatch, /color: foreground/);
  assert.match(swatch, /width=\{21\} height=\{23\}/);
  assert.match(read("docs-app/public/icons/color-swatch-copy.svg"), /fill="#F2F2F2"/);
  assert.match(read("docs-app/components/color-swatch.module.css"), /data-dark-ink="true"\] \.copyIcon/);
});

test("component-name headings have a distinct docs title style", () => {
  const mdx = read("docs-app/content/docs/components/search-bar.mdx");
  assert.match(mdx, /<div className="docs-component-heading">\n\n## Expanded search panel/);
  assert.match(globalCss, /\.docs-component-heading h2 \{[\s\S]*?font-family: var\(--font-subheading\)/);
  assert.match(globalCss, /\.docs-component-heading h2::before \{[\s\S]*?background-color: var\(--color-fd-ring\)/);
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
