#!/usr/bin/env node
// COW-116: source the visual library's token metadata from the booking engine's
// CSS rather than duplicating values in MDX. The generated JSON is committed so
// a clean checkout can build the docs; --check keeps it in sync with the CSS.
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { dirname, join, relative } from "node:path";

const ROOT = process.cwd();
const CHECK = process.argv.includes("--check");
const OUTPUT = "docs-app/lib/design-tokens.generated.json";

// Order matters: later declarations win when the browser cascades these files.
const STYLE_FILES = [
  "src/styles/theme.css",
  "src/styles/colors.css",
  "src/styles/typography.css",
  "src/styles/utilities.css",
  "src/styles/index.css",
];

const read = (file) => readFileSync(join(ROOT, file), "utf8");

/** Brace-aware extraction of :root, @theme, @utility and @font-face bodies. */
function findBlocks(css) {
  const blocks = [];
  const opener = /(:root|@theme(?:\s+inline)?|@utility\s+[\w-]+|@font-face)\s*\{/g;
  let match;
  while ((match = opener.exec(css)) !== null) {
    let depth = 1;
    let cursor = opener.lastIndex;
    while (cursor < css.length && depth > 0) {
      if (css[cursor] === "{") depth += 1;
      if (css[cursor] === "}") depth -= 1;
      cursor += 1;
    }
    blocks.push({
      selector: match[1].trim(),
      body: css.slice(opener.lastIndex, cursor - 1),
    });
    opener.lastIndex = cursor;
  }
  return blocks;
}

function declarations(body) {
  const found = [];
  const pattern = /(--[\w-]+)\s*:\s*([^;]+);/g;
  let match;
  while ((match = pattern.exec(body)) !== null) {
    found.push({ name: match[1], value: match[2].trim() });
  }
  return found;
}

function properties(body) {
  const found = [];
  const pattern = /([\w-]+)\s*:\s*([^;]+);/g;
  let match;
  while ((match = pattern.exec(body)) !== null) {
    found.push({ name: match[1], value: match[2].trim() });
  }
  return found;
}

/** Last declaration wins, mirroring the browser cascade across imported files. */
function declarationMap(sources) {
  const map = new Map();
  for (const { file, css } of sources) {
    for (const block of findBlocks(css)) {
      if (block.selector !== ":root" && !block.selector.startsWith("@theme")) continue;
      for (const { name, value } of declarations(block.body)) map.set(name, value);
    }
  }
  return map;
}

function resolveValue(value, map, seen = new Set()) {
  if (!value?.includes("var(")) return value?.trim() ?? "";
  return value.trim().replace(
    /var\(\s*(--[\w-]+)\s*(?:,\s*([^()]*))?\)/g,
    (full, name, fallback) => {
      if (seen.has(name)) return full;
      const raw = map.get(name);
      if (raw === undefined) return fallback?.trim() ?? full;
      return resolveValue(raw, map, new Set([...seen, name]));
    },
  );
}

function unquote(value) {
  return value.replace(/^["']|["']$/g, "").trim();
}

function firstFamily(stack) {
  return unquote(/(["'])([^"']+)\1/.exec(stack)?.[2] ?? stack.split(",")[0]);
}

function blockFor(css, selector) {
  return findBlocks(css).find((block) => block.selector === selector)?.body ?? "";
}

/** oklch lightness is the first component; it drives readable swatch labels. */
export function swatchInk(resolved) {
  const lightness = /oklch\(\s*([\d.]+)%/i.exec(resolved ?? "")?.[1];
  return lightness !== undefined && Number(lightness) < 62
    ? "var(--paper)"
    : "var(--color-foreground)";
}

function buildTypography(sources, map, exists) {
  const typography = sources.find((source) => source.file === "src/styles/typography.css").css;

  const faces = findBlocks(typography)
    .filter((block) => block.selector === "@font-face")
    .map((block) => {
      const props = Object.fromEntries(properties(block.body).map(({ name, value }) => [name, value]));
      const url = /url\(\s*["']?([^"')]+)["']?\s*\)/.exec(props.src ?? "")?.[1] ?? "";
      return {
        family: unquote(props["font-family"] ?? ""),
        weight: props["font-weight"] ?? "400",
        style: props["font-style"] ?? "normal",
        src: url,
        asset: decodeURIComponent(url.replace(/^\//, "")),
        assetExists: exists(join(ROOT, "public", decodeURIComponent(url.replace(/^\//, "")))),
      };
    });

  const families = [...new Set(faces.map((face) => face.family))]
    .sort((a, b) => a.localeCompare(b))
    .map((family) => ({
      family,
      faces: faces.filter((face) => face.family === family),
    }));

  const familyTokens = declarations(blockFor(typography, "@theme"))
    .filter(({ name }) => name.startsWith("--font-"))
    .map(({ name, value }) => ({
      name,
      value,
      cssValue: `var(${name})`,
      primaryFamily: firstFamily(value),
      role: name.replace("--font-", ""),
    }));

  for (const group of families) {
    group.tokens = familyTokens
      .filter((token) => token.primaryFamily === group.family)
      .map((token) => token.name);
  }

  const sizeAliases = new Map(
    declarations(blockFor(typography, "@theme inline"))
      .filter(({ name }) => name.startsWith("--text-"))
      .map(({ name, value }) => [name, value]),
  );
  const sizes = declarations(blockFor(typography, ":root"))
    .filter(({ name }) => name.startsWith("--text-size-"))
    .map(({ name, value }) => ({
      name,
      value,
      cssValue: `var(${name})`,
      alias: [...sizeAliases.entries()].find(([, expr]) => expr.includes(name))?.[0] ?? null,
    }));

  const tracking = declarations(findBlocks(sources[0].css).find((block) => block.selector === "@theme")?.body ?? "")
    .filter(({ name }) => name.startsWith("--tracking-"))
    .map(({ name, value }) => ({ name, value, cssValue: `var(${name})` }));

  const utilities = sources.find((source) => source.file === "src/styles/utilities.css").css;
  const textCases = findBlocks(utilities)
    .filter((block) => block.selector.startsWith("@utility text-case-"))
    .map((block) => ({
      name: block.selector.replace("@utility ", ""),
      value: properties(block.body).find((prop) => prop.name === "text-transform")?.value ?? "",
    }));

  return { families, familyTokens, sizes, tracking, textCases };
}

function buildColors(sources, map) {
  const colorsCss = sources.find((source) => source.file === "src/styles/colors.css").css;
  const indexCss = sources.find((source) => source.file === "src/styles/index.css").css;
  const utilitiesCss = sources.find((source) => source.file === "src/styles/utilities.css").css;

  const primitives = [];
  const familyAliases = [];
  for (const { name, value } of declarations(findBlocks(colorsCss).find((block) => block.selector === ":root")?.body ?? "")) {
    const shade = /^--([a-z-]+)-(\d{2,3})$/.exec(name);
    if (shade) {
      primitives.push({ name, family: shade[1], shade: shade[2], value, resolved: resolveValue(value, map) });
    } else if (/^--[a-z-]+(?:-(?:muted|fade))?$/.test(name) && value.startsWith("var(")) {
      familyAliases.push({ name, value, resolved: resolveValue(value, map) });
    }
  }
  primitives.sort((a, b) => a.family.localeCompare(b.family) || Number(a.shade) - Number(b.shade));
  familyAliases.sort((a, b) => a.name.localeCompare(b.name));

  const roles = new Map();
  for (const css of [indexCss, utilitiesCss]) {
    for (const block of findBlocks(css)) {
      if (!block.selector.startsWith("@theme")) continue;
      for (const { name, value } of declarations(block.body)) {
        if (name.startsWith("--color-")) {
          roles.set(name, { name, value, resolved: resolveValue(value, map) });
        }
      }
    }
  }
  for (const { name, value } of declarations(findBlocks(indexCss).find((block) => block.selector === ":root")?.body ?? "")) {
    if (/^--(?:foreground|background|primary|secondary|accent|emphasis|error|popover|card|muted|input|ring|border|destructive|sidebar)(?:-foreground|-primary|-accent|-border|-ring)?$/.test(name)) {
      roles.set(name, { name, value, resolved: resolveValue(value, map) });
    }
  }
  const semantic = [...roles.values()].sort((a, b) => a.name.localeCompare(b.name));

  const controlColors = findBlocks(utilitiesCss)
    .filter((block) => block.selector.startsWith("@utility control-color-"))
    .map((block) => {
      const props = Object.fromEntries(declarations(block.body).map(({ name, value }) => [name, value]));
      return {
        name: block.selector.replace("@utility ", ""),
        bg: props["--bg"] ?? "",
        fg: props["--fg"] ?? "",
        border: props["--border"] ?? "",
        resolvedBg: resolveValue(props["--bg"] ?? "", map),
      };
    })
    .sort((a, b) => a.name.localeCompare(b.name));

  const pairings = semantic
    .filter((token) => token.name.endsWith("-foreground"))
    .flatMap((token) => {
      const background = token.name.replace(/-foreground$/, "");
      if (!roles.has(background)) return [];
      return [{ background, foreground: token.name, value: `var(${background})`, foregroundValue: `var(${token.name})` }];
    });
  for (const control of controlColors) {
    pairings.push({
      background: control.name,
      foreground: `${control.name} / --fg`,
      value: `var(${control.bg.replace(/^var\(|\)/g, "")})`,
      foregroundValue: `var(${control.fg.replace(/^var\(|\)/g, "")})`,
    });
  }

  return { primitives, familyAliases, semantic, controlColors, pairings };
}

function buildGeneral(sources, map) {
  const themeCss = sources.find((source) => source.file === "src/styles/theme.css").css;
  const utilitiesCss = sources.find((source) => source.file === "src/styles/utilities.css").css;
  const indexCss = sources.find((source) => source.file === "src/styles/index.css").css;

  const themeBlock = findBlocks(themeCss).find((block) => block.selector === "@theme")?.body ?? "";
  const radii = declarations(themeBlock)
    .filter(({ name }) => name.startsWith("--radius-"))
    .map(({ name, value }) => ({ name, value, cssValue: `var(${name})` }));

  const shadows = new Map();
  for (const css of [themeCss, indexCss]) {
    for (const block of findBlocks(css)) {
      if (!block.selector.startsWith("@theme")) continue;
      for (const { name, value } of declarations(block.body)) {
        if (name.startsWith("--shadow-")) shadows.set(name, { name, value, cssValue: `var(${name})` });
      }
    }
  }

  const buttonRadii = declarations(findBlocks(utilitiesCss).find((block) => block.selector === "@theme")?.body ?? "")
    .filter(({ name }) => name.startsWith("--radius-btn"))
    .map(({ name, value }) => ({ name, value, cssValue: `var(${name})` }));
  const buttonBorderWidths = declarations(findBlocks(utilitiesCss).find((block) => block.selector === "@theme")?.body ?? "")
    .filter(({ name }) => name.startsWith("--border-btn"))
    .map(({ name, value }) => ({ name, value, cssValue: `var(${name})`, resolved: resolveValue(value, map) }));

  const controlSizes = findBlocks(utilitiesCss)
    .filter((block) => /^@utility btn(?:-(?:xs|sm|md|lg|xl))?$/.test(block.selector))
    .map((block) => {
      const props = Object.fromEntries(properties(block.body).map(({ name, value }) => [name, value]));
      return {
        name: block.selector.replace("@utility ", ""),
        fontSize: props["font-size"] ?? "",
        lineHeight: props["line-height"] ?? "",
        letterSpacing: props["letter-spacing"] ?? "",
        paddingTop: props["padding-top"] ?? "",
        paddingBottom: props["padding-bottom"] ?? "",
        paddingInline: props["padding-inline"] ?? "",
        borderRadius: props["border-radius"] ?? "",
        borderWidth: props["border-width"] ?? "",
      };
    });

  const utilityBorderWidths = new Map();
  for (const block of findBlocks(utilitiesCss)) {
    if (!block.selector.startsWith("@utility")) continue;
    const width = properties(block.body).find((prop) => prop.name === "border-width")?.value;
    if (!width) continue;
    const entry = utilityBorderWidths.get(width) ?? { value: width, utilities: [] };
    entry.utilities.push(block.selector.replace("@utility ", ""));
    utilityBorderWidths.set(width, entry);
  }

  return {
    radii,
    buttonRadii,
    shadows: [...shadows.values()].sort((a, b) => a.name.localeCompare(b.name)),
    buttonBorderWidths,
    controlSizes,
    utilityBorderWidths: [...utilityBorderWidths.values()].sort((a, b) => a.value.localeCompare(b.value)),
  };
}

/** Record missing tokens instead of inventing stand-in values. */
function buildGaps(defined, exists, sources, root) {
  const references = new Map();
  const familyPatterns = [
    ["spacing", /--spacing-[\w-]+/g],
    ["breakpoint", /--breakpoint-[\w-]+/g],
    ["opacity", /--opacity-[\w-]+/g],
    ["border width", /--border-width-[\w-]+/g],
  ];
  const sourceFiles = [];
  function walk(directory) {
    for (const entry of readdirSync(directory, { withFileTypes: true })) {
      const path = join(directory, entry.name);
      if (entry.isDirectory()) walk(path);
      else if (/\.(?:ts|tsx|css)$/.test(entry.name)) sourceFiles.push(path);
    }
  }
  walk(join(root, "src"));

  for (const file of sourceFiles) {
    const source = readFileSync(file, "utf8");
    for (const [, pattern] of familyPatterns) {
      pattern.lastIndex = 0;
      for (const match of source.matchAll(pattern)) {
        const token = match[0];
        if (defined.has(token)) continue;
        const entry = references.get(token) ?? { token, count: 0, files: new Set() };
        entry.count += 1;
        entry.files.add(relative(root, file).split("\\").join("/"));
        references.set(token, entry);
      }
    }
  }

  const gaps = [...references.values()]
    .sort((a, b) => a.token.localeCompare(b.token))
    .map(({ token, count, files }) => ({
      kind: "undefined-reference",
      token,
      references: count,
      sources: [...files].sort(),
      note: "Referenced in source but not defined in src/styles. No value is invented here.",
    }));

  for (const [family, pattern] of familyPatterns) {
    const familySource = new RegExp(pattern.source, "g");
    let used = 0;
    for (const file of sourceFiles) {
      const source = readFileSync(file, "utf8");
      familySource.lastIndex = 0;
      used += [...source.matchAll(familySource)].length;
    }
    const declared = [...defined.keys()].filter((name) => new RegExp(pattern.source).test(name));
    if (declared.length === 0) {
      gaps.push({
        kind: "undefined-family",
        family,
        pattern: familySource.source,
        references: used,
        note: "No named project custom property is defined for this family. Utility or media-query defaults are not promoted to tokens here.",
      });
    }
  }

  // Font faces whose declared asset is absent cannot be rendered as a specimen.
  const typography = sources.find((source) => source.file === "src/styles/typography.css").css;
  for (const face of findBlocks(typography).filter((block) => block.selector === "@font-face")) {
    const props = Object.fromEntries(properties(face.body).map(({ name, value }) => [name, value]));
    const url = /url\(\s*["']?([^"')]+)["']?\s*\)/.exec(props.src ?? "")?.[1] ?? "";
    if (!url) continue;
    const asset = decodeURIComponent(url.replace(/^\//, ""));
    if (!exists(join(root, "public", asset))) {
      gaps.push({
        kind: "missing-font-asset",
        token: `${unquote(props["font-family"] ?? "")} ${props["font-weight"] ?? "400"}`,
        references: 1,
        sources: ["src/styles/typography.css"],
        note: `@font-face declares ${url}, which is not checked into public/fonts.`,
      });
    }
  }

  return gaps;
}

export function generateDesignTokens(root = ROOT) {
  const sources = STYLE_FILES.map((file) => ({ file, css: readFileSync(join(root, file), "utf8") }));
  const map = declarationMap(sources);
  const exists = (path) => existsSync(path);

  const data = {
    schemaVersion: 1,
    generatedFrom: STYLE_FILES,
    sourceDigests: Object.fromEntries(
      sources.map(({ file, css }) => [file, createHash("sha256").update(css).digest("hex")]),
    ),
    typography: buildTypography(sources, map, exists),
    colors: buildColors(sources, map),
    general: buildGeneral(sources, map),
    gaps: buildGaps(map, exists, sources, root),
  };
  data.totals = {
    fontFamilies: data.typography.families.length,
    fontFaces: data.typography.families.reduce((sum, family) => sum + family.faces.length, 0),
    fontRoles: data.typography.familyTokens.length,
    typeSizes: data.typography.sizes.length,
    primitiveColors: data.colors.primitives.length,
    familyAliases: data.colors.familyAliases.length,
    semanticColors: data.colors.semantic.length,
    controlColors: data.colors.controlColors.length,
    radii: data.general.radii.length + data.general.buttonRadii.length,
    shadows: data.general.shadows.length,
    gaps: data.gaps.length,
  };
  return data;
}

const JSON_TEXT = (data) => `${JSON.stringify(data, null, 2)}\n`;

if (import.meta.url === `file://${process.argv[1]}` || process.argv[1]?.endsWith("generate-design-tokens.mjs")) {
  const data = generateDesignTokens(ROOT);
  const text = JSON_TEXT(data);
  if (CHECK) {
    const current = existsSync(join(ROOT, OUTPUT)) ? readFileSync(join(ROOT, OUTPUT), "utf8") : "";
    if (current !== text) {
      console.error(`Generated design tokens are stale: ${OUTPUT}. Run npm run docs:tokens.`);
      process.exit(1);
    }
    console.log("design token metadata is current");
    process.exit(0);
  }
  mkdirSync(dirname(join(ROOT, OUTPUT)), { recursive: true });
  writeFileSync(join(ROOT, OUTPUT), text);
  console.log(
    `generated ${relative(ROOT, join(ROOT, OUTPUT))}: ${data.totals.fontFamilies} font families, ` +
      `${data.totals.primitiveColors} primitive colors, ${data.totals.semanticColors} semantic colors, ` +
      `${data.totals.gaps} documented gaps`,
  );
}
