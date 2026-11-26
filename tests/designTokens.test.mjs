// COW-116: the Fumadocs visual token library must be generated from the real CSS,
// indexed in navigation, and covered by the static smoke checks.
import assert from "node:assert/strict";
import { readFileSync, writeFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import test from "node:test";

const root = new URL("../", import.meta.url);
const read = (path) => readFileSync(new URL(path, root), "utf8");
const generatedUrl = new URL("../docs-app/lib/design-tokens.generated.json", import.meta.url);
const generator = "scripts/fumadocs/generate-design-tokens.mjs";
const runGenerator = (...args) => spawnSync(process.execPath, [generator, ...args], {
  cwd: new URL("..", import.meta.url), encoding: "utf8",
});

test("checked-in token metadata passes the CI freshness check", () => {
  const check = runGenerator("--check");
  assert.equal(check.status, 0, check.stderr || check.stdout);
});

test("token generation is deterministic and leaves the tracked file unchanged", () => {
  const original = readFileSync(generatedUrl, "utf8");
  try {
    const first = runGenerator();
    assert.equal(first.status, 0, first.stderr);
    const firstText = readFileSync(generatedUrl, "utf8");
    const second = runGenerator();
    assert.equal(second.status, 0, second.stderr);
    assert.equal(readFileSync(generatedUrl, "utf8"), firstText);
    assert.equal(firstText, original, "checked-in metadata matches the generator");
  } finally {
    writeFileSync(generatedUrl, original);
  }
});

test("generated values resolve from the CSS sources and no font asset is missing", () => {
  const data = JSON.parse(read("docs-app/lib/design-tokens.generated.json"));
  const css = [
    "theme.css", "colors.css", "typography.css", "utilities.css", "index.css",
  ].map((file) => read(`src/styles/${file}`)).join("\n");

  assert.equal(data.generatedFrom.length, 5);
  assert.deepEqual(Object.keys(data.sourceDigests), data.generatedFrom);
  for (const source of data.generatedFrom) {
    assert.match(data.sourceDigests[source], /^[a-f0-9]{64}$/);
  }

  const primitives = new Map(data.colors.primitives.map((color) => [color.name, color]));
  assert.equal(primitives.get("--paper-500").value, "oklch(98.2% 0.00 11.251)");
  assert.equal(primitives.get("--paper-500").resolved, primitives.get("--paper-500").value);
  const aliases = new Map(data.colors.familyAliases.map((color) => [color.name, color]));
  assert.equal(aliases.get("--paper").value, "var(--paper-500)");
  assert.equal(aliases.get("--paper").resolved, primitives.get("--paper-500").resolved);
  const semantic = new Map(data.colors.semantic.map((color) => [color.name, color]));
  assert.equal(semantic.get("--color-primary").resolved, primitives.get("--paper-500").resolved);

  for (const group of [
    ...data.colors.primitives, ...data.colors.familyAliases, ...data.colors.semantic,
    ...data.general.radii, ...data.general.buttonRadii, ...data.general.shadows,
    ...data.typography.sizes, ...data.typography.familyTokens, ...data.typography.tracking,
  ]) {
    assert.ok(css.includes(group.value), `value ${group.value} for ${group.name} comes from CSS`);
  }

  const faces = data.typography.families.flatMap((family) => family.faces);
  assert.ok(faces.length > 0);
  for (const face of faces) assert.equal(face.assetExists, true, `${face.src} is checked in`);
  assert.ok(data.typography.familyTokens.some((token) => token.name === "--font-heading"));
  assert.ok(data.typography.sizes.some((size) => size.name === "--text-size-base" && size.alias === "--text-base"));
  assert.ok(data.typography.textCases.some((item) => item.value === "uppercase"));
});

test("missing tokens are recorded as gaps, never filled with invented values", () => {
  const data = JSON.parse(read("docs-app/lib/design-tokens.generated.json"));
  const css = [
    "theme.css", "colors.css", "typography.css", "utilities.css", "index.css",
  ].map((file) => read(`src/styles/${file}`)).join("\n");
  for (const gap of data.gaps) {
    if (gap.token) assert.doesNotMatch(css, new RegExp(`${gap.token}\\s*:`));
    assert.match(gap.note, /not defined|No named|not checked in/);
  }
  assert.ok(data.gaps.some((gap) => gap.token === "--border-width-medium"));
  for (const family of ["spacing", "breakpoint", "opacity"]) {
    assert.ok(data.gaps.some((gap) => gap.family === family), `${family} gap is documented`);
  }
});

test("visual reference pages are indexed, sourced and smoke-tested", () => {
  const rootMeta = JSON.parse(read("docs-app/content/docs/meta.json"));
  const tokensMeta = JSON.parse(read("docs-app/content/docs/design-tokens/meta.json"));
  assert.ok(rootMeta.pages.includes("design-tokens"));
  assert.deepEqual(tokensMeta.pages, ["typography", "colors", "general-tokens"]);

  const pages = {
    typography: "TypographyShowcase",
    colors: "ColorsShowcase",
    "general-tokens": "GeneralTokensShowcase",
  };
  for (const [slug, component] of Object.entries(pages)) {
    const mdx = read(`docs-app/content/docs/design-tokens/${slug}.mdx`);
    assert.match(mdx, /^---\ntitle: .+\ndescription: .+\n---/);
    assert.match(mdx, new RegExp(component));
    const smoke = read("scripts/fumadocs/smoke-docs.mjs");
    assert.ok(smoke.includes(`design-tokens/${slug}/index.html`), `${slug} is in the smoke list`);
  }

  const packageJson = JSON.parse(read("package.json"));
  assert.match(packageJson.scripts["docs:prepare"], /generate-design-tokens\.mjs/);
  assert.match(packageJson.scripts["test:docs"], /designTokens\.test\.mjs/);
  assert.match(read(".github/workflows/docs-pages.yml"), /docs:tokens:check/);
  const devDocs = read("scripts/fumadocs/dev-docs.mjs");
  assert.match(devDocs, /generateDesignTokens/);
  assert.match(devDocs, /watchTree\(sourceRoot/, "TS/TSX token references also refresh the metadata");
});

test("copy affordances use accessible native controls", () => {
  const source = read("docs-app/components/token-copy-button.tsx");
  assert.match(source, /<button/);
  assert.match(source, /aria-label=/);
  assert.match(source, /aria-live="polite"/);
  assert.match(source, /navigator\.clipboard\.writeText/);
  for (const file of [
    "typography-showcase.tsx", "colors-showcase.tsx", "general-tokens-showcase.tsx",
  ]) {
    const component = read(`docs-app/components/${file}`);
    assert.match(component, /design-tokens\.generated\.json/);
    assert.match(component, /TokenCopyButton/);
  }
});
