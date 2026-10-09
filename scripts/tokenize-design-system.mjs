import { readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const ROOT = process.cwd();
const SRC_ROOT = path.join(ROOT, "src");
const TOKEN_SOURCE = path.join(SRC_ROOT, "index.css");
const WRITE = process.argv.includes("--write");
const CHECK = process.argv.includes("--check");

const COLOR_TOKENS = new Map(
  Object.entries({
    "#4e332d": "cowboy-umber",
    "#fddc4e": "lodge-yellow",
    "#ccc7bb": "ash",
    "#faf9f9": "paper",
    "#0e301a": "lake-forest",
    "#ddc5a4": "whiskey-sour",
    "#f2f2f2": "mist",
    "#9a5636": "copper",
    "#69253a": "oxblood",
    "#d65241": "bandana-red",
    "#236b7d": "oxidized-teal",
    "#f2aaa9": "nude-ember",
    "#566e5f": "lake-forest-fade",

    // Shared interface neutrals.
    "#221c18": "smoke",
    "#1c1917": "ink-deep",
    "#60605e": "copy",
    "#6b6259": "copy-warm",
    "#73716d": "smoke-fade",
    "#717470": "smoke-fade",
    "#767470": "copy-soft",
    "#8a7e74": "copy-faint",
    "#d1c9be": "alpine-linen",
    "#e1e0e0": "line-light",
    "#e2e2e1": "line-cool",
    "#dddddd": "line-neutral",
    "#f0efeb": "surface-muted",
    "#f4f1ea": "surface-warm",
    "#f9f9f9": "surface-light",
    "#afaeae": "disabled",
    "#a79996": "mauve-muted",

    // Tailwind core colors do not need duplicate @theme declarations.
    "#ffffff": "white",
    "#000000": "black",
  }),
);

const COLOR_CLASS_REPLACEMENTS = new Map([
  ["text-ink", "text-smoke"],
  ["bg-ink", "bg-smoke"],
  ["border-ink", "border-smoke"],
  ["ring-ink", "ring-smoke"],
]);

const FONT_CLASS_REPLACEMENTS = new Map([
  ["font-woodblock", "font-label"],
  ["font-brothers", "font-label"],
  ["font-editorial", "font-body"],
  ["font-uchen", "font-body"],
  ["font-desert", "font-heading"],
  ["font-bianco", "font-number"],
  ["font-display", "font-heading"],
  ["font-brand", "font-heading"],
  ["font-topic", "font-eyebrow"],
  ["font-inter", "font-body"],
  ["font-lato", "font-body"],
  ["font-dm-sans", "font-body"],
  ["font-league-spartan", "font-label"],
  ["font-emoji-mono", "font-emoji emoji-text"],
]);

const RADIUS_CLASS_REPLACEMENTS = new Map([
  ["rounded-[10px]", "rounded-control-xs"],
  ["rounded-[12px]", "rounded-control-sm"],
  ["rounded-[14px]", "rounded-control"],
  ["rounded-[16px]", "rounded-card"],
  ["rounded-[17px]", "rounded-card-media"],
  ["rounded-[18px]", "rounded-control-lg"],
  ["rounded-[20px]", "rounded-control-xl"],
  ["rounded-[2px]", "rounded-hairline"],
  ["rounded-[5px]", "rounded-field"],
  ["rounded-[22px]", "rounded-panel-xs"],
  ["rounded-[24px]", "rounded-panel-sm"],
  ["rounded-[26px]", "rounded-panel"],
  ["rounded-[28px]", "rounded-panel-lg"],
  ["rounded-[32px]", "rounded-modal"],
  ["rounded-[36px]", "rounded-modal-lg"],
  ["rounded-[40px]", "rounded-modal-xl"],
  ["rounded-[48px]", "rounded-modal-2xl"],
  ["rounded-[9999px]", "rounded-full"],
]);

const BORDER_CLASS_REPLACEMENTS = new Map([
  ["border-[0.386px]", "border-[length:var(--border-width-hairline)]"],
  ["border-[1px]", "border"],
  ["border-[1.5px]", "border-[length:var(--border-width-medium)]"],
  ["border-[2px]", "border-2"],
  ["border-[3px]", "border-[length:var(--border-width-control)]"],
  ["border-[3.5px]", "border-[length:var(--border-width-control-lg)]"],
  ["border-[4px]", "border-[length:var(--border-width-heavy)]"],
]);

const STATIC_VALUE_PATTERNS = [
  {
    kind: "color",
    pattern: /#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})\b/g,
  },
  {
    kind: "radius",
    pattern: /rounded-\[(?:\d+(?:\.\d+)?)(?:px|rem)\]/g,
  },
  {
    kind: "border-width",
    pattern: /border-\[(?:\d+(?:\.\d+)?)(?:px|rem)\]/g,
  },
  {
    kind: "font",
    pattern: /font-(?:woodblock|brothers|editorial|uchen|desert|bianco|display|brand|topic|inter|lato|dm-sans|league-spartan|emoji-mono)\b/g,
  },
];

function normalizeHex(value) {
  const lower = value.toLowerCase();
  if (/^#[0-9a-f]{3}$/.test(lower)) {
    return "#" + lower.slice(1).split("").map((c) => c + c).join("");
  }
  return lower;
}

function replaceTailwindColors(source) {
  return source.replace(
    /((?:[a-z0-9_-]+:)*)((?:bg|text|border|ring|outline|fill|stroke))-\[(#[0-9a-fA-F]{3,8})\](\/\d{1,3})?/g,
    (full, variants, utility, rawHex, opacity = "") => {
      const token = COLOR_TOKENS.get(normalizeHex(rawHex));
      return token ? `${variants}${utility}-${token}${opacity}` : full;
    },
  );
}

function replaceInlineStyleColors(source) {
  return source.replace(
    /(\b(?:color|backgroundColor|borderColor|outlineColor|fill|stroke)\s*:\s*)(["'])(#[0-9a-fA-F]{3,8})\2/g,
    (full, prefix, quote, rawHex) => {
      const token = COLOR_TOKENS.get(normalizeHex(rawHex));
      return token ? `${prefix}${quote}var(--color-${token})${quote}` : full;
    },
  );
}

function replaceCssColors(source) {
  return source.replace(
    /(\b(?:color|background-color|border-color|outline-color|fill|stroke)\s*:\s*)(#[0-9a-fA-F]{3,8})(\s*[;}])/g,
    (full, prefix, rawHex, suffix) => {
      const token = COLOR_TOKENS.get(normalizeHex(rawHex));
      return token ? `${prefix}var(--color-${token})${suffix}` : full;
    },
  );
}

function replaceKnownClasses(source) {
  let next = source;
  for (const [from, to] of COLOR_CLASS_REPLACEMENTS) {
    next = next.replace(new RegExp(`\\b${from}\\b`, "g"), to);
  }
  for (const [from, to] of FONT_CLASS_REPLACEMENTS) {
    next = next.replace(new RegExp(`\\b${from}\\b`, "g"), to);
  }
  for (const [from, to] of RADIUS_CLASS_REPLACEMENTS) {
    next = next.split(from).join(to);
  }
  for (const [from, to] of BORDER_CLASS_REPLACEMENTS) {
    next = next.split(from).join(to);
  }
  return next;
}

function transform(source, filePath) {
  // The token source is maintained deliberately. Never run the codemod over
  // its own declarations/selectors or it can create self-references.
  if (filePath === TOKEN_SOURCE) return source;

  let next = source;
  next = replaceTailwindColors(next);
  next = replaceInlineStyleColors(next);
  next = replaceKnownClasses(next);

  // src/index.css is the token source. Never rewrite its literal token values
  // into self-references. Other CSS files may safely consume the variables.
  if (filePath !== TOKEN_SOURCE && filePath.endsWith(".css")) {
    next = replaceCssColors(next);
  }

  return next;
}

function isArtworkSource(filePath) {
  const relative = path.relative(ROOT, filePath).split(path.sep).join("/");
  return (
    relative === "src/components/WoodcutArt.tsx" ||
    relative === "src/components/icons/WoodcutArt.tsx" ||
    relative.startsWith("src/components/icons/generated/")
  );
}

async function walk(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    if (entry.name === "node_modules" || entry.name === "dist") continue;
    const child = path.join(directory, entry.name);

    if (entry.isDirectory()) {
      files.push(...(await walk(child)));
    } else if (/\.(?:ts|tsx|css)$/.test(entry.name) && !isArtworkSource(child)) {
      files.push(child);
    }
  }

  return files;
}

function lineNumber(source, offset) {
  return source.slice(0, offset).split("\n").length;
}

function collectUnresolved(source, filePath) {
  const findings = [];

  for (const { kind, pattern } of STATIC_VALUE_PATTERNS) {
    pattern.lastIndex = 0;
    for (const match of source.matchAll(pattern)) {
      const value = match[0];

      if (kind === "color") {
        const normalized = normalizeHex(value);
        if (COLOR_TOKENS.has(normalized)) continue;

        // Literal token definitions belong in the design-token source.
        if (filePath === TOKEN_SOURCE) continue;
      }

      if (kind === "radius" && RADIUS_CLASS_REPLACEMENTS.has(value)) continue;
      if (kind === "border-width" && BORDER_CLASS_REPLACEMENTS.has(value)) continue;
      if (kind === "font" && FONT_CLASS_REPLACEMENTS.has(value)) continue;

      findings.push({
        kind,
        value,
        line: lineNumber(source, match.index ?? 0),
      });
    }
  }

  return findings;
}

const files = await walk(SRC_ROOT);
let changedFiles = 0;
let replacementFiles = 0;
let unresolvedCount = 0;
const unresolvedByValue = new Map();

for (const filePath of files) {
  const original = await readFile(filePath, "utf8");
  const transformed = transform(original, filePath);
  const relative = path.relative(ROOT, filePath);

  if (transformed !== original) {
    replacementFiles += 1;
    if (WRITE) {
      await writeFile(filePath, transformed, "utf8");
      changedFiles += 1;
      console.log(`updated       ${relative}`);
    } else {
      console.log(`would update  ${relative}`);
    }
  }

  const unresolved = collectUnresolved(transformed, filePath);
  unresolvedCount += unresolved.length;

  for (const finding of unresolved) {
    console.log(
      `review        ${relative}:${finding.line} [${finding.kind}] ${finding.value}`,
    );
    const key = `${finding.kind}:${finding.value.toLowerCase()}`;
    const previous = unresolvedByValue.get(key) ?? {
      kind: finding.kind,
      value: finding.value,
      count: 0,
    };
    previous.count += 1;
    unresolvedByValue.set(key, previous);
  }
}

if (unresolvedByValue.size > 0) {
  console.log("");
  console.log("Unresolved values by frequency:");
  [...unresolvedByValue.values()]
    .sort((a, b) => b.count - a.count || a.value.localeCompare(b.value))
    .forEach((item) => {
      console.log(
        `  ${String(item.count).padStart(3, " ")}x  [${item.kind}] ${item.value}`,
      );
    });
}

console.log("");
console.log(
  WRITE
    ? `Updated ${changedFiles} file(s). ${unresolvedCount} unmatched value(s) remain for review.`
    : `${replacementFiles} file(s) have safe token replacements. ${unresolvedCount} unmatched value(s) require review.`,
);

if (CHECK && (replacementFiles > 0 || unresolvedCount > 0)) {
  process.exitCode = 1;
}
